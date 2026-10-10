// These pages are drawn after they load, so the browser cannot jump to #section by itself.
// Jump there once the section exists, and again while fonts and pictures settle,
// until the reader scrolls on their own.
(function () {
  var id = decodeURIComponent(location.hash.slice(1));
  if (!id) return;
  var moved = false;
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (type) {
    addEventListener(type, function () { moved = true; }, { once: true, passive: true });
  });
  var tries = 0;
  function go() {
    if (moved) return;
    var el = document.getElementById(id);
    if (!el) { if (++tries < 50) setTimeout(go, 100); return; }
    var margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - margin, behavior: 'instant' });
  }
  addEventListener('load', function () {
    go();
    if (document.fonts) document.fonts.ready.then(go);
    [300, 800, 1600].forEach(function (ms) { setTimeout(go, ms); });
  });
})();
