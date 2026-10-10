(() => {
  const root = document.documentElement;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  // ---- the Portfolio page shows the same Projects block as Home, so a project is added in one place ----
  const projects = document.querySelector('[data-projects]');
  const projectsCopy = document.querySelector('[data-projects-copy]');
  if (projects && projectsCopy) {
    const copy = projects.cloneNode(true);
    copy.removeAttribute('data-projects');
    copy.querySelectorAll('[id]').forEach(n => { n.id += '-list'; });
    copy.querySelectorAll('[aria-labelledby]').forEach(n => { n.setAttribute('aria-labelledby', n.getAttribute('aria-labelledby') + '-list'); });
    projectsCopy.replaceWith(copy);
  }

  // ---- pages: #home, #portfolio, #portfolio/<project>, #about ----
  const baseTitle = document.title;
  const dialog = document.querySelector('dialog.doc');
  function route(e) {
    if (dialog && dialog.open) dialog.close();
    let key = location.hash.slice(1) || 'home';
    if (key === 'work' || key.startsWith('work/')) {  // old links
      key = 'portfolio' + key.slice(4);
      history.replaceState(null, '', '#' + key);
    }
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

  // ---- document pop-up: a button with data-doc="x" opens <template id="x"> ----
  if (dialog) {
    const title = dialog.querySelector('[data-doc-title]');
    const kicker = dialog.querySelector('[data-doc-kicker]');
    const body = dialog.querySelector('[data-doc-body]');
    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-doc]');
      if (!btn) return;
      const tpl = document.getElementById(btn.dataset.doc);
      if (!tpl) return;
      const vi = root.lang === 'vi';
      title.textContent = (vi && tpl.dataset.titleVi) || tpl.dataset.title || btn.textContent.trim();
      kicker.textContent = (vi && tpl.dataset.kickerVi) || tpl.dataset.kicker || '';
      body.replaceChildren(tpl.content.cloneNode(true));
      if (vi) body.querySelectorAll('[data-vi]').forEach(n => { n.innerHTML = n.dataset.vi; });
      body.scrollTop = 0;
      dialog.showModal();
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
    dialog.addEventListener('close', () => body.replaceChildren());
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
