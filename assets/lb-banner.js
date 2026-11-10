/* Banner Top 3 trên trang chủ: kéo dữ liệu thật từ API bảng xếp hạng. */
(function () {
  var list = document.getElementById('lbBannerTop');
  if (!list) return;
  if (typeof window.fetch !== 'function') { list.innerHTML = ''; return; }
  var MEDALS = { 1: '状', 2: '榜', 3: '探' };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function api(path) { return fetch(path, { headers: { 'Accept': 'application/json' } }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); }
  api('/api/leaderboard').then(function (d) {
    var top = (d && d.top ? d.top : []).slice(0, 3);
    if (!top.length) { list.innerHTML = ''; return; }
    list.innerHTML = top.map(function (p) {
      return '<li class="lbb-item"><span class="lbb-medal lbb-medal-' + p.rank + '" role="img" aria-label="Hạng ' + p.rank + '">' + (MEDALS[p.rank] || p.rank) + '</span>' +
        '<span class="lbb-txt"><strong>' + esc(p.name) + '</strong><small>' + p.points + ' điểm</small></span></li>';
    }).join('');
    var prof = null;
    try { prof = JSON.parse(localStorage.getItem('hoc-hsk-lb-v1') || 'null'); } catch (e) { prof = null; }
    if (prof && prof.id) {
      api('/api/me?id=' + encodeURIComponent(prof.id)).then(function (m) {
        if (!m || !m.player) return;
        var el = document.getElementById('lbBannerMe');
        if (!el) return;
        el.textContent = m.player.rank ? ('Bạn đang hạng #' + m.player.rank + ' · ' + m.player.points + ' điểm')
          : ('Bạn có ' + m.player.points + ' điểm · cố lên để vào Top 10');
        el.hidden = false;
      }).catch(function () {});
    }
  }).catch(function () {
    list.innerHTML = '';
  });
})();
