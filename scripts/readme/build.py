"""Writes the READMEs from the site, so GitHub shows the same words as the site.

    python3 scripts/readme/build.py

It reads index.html and writes:
  README.md                      the profile README (Home, Portfolio, the periods of About me by name)
  readme/hear-them-out.md        the README of the Hear Them Out repository (the Why Members Are Unhappy page)
  readme/delivery-scenario.md    the README of the delivery-scenario repository (the Not-Home Delivery Stop page)

Only text is copied. Pictures and screenshots stay on the site, and the README links to each of them (a link with its caption).
A block this script does not know stops the build with a message, and so does a missing piece of the page (a class that was
renamed, a data-page route that is gone): the message names the data-page and the selector. Nothing is dropped without anyone noticing.
A node that may be absent says so at the call site (optional=True).
A GitHub Action runs this script when index.html changes (.github/workflows/readme.yml); each project
repository copies its file from readme/ (its own .github/workflows/readme-sync.yml).
"""
from html.parser import HTMLParser
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
SITE = 'https://duongngochongson.vercel.app'
PROJECTS = {
    # page on the site: (file in readme/, what the repository holds, the file in that repository that the README's footer links to)
    # Each repository has its own entry: a link to a file the repository does not have shows as a broken link on its page.
    'portfolio/why-members-are-unhappy': ('hear-them-out.md',
        'This repository holds the code of Hear Them Out, the course this project led to.',
        'docs/DEVELOPMENT.md'),
    'portfolio/delivery-scenario': ('delivery-scenario.md',
        'This repository holds the code of the module.',
        'docs/DEVELOPMENT.md'),
}
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'}


# ---------------------------------------------------------------- a small tree of the page
class MissingNode(Exception):
    """A node that the build needs is not on the page."""


class Node:
    def __init__(self, tag, attrs, parent):
        self.tag, self.attrs, self.parent, self.kids = tag, dict(attrs), parent, []

    def where(self):
        """The data-page this node sits on (the route), or the file when it sits outside every page."""
        n = self
        while n is not None:
            if 'data-page' in n.attrs:
                return f'data-page="{n.attrs["data-page"]}"'
            n = n.parent
        return 'index.html'

    def label(self):
        if self.parent is None:
            return 'the whole page'
        cls = ' class="' + ' '.join(self.classes) + '"' if self.classes else ''
        return f'<{self.tag}{cls}>'

    @property
    def classes(self):
        return (self.attrs.get('class') or '').split()

    def has(self, cls):
        return cls in self.classes

    def _walk(self, test):
        out = []
        for k in self.kids:
            if isinstance(k, Node):
                if test(k):
                    out.append(k)
                out.extend(k._walk(test))
        return out

    def find_all(self, test, minimum=0):
        """Every node that matches. A list that has to have something in it says so (minimum=1)."""
        out = self._walk(test)
        if len(out) < minimum:
            raise MissingNode(f'{self.where()}: expected at least {minimum} of {describe(test)} inside {self.label()}, found {len(out)}. '
                              'Rename the class in build.py if it was renamed on the page.')
        return out

    def find(self, test, optional=False):
        """The first node that matches. A node the build needs raises when it is missing; a node that may be absent is marked optional=True."""
        found = self._walk(test)
        if found:
            return found[0]
        if optional:
            return None
        raise MissingNode(f'{self.where()}: nothing matches {describe(test)} inside {self.label()}. '
                          'If it was renamed or removed on the page, change build.py to match; if it may be absent, mark the call optional=True.')

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


def described(desc, test):
    """A test with a name, so that a miss says what was looked for (a CSS-like selector)."""
    test.desc = desc
    return test


def describe(test):
    return getattr(test, 'desc', None) or 'a node the build looks for'


def by_class(cls, tag=None):
    return described(f'{tag or ""}.{cls}', lambda n: n.has(cls) and (tag is None or n.tag == tag))


def by_tag(tag):
    return described(tag, lambda n: n.tag == tag)


def by_page(route):
    return described(f'[data-page="{route}"]', lambda n: n.attrs.get('data-page') == route)


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


def t(node, marks=True, optional=False):
    """The clean text of a node. None (nothing was found) is an error unless the caller says it may be missing (optional=True: '')."""
    if node is None:
        if optional:
            return ''
        raise MissingNode('t() was given no node: the build asked for the text of something that is not on the page.')
    return clean(text(node, marks))


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
    img = btn.find(by_tag('img'), optional=True)
    cap = t(btn.find(by_class('shot-cap'), optional=True), optional=True) or clean(img.attrs.get('alt', '') if img is not None else '')
    return f'[{cap}]({SITE}/{btn.attrs["data-image"]})'


def meter_md(m):
    keys = '; '.join(t(li) for li in m.find(by_class('m-keys')).elements())
    how = t(m.find(by_class('m-how'), optional=True), optional=True)
    return f'- **{t(m.find(by_class("m-name")))}**: {keys}.' + (f' {how}' if how else '')


def fold_md(det):
    """A fold: its title row is the heading (and the tag under it), then what is inside."""
    head = det.find(by_tag('summary'))
    name = t(head.find(by_class('fold-name')), False)
    tag = head.find(by_class('tag'), optional=True)
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
    if 'tile-pair' in c:   # two pictures for one fold: a list, like several shots
        return bullets(picture_md(b) for b in n.elements())
    if 'issues' in c:   # each problem, then where it was found (its tag) in brackets
        return bullets(f'{t(li.elements()[1])} ({t(li.find(by_class("tag")))})' for li in n.elements())
    if 'pull' in c:
        q = t(n.find(by_tag('blockquote')))
        cap = t(n.find(by_tag('figcaption')))
        return f'> {q}\n>\n> {cap}'
    if 'meters' in c:
        return '\n'.join(meter_md(m) for m in n.elements())
    if 'method' in c:
        lab = sentence(t(n.find(by_class('lab'))))
        body = t(n.find(by_tag('p')))
        cells = [t(x) for x in n.find_all(described('.sb-h, .sb-c', lambda x: x.has('sb-h') or x.has('sb-c')))]
        rows_ = []
        for i in range(0, len(cells), 4):
            rows_.append(f'- {cells[i]}: {", ".join(cells[i + 1:i + 4])}')
        split = n.find(by_class('split'), optional=True)
        if split is not None:
            rows_.append(split.attrs.get('aria-label', '').capitalize() + '.')
        return f'**{lab}.** {body}' + ('\n\n' + '\n'.join(rows_) if rows_ else '')
    if 'persona' in c:
        cards = n.find_all(by_class('pe-card'), minimum=2)
        who = cards[0].find(by_class('pe-who'))
        name = t(who.find(by_tag('b')), False)
        desc = t(who.find(by_tag('b')).parent.elements()[1])
        facts = bullets(t(li) for li in cards[0].find(by_tag('ul')).elements())
        so_lab = tag_case(t(cards[1].find(by_class('lab'))))
        so = bullets(t(li) for li in cards[1].find(by_tag('ul')).elements())
        return f'**{name}.** {desc}.\n\n{facts}\n\n**{so_lab}:**\n\n{so}'
    if 'heard' in c:
        return bullets(f'**{t(li.find(by_tag("b")), False)}**: {t(li.elements()[-1])}' for li in n.elements())
    if 'flow' in c:
        out = []
        mains = [x for x in n.elements() if x.has('f-main')]
        out.append(f'- {t(mains[0])}')
        for lane in n.find_all(by_class('f-lane')):
            go = lane.find(by_class('f-go'), optional=True)  # the line that says where this way leads (Part 2)
            out.append(f'- {tag_case(t(lane.find(by_class("lab"))))}:' + (f' {t(go)}' if go is not None else ''))
            for i, step in enumerate(lane.find(by_tag('ol')).elements(), 1):
                out.append(f'  {i}. {t(step)}')
            alt = lane.find(by_class('f-alt'), optional=True)
            if alt is not None:
                out.append(f'  - {t(alt)}')
        out.append(f'- {t(mains[-1])}')
        return '\n'.join(out)
    if 'codes' in c:
        cap = tag_case(t(n.find(by_tag('figcaption'))))
        trs = n.find_all(by_tag('tr'), minimum=2)
        head = [t(th) for th in trs[0].elements()][1:]
        lines = ['| Code | ' + ' | '.join(head) + ' |', '|---|' + '---|' * len(head)]
        for tr in trs[1:]:
            th = tr.elements()[0]
            code = f'**{t(th.find(by_tag("b")), False)}** ({t(th.find(by_tag("span")))})'
            tds = [('✓ ' if td.has('yes') else '✗ ') + t(td) for td in tr.elements()[1:]]
            lines.append('| ' + ' | '.join(cell(x) for x in [code] + tds) + ' |')
        return f'{cap}:\n\n' + '\n'.join(lines)
    if 'split' in c:
        return n.attrs.get('aria-label', '').capitalize() + '.'
    if 'slides' in c:
        lines = ['| # | Slide | Type | Points |', '|---|---|---|---|']
        for li in n.elements():
            num = t(li.find(by_class('sl-n'), optional=True), optional=True)
            name = t(li.find(by_tag('b')))
            kind = t(li.find(by_class('sl-type')))
            pts = t(li.find(by_class('sl-pts'), optional=True), optional=True)
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
            href = el.attrs["href"]
            if not href.startswith(('http://', 'https://')):  # a file of this site, such as the slides' PDF
                href = doc_link(href)
            links.append(f'[{clean(text(el, False)).replace(" ↗", "")}]({href})')
        elif el.has('doc-btn') and 'data-frame' in el.attrs:
            links.append(f'[{t(el)}]({doc_link(el.attrs["data-frame"])})')
        elif el.has('slide-set'):  # the slides open in the pop-up on the page; the README links their PDF
            links.append(f'[{t(el.find(by_class("doc-btn")))}]({doc_link(el.attrs["data-pdf"])})')
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
    label = sentence(t(sec.find(by_tag('h3'))))
    return join_blocks([f'## {label}'] + [block_md(el) for el in sec.elements() if not set(el.classes) & SKIP])


def credits_md(tpl):
    out = ['## Credits', t(tpl.find(by_class('credits-intro')))]
    rows_ = []
    for row in tpl.find_all(by_class('used-row'), minimum=1):
        lab = tag_case(t(row.find(by_class('chips-label'))))
        items = []
        for li in row.find(by_tag('ul')).elements():
            a = li.find(by_tag('a'))
            rest = t(li.elements()[-1])
            items.append(f'[{t(a, False)}]({a.attrs["href"]}) {rest}')
        rows_.append(f'- **{lab}**: ' + '; '.join(items))
    out.append('\n'.join(rows_))
    line = tpl.find(by_class('credit-line'), optional=True)
    if line is not None:
        out.append(t(line))
    return '\n\n'.join(out)


def filled(node, text_, what):
    """Text that must not come out empty: a node that is there with nothing in it would drop its line from the README."""
    if not text_:
        raise MissingNode(f'{node.where()}: {what} is there but has no text.')
    return text_


def project_md(page, route, holds, footer):
    hero = page.find(by_class('hero'))
    title = filled(hero, t(hero.find(by_tag('h2')), False), 'the hero title (h2)')
    concept = filled(hero, t(hero.find(by_class('hero-tag'))), 'the concept line (.hero-tag)')
    lead = filled(page, t(page.find(by_class('sum'))), 'the lead paragraph (.sum)')
    links = doc_links(page.find(described('.case > .cta-row', lambda x: x.has('cta-row') and x.parent.has('case'))))
    links.append(f'[The project page]({SITE}/#{route})')
    parts = [f'# {title}', f'_{concept}_', lead, holds, ' · '.join(links)]
    summary = page.find(by_class('summary'), optional=True)
    for box in summary.elements() if summary is not None else []:
        parts.append(f'**{tag_case(t(box.find(by_class("lab"))))}**\n\n' + bullets(t(li) for li in box.find(by_tag('ul')).elements()))
    for sec in page.find_all(described('section.cs', lambda x: x.tag == 'section' and x.has('cs')), minimum=1):
        parts.append(section_md(sec))
    credits = page.find(described('template.credits', lambda x: x.tag == 'template' and x.has('credits')), optional=True)
    if credits is not None:
        parts.append(credits_md(credits))
    parts.append('---')
    parts.append(f'<sub>This README is written from the project page on my portfolio, {SITE}/#{route}, '
                 f'and is updated when that page changes. To run, build and test the code, see [{footer}]({footer}).</sub>')
    return '\n\n'.join(p for p in parts if p) + '\n'


# ---------------------------------------------------------------- the profile README
def profile_md(root):
    title = t(root.find(by_tag('title')), False)
    hello = t(root.find(described('.side > h1', lambda x: x.tag == 'h1' and x.parent.has('side'))), False)
    home = root.find(by_page('home'))
    intro = t(home.find(described('.intro > p', lambda x: x.tag == 'p' and x.parent.has('intro'))))
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
        return tag_case(t(page.find_all(by_class('eyebrow', 'h2'), minimum=n + 1)[n], False))

    portfolio = root.find(by_page('portfolio'))
    parts.append(f'## {heading(home, 0)}')
    # like Home's Selected work: only the Portfolio cards marked data-selected
    for card in portfolio.find_all(described('a.proj[data-selected]', lambda x: x.tag == 'a' and x.has('proj') and 'data-selected' in x.attrs), minimum=1):
        name = t(card.find(by_tag('h3')), False)
        rows_ = []
        for d in card.find(by_class('prs')).elements():
            dt, dd = d.elements()[0], d.elements()[1]
            rows_.append(f'- **{tag_case(t(dt))}:** {t(dd)}')
        parts.append(f'### [{name}]({SITE}/{card.attrs["href"]})\n\n' + '\n'.join(rows_))

    skills = home.find(by_class('chips-row'))
    parts.append(f'## {heading(home, 1)}')
    parts.append(' '.join(f'`{t(x, False)}`' for x in skills.elements()))

    about = root.find(by_page('about'))
    # About me: the page's name, then the title and the years of each of its four periods
    parts.append(f'## [{about.attrs["data-title"]}]({SITE}/#about)')
    lines = []
    for period in about.find_all(by_class('period'), minimum=1):
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
    out = ROOT / 'readme'
    files = {ROOT / 'README.md': profile_md(root)}
    for route, (name, holds, footer) in PROJECTS.items():
        page = root.find(by_page(route))   # a missing route stops the build and names the data-page
        files[out / name] = project_md(page, route, holds, footer)
    out.mkdir(exist_ok=True)
    for path, md in files.items():   # everything is written only when everything was built
        path.write_text(md, encoding='utf-8')
    print('wrote README.md and', ', '.join('readme/' + p[0] for p in PROJECTS.values()))


if __name__ == '__main__':
    main()
