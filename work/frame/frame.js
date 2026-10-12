// The contents mark the section being read, and a link in the contents box closes the box.
(function () {
  var links = [].slice.call(document.querySelectorAll('.toc-side a[href^="#"]'));
  var box = document.querySelector('.toc-box');
  if (box) box.addEventListener('click', function (e) { if (e.target.closest('a')) box.open = false; });
  if (!links.length || !('IntersectionObserver' in window)) return;
  var byId = {};
  links.forEach(function (a) { byId[decodeURIComponent(a.getAttribute('href').slice(1))] = a; });
  var seen = {};
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { seen[en.target.id] = en.isIntersecting ? en.boundingClientRect.top : undefined; });
    var current = null, best = Infinity;
    Object.keys(seen).forEach(function (id) { var t = seen[id]; if (t !== undefined && Math.abs(t) < best) { best = Math.abs(t); current = id; } });
    if (!current) return;
    links.forEach(function (a) { a.setAttribute('aria-current', String(a === byId[current])); });
  }, { rootMargin: '0px 0px -60% 0px' });
  Object.keys(byId).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
})();
