(() => {
  const root = document.documentElement;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  // ---- pages: #home, #work, #work/<case-id>, #about ----
  const pages = ['home', 'work', 'about'];
  function route() {
    const [page, anchor] = (location.hash.slice(1) || 'home').split('/');
    const current = pages.includes(page) ? page : 'home';
    document.querySelectorAll('[data-page]').forEach(n => { n.hidden = n.dataset.page !== current; });
    document.querySelectorAll('[data-nav]').forEach(a => {
      if (a.dataset.nav === current) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    const target = anchor && document.getElementById(anchor);
    if (target) requestAnimationFrame(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    else window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const savedLang = store.get('lang');
  if (savedLang === 'vi') setLang('vi');
  setTheme(root.dataset.theme === 'dark' ? 'dark' : 'light');
  route();
})();
