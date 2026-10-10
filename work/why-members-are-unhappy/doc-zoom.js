/* Figure lightbox for the Cozy documents.
   Any [data-zoom] figure opens full-screen on a night ground. Progressive: without
   this file the figures still read inline, they just do not enlarge. */
(function () {
  if (window.__cozyDocZoom) return;
  window.__cozyDocZoom = true;

  var overlay, stage, body, cap, closeBtn, lastFocus;

  function build() {
    overlay = document.createElement('div');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Figure, enlarged');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:90;background:rgba(18,15,10,.93);display:none;align-items:flex-start;justify-content:center;padding:clamp(12px,3vw,40px);overflow:auto;-webkit-font-smoothing:antialiased';

    stage = document.createElement('div');
    stage.style.cssText = 'background:#FBF7EE;border-radius:16px;width:100%;max-width:1400px;box-shadow:0 30px 60px -20px rgba(0,0,0,.6);display:flex;flex-direction:column;overflow:hidden';

    var bar = document.createElement('div');
    bar.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 18px;border-bottom:1.5px solid #E3DACB;background:#F4EFE4";

    cap = document.createElement('span');
    cap.style.cssText = "font:500 17px/1.35 'IBM Plex Mono',monospace;color:#5E5446;min-width:0";

    closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.textContent = 'Close';
    closeBtn.style.cssText = "flex:none;min-height:44px;padding:10px 18px;border:1.5px solid #1F1A12;border-radius:12px;background:#FBF7EE;color:#1F1A12;font:600 16px/24px 'IBM Plex Sans',sans-serif;cursor:pointer";
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
      if (e.key === 'Escape' && overlay && overlay.style.display === 'flex') close();
    });
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
    lastFocus = document.activeElement;
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    if (!overlay) return;
    overlay.style.display = 'none';
    body.textContent = '';
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('a[href]')) return;
    var fig = e.target.closest('[data-zoom]');
    if (fig) open(fig);
  });
})();
