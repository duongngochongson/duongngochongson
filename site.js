(() => {
  const root = document.documentElement;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  // ---- pages: #home, #portfolio, #portfolio/<project>, #about ----
  // The portfolio list reuses the project cards from Home, so a project is added in one place.
  const list = document.querySelector('[data-project-list]');
  const listCopy = document.querySelector('[data-project-list-copy]');
  if (list && listCopy) listCopy.append(...[...list.children].map(n => n.cloneNode(true)));

  const baseTitle = document.title;
  function route() {
    let key = location.hash.slice(1) || 'home';
    if (key === 'work' || key.startsWith('work/')) {  // old links
      history.replaceState(null, '', '#portfolio' + key.slice(4));
      key = 'portfolio' + key.slice(4);
    }
    const target = document.querySelector(`[data-page="${CSS.escape(key)}"]`) ? key : 'home';
    document.querySelectorAll('[data-page]').forEach(n => { n.hidden = n.dataset.page !== target; });
    const section = target.split('/')[0];
    document.querySelectorAll('[data-nav]').forEach(a => {
      if (a.dataset.nav === section) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    const page = document.querySelector(`[data-page="${CSS.escape(target)}"]`);
    document.title = page.dataset.title ? `${page.dataset.title} — Son Duong` : baseTitle;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  window.addEventListener('hashchange', route);

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

  // ---- theme ----
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

  // ---- Saigon clock ----
  function tick() {
    const t = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' });
    document.querySelectorAll('[data-clock]').forEach(n => { n.textContent = t; });
  }
  tick();
  setInterval(tick, 15000);

  // Vietnamese only applies while its button is shown (it is hidden in index.html for now).
  const viButton = document.querySelector('[data-lang="vi"]');
  if (viButton && !viButton.hidden && store.get('lang') === 'vi') setLang('vi');
  setTheme(root.dataset.theme === 'dark' ? 'dark' : 'light');
  route();
})();
