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
  function setLang(lang) {
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

  // ---- About: the four periods ----
  // In the markup they are a plain list. While the About page is open, and the visitor has not yet scrolled past the last period,
  // the list becomes a stage (.is-stage, styles.css): the block sticks to the window while the track gives it scroll, one period shows
  // at a time, and its years turn over on a split-flap board. Scrolling is never touched: the script only reads the scroll position.
  // Past the last period the stage turns back into the list for good (until the page is loaded again), once the scrolling has
  // settled. With reduced motion, or in a window under 480px high (a phone on its side), there is no stage. While the page is
  // closed nothing runs, and the listeners go with it.
  const about = (() => {
    const track = document.querySelector('[data-path]');
    const none = { enter() {}, leave() {} };
    if (!track) return none;
    const block = track.querySelector('.about-path');
    const board = track.querySelector('.board');
    const frame = track.querySelector('.periods');
    const periods = [...track.querySelectorAll('.period')];
    const labels = periods.map(p => p.querySelector('.period-years').textContent.trim());
    const size = Math.max(...labels.map(l => l.length));
    const main = track.closest('.main');
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const tight = matchMedia('(max-height: 479px)');  // too little room for a stage: the list reads better
    let running = false, done = false;
    let pin = 0, top0 = 0, travel = 0, plan = [], armed = false;  // measured: where the stage sticks, how far it travels, each period's stretch of scroll
    let shown = -1, want = -1, busy = false, gen = 0, frameId = 0, again = 0, calm = 0, hold = 0, flaps = [];
    const cells = [];
    const resizes = new ResizeObserver(() => remeasure());

    // The pictures: a period's picture shows when its file loads; if there is none, the placeholder stays and the img is dropped.
    track.querySelectorAll('.period-pic img').forEach(img => {
      const ok = () => img.parentElement.classList.add('has-photo');
      const no = () => img.remove();
      img.addEventListener('load', ok);
      img.addEventListener('error', no);
      if (img.complete) (img.naturalWidth ? ok : no)();
    });

    const jump = y => {  // an instant scroll (the page scrolls smoothly otherwise)
      root.style.scrollBehavior = 'auto';
      window.scrollTo(0, y);
      root.style.scrollBehavior = '';
    };

    // ---- the board: one cell per character; a cell flips to its new character (the top flap folds down, the bottom flap drops) ----
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
    // Go to period i: the old words fade out, the board flips (the picture changes with it), then the new words fade in.
    // If the visitor moves on while it flips, the board settles on the latest period when it is done.
    function go(i) {
      want = i;
      if (!busy) settle();
    }
    function settle() {
      if (want === shown) return;
      const to = want, mine = gen;
      busy = true;
      if (shown >= 0) periods[shown].classList.remove('is-on', 'is-pic');
      periods[to].classList.add('is-pic');
      flip(to).then(() => {
        if (mine !== gen) return;
        busy = false;
        shown = to;
        if (want === shown) periods[shown].classList.add('is-on'); else settle();
      });
    }

    // ---- the scroll: where the stage sticks and how far it travels (measured when the page opens or changes size) ----
    // A period gets a screen of scroll (85% of the window), and a period taller than the window gets the extra it needs, so its words
    // can scroll up (only after the first 45% of that screen, so the opening lines can be read first).
    function measure() {
      const room = frame.clientHeight, screen = Math.min(900, Math.max(360, innerHeight * .85));
      let at = 0;
      plan = periods.map(p => {
        const over = Math.max(0, Math.ceil(p.offsetHeight - room));
        const one = { start: at, over, lead: screen * .45 };
        at += screen + over;
        return one;
      });
      travel = at;
      track.style.setProperty('--travel', travel + 'px');
      pin = parseFloat(getComputedStyle(block).top) || 0;
      top0 = track.getBoundingClientRect().top + scrollY - pin;
    }
    function remeasure() {
      cancelAnimationFrame(again);
      again = requestAnimationFrame(() => { if (running) { measure(); update(); } });
    }
    function update() {
      frameId = 0;
      if (!running) return;
      clearTimeout(calm);
      const far = scrollY - top0;  // how far the stage has been stuck
      const s = Math.min(far, travel);  // (past the end it keeps showing the last period as it scrolls away)
      // Past the last period. The list takes over only when the scrolling has settled (nothing for 120ms): switching mid-glide
      // would cancel a smooth scroll that is still on its way (a key press, a link that takes focus).
      if (far > travel + 2) calm = setTimeout(() => finish(periods.length - 1), 120);
      if (!armed) {  // the first period shows once the stage is well into the window
        if (s < pin - innerHeight * .6) return;
        armed = true;
      }
      let i = periods.length - 1;
      while (i > 0 && s < plan[i].start) i--;
      const shift = Math.min(plan[i].over, Math.max(0, s - plan[i].start - plan[i].lead));
      const px = shift.toFixed(1);
      if (periods[i].style.getPropertyValue('--shift') !== px) periods[i].style.setProperty('--shift', px);
      go(i);
    }
    const onScroll = () => { if (!frameId) frameId = requestAnimationFrame(update); };

    // ---- start and stop ----
    function stop() {
      running = false;
      gen++;
      busy = false;
      removeEventListener('scroll', onScroll);
      motion.removeEventListener('change', bail);
      tight.removeEventListener('change', bail);
      resizes.disconnect();
      clearTimeout(calm);
      cancelAnimationFrame(frameId); cancelAnimationFrame(again);
      frameId = again = 0;
      flaps.forEach(a => a.cancel());
      track.classList.remove('is-stage');
      track.style.removeProperty('--travel');
      periods.forEach(p => { p.classList.remove('is-on', 'is-pic'); p.style.removeProperty('--shift'); });
      board.replaceChildren();
    }
    // The stage is gone, so the page is shorter. With a tall window the scroll position that keeps the words where they were can be
    // lower than the new bottom of the page; the page then gets the missing height as space under the footer (hold), until the visitor
    // scrolls up past it or leaves.
    function unhold() {
      if (!hold) return;
      hold = 0;
      main.style.removeProperty('padding-bottom');
      removeEventListener('scroll', onHold);
    }
    function onHold() { if (scrollY + root.clientHeight <= root.scrollHeight - hold) unhold(); }
    // Back to the list for good. What is on screen stays where it is: period i's words (the one that was showing; the last one when
    // the stage was scrolled to its end), or, when the stage is out of sight, the block above or below it, keep their place.
    function finish(i) {
      const r = track.getBoundingClientRect();
      const mark = r.bottom <= 0 ? track.nextElementSibling
        : i >= 0 && r.top < innerHeight ? periods[i].querySelector('.period-body')
        : track.previousElementSibling;
      const before = mark.getBoundingClientRect().bottom;
      done = true;
      stop();
      const after = mark.getBoundingClientRect().bottom;  // (measured first: it lays the page out, and the scroll position settles)
      const goal = Math.max(0, scrollY + after - before);
      const lack = goal - (root.scrollHeight - root.clientHeight);
      if (lack > 0) {
        hold = Math.ceil(lack);
        main.style.paddingBottom = hold + 'px';
        addEventListener('scroll', onHold, { passive: true });
      }
      jump(goal);
      track.classList.add('just-done');
      setTimeout(() => track.classList.remove('just-done'), 700);
    }
    const bail = e => { if (e.matches && running) finish(want); };  // reduced motion turned on, or the window got too short: the list, with the period being read kept in place
    function enter() {
      if (done || running || motion.matches || tight.matches) return;
      running = true;
      shown = want = -1; armed = false;
      jump(0);
      track.classList.add('is-stage');
      build();
      measure();
      update();
      addEventListener('scroll', onScroll, { passive: true });
      motion.addEventListener('change', bail);
      tight.addEventListener('change', bail);
      [block, track.parentElement, ...periods].forEach(n => resizes.observe(n));
    }
    return { enter, leave() { if (running) stop(); unhold(); } };
  })();

  route();
})();
