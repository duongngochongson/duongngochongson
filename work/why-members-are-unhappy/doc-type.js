// Curly quotes in the words these pages draw after they load (the site's pages and its other documents use them too):
// it's → it’s, "a line" → “a line”. Code, scripts and fields keep their straight quotes. Pages that change later are
// typeset again as they change.
(function () {
  var SKIP = /^(SCRIPT|STYLE|CODE|PRE|TEXTAREA|INPUT|SELECT)$/;
  function curl(t) {
    return t
      .replace(/([A-Za-z0-9])'(?=[A-Za-z])/g, '$1’')
      .replace(/([sS])'(?=[\s,.;:)]|$)/g, '$1’')
      .replace(/(^|[\s(\[—-])"(?=\S)/g, '$1“')
      .replace(/"/g, '”')
      .replace(/(^|[\s(\[])'(?=\S)/g, '$1‘')
      .replace(/(\S)'/g, '$1’');
  }
  function typeset(root) {
    var walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        for (var e = n.parentElement; e; e = e.parentElement) {
          if (SKIP.test(e.tagName) || e.isContentEditable) return NodeFilter.FILTER_REJECT;
        }
        return /['"]/.test(n.data) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });
    for (var n; (n = walk.nextNode());) {
      var next = curl(n.data);
      if (next !== n.data) n.data = next;
    }
  }
  var queued = false;
  function soon() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; typeset(document.body); });
  }
  function start() {
    typeset(document.body);
    new MutationObserver(soon).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
