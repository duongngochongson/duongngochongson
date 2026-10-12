// Draws the lines of every diagram (.dg). A box with data-from="a b" gets a line from #a and from #b.
// data-wire on that box changes the line: "dash", "arrow", "good", "weak", "key", "bold".
// Lines from one box share one trunk, so a box with several children reads as a bracket.
// data-route forces the shape: "h" (side to side), "v" (top to bottom), "rail" (down the parent's left
// side, then across: an outline), "around" (out to the right and back in: a loop), "none". Without it, the shape follows where the two boxes sit, so the same
// diagram can be a wide tree on a large screen and an outline on a phone. CSS can set the shape too, as
// --route on the box, so a container query can change it. Lines are redrawn on resize.
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var R = 8;  // corner radius of a bend

  function box(el, o) {
    var r = el.getBoundingClientRect();
    var l = r.left - o.left, t = r.top - o.top;
    return { l: l, t: t, r: l + r.width, b: t + r.height, cx: l + r.width / 2, cy: t + r.height / 2 };
  }

  function rounded(pts) {
    var d = 'M' + pts[0][0] + ',' + pts[0][1];
    for (var i = 1; i < pts.length - 1; i++) {
      var p0 = pts[i - 1], p1 = pts[i], p2 = pts[i + 1];
      var d1 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), d2 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
      var r = Math.min(R, d1 / 2, d2 / 2);
      if (r < 0.5) { d += ' L' + p1[0] + ',' + p1[1]; continue; }
      var ax = p1[0] - (p1[0] - p0[0]) / d1 * r, ay = p1[1] - (p1[1] - p0[1]) / d1 * r;
      var bx = p1[0] + (p2[0] - p1[0]) / d2 * r, by = p1[1] + (p2[1] - p1[1]) / d2 * r;
      d += ' L' + ax + ',' + ay + ' Q' + p1[0] + ',' + p1[1] + ' ' + bx + ',' + by;
    }
    var e = pts[pts.length - 1];
    return d + ' L' + e[0] + ',' + e[1];
  }

  // the points of a line from box p (parent) to box c (child)
  function route(p, c, how) {
    var G = 2;
    if (how === 'none') return null;  // a layout where the order alone says it (set from CSS)
    // around: out of the parent's right side, up or down past both boxes, into the child's right side (a loop back)
    if (how === 'around') { var ax = Math.max(p.r, c.r) + 16; return [[p.r, p.cy], [ax, p.cy], [ax, c.cy], [c.r, c.cy]]; }
    // below and indented: an outline, the line runs down the indent and across
    if (how === 'rail' || (!how && c.t >= p.b - G && c.l >= p.l + 10 && c.l < p.r)) {
      var rx = p.l + Math.min(22, Math.max(10, (c.l - p.l) / 2));
      return [[rx, p.b], [rx, c.cy], [c.l, c.cy]];
    }
    if (how === 'h' || (!how && (c.l >= p.r - G || c.r <= p.l + G))) {
      var right = c.l >= p.r - G || (how === 'h' && c.cx >= p.cx);
      var x1 = right ? p.r : p.l, x2 = right ? c.l : c.r;
      // straight across when one box spans the other's middle (the parent's middle first, so a bracket keeps one trunk)
      if (c.t <= p.cy - 4 && c.b >= p.cy + 4) return [[x1, p.cy], [x2, p.cy]];
      if (p.t <= c.cy - 4 && p.b >= c.cy + 4) return [[x1, c.cy], [x2, c.cy]];
      var xm = x1 + (x2 - x1) / 2;
      return [[x1, p.cy], [xm, p.cy], [xm, c.cy], [x2, c.cy]];
    }
    if (how === 'v' || c.t >= p.b - G || c.b <= p.t + G) {
      var down = c.t >= p.b - G || (how === 'v' && c.cy >= p.cy);
      var y1 = down ? p.b : p.t, y2 = down ? c.t : c.b;
      if (c.l <= p.cx - 4 && c.r >= p.cx + 4) return [[p.cx, y1], [p.cx, y2]];
      if (p.l <= c.cx - 4 && p.r >= c.cx + 4) return [[c.cx, y1], [c.cx, y2]];
      var ym = y1 + (y2 - y1) / 2;
      return [[p.cx, y1], [p.cx, ym], [c.cx, ym], [c.cx, y2]];
    }
    return null;  // the boxes overlap: no line
  }

  function head(pts, cls) {
    var a = pts[pts.length - 2], b = pts[pts.length - 1];
    var ang = Math.atan2(b[1] - a[1], b[0] - a[0]), s = 6;
    var p = document.createElementNS(NS, 'path');
    var l = [b[0] - s * Math.cos(ang - 0.5), b[1] - s * Math.sin(ang - 0.5)];
    var r = [b[0] - s * Math.cos(ang + 0.5), b[1] - s * Math.sin(ang + 0.5)];
    p.setAttribute('d', 'M' + b[0] + ',' + b[1] + ' L' + l[0] + ',' + l[1] + ' L' + r[0] + ',' + r[1] + ' Z');
    p.setAttribute('class', 'head ' + cls);
    return p;
  }

  function draw(dg) {
    var svg = dg.querySelector(':scope > svg.dg-wires');
    if (!svg) {
      svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'dg-wires');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      dg.insertBefore(svg, dg.firstChild);
    }
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var o = dg.getBoundingClientRect();
    dg.querySelectorAll('[data-from]').forEach(function (child) {
      if (!child.getClientRects().length) return;
      var mods = (child.getAttribute('data-wire') || '').split(/\s+/).filter(Boolean);
      var cls = mods.filter(function (m) { return m !== 'arrow'; }).join(' ');
      child.getAttribute('data-from').split(/\s+/).filter(Boolean).forEach(function (id) {
        var parent = document.getElementById(id);
        if (!parent || !dg.contains(parent) || !parent.getClientRects().length) return;
        var how = child.getAttribute('data-route') || getComputedStyle(child).getPropertyValue('--route').trim() || null;
        var pts = route(box(parent, o), box(child, o), how);
        if (!pts) return;
        var path = document.createElementNS(NS, 'path');
        path.setAttribute('d', rounded(pts));
        if (cls) path.setAttribute('class', cls);
        svg.appendChild(path);
        if (mods.indexOf('arrow') >= 0) svg.appendChild(head(pts, cls));
      });
    });
  }

  var queued = false;
  function drawAll() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; document.querySelectorAll('.dg').forEach(draw); });
  }
  function start() {
    drawAll();
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(drawAll);
      document.querySelectorAll('.dg').forEach(function (dg) { ro.observe(dg); dg.querySelectorAll('.n').forEach(function (n) { ro.observe(n); }); });
    }
    addEventListener('resize', drawAll);
    addEventListener('load', drawAll);
    if (document.fonts) document.fonts.ready.then(drawAll);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.dgRedraw = drawAll;
})();
