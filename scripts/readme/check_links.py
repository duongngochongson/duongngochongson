"""Checks that every local link of the site points at a file that exists.

    python3 scripts/readme/check_links.py

It reads index.html, every page and component in work/ (.html and .dc.html) and every stylesheet (styles.css and work/**/*.css), and
checks each href, src, srcset, poster, data-frame, data-image and data-pdf that points inside the repository, each url() in a stylesheet, each
<dc-import name="..."> (it must have a <name>.dc.html next to the page), each data-doc (it must be an id in index.html), each icon of the sprite (href="file.svg#i-name" needs
id="i-name" in that file), and each link into another page's anchor (Diagrams.html#action-map needs id="action-map" there).
Links to other sites, mailto: links, data: URLs, same-page #anchors and values with a {{ binding }} are skipped.
It stops with the file, the line and the path that is missing, so a renamed picture or document fails the push that broke it.
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re
import sys

ROOT = Path(__file__).resolve().parents[2]
PATH_ATTRS = {'href', 'src', 'poster', 'data-frame', 'data-image', 'data-pdf'}
SKIP_SCHEMES = ('http:', 'https:', 'mailto:', 'tel:', 'data:', 'javascript:', 'blob:', '//')
CSS_URL = re.compile(r'url\(\s*([\'"]?)(.*?)\1\s*\)')


class Refs(HTMLParser):
    """Every reference in one HTML file: (line, attribute, value), and the ids the file has."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.refs, self.ids, self.docs = [], set(), []

    def handle_starttag(self, tag, attrs):
        line = self.getpos()[0]
        for name, value in attrs:
            if value is None:
                continue
            if name == 'id':
                self.ids.add(value)
            elif name == 'data-doc':   # the id of a <template> on the same page
                self.docs.append((line, value))
            elif name in PATH_ATTRS:
                self.refs.append((line, f'{tag} {name}', value))
            elif name == 'srcset':
                for candidate in value.split(','):
                    if candidate.strip():
                        self.refs.append((line, f'{tag} srcset', candidate.strip().split()[0]))
            elif tag == 'dc-import' and name == 'name':
                self.refs.append((line, 'dc-import name', value))

    handle_startendtag = handle_starttag


def read(path):
    parser = Refs()
    parser.feed(path.read_text(encoding='utf-8'))
    return parser


def local(value):
    """True when a value points inside the repository (not another site, an address, or a binding)."""
    value = value.strip()
    return bool(value) and '{{' not in value and not value.startswith('#') and not value.lower().startswith(SKIP_SCHEMES)


def check_file(page, errors, cache):
    here = page.parent
    rel = page.relative_to(ROOT)
    for line, kind, value in read(page).refs:
        if kind == 'dc-import name':
            target = here / f'{value}.dc.html'
            if not target.is_file():
                errors.append(f'{rel}:{line}: <dc-import name="{value}"> has no {value}.dc.html next to the page')
            continue
        if not local(value):
            continue
        parts = urlsplit(value)
        target = (here / unquote(parts.path)).resolve() if parts.path else page
        problem = missing(target, parts.fragment, cache)
        if problem:
            errors.append(f'{rel}:{line}: {kind}="{value}" {problem}')


def missing(target, fragment, cache):
    """Why a target is not there ('' when it is)."""
    if not target.exists():
        return 'points at a file that does not exist'
    if fragment and target.suffix in ('.svg', '.html') and not target.name.endswith('.dc.html'):
        if target not in cache:   # the ids of that file, found once
            cache[target] = set(re.findall(r'\bid="([^"]+)"', target.read_text(encoding='utf-8')))
        if unquote(fragment) not in cache[target]:
            return f'points at #{fragment}, which {target.name} does not have'
    return ''


def check_css(sheet, errors):
    rel = sheet.relative_to(ROOT)
    for number, line in enumerate(sheet.read_text(encoding='utf-8').splitlines(), 1):
        for _, value in CSS_URL.findall(line):
            if not local(value):
                continue
            path = unquote(urlsplit(value).path)
            if not (sheet.parent / path).is_file():
                errors.append(f'{rel}:{number}: url({value}) points at a file that does not exist')


def main():
    errors, cache, count = [], {}, 0
    pages = [ROOT / 'index.html'] + sorted((ROOT / 'work').rglob('*.html'))
    for page in pages:
        check_file(page, errors, cache)
    sheets = [ROOT / 'styles.css'] + sorted((ROOT / 'work').rglob('*.css'))
    for sheet in sheets:
        if sheet.is_file():
            check_css(sheet, errors)
    index = read(ROOT / 'index.html')
    for line, value in index.docs:
        if value not in index.ids:
            errors.append(f'index.html:{line}: data-doc="{value}" has no element with that id')
    if errors:
        print('Broken local links:', *errors, sep='\n  ')
        sys.exit(1)
    print(f'All local links resolve ({len(pages)} pages, {len(sheets)} stylesheets).')


if __name__ == '__main__':
    main()
