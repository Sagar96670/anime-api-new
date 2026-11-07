
// ===== NAV ROUTER: Blogger-style category links -> Hello Anime catalogue pages =====
(function () {
  function pick(href) {
    if (href.indexOf('/search/label/') === 0) {
      var label = decodeURIComponent(href.split('/search/label/')[1]);
      var L = label.trim();
      var low = L.toLowerCase().replace(/\s+/g, '');
      if (/^[a-z]$/i.test(L) || L === '#')    return '/?label=' + encodeURIComponent(L);
      if (low === 'movie' || low === 'movies') return '/movie.html';
      if (low === 'series')                    return '/ongoing.html';
      if (low === 'drama' || low === 'ongoing' || low === 'completed')
                                               return '/ongoing.html?label=' + encodeURIComponent(L);
      return '/?label=' + encodeURIComponent(L);
    }
    if (href.indexOf('/p/') === 0) {
      var sp = href.split('?')[1] ? new URLSearchParams(href.split('?')[1]) : null;
      if (sp && sp.get('language')) {
        var lan = sp.get('language').trim();
        if (lan.toLowerCase() === 'movie') return '/movie.html';
        if (lan.toLowerCase() === 'drama') return '/ongoing.html?label=Drama';
        return '/?label=' + encodeURIComponent(lan);
      }
      return '/ongoing.html';
    }
    if (href.indexOf('/search') === 0) {
      var q = href.split('?')[1] ? new URLSearchParams(href.split('?')[1]).get('q') : null;
      if (q) return '/?q=' + encodeURIComponent(q);
    }
    return null;
  }
  var sf = document.querySelector('.cari-isi form, #search form');
  if (sf) sf.addEventListener('submit', function (e) {
    e.preventDefault();
    var i = sf.querySelector('[name=q]');
    window.location.href = '/?q=' + encodeURIComponent((i && i.value) || '');
  });
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (!href || href.charAt(0) !== '/') return;
    var target = pick(href);
    if (target) { e.preventDefault(); window.location.href = target; }
  });
})();
