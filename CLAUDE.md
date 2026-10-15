# Son Duong's portfolio: notes for working in this repo

A static site for Son Duong, a learning experience designer: Home, Portfolio (two project pages) and About me. Plain HTML, CSS and
JavaScript, with no build step and no package.json; the files are served as they are (Vercel, duongngochongson.vercel.app).
To look at it, run `python3 -m http.server` in the repo root. Work on a branch and open a pull request.

## Commands

| Command | What it does |
|---|---|
| `python3 scripts/readme/build.py` | Writes `README.md` and `readme/*.md` from `index.html`. A missing part of the page stops it, with the data-page and the selector in the message |
| `python3 scripts/readme/check_links.py` | Checks that every local link, picture, font, icon and component in the site and in `work/` points at a file that exists |

## Where things live

- `index.html`: every page, in one file. A page is `<section class="page" data-page="..." data-title="..." hidden>` with a nav link (`data-nav`).
  - Hash routes: `#home`, `#portfolio`, `#portfolio/why-members-are-unhappy`, `#portfolio/delivery-scenario`, `#about`.
    Old `#work...` and `#portfolio/hear-them-out` links still work (`aliases` in `site.js`).
  - The pop-up is one `<dialog class="doc">`. `<template>` blocks hold the credits and the CV placeholder.
  - `data-vi` is an element's Vietnamese text, beside its English in the markup. `site.js` swaps it in (`setLang`).
- `styles.css`: the fonts (files in `assets/fonts`), the `:root` token block (colors, corners, lines, padding, gaps, type, motion) with the dark
  set under `:root[data-theme="dark"]`, then the rules by area: sidebar, main, project pages, pop-up, About, footer, small screens.
- `site.js`: one script in parts, each with a comment on top: selected cards, routes, pop-up, language, theme, greeting, email copy,
  decoding, and the About stages and scroll bar.
- `work/`: the project documents, in two kinds. Both use the one fonts folder, `work/frame/fonts`.
  - Frame pages (`work/frame/`, both `Diagrams.html`, the delivery `Style Guide.html`): static HTML on `frame.css`, with `frame.js` for the
    contents and `dg.css` and `dg.js` for diagrams (boxes joined by drawn lines). Edit them by hand.
  - Cozy documents (`work/why-members-are-unhappy/*.dc.html`, six pages and the components they import): design tool sources, drawn in the
    browser by `support.js` and the vendored React. Their named values are in `doc-text.css`. `support.js` is the tool's runtime copied
    here; its source is not in this repo.
  - The site opens documents in the pop-up (`data-frame`); they also work on their own.
- `assets/`: `portrait.jpg`, favicons, `fonts/`, `about/` (each photo has a `-large` pair for the pop-up) and `projects/` (the full file
  for the pop-up, an `-800` copy for a card, a 4:3 `-thumb` for a fold).
- `scripts/readme/build.py` writes the READMEs from `index.html`. `.github/workflows/readme.yml` runs `check_links.py`, then `build.py`, and
  commits the result as a backstop.
  - `README.md` is this repo's page. `readme/hear-them-out.md` and `readme/delivery-scenario.md` are copied once a day (each repo's
    `readme-sync.yml`) into the Hear Them Out and delivery-scenario repositories, so a change reaches them at the next merge plus up to a day.

## Rules

- Copy: plain US English, sentence case, no em dashes, no exclamation marks, no emphasis words.
- The About text is Son's own words (the intro, the fun fact, the four periods, Outside of work). Never reword it.
- A value that repeats in a role gets a name in the `:root` block (`doc-text.css` or `frame.css` for documents). A raw value is for a one-off.
- One pop-up. Previous and next step through the pictures and documents of the section the button sits in (`section.cs` or a `data-group`
  box), so a new picture or document goes inside the section and joins its group by itself.
- The About stages keep their arrow: it stays on a stage's last part and goes only when the stage turns into plain content (commit 4db56b3
  removed the rule that hid it there, on purpose).
- Pictures carry no EXIF (`convert in.jpg -strip out.jpg`). Check the real width and height before writing the attributes.
- After a content edit in `index.html`, run `build.py` and commit `README.md` and `readme/` with it. Never edit those by hand.
- Before a pull request, look at light and dark and at 320 px wide: contrast 4.5:1 or more, real buttons and labels, no sideways scroll,
  keyboard and screen readers working. The pages' look changes only when the task says so.
- Never push to main. Never commit secrets.

## The Vietnamese layer

The VI switch is hidden (`hidden` on its button in `index.html`): the page would show Vietnamese in some places and English in the rest.
Done so far: the greeting, the nav, the CV button, Home's intro and headings, the project titles and card labels, and About's headings.
Still English: most of About, the cards' Problem, Solution and Goal text, both project pages, the pop-up's titles, alt text, `aria-label`s,
page titles, and the documents in `work/`. The full list is in the comment above the VI button in `index.html`; `site.js` has more, at the
comment "Vietnamese only applies". Read both before turning the switch on.
