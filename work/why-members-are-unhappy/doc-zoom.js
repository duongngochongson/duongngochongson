/* Figure lightbox for the Cozy documents (its look uses the named values of doc-text.css).
   Any [data-zoom] figure opens full-screen on a night ground. Progressive: without
   this file the figures still read inline, they just do not enlarge.
   While it is open, focus stays inside it (Tab and Shift+Tab go round, the page behind is inert), it is
   a modal dialog only then (aria-modal is set on open and removed on close, so the pop-up of the site can
   tell when a document's own viewer is open), and on close focus goes back to the button that opened it. */
(function () {
  if (window.__cozyDocZoom) return;
  window.__cozyDocZoom = true;

  var overlay, stage, body, cap, closeBtn, lastFocus, lastFig, behind = [];

  function build() {
    overlay = document.createElement('div');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Figure, enlarged');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:90;background:rgba(18,15,10,.93);display:none;align-items:flex-start;justify-content:center;padding:clamp(12px,3vw,40px);overflow:auto;-webkit-font-smoothing:antialiased';

    stage = document.createElement('div');
    stage.style.cssText = 'background:var(--cz-paper);border-radius:var(--cz-radius-box);width:100%;max-width:1400px;box-shadow:0 30px 60px -20px rgba(0,0,0,.6);display:flex;flex-direction:column;overflow:hidden';

    var bar = document.createElement('div');
    bar.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 18px;border-bottom:var(--cz-border);background:var(--cz-desk)";

    cap = document.createElement('span');
    cap.style.cssText = "font:var(--cz-mono-caption);color:var(--cz-ink-soft);min-width:0";

    closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.textContent = 'Close';
    closeBtn.style.cssText = "flex:none;min-height:44px;padding:var(--cz-pad-button);border:var(--cz-border-ink);border-radius:var(--cz-radius-item);background:var(--cz-paper);color:var(--cz-ink);font:var(--cz-sans-strong);cursor:pointer";
    closeBtn.addEventListener('click', close);

    body = document.createElement('div');
    body.style.cssText = 'padding:clamp(14px,2.5vw,28px);overflow:auto';

    bar.appendChild(cap);
    bar.appendChild(closeBtn);
    stage.appendChild(bar);
    stage.appendChild(body);
    overlay.appendChild(stage);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function (e) {
      if (overlay.style.display !== 'flex') return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'Tab') keepFocusInside(e);
    });
  }

  // Tab and Shift+Tab go round inside the dialog; if focus is somewhere outside it, it comes back in.
  function keepFocusInside(e) {
    var list = Array.prototype.filter.call(overlay.querySelectorAll('a[href],button,input,select,textarea,[tabindex]'), function (n) {
      return !n.disabled && n.tabIndex >= 0 && n.getClientRects().length > 0;
    });
    if (!list.length) { e.preventDefault(); return; }
    var first = list[0], last = list[list.length - 1], now = document.activeElement;
    if (!overlay.contains(now)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && now === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && now === last) { e.preventDefault(); first.focus(); }
  }

  // The page behind the dialog cannot take focus or be read while the dialog is open.
  function hidePage() {
    behind = [];
    Array.prototype.forEach.call(document.body.children, function (el) {
      if (el === overlay || el.inert) return;
      el.inert = true;
      behind.push(el);
    });
  }
  function showPage() {
    behind.forEach(function (el) { el.inert = false; });
    behind = [];
  }

  function open(fig) {
    if (!overlay) build();
    var caption = fig.querySelector('figcaption');
    var parts = [];
    if (caption) {
      Array.prototype.forEach.call(caption.childNodes, function (n) {
        if (n.nodeType === 1 && n.hasAttribute && n.hasAttribute('data-zoom-hint')) return;
        var t = (n.textContent || '').trim();
        if (t) parts.push(t);
      });
    }
    cap.textContent = parts.join('  ');
    body.textContent = '';
    Array.prototype.forEach.call(fig.children, function (child) {
      if (child.tagName === 'FIGCAPTION') return;
      if (child.tagName === 'A') return;
      var clone = child.cloneNode(true);
      Array.prototype.forEach.call(clone.querySelectorAll('button,[data-zoom-hint]'), function (n) { n.remove(); });
      body.appendChild(clone);
    });
    lastFig = fig;
    lastFocus = document.activeElement && document.activeElement !== document.body ? document.activeElement : null;
    overlay.style.display = 'flex';
    overlay.setAttribute('aria-modal', 'true');
    hidePage();
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    if (!overlay) return;
    overlay.style.display = 'none';
    overlay.removeAttribute('aria-modal');
    showPage();
    body.textContent = '';
    document.body.style.overflow = '';
    // back to the button that opened it (or, when the figure was opened by a tap on the picture, the figure's own button)
    var back = lastFocus && lastFocus.isConnected ? lastFocus : (lastFig && lastFig.isConnected ? lastFig.querySelector('[data-zoom-hint]') : null);
    if (back && back.focus) back.focus();
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('a[href]')) return;
    var fig = e.target.closest('[data-zoom]');
    if (fig) open(fig);
  });
})();
