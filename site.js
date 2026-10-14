(() => {
  const root = document.documentElement;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Home's Selected work shows the Portfolio cards marked data-selected, so a project is added in one place ----
  const selectedCopy = document.querySelector('[data-selected-copy]');
  if (selectedCopy) {
    document.querySelectorAll('[data-page="portfolio"] .proj[data-selected]').forEach(card => {
      const copy = card.cloneNode(true);
      copy.removeAttribute('data-selected');
      copy.querySelectorAll('[id]').forEach(n => { n.id += '-home'; });
      if (copy.hasAttribute('aria-labelledby')) copy.setAttribute('aria-labelledby', copy.getAttribute('aria-labelledby') + '-home');
      selectedCopy.append(copy);
    });
  }

  // ---- pages: #home, #portfolio, #portfolio/<project>, #about ----
  // Old addresses keep working: #work… became #portfolio…, and Hear Them Out is now part of Why Members Are Unhappy.
  const aliases = { 'portfolio/hear-them-out': 'portfolio/why-members-are-unhappy' };
  const baseTitle = document.title;
  const dialog = document.querySelector('dialog.doc');
  function route(e) {
    if (dialog && dialog.open) dialog.close();
    let key = location.hash.slice(1) || 'home';
    if (key === 'work' || key.startsWith('work/')) key = 'portfolio' + key.slice(4);
    if (aliases[key]) key = aliases[key];
    if ('#' + key !== location.hash && location.hash) history.replaceState(null, '', '#' + key);
    const target = document.querySelector(`[data-page="${CSS.escape(key)}"]`) ? key : 'home';
    document.querySelectorAll('[data-page]').forEach(n => { n.hidden = n.dataset.page !== target; });
    const section = target.split('/')[0];
    document.querySelectorAll('[data-nav]').forEach(a => {
      if (a.dataset.nav === section) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    const page = document.querySelector(`[data-page="${CSS.escape(target)}"]`);
    document.title = page.dataset.title ? `${page.dataset.title} · Son Duong` : baseTitle;
    window.scrollTo(0, 0);  // smooth via CSS scroll-behavior, instant with reduced motion
    if (target === 'about') about.enter(); else about.leave();
    if (e) {  // on navigation (not first load), put keyboard and screen reader focus on the new page
      page.tabIndex = -1;
      page.focus({ preventScroll: true });
    }
  }
  window.addEventListener('hashchange', route);

  // ---- pop-up: documents in a frame (data-frame, the only place they open), pictures (data-image), templates (data-doc) ----
  if (dialog) {
    const title = dialog.querySelector('[data-doc-title]');
    const kicker = dialog.querySelector('[data-doc-kicker]');
    const body = dialog.querySelector('[data-doc-body]');
    const vi = () => root.lang === 'vi';

    function open({ heading, label, wide }) {
      title.textContent = heading || '';
      kicker.textContent = label || '';
      dialog.classList.toggle('doc-wide', !!wide);
      body.scrollTop = 0;
      if (!dialog.open) dialog.showModal();
    }

    // A document from work/ (same site): links inside it are kept tidy, so the pop-up behaves like one page.
    function wireFrame(frame) {
      let doc, win;
      try { doc = frame.contentDocument; win = frame.contentWindow; } catch (e) { return; }
      if (!doc || !win) return;
      // The pop-up's body color shows around the document's card: its own page color (dark, for when it is opened on its own) is cleared.
      const see = doc.createElement('style');
      see.textContent = 'html, body, :not(article, article *):has(article) { background: transparent !important; }';
      doc.head.append(see);
      frame.classList.add('is-ready');
      const name = (doc.title || '').split(' · ')[0].trim();
      if (name) { title.textContent = name; frame.title = name; }  // the frame's name follows the document it shows
      doc.addEventListener('click', e => {
        const a = e.target.closest && e.target.closest('a[href]');
        if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const url = new URL(a.getAttribute('href'), win.location.href);
        if (url.origin !== location.origin) {  // sources and the live course: a new tab, never inside the pop-up (documents never leave it)
          e.preventDefault();
          window.open(url.href, '_blank', 'noopener');
        } else if (url.pathname === win.location.pathname && url.hash) {  // contents links: scroll, no history entry
          e.preventDefault();
          const to = doc.getElementById(decodeURIComponent(url.hash.slice(1)));
          if (to) to.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
        } else {  // another document of the project: replace, so browser Back still leaves the project page
          e.preventDefault();
          frame.classList.remove('is-ready');  // the loading screen shows until the next document is wired
          win.location.replace(url.href);
        }
      }, true);
      doc.addEventListener('keydown', e => {  // Escape closes the pop-up, unless the document's own figure viewer is open
        if (e.key === 'Escape' && !doc.querySelector('[aria-modal="true"]')) { e.preventDefault(); shut(); }
      }, true);
    }

    function openFrame(btn) {
      const href = new URL(btn.dataset.frame, location.href).href;
      open({ heading: btn.dataset.title || btn.textContent.trim(), label: btn.dataset.kicker, wide: true });
      const loading = document.createElement('div');
      loading.className = 'doc-loading';
      loading.textContent = vi() ? 'Đang mở tài liệu…' : 'Opening the document…';
      const frame = document.createElement('iframe');
      frame.className = 'doc-frame';
      frame.title = btn.dataset.title || 'Document';
      frame.addEventListener('load', () => wireFrame(frame));
      frame.src = href;
      body.replaceChildren(loading, frame);
    }

    function openImage(btn) {
      const img = btn.querySelector('img');
      const src = new URL(btn.dataset.image, location.href).href;
      open({ heading: btn.dataset.title, label: btn.dataset.kicker, wide: true });
      const wrap = document.createElement('div');
      wrap.className = 'doc-picture';
      const big = document.createElement('img');
      big.src = src;
      big.alt = img ? img.alt : '';
      wrap.append(big);
      body.replaceChildren(wrap);
    }

    function openTemplate(btn) {
      const tpl = document.getElementById(btn.dataset.doc);
      if (!tpl) return;
      open({
        heading: (vi() && tpl.dataset.titleVi) || tpl.dataset.title || btn.textContent.trim(),
        label: (vi() && tpl.dataset.kickerVi) || tpl.dataset.kicker || ''
      });
      body.replaceChildren(tpl.content.cloneNode(true));
      if (vi()) body.querySelectorAll('[data-vi]').forEach(n => { n.innerHTML = n.dataset.vi; });
    }

    document.addEventListener('click', e => {
      const el = e.target.closest('[data-frame], [data-image], [data-doc]');
      if (!el) return;
      if (el.matches('[data-frame]')) {
        openFrame(el);
      } else if (el.matches('[data-image]')) {
        openImage(el);
      } else {
        openTemplate(el);
      }
    });
    // Closing fades out over .2s (styles.css, .is-closing), then the dialog closes and focus goes back; at once with reduced motion.
    let closeTimer = 0;
    function shut() {
      if (!dialog.open || dialog.classList.contains('is-closing')) return;
      if (reduceMotion()) { dialog.close(); return; }
      dialog.classList.add('is-closing');
      closeTimer = setTimeout(() => dialog.close(), 300);  // in case the animation does not run
    }
    dialog.addEventListener('animationend', e => { if (e.animationName === 'doc-out') dialog.close(); });
    dialog.addEventListener('cancel', e => {  // Escape
      if (reduceMotion()) return;
      e.preventDefault();
      shut();
    });
    dialog.querySelector('[data-doc-close]').addEventListener('click', shut);
    // A click on the dimmed area around the box closes it, but only if the press started there too
    // (so selecting text and letting go outside the box keeps it open).
    const outside = e => {
      const r = dialog.getBoundingClientRect();
      return e.target === dialog && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom);
    };
    let pressedOutside = false;
    dialog.addEventListener('pointerdown', e => { pressedOutside = outside(e); });
    dialog.addEventListener('click', e => {
      if (pressedOutside && outside(e)) shut();
      pressedOutside = false;
    });
    dialog.addEventListener('close', () => {
      clearTimeout(closeTimer);
      dialog.classList.remove('is-closing', 'doc-wide');
      body.replaceChildren();
    });
  }

  // ---- language: English is in the markup, Vietnamese in data-vi ----
  let greetRun = null;  // (the greeting's decoding, below; a switch ends it first)
  function setLang(lang) {
    if (greetRun) greetRun.halt();
    document.querySelectorAll('[data-vi]').forEach(n => {
      if (n.dataset.en === undefined) n.dataset.en = n.innerHTML;
      n.innerHTML = lang === 'vi' ? n.dataset.vi : n.dataset.en;
    });
    root.lang = lang;
    document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    store.set('lang', lang);
  }

  // ---- theme: light unless the visitor picks dark ----
  // On a switch, theme-fading on <html> fades every color for 400ms (styles.css); not on the first paint, nor with reduced motion.
  let fadeTimer;
  function setTheme(theme, fade) {
    if (fade && !reduceMotion() && (root.dataset.theme === 'dark') !== (theme === 'dark')) {
      root.classList.add('theme-fading');
      clearTimeout(fadeTimer);
      fadeTimer = setTimeout(() => root.classList.remove('theme-fading'), 400);
    }
    if (theme === 'dark') root.dataset.theme = 'dark'; else delete root.dataset.theme;
    document.querySelectorAll('[data-theme-set]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.themeSet === theme)));
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#131211' : '#ffffff';
  }

  document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
  document.querySelectorAll('[data-theme-set]').forEach(b => b.addEventListener('click', () => {
    setTheme(b.dataset.themeSet, true);
    store.set('theme', b.dataset.themeSet);
  }));

  // Vietnamese only applies while its button is shown (it is hidden in index.html for now).
  const viButton = document.querySelector('[data-lang="vi"]');
  if (viButton && !viButton.hidden && store.get('lang') === 'vi') setLang('vi');
  setTheme(root.dataset.theme === 'dark' ? 'dark' : 'light');
  // ---- the greeting: once per page load, its letters are decoded like the About intro's; then "I'm Son." takes its color with a press ----
  // While the letters settle, the whole line is in the text color; then, like a pressed key, the color runs to a hot orange and
  // settles into the accent as the key comes back up, over about three seconds (styles.css, gr-press).
  const greeting = document.querySelector('.side h1');
  if (greeting && !reduceMotion()) {
    greeting.classList.add('is-decoding', 'gr-wait');
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(() => {
      greetRun = decode([greeting], () => {  // (about 2 seconds, slower than the About intro's)
        greetRun = null;
        setTimeout(() => {
          greeting.classList.remove('gr-wait');
          const accent = greeting.querySelector('.accent');
          if (accent) accent.classList.add('gr-press');
        }, 260);
      }, 2.2);
    }, 250));
  }
  // ---- copy the email: the button shows a tick and a short note for a moment ----
  document.querySelectorAll('[data-copy]').forEach(btn => {
    const note = btn.parentElement.querySelector('.copy-note');
    let timer;
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      let ok = false;
      try { await navigator.clipboard.writeText(text); ok = true; } catch (e) {
        const t = document.createElement('textarea');
        t.value = text; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
        document.body.append(t); t.select();
        try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
        t.remove();
      }
      btn.classList.toggle('is-done', ok);
      if (note) { note.textContent = ok ? 'Email copied' : 'Copy did not work'; note.classList.add('is-shown'); }
      clearTimeout(timer);
      timer = setTimeout(() => { btn.classList.remove('is-done'); if (note) { note.classList.remove('is-shown'); note.textContent = ''; } }, 1800);
    });
  });

  // ---- decoding: a paragraph's letters flicker through other characters and settle, like an old terminal ----
  // The real paragraph keeps its place with transparent text (.is-decoding). On top of it an aria-hidden layer holds one element per
  // letter, put where the real letter is (measured once), so nothing moves and the lines break as they do. The layer is removed at the end.
  const HEAD = 4, STEP = 110, HEAD_MS = (HEAD - 1) * STEP + 150;  // the first characters go one after another; the rest follows together
  const pool = { n: 'il|!.,:;', m: 'aceonsuvxz0123456789#%&*+=?', w: 'mwMW@%&' };  // by width, so a flicker looks like the letter it hides
  function layer(p) {
    const nodes = [], walk = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
    while (walk.nextNode()) if (walk.currentNode.data.trim()) nodes.push(walk.currentNode);
    if (!nodes.length) return null;
    const box = p.getBoundingClientRect(), em = parseFloat(getComputedStyle(p).fontSize) || 15;
    const range = document.createRange(), el = document.createElement('span'), list = [];
    el.className = 'dc';
    el.setAttribute('aria-hidden', 'true');
    const add = (ch, r, w, k) => {
      const i = document.createElement('i');
      i.style.cssText = `left:${(r.left - box.left).toFixed(2)}px;top:${(r.top - box.top).toFixed(2)}px;width:${w.toFixed(2)}px;height:${r.height.toFixed(2)}px;line-height:${r.height.toFixed(2)}px`;
      el.append(i);
      list.push({ i, ch, k, cls: w < em * .4 ? 'n' : w > em * .78 ? 'w' : 'm', start: 0, end: 0, swap: 0, head: k < HEAD, done: false });
    };
    let before = null, base = 0;  // the letter just before this one, when no space is between them; where this text starts in the whole
    for (const node of nodes) {
      const text = node.data;
      for (let k = 0; k < text.length; k++) {
        if (/\s/.test(text[k])) { before = null; continue; }
        range.setStart(node, k);
        range.setEnd(node, k + 1);
        const r = range.getBoundingClientRect();
        // the line broke inside the word: the hyphen the browser draws at the end of the line above is drawn too
        if (before && k && r.top > before.top + r.height / 2 && text[k - 1] !== '-') add('-', { left: before.right, top: before.top, height: before.height }, em * .34, base + k - 1);
        add(text[k], r, r.width, base + k);
        before = r;
      }
      base += text.length;
    }
    p.append(el);
    return { p, el, list };
  }
  function decode(paragraphs, end, pace = 1) {  // the paragraphs one after another: the next one starts as the rest of the last one begins
    // (pace stretches every time in it: 2 is twice as slow, the flicker included; the greeting uses 2.2)
    const layers = paragraphs.map(layer).filter(Boolean);
    const all = [];
    layers.forEach((L, n) => {
      const at = n * HEAD_MS * pace;
      L.list.forEach(g => {
        if (g.head) { g.start = at + g.k * STEP * pace; g.end = g.start + 150 * pace; }
        else { g.start = at + (HEAD_MS + Math.random() * 80) * pace; g.end = at + (HEAD_MS + 180 + Math.random() * 240) * pace; }
        all.push(g);
      });
    });
    let id = 0, t0 = 0, left = all.length;
    function halt() {
      cancelAnimationFrame(id);
      layers.forEach(L => { L.el.remove(); L.p.classList.remove('is-decoding'); });
      end();
    }
    function tick(now) {
      t0 = t0 || now;
      const t = now - t0;
      for (const g of all) {
        if (g.done || t < g.start) continue;
        if (t >= g.end) { g.i.textContent = g.ch; g.i.className = ''; g.done = true; left--; continue; }
        if (t >= g.swap) {
          const set = pool[g.cls];
          g.i.textContent = set[Math.floor(Math.random() * set.length)];
          g.i.className = g.head ? 'h' : 'r';
          g.swap = t + (50 + Math.random() * 30) * pace;
        }
      }
      if (left) id = requestAnimationFrame(tick); else halt();
    }
    id = requestAnimationFrame(tick);
    return { halt };
  }

  // ---- About: two stages and a scroll bar ----
  // The intro ("So, what is this page about?", in three parts) and the four periods are plain content in the markup. While the About page
  // is open, and the visitor has not yet scrolled past one of them, it becomes a stage (.is-stage, styles.css): a card that sticks to the
  // window while its track gives it scroll, shows one part at a time, and is as tall as the part it shows. The intro's words are decoded
  // letter by letter; the periods' years turn over on a split-flap board. Scrolling is never touched: one passive scroll listener only
  // reads the position (in a requestAnimationFrame). Past its last part a stage turns back into plain content for good (until the page
  // is loaded again), once the scrolling has settled. With reduced motion, or in a window under 480px high (a phone on its side), there
  // are no stages. A thin bar along the top of the window fills with the page's scroll position. While the page is closed nothing runs,
  // and the listeners go with it.
  const about = (() => {
    const page = document.querySelector('[data-page="about"]');
    const none = { enter() {}, leave() {} };
    if (!page) return none;
    const main = page.closest('.main');
    const fill = page.querySelector('.scroll-bar i');
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const tight = matchMedia('(max-height: 479px)');  // too little room for a stage: plain content reads better
    let open = false, frameId = 0, again = 0, maxY = 1, drawn = '', hold = 0;
    const resizes = new ResizeObserver(() => remeasure());

    const jump = y => {  // an instant scroll (the page scrolls smoothly otherwise)
      root.style.scrollBehavior = 'auto';
      window.scrollTo(0, y);
      root.style.scrollBehavior = '';
    };

    // ---- the intro: the words of each part are decoded ----
    // A part read before comes back with a short fade instead (it would be tiring to see it decoded again).
    const words = part => [...part.querySelectorAll('p')];
    function introKind(track, items, wait) {
      const frame = track.querySelector('.stage-frame');
      const seen = new Set();
      const sign = () => frame.clientWidth + ':' + items.map(p => p.offsetHeight).join();
      let run = null, sig = '';
      const calm = () => { if (run) run.halt(); };
      return {
        start() {},
        stop() {
          calm();
          seen.clear();
          items.forEach(p => { p.classList.remove('soft'); p.querySelectorAll('p').forEach(q => q.classList.remove('is-decoding')); });
        },
        change(to, from) {  // the old part fades out while the card moves to the height of the new one
          calm();
          if (from >= 0) items[from].classList.remove('soft');
          if (!seen.has(to)) words(items[to]).forEach(p => p.classList.add('is-decoding'));
          return from < 0 ? Promise.resolve() : wait(300);
        },
        shown(to, alive) {
          if (seen.has(to)) { items[to].classList.add('soft'); return; }
          seen.add(to);
          // (after the fonts are in: the letters are put where the real ones are)
          Promise.resolve(document.fonts && document.fonts.ready).then(() => {
            if (!alive()) return;
            sig = sign();
            run = decode(words(items[to]), () => { run = null; });
          });
        },
        relayout() { if (run && sign() !== sig) run.halt(); },  // the real text moved (a resize, a font): show it as it is
        anchor: i => items[i],
        keepsTop: true
      };
    }

    // ---- the periods: the years on a split-flap board, one cell per character ----
    function periodsKind(track, items) {
      const board = track.querySelector('.board');
      const labels = items.map(p => p.querySelector('.period-years').textContent.trim());
      const size = Math.max(...labels.map(l => l.length));
      const cells = [];
      let flaps = [];

      // The pictures: a period's picture shows when its file loads; if there is none, the placeholder stays and the img is dropped.
      track.querySelectorAll('.period-pic img').forEach(img => {
        const ok = () => img.parentElement.classList.add('has-photo');
        const no = () => img.remove();
        img.addEventListener('load', ok);
        img.addEventListener('error', no);
        if (img.complete) (img.naturalWidth ? ok : no)();
      });

      // A cell flips to its new character: the top flap folds down, the bottom flap drops.
      function build() {
        board.replaceChildren();
        cells.length = 0;
        for (let k = 0; k < size; k++) {
          const el = document.createElement('span');
          el.className = 'bd-cell';
          el.innerHTML = ['top', 'bot', 'fold', 'drop'].map(n => `<span class="bd-half bd-${n}"><i></i></span>`).join('');
          board.append(el);
          const c = { ch: ' ' };
          ['top', 'bot', 'fold', 'drop'].forEach(n => { c[n] = el.querySelector(`.bd-${n}`); });
          cells.push(c);
        }
      }
      const put = (c, ch, halves) => halves.forEach(n => {
        const i = c[n].firstChild;
        i.textContent = ch.trim();
        i.classList.toggle('bd-letter', /\p{L}/u.test(ch));
      });
      function flip(to) {  // resolves when the whole board shows period `to` (-1: blank); the cells start 45ms apart, about 0.85s in all
        const label = to < 0 ? '' : labels[to];
        flaps = [];
        cells.forEach((c, k) => {
          const next = label[k] || ' ';
          if (c.ch === ' ' && next === ' ') return;
          put(c, next, ['top', 'drop']);  // the new character waits under the top flap and on the bottom flap; the old one stays on the rest
          const d = k * 45;
          flaps.push(
            c.fold.animate([{ transform: 'rotateX(0)', filter: 'brightness(1)' }, { transform: 'rotateX(-90deg)', filter: 'brightness(.55)' }], { duration: 180, delay: d, easing: 'ease-in', fill: 'both' }),
            c.drop.animate([{ transform: 'rotateX(90deg)', filter: 'brightness(.55)' }, { transform: 'rotateX(0)', filter: 'brightness(1)' }], { duration: 220, delay: d + 180, easing: 'ease-out', fill: 'both' })
          );
        });
        const mine = flaps;
        return Promise.all(mine.map(a => a.finished.catch(() => {}))).then(() => {
          cells.forEach((c, k) => { c.ch = label[k] || ' '; put(c, c.ch, ['top', 'bot', 'fold', 'drop']); });
          mine.forEach(a => a.cancel());
        });
      }
      return {
        start: build,
        stop() { flaps.forEach(a => a.cancel()); board.replaceChildren(); items.forEach(p => p.classList.remove('is-pic')); },
        change(to, from) {  // the old words fade out, the board flips (the picture changes with it), then the new words fade in
          if (from >= 0) items[from].classList.remove('is-pic');
          items[to].classList.add('is-pic');
          return flip(to);
        },
        shown() {},
        relayout() {},
        anchor: i => items[i].querySelector('.period-body')
      };
    }

    // ---- a stage ----
    function stage(track) {
      const pinEl = track.querySelector('.stage-pin'), card = track.querySelector('.stage-card'), frame = track.querySelector('.stage-frame');
      const items = [...track.querySelectorAll('.stage-item')];
      const timers = new Set();
      const wait = ms => new Promise(r => { const t = setTimeout(() => { timers.delete(t); r(); }, ms); timers.add(t); });
      const kind = (track.dataset.stage === 'path' ? periodsKind : introKind)(track, items, wait);
      let running = false, done = false, armed = false;
      let stick = 0, top0 = 0, travel = 0, plan = [];  // measured: where the card sticks, where the track starts, how far it travels, each part's stretch of scroll
      let shown = -1, want = -1, busy = false, turn = 0, calm = 0;
      // The rail: one short bar per part along the top of the card; a bar fills when its part comes in (one step at a time).
      const rail = document.createElement('div');
      rail.className = 'stage-rail';
      rail.setAttribute('aria-hidden', 'true');
      const bars = items.map(() => { const bar = document.createElement('i'), fill = document.createElement('b'); bar.append(fill); rail.append(bar); return fill; });
      const filled = items.map(() => -1);
      card.append(rail);

      // ---- the scroll: where the stage sticks and how far it travels (measured when the page opens or changes size) ----
      // A part gets a short stretch of scroll (a quarter of the window, 140 to 240px), so one light scroll brings the next part; a part
      // taller than the room the card has gets the extra it needs, and its words scroll up with the finger until its end, then the next
      // part comes. The card is as tall as its part and what is around it (chrome), but never taller than the window gives it.
      const fit = i => track.style.setProperty('--card-h', plan[i].card + 'px');
      function measure() {
        if (!running) return;
        const full = pinEl.offsetHeight, chrome = card.offsetHeight - frame.clientHeight, room = full - chrome;
        const screen = Math.min(240, Math.max(140, innerHeight * .24));
        let at = 0;
        plan = items.map(p => {
          const h = p.offsetHeight, over = Math.max(0, Math.ceil(h - room));
          const one = { start: at, over, card: Math.min(full, Math.ceil(chrome + h)) };
          at += screen + over;
          return one;
        });
        travel = at;
        track.style.setProperty('--travel', travel + 'px');
        stick = parseFloat(getComputedStyle(pinEl).top) || 0;
        top0 = track.getBoundingClientRect().top + scrollY - stick;
        fit(Math.max(0, want));
        kind.relayout();
      }
      function update() {
        if (!running) return;
        clearTimeout(calm);
        const far = scrollY - top0;  // how far the card has been stuck
        const s = Math.min(far, travel);  // (past the end it keeps showing the last part as it scrolls away)
        // Past the last part, the plain content takes over as soon as the scrolling pauses (nothing for 120ms: switching mid-glide would
        // cancel a smooth scroll that is still on its way, a key press or a link that takes focus).
        if (far > travel + 2) calm = setTimeout(() => finish(items.length - 1), 120);
        if (!armed) {  // the first part shows once the stage is well into the window
          if (s < stick - innerHeight * .6) return;
          armed = true;
        }
        let i = items.length - 1;
        while (i > 0 && s < plan[i].start) i--;
        // a part taller than its room moves with the scroll until its end; a short one stays still
        const shift = Math.min(plan[i].over, Math.max(0, s - plan[i].start));
        const px = shift.toFixed(1);
        if (items[i].style.getPropertyValue('--shift') !== px) items[i].style.setProperty('--shift', px);
        bars.forEach((fill, k) => {
          const v = k <= i ? 1 : 0;
          if (filled[k] !== v) { filled[k] = v; fill.style.transform = `scaleX(${v})`; }
        });
        go(i);
      }

      // Go to part i: the old one goes out, the card moves to the height of the new one, then the new one comes in.
      // If the visitor moves on meanwhile, the stage settles on the latest part when it is done.
      function go(i) {
        want = i;
        if (!busy) settle();
      }
      function settle() {
        if (want === shown) return;
        const to = want, from = shown, mine = ++turn;
        busy = true;
        if (from >= 0) items[from].classList.remove('is-on');
        fit(to);
        track.classList.add('is-live');
        track.classList.toggle('is-last', to === items.length - 1);  // (the arrow that says there is more goes away on the last part)
        kind.change(to, from).then(() => {
          if (mine !== turn) return;
          busy = false;
          shown = to;
          if (want === shown) {
            items[shown].classList.add('is-on');
            kind.shown(shown, () => mine === turn);
          } else settle();
        });
      }

      // ---- start and stop ----
      function start() {
        if (done || running) return;
        running = true;
        shown = want = -1;
        armed = false;
        track.classList.add('is-stage', 'no-tween');
        kind.start();
        measure();
        void card.offsetHeight;  // (the card takes its first height without moving to it)
        track.classList.remove('no-tween');
      }
      function stop() {
        if (!running) return;
        running = false;
        turn++;
        busy = false;
        clearTimeout(calm);
        timers.forEach(clearTimeout);
        timers.clear();
        kind.stop();
        track.classList.remove('is-stage', 'is-live', 'is-last', 'no-tween');
        track.style.removeProperty('--travel');
        track.style.removeProperty('--card-h');
        items.forEach(p => { p.classList.remove('is-on'); p.style.removeProperty('--shift'); });
        bars.forEach((fill, k) => { filled[k] = -1; fill.style.removeProperty('transform'); });
      }
      // Back to plain content for good. What is on screen stays where it is: the block after the stage when the card has scrolled out
      // or the page is at its end (the stage's empty room under the card goes, and what is after it must not move), otherwise the part
      // that was showing, or, when the stage is out of sight, the block above it.
      function finish(i) {
        const r = track.getBoundingClientRect(), c = card.getBoundingClientRect();
        const part = i >= 0 ? kind.anchor(i) : null;
        const end = scrollY >= root.scrollHeight - root.clientHeight - 2;
        const seen = c.bottom > 0 && c.top < innerHeight;
        // the intro: its heading stays at the top and the whole block shows under it, so the visitor sees all of it before going on
        const top = kind.keepsTop && seen;
        const mark = top ? card
          : r.bottom <= 0 || c.bottom <= 0 || end ? track.nextElementSibling
          : part && r.top < innerHeight ? part
          : track.previousElementSibling;
        const edge = el => top ? el.getBoundingClientRect().top : el.getBoundingClientRect().bottom;
        // (the intro's heading goes back to where the card stuck, in case the page moved on a little before the scrolling paused)
        const before = top ? stick : edge(mark);
        done = true;
        stop();
        const after = edge(mark);  // (measured first: it lays the page out, and the scroll position settles)
        const goal = Math.max(0, scrollY + after - before);
        // The page is shorter now. With a tall window the scroll position that keeps the words where they were can be lower than the new
        // bottom of the page; the page then gets the missing height as space under the footer (hold), until the visitor scrolls up past it or leaves.
        const lack = goal - (root.scrollHeight - root.clientHeight);
        if (lack > 0) {
          hold += Math.ceil(lack);
          main.style.paddingBottom = hold + 'px';
        }
        jump(goal);
        track.classList.add('just-done');
        track.classList.toggle('fresh', mark !== part);  // (when no part kept its place, all of them come in softly)
        setTimeout(() => track.classList.remove('just-done', 'fresh'), 700);
        measureAll();  // (the stages after this one now start higher on the page)
      }
      return { track, items, start, stop, measure, update, finish, running: () => running, wanted: () => want };
    }

    const stages = [...page.querySelectorAll('[data-stage]')].map(stage);

    // ---- coming into view: the fun fact and the block after the periods come in once each, the first time they are seen ----
    // (styles.css, data-reveal; once per page load, nothing with reduced motion)
    const reveals = [...page.querySelectorAll('[data-reveal]')];
    if (reveals.length && 'IntersectionObserver' in window && !motion.matches) {
      page.classList.add('reveal-on');
      const watch = new IntersectionObserver(list => list.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        watch.unobserve(e.target);
      }), { threshold: .25 });
      reveals.forEach(el => watch.observe(el));
    }

    // ---- the page: the scroll bar, the sizes, start and stop ----
    function unhold() {
      if (!hold) return;
      hold = 0;
      main.style.removeProperty('padding-bottom');
    }
    function measureAll() {
      stages.forEach(s => s.measure());
      maxY = Math.max(1, root.scrollHeight - root.clientHeight);
    }
    function remeasure() {
      cancelAnimationFrame(again);
      again = requestAnimationFrame(() => { if (open) { measureAll(); render(); } });
    }
    function render() {
      frameId = 0;
      if (hold && scrollY <= maxY - hold) { unhold(); maxY = Math.max(1, root.scrollHeight - root.clientHeight); }
      stages.forEach(s => s.update());
      const p = Math.min(1, Math.max(0, scrollY / maxY)).toFixed(4);
      if (fill && p !== drawn) { drawn = p; fill.style.transform = `scaleX(${p})`; }
    }
    const onScroll = () => { if (!frameId) frameId = requestAnimationFrame(render); };
    const bail = e => { if (e.matches && open) stages.forEach(s => s.running() && s.finish(s.wanted())); };  // reduced motion turned on, or the window got too short: plain content, with the part being read kept in place
    function enter() {
      if (open) return;
      open = true;
      drawn = '';
      jump(0);
      if (!motion.matches && !tight.matches) stages.forEach(s => s.start());
      measureAll();
      render();
      addEventListener('scroll', onScroll, { passive: true });
      motion.addEventListener('change', bail);
      tight.addEventListener('change', bail);
      [page, ...stages.flatMap(s => [s.track.querySelector('.stage-pin'), ...s.items])].forEach(n => resizes.observe(n));
    }
    function leave() {
      unhold();
      if (!open) return;
      open = false;
      stages.forEach(s => s.stop());
      removeEventListener('scroll', onScroll);
      motion.removeEventListener('change', bail);
      tight.removeEventListener('change', bail);
      resizes.disconnect();
      cancelAnimationFrame(frameId);
      cancelAnimationFrame(again);
      frameId = again = 0;
    }
    return { enter, leave };
  })();

  route();
})();
