"""Writes the READMEs from the site, so GitHub shows the same words as the site.

    python3 scripts/readme/build.py

It reads index.html and writes:
  README.md                      the profile README (Home, Portfolio, the periods of About me by name)
  readme/hear-them-out.md        the README of the Hear Them Out repository (the Why Members Are Unhappy page)
  readme/delivery-scenario.md    the README of the delivery-scenario repository (the Not-Home Delivery Stop page)

Only text is copied. Pictures and screenshots stay on the site, and the README links to each of them (a link with its caption).
A block this script does not know stops the build with a message, so nothing is dropped without anyone noticing.
A GitHub Action runs this script when index.html changes (.github/workflows/readme.yml); each project
repository copies its file from readme/ (its own .github/workflows/readme-sync.yml).
"""
from html.parser import HTMLParser
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
SITE = 'https://duongngochongson.vercel.app'
PROJECTS = {
    # page on the site: (file in readme/, what the repository holds)
    'portfolio/why-members-are-unhappy': ('hear-them-out.md',
        'This repository holds the code of Hear Them Out, the course this project led to.'),
    'portfolio/delivery-scenario': ('delivery-scenario.md',
        'This repository holds the code of the module.'),
}
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'}


# ---------------------------------------------------------------- a small tree of the page
class Node:
    def __init__(self, tag, attrs, parent):
        self.tag, self.attrs, self.parent, self.kids = tag, dict(attrs), parent, []

    @property
    def classes(self):
        return (self.attrs.get('class') or '').split()

    def has(self, cls):
        return cls in self.classes

    def find_all(self, test):
        out = []
        for k in self.kids:
            if isinstance(k, Node):
                if test(k):
                    out.append(k)
                out.extend(k.find_all(test))
        return out

    def find(self, test):
        found = self.find_all(test)
        return found[0] if found else None

    def elements(self):
        return [k for k in self.kids if isinstance(k, Node)]


class Tree(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node('root', [], None)
        self.cur = self.root

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs, self.cur)
        self.cur.kids.append(node)
        if tag not in VOID:
            self.cur = node

    def handle_startendtag(self, tag, attrs):
        self.cur.kids.append(Node(tag, attrs, self.cur))

    def handle_endtag(self, tag):
        n = self.cur
        while n is not self.root and n.tag != tag:
            n = n.parent
        if n is not self.root:
            self.cur = n.parent

    def handle_data(self, data):
        self.cur.kids.append(data)


def by_class(cls, tag=None):
    return lambda n: n.has(cls) and (tag is None or n.tag == tag)


# ---------------------------------------------------------------- text
def text(node, marks=True):
    """The visible words of a node, with bold and links kept as Markdown."""
    if isinstance(node, str):
        return node
    if 'data-md' in node.attrs:   # what the README shows in place of a node that is only for the eye (the → in "4.1 → 3.2")
        return node.attrs['data-md']
    if node.tag in ('svg', 'script', 'style', 'template', 'img') or node.attrs.get('aria-hidden') == 'true' or node.has('sr-only'):
        return ''
    if node.tag in ('br', 'wbr'):
        return ' ' if node.tag == 'br' else ''
    inner = ''.join(text(k, marks) for k in node.kids)
    if not marks:
        return inner
    if node.tag in ('b', 'strong') and inner.strip():
        return f'**{inner.strip()}**'
    if node.tag == 'a' and node.attrs.get('href', '').startswith(('http', 'mailto:')) and inner.strip():
        return f'[{inner.strip()}]({node.attrs["href"]})'
    return inner


def clean(s):
    return re.sub(r'\s+', ' ', s).strip()


def t(node, marks=True):
    return clean(text(node, marks)) if node is not None else ''


def sentence(label):
    """THE COURSE: HEAR THEM OUT -> The course: Hear Them Out"""
    head, _, name = label.partition(': ')
    head = tag_case(head)
    if name:
        name = ' '.join('-'.join(part.capitalize() for part in w.split('-')) for w in name.lower().split())
        return f'{head}: {name}'
    return head


def tag_case(s):
    """WHAT I FOUND -> What I found"""
    return re.sub(r'\bi\b', 'I', s.lower().capitalize())


def cell(s):
    return s.replace('|', '\\|')


def doc_link(path):
    return f'{SITE}/{path}'


# ---------------------------------------------------------------- the blocks of a project section
def bullets(items):
    return '\n'.join(f'- {x}' for x in items)


def picture_md(btn):
    """A picture that opens in the pop-up: a link to the picture, with its caption (or its description) as the text."""
    img = btn.find(lambda x: x.tag == 'img')
    cap = t(btn.find(by_class('shot-cap'))) or clean(img.attrs.get('alt', '') if img is not None else '')
    return f'[{cap}]({SITE}/{btn.attrs["data-image"]})'


def meter_md(m):
    keys = '; '.join(t(li) for li in m.find(by_class('m-keys')).elements())
    how = t(m.find(by_class('m-how')))
    return f'- **{t(m.find(by_class("m-name")))}**: {keys}.' + (f' {how}' if how else '')


def fold_md(det):
    """A fold: its title row is the heading (and the tag under it), then what is inside."""
    head = det.find(lambda x: x.tag == 'summary')
    name = t(head.find(by_class('fold-name')), False)
    tag = head.find(by_class('tag'))
    body = det.find(by_class('fold-body'))
    parts = [f'### {name}'] + ([f'_{tag_case(t(tag))}_'] if tag is not None else [])
    blocks = []
    for k in body.elements():
        md = block_md(k)
        if md.startswith(f'**{name}.** '):   # the persona card says its own name again
            md = md[len(name) + 6:]
        blocks.append(md)
    return join_blocks(parts + blocks)


def block_md(n):
    c = n.classes
    if n.tag == 'p':
        if 'note' in c:
            return f'_{t(n)}_'
        return t(n)
    if n.tag in ('ul', 'ol') and (not c or 'takeaways' in c):
        return bullets(t(li) for li in n.elements())
    if 'folds' in c:
        return join_blocks([fold_md(d) for d in n.elements()])
    if 'shots' in c:   # one picture is a line of its own, several are a list
        links = [picture_md(b) for b in n.elements()]
        return links[0] if len(links) == 1 else bullets(links)
    if 'tile-thumb' in c:
        return picture_md(n)
    if 'issues' in c:
        return bullets(t(li) for li in n.elements())
    if 'pull' in c:
        q = t(n.find(lambda x: x.tag == 'blockquote'))
        cap = t(n.find(lambda x: x.tag == 'figcaption'))
        return f'> {q}\n>\n> {cap}'
    if 'meters' in c:
        return '\n'.join(meter_md(m) for m in n.elements())
    if 'method' in c:
        lab = sentence(t(n.find(by_class('lab'))))
        body = t(n.find(lambda x: x.tag == 'p'))
        cells = [t(x) for x in n.find_all(lambda x: x.has('sb-h') or x.has('sb-c'))]
        rows_ = []
        for i in range(0, len(cells), 4):
            rows_.append(f'- {cells[i]}: {", ".join(cells[i + 1:i + 4])}')
        split = n.find(by_class('split'))
        if split is not None:
            rows_.append(split.attrs.get('aria-label', '').capitalize() + '.')
        return f'**{lab}.** {body}' + ('\n\n' + '\n'.join(rows_) if rows_ else '')
    if 'persona' in c:
        cards = n.find_all(by_class('pe-card'))
        who = cards[0].find(by_class('pe-who'))
        name = t(who.find(lambda x: x.tag == 'b'), False)
        desc = t(who.find(lambda x: x.tag == 'b').parent.elements()[1])
        facts = bullets(t(li) for li in cards[0].find(lambda x: x.tag == 'ul').elements())
        so_lab = tag_case(t(cards[1].find(by_class('lab'))))
        so = bullets(t(li) for li in cards[1].find(lambda x: x.tag == 'ul').elements())
        return f'**{name}.** {desc}.\n\n{facts}\n\n**{so_lab}:**\n\n{so}'
    if 'heard' in c:
        return bullets(f'**{t(li.find(lambda x: x.tag == "b"), False)}**: {t(li.elements()[-1])}' for li in n.elements())
    if 'flow' in c:
        out = []
        mains = [x for x in n.elements() if x.has('f-main')]
        out.append(f'- {t(mains[0])}')
        for lane in n.find_all(by_class('f-lane')):
            go = lane.find(by_class('f-go'))  # the line that says where this way leads (Part 2)
            out.append(f'- {tag_case(t(lane.find(by_class("lab"))))}:' + (f' {t(go)}' if go is not None else ''))
            for i, step in enumerate(lane.find(lambda x: x.tag == 'ol').elements(), 1):
                out.append(f'  {i}. {t(step)}')
            alt = lane.find(by_class('f-alt'))
            if alt is not None:
                out.append(f'  - {t(alt)}')
        out.append(f'- {t(mains[-1])}')
        return '\n'.join(out)
    if 'codes' in c:
        cap = tag_case(t(n.find(lambda x: x.tag == 'figcaption')))
        trs = n.find_all(lambda x: x.tag == 'tr')
        head = [t(th) for th in trs[0].elements()][1:]
        lines = ['| Code | ' + ' | '.join(head) + ' |', '|---|' + '---|' * len(head)]
        for tr in trs[1:]:
            th = tr.elements()[0]
            code = f'**{t(th.find(lambda x: x.tag == "b"), False)}** ({t(th.find(lambda x: x.tag == "span"))})'
            tds = [('✓ ' if td.has('yes') else '✗ ') + t(td) for td in tr.elements()[1:]]
            lines.append('| ' + ' | '.join(cell(x) for x in [code] + tds) + ' |')
        return f'{cap}:\n\n' + '\n'.join(lines)
    if 'split' in c:
        return n.attrs.get('aria-label', '').capitalize() + '.'
    if 'slides' in c:
        lines = ['| # | Slide | Type | Points |', '|---|---|---|---|']
        for li in n.elements():
            num = t(li.find(by_class('sl-n'))) or ''
            name = t(li.find(lambda x: x.tag == 'b'))
            kind = t(li.find(by_class('sl-type')))
            pts = t(li.find(by_class('sl-pts')))
            lines.append(f'| {num} | {cell(name)} | {cell(kind)} | {cell(pts)} |')
        return '\n'.join(lines)
    if 'cta-row' in c:   # the last section's buttons: each document is a link; Credits has its own section below
        return ' · '.join(doc_links(n))
    if n.tag == 'a' and 'back' in c:
        return f'[{t(n)}]({SITE}/{n.attrs["href"]})'
    if n.tag == 'template':   # the credits, written by credits_md
        return ''
    raise ValueError(f'build.py does not know this block: <{n.tag} class="{" ".join(c)}"> ("{t(n)[:40]}"). Add it to block_md.')


def doc_links(row):
    """The links of a row of buttons: the live page and each document. A button with no file (Credits) is left out."""
    links = []
    for el in row.elements():
        if el.tag == 'a':
            links.append(f'[{clean(text(el, False)).replace(" ↗", "")}]({el.attrs["href"]})')
        elif el.has('doc-btn') and 'data-frame' in el.attrs:
            links.append(f'[{t(el)}]({doc_link(el.attrs["data-frame"])})')
    return links


def join_blocks(blocks):
    """Blocks with a blank line between them. Two lists in a row with only a blank line between them become one list
    on GitHub (CommonMark), so an empty HTML comment keeps them apart."""
    parts = []
    for md in blocks:
        if not md:
            continue
        if parts and LIST_ITEM.match(parts[-1].splitlines()[-1]) and LIST_ITEM.match(md.splitlines()[0]):
            parts.append('<!-- -->')
        parts.append(md)
    return '\n\n'.join(parts)


SKIP = {'cs-head'}
LIST_ITEM = re.compile(r'\s*(?:[-*+]|\d+[.)])\s')


def section_md(sec):
    label = sentence(t(sec.find(lambda x: x.tag == 'h3')))
    return join_blocks([f'## {label}'] + [block_md(el) for el in sec.elements() if not set(el.classes) & SKIP])


def credits_md(tpl):
    out = ['## Credits', t(tpl.find(by_class('credits-intro')))]
    rows_ = []
    for row in tpl.find_all(by_class('used-row')):
        lab = tag_case(t(row.find(by_class('chips-label'))))
        items = []
        for li in row.find(lambda x: x.tag == 'ul').elements():
            a = li.find(lambda x: x.tag == 'a')
            rest = t(li.elements()[-1])
            items.append(f'[{t(a, False)}]({a.attrs["href"]}) {rest}')
        rows_.append(f'- **{lab}**: ' + '; '.join(items))
    out.append('\n'.join(rows_))
    line = tpl.find(by_class('credit-line'))
    if line is not None:
        out.append(t(line))
    return '\n\n'.join(out)


def project_md(page, route, holds):
    hero = page.find(by_class('hero'))
    title = t(hero.find(lambda x: x.tag == 'h2'), False)
    concept = hero.find(by_class('hero-tag'))
    lead = t(page.find(by_class('sum')))
    links = doc_links(page.find(lambda x: x.has('cta-row') and x.parent.has('case')))
    links.append(f'[The project page]({SITE}/#{route})')
    parts = [f'# {title}', f'_{t(concept)}_' if concept is not None else '', lead, holds, ' · '.join(links)]
    summary = page.find(by_class('summary'))
    for box in summary.elements() if summary is not None else []:
        parts.append(f'**{tag_case(t(box.find(by_class("lab"))))}**\n\n' + bullets(t(li) for li in box.find(lambda x: x.tag == 'ul').elements()))
    for sec in page.find_all(lambda x: x.tag == 'section' and x.has('cs')):
        parts.append(section_md(sec))
    credits = page.find(lambda x: x.tag == 'template' and x.has('credits'))
    if credits is not None:
        parts.append(credits_md(credits))
    back = page.find(lambda x: x.tag == 'a' and x.has('back') and x.parent.has('case'))  # All projects, under the last section
    if back is not None:
        parts.append(f'[{t(back)}]({SITE}/{back.attrs["href"]})')
    parts.append('---')
    parts.append(f'<sub>This README is written from the project page on my portfolio, {SITE}/#{route}, '
                 'and is updated when that page changes. To run, build and test the code, see '
                 '[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).</sub>')
    return '\n\n'.join(p for p in parts if p) + '\n'


# ---------------------------------------------------------------- the profile README
def profile_md(root):
    title = t(root.find(lambda x: x.tag == 'title'), False)
    hello = t(root.find(lambda x: x.tag == 'h1' and x.parent.has('side')), False)
    home = root.find(lambda x: x.attrs.get('data-page') == 'home')
    intro = t(home.find(lambda x: x.tag == 'p' and x.parent.has('intro')))
    contact = root.find(by_class('contact-links'))
    mail = contact.find(by_class('mail')).attrs['href'].replace('mailto:', '')
    names = {'LINKEDIN': 'LinkedIn', 'GITHUB': 'GitHub'}
    social = []
    for a in contact.find(by_class('row')).elements():
        label = t(a, False).replace(' ↗', '')
        social.append(f'[{names.get(label, label.capitalize())}]({a.attrs["href"]})')
    links = [f'[Portfolio]({SITE}/#portfolio)', f'[About me]({SITE}/#about)'] + social + [f'[{mail}](mailto:{mail})']
    parts = [f'# {title}', f'**{hello}**', intro, ' · '.join(links)]

    def heading(page, n):
        # the block headings on the site, so the README sections keep their names
        return tag_case(t(page.find_all(lambda x: x.tag == 'h2' and x.has('eyebrow'))[n], False))

    portfolio = root.find(lambda x: x.attrs.get('data-page') == 'portfolio')
    parts.append(f'## {heading(home, 0)}')
    # like Home's Selected work: only the Portfolio cards marked data-selected
    for card in portfolio.find_all(lambda x: x.tag == 'a' and x.has('proj') and 'data-selected' in x.attrs):
        name = t(card.find(lambda x: x.tag == 'h3'), False)
        rows_ = []
        for d in card.find(by_class('prs')).elements():
            dt, dd = d.elements()[0], d.elements()[1]
            rows_.append(f'- **{tag_case(t(dt))}:** {t(dd)}')
        parts.append(f'### [{name}]({SITE}/{card.attrs["href"]})\n\n' + '\n'.join(rows_))

    skills = home.find(by_class('chips-row'))
    parts.append(f'## {heading(home, 1)}')
    parts.append(' '.join(f'`{t(x, False)}`' for x in skills.elements()))

    about = root.find(lambda x: x.attrs.get('data-page') == 'about')
    # About me: the page's name, then the title and the years of each of its four periods
    parts.append(f'## [{about.attrs["data-title"]}]({SITE}/#about)')
    lines = []
    for period in about.find_all(by_class('period')):
        name = t(period.find(by_class('period-name')), False)
        years = t(period.find(by_class('period-years')), False)
        lines.append(f'- **{name}** ({years})')
    parts.append('\n'.join(lines))
    parts.append('---')
    parts.append(f'<sub>This README is written from my site, {SITE}, by scripts/readme/build.py, and is updated when the site changes.</sub>')
    return '\n\n'.join(parts) + '\n'


def main():
    tree = Tree()
    tree.feed((ROOT / 'index.html').read_text(encoding='utf-8'))
    root = tree.root
    (ROOT / 'README.md').write_text(profile_md(root), encoding='utf-8')
    out = ROOT / 'readme'
    out.mkdir(exist_ok=True)
    for route, (name, holds) in PROJECTS.items():
        page = root.find(lambda x: x.attrs.get('data-page') == route)
        (out / name).write_text(project_md(page, route, holds), encoding='utf-8')
    print('wrote README.md and', ', '.join('readme/' + n for n, _ in PROJECTS.values()))


if __name__ == '__main__':
    main()
