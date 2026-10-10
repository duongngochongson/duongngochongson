(() => {
  const root = document.documentElement;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- the Portfolio page shows the same project cards as Home (without Home's block), so a project is added in one place ----
  const projects = document.querySelector('[data-projects] .proj-list');
  const projectsCopy = document.querySelector('[data-projects-copy]');
  if (projects && projectsCopy) {
    const copy = projects.cloneNode(true);
    copy.querySelectorAll('[id]').forEach(n => { n.id += '-list'; });
    copy.querySelectorAll('[aria-labelledby]').forEach(n => { n.setAttribute('aria-labelledby', n.getAttribute('aria-labelledby') + '-list'); });
    projectsCopy.replaceWith(copy);
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
    document.title = page.dataset.title ? `${page.dataset.title} — Son Duong` : baseTitle;
    window.scrollTo(0, 0);  // smooth via CSS scroll-behavior, instant with reduced motion
    if (e) {  // on navigation (not first load), put keyboard and screen reader focus on the new page
      page.tabIndex = -1;
      page.focus({ preventScroll: true });
    }
  }
  window.addEventListener('hashchange', route);

  // ---- pop-up: documents in a frame (data-frame), pictures (data-image), templates (data-doc) ----
  if (dialog) {
    const title = dialog.querySelector('[data-doc-title]');
    const kicker = dialog.querySelector('[data-doc-kicker]');
    const body = dialog.querySelector('[data-doc-body]');
    const newTab = dialog.querySelector('[data-doc-newtab]');
    const vi = () => root.lang === 'vi';

    function open({ heading, label, wide, tabHref }) {
      title.textContent = heading || '';
      kicker.textContent = label || '';
      dialog.classList.toggle('doc-wide', !!wide);
      newTab.hidden = !tabHref;
      if (tabHref) newTab.href = tabHref;
      body.scrollTop = 0;
      if (!dialog.open) dialog.showModal();
    }

    // A document from work/ (same site): links inside it are kept tidy, so the pop-up behaves like one page.
    function wireFrame(frame) {
      let doc, win;
      try { doc = frame.contentDocument; win = frame.contentWindow; } catch (e) { return; }
      if (!doc || !win) return;
      frame.classList.add('is-ready');
      const name = (doc.title || '').split(' · ')[0].trim();
      if (name) title.textContent = name;
      newTab.href = win.location.href;
      doc.addEventListener('click', e => {
        const a = e.target.closest && e.target.closest('a[href]');
        if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const url = new URL(a.getAttribute('href'), win.location.href);
        if (url.origin !== location.origin) {  // sources and the live course: a new tab, never inside the pop-up
          e.preventDefault();
          window.open(url.href, '_blank', 'noopener');
        } else if (url.pathname === win.location.pathname && url.hash) {  // contents links: scroll, no history entry
          e.preventDefault();
          const to = doc.getElementById(decodeURIComponent(url.hash.slice(1)));
          if (to) to.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
        } else {  // another document of the project: replace, so browser Back still leaves the project page
          e.preventDefault();
          win.location.replace(url.href);
        }
      }, true);
      doc.addEventListener('keydown', e => {  // Escape closes the pop-up, unless the document's own figure viewer is open
        if (e.key === 'Escape' && !doc.querySelector('[aria-modal="true"]')) { e.preventDefault(); dialog.close(); }
      }, true);
    }

    function openFrame(link) {
      const href = link.href;
      open({ heading: link.dataset.title || link.textContent.trim(), label: link.dataset.kicker, wide: true, tabHref: href });
      const loading = document.createElement('div');
      loading.className = 'doc-loading';
      loading.textContent = vi() ? 'Đang mở tài liệu…' : 'Opening the document…';
      const frame = document.createElement('iframe');
      frame.className = 'doc-frame';
      frame.title = link.dataset.title || 'Document';
      frame.addEventListener('load', () => wireFrame(frame));
      frame.src = href;
      body.replaceChildren(loading, frame);
    }

    function openImage(btn) {
      const img = btn.querySelector('img');
      const src = new URL(btn.dataset.image, location.href).href;
      open({ heading: btn.dataset.title, label: btn.dataset.kicker, wide: true, tabHref: src });
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
        // Ctrl/Cmd/Shift-click and middle-click keep the link's own new-tab behaviour.
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        openFrame(el);
      } else if (el.matches('[data-image]')) {
        openImage(el);
      } else {
        openTemplate(el);
      }
    });
    dialog.querySelector('[data-doc-close]').addEventListener('click', () => dialog.close());
    // A click on the dimmed area around the box closes it, but only if the press started there too
    // (so selecting text and letting go outside the box keeps it open).
    const outside = e => {
      const r = dialog.getBoundingClientRect();
      return e.target === dialog && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom);
    };
    let pressedOutside = false;
    dialog.addEventListener('pointerdown', e => { pressedOutside = outside(e); });
    dialog.addEventListener('click', e => {
      if (pressedOutside && outside(e)) dialog.close();
      pressedOutside = false;
    });
    dialog.addEventListener('close', () => {
      body.replaceChildren();
      dialog.classList.remove('doc-wide');
      newTab.hidden = true;
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
  function setTheme(theme) {
    if (theme === 'dark') root.dataset.theme = 'dark'; else delete root.dataset.theme;
    document.querySelectorAll('[data-theme-set]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.themeSet === theme)));
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#131211' : '#ffffff';
  }

  document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
  document.querySelectorAll('[data-theme-set]').forEach(b => b.addEventListener('click', () => {
    setTheme(b.dataset.themeSet);
    store.set('theme', b.dataset.themeSet);
  }));

  // Vietnamese only applies while its button is shown (it is hidden in index.html for now).
  const viButton = document.querySelector('[data-lang="vi"]');
  if (viButton && !viButton.hidden && store.get('lang') === 'vi') setLang('vi');
  setTheme(root.dataset.theme === 'dark' ? 'dark' : 'light');
  route();
})();
