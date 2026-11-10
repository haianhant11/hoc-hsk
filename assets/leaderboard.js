/* ===== Bảng xếp hạng HSK: hồ sơ theo tên + cộng điểm chạy ngầm =====
   Điểm luôn do server tính và xác nhận; module này chỉ gửi kết quả thô khi có hồ sơ.
   Chưa tham gia thì học và chơi bình thường, không gửi gì, không hiện gì trong bài học. */
(function () {
  'use strict';
  var KEY = 'hoc-hsk-lb-v1';

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function todayKey() {
    try {
      var parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
      var m = {};
      for (var i = 0; i < parts.length; i++) m[parts[i].type] = parts[i].value;
      if (m.year && m.month && m.day) return m.year + '-' + m.month + '-' + m.day;
    } catch (e) {}
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function profile() {
    try {
      var p = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (p && typeof p.id === 'string' && typeof p.name === 'string') return p;
    } catch (e) {}
    return null;
  }
  function saveProfile(p) {
    try { localStorage.setItem(KEY, JSON.stringify({ id: p.id, name: p.name })); } catch (e) {}
  }
  function eventId() {
    try { if (window.crypto && crypto.randomUUID) return crypto.randomUUID(); } catch (e) {}
    return 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
  }
  /* Gửi một lượt hoàn thành. Chạy ngầm: lỗi mạng hay chưa tham gia đều im lặng bỏ qua,
     tuyệt đối không hiển thị điểm chưa được server xác nhận. */
  function award(activityType, activityId, correct, total) {
    var p = profile();
    if (!p || typeof fetch !== 'function') return;
    if (typeof correct !== 'number' || typeof total !== 'number' || total < 1 || correct < 0 || correct > total) return;
    fetch('/api/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: p.id, eventId: eventId(), activityType: activityType, activityId: activityId, correct: correct, total: total })
    }).catch(function () {});
  }

  window.LB = { profile: profile, award: award, todayKey: todayKey };

  /* ---------- Phần dưới chỉ chạy trên trang Bảng xếp hạng ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function api(path, opts) {
    return fetch(path, opts).then(function (r) {
      if (!r.ok) throw new Error('http ' + r.status);
      return r.json();
    });
  }
  function cleanName(v) { return String(v || '').replace(/\s+/g, ' ').trim(); }

  function initPage() {
    var listEl = document.getElementById('lbList');
    if (!listEl) return;
    var meEl = document.getElementById('lbMe');
    var state = { top: null, me: null };

    function renderTop() {
      if (!state.top) {
        listEl.innerHTML = '<li class="lb-state">Đang tải bảng xếp hạng…</li>';
        return;
      }
      if (!state.top.length) {
        listEl.innerHTML = '<li class="lb-state">Chưa có dữ liệu bảng xếp hạng.</li>';
        return;
      }
      var me = profile();
      var MEDALS = { 1: { han: '状', title: 'Trạng nguyên' }, 2: { han: '榜', title: 'Bảng nhãn' }, 3: { han: '探', title: 'Thám hoa' } };
      var head = state.top.length >= 3 ? '<li class="lb-top3-head"><span class="han">三甲</span> · Top 3 được vinh danh</li>' : '';
      listEl.innerHTML = head + state.top.map(function (p) {
        var mine = me && me.id === p.id;
        var medal = MEDALS[p.rank];
        var badge = medal
          ? '<span class="lb-rank lb-medal lb-medal-' + p.rank + '" role="img" aria-label="Hạng ' + p.rank + '" title="Hạng ' + p.rank + ' · ' + medal.title + '">' + medal.han + '</span>'
          : '<span class="lb-rank">' + p.rank + '</span>';
        var titleTag = medal ? ' <span class="lb-title lb-title-' + p.rank + '">' + medal.title + '</span>' : '';
        return '<li class="lb-row lb-top' + p.rank + (mine ? ' is-me' : '') + '">' +
          badge +
          '<span class="lb-name">' + esc(p.name) + titleTag + (mine ? ' <span class="lb-you">Bạn</span>' : '') + '</span>' +
          '<span class="lb-points">' + p.points + ' <small>điểm</small></span></li>';
      }).join('');
    }
    function rankText(me) {
      if (!me || !me.rank) return 'Đang tải…';
      if (me.rank <= 10) return 'Hạng #' + me.rank;
      return '#11 · Ngoài Top 10';
    }
    function gapText() {
      var me = state.me, top = state.top;
      if (!me || !me.rank || !top || !top.length) return '';
      if (me.rank === 1) return 'Bạn đang dẫn đầu bảng xếp hạng.';
      if (me.rank <= 10) {
        var above = top[me.rank - 2];
        if (above && above.points > me.points) return 'Kém hạng ' + (me.rank - 1) + ' đúng ' + (above.points - me.points) + ' điểm.';
        return '';
      }
      var tenth = top[top.length - 1];
      if (tenth && tenth.points >= me.points) return 'Cần thêm ' + (tenth.points - me.points + 1) + ' điểm nữa để vào Top 10.';
      return '';
    }
    function renderMe() {
      var p = profile();
      if (!p) {
        meEl.innerHTML = '<h2>Thứ hạng của bạn</h2>' +
          '<p class="lb-me-note">Tham gia ngay để được xếp hạng. Chưa tham gia cũng không sao cả</p>' +
          '<form class="lb-join" id="lbJoinForm" novalidate>' +
          '<label for="lbName">Tên hiển thị của bạn</label>' +
          '<div class="lb-join-row"><input id="lbName" type="text" maxlength="40" autocomplete="name" placeholder="Ví dụ: Nguyễn Văn A">' +
          '<button class="pw-go lb-join-btn" id="lbJoinBtn" type="submit" disabled>Tham gia</button></div>' +
          '<p class="lb-join-preview" id="lbPreview" hidden>Tên sẽ hiển thị trên bảng: <strong></strong></p>' +
          '<p class="lb-err" id="lbErr" hidden></p>' +
          '<p class="lb-me-note lb-join-note">Người mới được tặng 20 điểm chào mừng. Nếu tên này đã có hồ sơ, bạn sẽ dùng chung điểm của hồ sơ đó. Bảng thi đua thân thiện, nhận hồ sơ bằng tên nên không xác thực danh tính.</p></form>';
        wireJoinForm();
        return;
      }
      var me = state.me;
      var gap = gapText();
      meEl.innerHTML = '<h2>Thứ hạng của bạn</h2>' +
        '<div class="lb-me-row"><span class="lb-me-name">' + esc(p.name) + '</span>' +
        '<span class="lb-me-points">' + (me ? me.points : '…') + ' điểm</span>' +
        '<span class="lb-me-rank">' + rankText(me) + '</span></div>' +
        (gap ? '<p class="lb-me-gap">' + esc(gap) + '</p>' : '') +
        '<p class="lb-me-note">Điểm được cộng ngầm khi bạn hoàn thành bài luyện tập, bài kiểm tra và các ván game.</p>';
    }
    function wireJoinForm() {
      var form = document.getElementById('lbJoinForm');
      if (!form) return;
      var input = document.getElementById('lbName');
      var btn = document.getElementById('lbJoinBtn');
      var preview = document.getElementById('lbPreview');
      var err = document.getElementById('lbErr');
      function sync() {
        var name = cleanName(input.value);
        btn.disabled = name.length < 2;
        if (name) {
          preview.hidden = false;
          preview.querySelector('strong').textContent = name;
        } else preview.hidden = true;
      }
      input.addEventListener('input', sync);
      sync();
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = cleanName(input.value);
        if (name.length < 2) return;
        btn.disabled = true;
        btn.textContent = 'Đang tham gia…';
        err.hidden = true;
        api('/api/join', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name })
        }).then(function (r) {
          saveProfile({ id: r.id, name: r.name });
          state.me = { points: r.points, rank: r.rank, totalPlayers: r.totalPlayers };
          renderMe();
          renderTop();
          refresh();
        }).catch(function () {
          err.textContent = 'Chưa kết nối được máy chủ. Kiểm tra mạng rồi thử lại nhé.';
          err.hidden = false;
          btn.disabled = false;
          btn.textContent = 'Tham gia';
        });
      });
    }
    function refresh() {
      api('/api/leaderboard').then(function (r) {
        state.top = r.players || [];
        renderTop();
        if (profile() && state.me) renderMe();
      }).catch(function () {
        if (!state.top) listEl.innerHTML = '<li class="lb-state">Chưa tải được bảng xếp hạng. <button class="srs-btn ghost" id="lbRetry" type="button">Thử lại</button></li>';
        var rb = document.getElementById('lbRetry');
        if (rb) rb.addEventListener('click', refresh);
      });
      var p = profile();
      if (p) {
        api('/api/me?id=' + encodeURIComponent(p.id)).then(function (r) {
          state.me = r;
          renderMe();
        }).catch(function () { /* giữ nguyên hiển thị cũ, không hiện điểm chưa xác nhận */ });
      }
    }

    renderMe();
    renderTop();
    refresh();
    document.addEventListener('visibilitychange', function () { if (!document.hidden) refresh(); });
    setInterval(function () { if (!document.hidden) refresh(); }, 45000);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPage);
    else initPage();
  }
})();
