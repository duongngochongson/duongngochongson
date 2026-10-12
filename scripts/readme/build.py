"""Writes the READMEs from the site, so GitHub shows the same words as the site.

    python3 scripts/readme/build.py

It reads index.html and writes:
  README.md                      the profile README (Home, Portfolio, About me)
  readme/hear-them-out.md        the README of the Hear Them Out repository (the Why Members Are Unhappy page)
  readme/delivery-scenario.md    the README of the delivery-scenario repository (the Not-Home Delivery Stop page)

Only text is copied. Pictures, screenshots and diagrams stay on the site, and the README links to them.
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
def block_md(n):
    c = n.classes
    if n.tag == 'p':
        if 'note' in c:
            return f'_{t(n)}_'
        return t(n)
    if 'zones' in c:
        return '\n'.join(f'- **{t(li.find(lambda x: x.tag == "b"), False)}**: {t(li.find(lambda x: x.tag == "b").parent.elements()[1])}' for li in n.elements())
    if 'issues' in c or 'checks' in c:
        return '\n'.join(f'- {t(li)}' for li in n.elements())
    if 'stats' in c:
        return '\n'.join(f'- **{t(card.find(by_class("stat")))}**: {t(card.find(by_class("stat-l")))}' for card in n.elements())
    if 'pull' in c:
        q = t(n.find(lambda x: x.tag == 'blockquote'))
        cap = t(n.find(lambda x: x.tag == 'figcaption'))
        return f'> {q}\n>\n> {cap}'
    if 'meters' in c:
        return '\n'.join(f'- **{t(m.find(by_class("m-name")))}**: {t(m.find(by_class("m-text")))}' for m in n.elements())
    if 'method' in c:
        lab = sentence(t(n.find(by_class('lab'))))
        body = t(n.find(lambda x: x.tag == 'p'))
        cells = [t(x) for x in n.find_all(lambda x: x.has('sb-h') or x.has('sb-c'))]
        rows_ = []
        for i in range(0, len(cells), 4):
            rows_.append(f'- {cells[i]}: {", ".join(cells[i + 1:i + 4])}')
        return f'**{lab}.** {body}\n\n' + '\n'.join(rows_)
    if 'rows' in c:
        out = []
        for item in n.elements():
            name = t(item.find(by_class('row-name')))
            tag = tag_case(t(item.find(by_class('tag'))))
            parts = []
            for col in item.find(by_class('row-body')).elements():
                parts.append(f'**{tag_case(t(col.find(by_class("lab"))))}.** {t(col.find(lambda x: x.tag == "p"))}')
            out.append(f'### {name}\n\n_{tag}_\n\n' + '\n\n'.join(parts))
        return '\n\n'.join(out)
    if 'tiles' in c:
        out = []
        for tile in n.elements():
            out.append(f'### {t(tile.find(lambda x: x.tag == "h4"))}\n\n_{tag_case(t(tile.find(by_class("lab"))))}_\n\n{t(tile.find(lambda x: x.tag == "p"))}')
        return '\n\n'.join(out)
    if 'persona' in c:
        cards = n.find_all(by_class('pe-card'))
        who = cards[0].find(by_class('pe-who'))
        name = t(who.find(lambda x: x.tag == 'b'), False)
        desc = t(who.find(lambda x: x.tag == 'b').parent.elements()[1])
        facts = '\n'.join(f'- {t(li)}' for li in cards[0].find(lambda x: x.tag == 'ul').elements())
        so_lab = tag_case(t(cards[1].find(by_class('lab'))))
        so = '\n'.join(f'- {t(li)}' for li in cards[1].find(lambda x: x.tag == 'ul').elements())
        return f'**{name}.** {desc}.\n\n{facts}\n\n**{so_lab}:**\n\n{so}'
    if 'heard' in c:
        return '\n'.join(f'- **{t(li.find(lambda x: x.tag == "b"), False)}**: {t(li.elements()[-1])}' for li in n.elements())
    if 'flow' in c:
        out = []
        mains = [x for x in n.elements() if x.has('f-main')]
        out.append(f'- {t(mains[0])}')
        for lane in n.find_all(by_class('f-lane')):
            out.append(f'- {tag_case(t(lane.find(by_class("lab"))))}:')
            for i, step in enumerate(lane.find(lambda x: x.tag == 'ol').elements(), 1):
                out.append(f'  {i}. {t(step)}')
        out.append(f'- {t(mains[-1])}')
        return '\n'.join(out)
    if 'matrix' in c:
        cap = tag_case(t(n.find(lambda x: x.tag == 'figcaption')))
        cols = [t(x) for x in n.find_all(by_class('mx-col'))]
        grid = n.find(by_class('mx-grid')).elements()
        lines = [f'| | {" | ".join(cols)} |', '|---|' + '---|' * len(cols)]
        row, cells = None, []
        for el in grid:
            if el.has('mx-row'):
                if row:
                    lines.append(f'| {row} | {" | ".join(cells)} |')
                row, cells = t(el), []
            elif el.has('mx-cell'):
                parts = [t(x, False) for x in el.elements()]
                cells.append(cell(f'**{parts[0]} {parts[1]}**: {parts[2]}'))
        lines.append(f'| {row} | {" | ".join(cells)} |')
        return f'{cap}.\n\n' + '\n'.join(lines)
    if 'why' in c:
        return '\n'.join(f'- **{t(it.find(lambda x: x.tag == "b"), False)}**: {t(it.find(lambda x: x.tag == "p"))}' for it in n.elements())
    if 'bul' in c:
        return '\n'.join(f'- {t(d.elements()[-1])}' for d in n.elements())
    if 'nextstep' in c:
        return f'**{t(n.find(lambda x: x.tag == "b"), False)}:** {t(n.find(lambda x: x.tag == "p"))}'
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
    return ''   # pictures, screenshots and anything else that is not text


SKIP = {'cs-head', 'shots'}


def section_md(sec):
    label = sentence(t(sec.find(lambda x: x.tag == 'h3')))
    parts = [f'## {label}']
    for el in sec.elements():
        if set(el.classes) & SKIP:
            continue
        md = block_md(el)
        if md:
            parts.append(md)
    chips = sec.find_all(by_class('doc-btn'))
    if chips:
        parts.append('Read more: ' + ' · '.join(f'[{t(b)}]({doc_link(b.attrs["data-frame"])})' for b in chips))
    return '\n\n'.join(parts)


def credits_md(det):
    out = ['## Credits', t(det.find(by_class('credits-intro')))]
    rows_ = []
    for row in det.find_all(by_class('used-row')):
        lab = tag_case(t(row.find(by_class('chips-label'))))
        items = []
        for li in row.find(lambda x: x.tag == 'ul').elements():
            a = li.find(lambda x: x.tag == 'a')
            rest = t(li.elements()[-1])
            items.append(f'[{t(a, False)}]({a.attrs["href"]}) {rest}')
        rows_.append(f'- **{lab}**: ' + '; '.join(items))
    out.append('\n'.join(rows_))
    line = det.find(by_class('credit-line'))
    if line is not None:
        out.append(t(line))
    return '\n\n'.join(out)


def project_md(page, route, holds):
    title = t(page.find(lambda x: x.tag == 'h2' and x.parent.has('hero-head')), False)
    lead = t(page.find(by_class('sum')))
    cta = page.find(by_class('cta-row'))
    links = []
    for el in cta.elements():
        if el.tag == 'a':
            links.append(f'[{clean(text(el, False)).replace(" ↗", "")}]({el.attrs["href"]})')
        elif el.has('doc-btn'):
            links.append(f'[{t(el)}]({doc_link(el.attrs["data-frame"])})')
    links.append(f'[The project page]({SITE}/#{route})')
    parts = [f'# {title}', lead, holds, ' · '.join(links)]
    for sec in page.find_all(lambda x: x.tag == 'section' and x.has('cs')):
        parts.append(section_md(sec))
    det = page.find(lambda x: x.tag == 'details' and x.has('used-sec'))
    if det is not None:
        parts.append(credits_md(det))
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

    portfolio = root.find(lambda x: x.attrs.get('data-page') == 'portfolio')
    parts.append('## Portfolio')
    for card in portfolio.find_all(lambda x: x.tag == 'a' and x.has('proj')):
        name = t(card.find(lambda x: x.tag == 'h3'), False)
        rows_ = []
        for d in card.find(by_class('prs')).elements():
            dt, dd = d.elements()[0], d.elements()[1]
            rows_.append(f'- **{tag_case(t(dt))}:** {t(dd)}')
        parts.append(f'### [{name}]({SITE}/{card.attrs["href"]})\n\n' + '\n'.join(rows_))

    skills = home.find(by_class('chips-row'))
    parts.append('## Skillset')
    parts.append(' '.join(f'`{t(x, False)}`' for x in skills.elements()))

    about = root.find(lambda x: x.attrs.get('data-page') == 'about')
    path = about.find(by_class('path'))
    parts.append('## The path')
    steps = []
    for card in path.elements():
        when = tag_case(t(card.find(by_class('y'))))
        what = t(card.find(by_class('t')))
        desc = t(card.find(by_class('d')))
        steps.append(f'- **{what}** ({when}): {desc}')
    parts.append('\n'.join(steps))

    footer = root.find(lambda x: x.tag == 'footer')
    parts.append(f'## {t(footer.find(lambda x: x.tag == "h2"), False)}')
    parts.append(f'[{mail}](mailto:{mail})')
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
