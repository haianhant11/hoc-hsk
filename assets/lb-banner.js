/* Banner Top 3 trên trang chủ: kéo dữ liệu thật từ API bảng xếp hạng (có dự phòng local khi chạy localhost). */
(function () {
  var list = document.getElementById('lbBannerTop');
  if (!list) return;
  var MEDALS = { 1: '状', 2: '榜', 3: '探' };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function api(path) { return fetch(path, { headers: { 'Accept': 'application/json' } }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); }
  function renderBanner(top) {
    if (!top || !top.length) { list.innerHTML = ''; return; }
    list.innerHTML = top.slice(0, 3).map(function (p) {
      return '<li class="lbb-item"><span class="lbb-medal lbb-medal-' + p.rank + '" role="img" aria-label="Hạng ' + p.rank + '">' + (MEDALS[p.rank] || p.rank) + '</span>' +
        '<span class="lbb-txt"><strong>' + esc(p.name) + '</strong><small>' + p.points + ' điểm</small></span></li>';
    }).join('');
  }
  api('/api/leaderboard').then(function (d) {
    var top = (d && (d.players || d.top) ? (d.players || d.top) : []).slice(0, 3);
    renderBanner(top);
    var prof = null;
    try { prof = JSON.parse(localStorage.getItem('hoc-hsk-lb-v1') || 'null'); } catch (e) { prof = null; }
    if (prof && prof.id) {
      api('/api/me?id=' + encodeURIComponent(prof.id)).then(function (m) {
        var pl = (m && m.player) ? m.player : m;
        if (!pl || typeof pl.points !== 'number') return;
        var el = document.getElementById('lbBannerMe');
        if (!el) return;
        el.textContent = pl.rank ? ('Bạn đang hạng #' + pl.rank + ' · ' + pl.points + ' điểm')
          : ('Bạn có ' + pl.points + ' điểm · cố lên để vào Top 10');
        el.hidden = false;
      }).catch(function () {});
    }
  }).catch(function () {
    if (window.LB && typeof window.LB.localTop === 'function') {
      renderBanner(window.LB.localTop().slice(0, 3));
      var me = window.LB.localMe && window.LB.localMe();
      var el = document.getElementById('lbBannerMe');
      if (me && el) {
        el.textContent = 'Bạn đang hạng #' + me.rank + ' · ' + me.points + ' điểm';
        el.hidden = false;
      }
    } else {
      list.innerHTML = '';
    }
  });
})();
