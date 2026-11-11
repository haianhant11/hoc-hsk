/* Banner Top 3 trên trang chủ: SWR cache tức thì (0ms) + đồng bộ dữ liệu thật từ API bảng xếp hạng */
(function () {
  var list = document.getElementById('lbBannerTop');
  if (!list) return;
  var MEDALS = { 1: '状', 2: '榜', 3: '探' };
  var CACHE_TOP = 'hoc-hsk-lb-cache-top';
  var CACHE_ME = 'hoc-hsk-lb-cache-me';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function api(path) {
    return fetch(path, { headers: { 'Accept': 'application/json' } }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    });
  }

  function renderBanner(top) {
    if (!top || !top.length) { list.innerHTML = ''; return; }
    list.innerHTML = top.slice(0, 3).map(function (p) {
      return '<li class="lbb-item"><span class="lbb-medal lbb-medal-' + p.rank + '" role="img" aria-label="Hạng ' + p.rank + '">' + (MEDALS[p.rank] || p.rank) + '</span>' +
        '<span class="lbb-txt"><strong>' + esc(p.name) + '</strong><small>' + p.points + ' điểm</small></span></li>';
    }).join('');
  }

  function updateMeText(pl) {
    var el = document.getElementById('lbBannerMe');
    if (!el || !pl || typeof pl.points !== 'number') return;
    el.textContent = pl.rank ? ('Bạn đang hạng #' + pl.rank + ' · ' + pl.points + ' điểm')
      : ('Bạn có ' + pl.points + ' điểm · cố lên để vào Top 10');
    el.hidden = false;
  }

  // 1. SWR: Hiển thị ngay từ LocalStorage cache trong 0ms (tránh tình trạng "cứ load load")
  try {
    var cachedTop = JSON.parse(localStorage.getItem(CACHE_TOP) || 'null');
    if (Array.isArray(cachedTop) && cachedTop.length) {
      renderBanner(cachedTop.slice(0, 3));
    }
    var cachedMe = JSON.parse(localStorage.getItem(CACHE_ME) || 'null');
    if (cachedMe) updateMeText(cachedMe);
  } catch (e) {}

  // 2. Chạy ngầm tải mới nhất từ server / Edge CDN
  function refreshBanner() {
    api('/api/leaderboard').then(function (d) {
      var top = (d && (d.players || d.top) ? (d.players || d.top) : []).slice(0, 10);
      if (top.length) {
        try { localStorage.setItem(CACHE_TOP, JSON.stringify(top)); } catch (e) {}
        renderBanner(top.slice(0, 3));
      }
      var prof = null;
      try { prof = JSON.parse(localStorage.getItem('hoc-hsk-lb-v1') || 'null'); } catch (e) { prof = null; }
      if (prof && prof.id) {
        api('/api/me?id=' + encodeURIComponent(prof.id)).then(function (m) {
          var pl = (m && m.player) ? m.player : m;
          if (!pl || typeof pl.points !== 'number') return;
          try { localStorage.setItem(CACHE_ME, JSON.stringify(pl)); } catch (e) {}
          updateMeText(pl);
        }).catch(function () {});
      }
    }).catch(function () {
      if (window.LB && typeof window.LB.localTop === 'function') {
        renderBanner(window.LB.localTop().slice(0, 3));
        var me = window.LB.localMe && window.LB.localMe();
        if (me) updateMeText(me);
      } else if (!list.querySelector('.lbb-item')) {
        list.innerHTML = '';
      }
    });
  }

  refreshBanner();

  // Lắng nghe sự kiện khi người dùng đăng ký hoặc đổi tên từ Header
  window.addEventListener('hoc-hsk:user-updated', function (e) {
    if (e.detail) updateMeText(e.detail);
    refreshBanner();
  });
})();
