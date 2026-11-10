/* ===== Chuỗi ngày học (streak): module riêng, dùng chung mọi trang =====
   Ngày tính theo lịch Asia/Ho_Chi_Minh. Một ngày được tính khi hoàn thành một trong:
   ôn 5 từ khác nhau trong SRS (hoặc ôn hết hàng chờ nếu hôm đó chỉ có 1–4 từ đến hạn),
   một lượt luyện tập trả lời ít nhất 5 câu, hoặc một ván game trả lời đúng ít nhất 5 từ khác nhau.
   Dữ liệu lưu trên trình duyệt (localStorage), đồng bộ giữa các tab qua sự kiện storage. */
(function () {
  'use strict';
  var KEY = 'hoc-hsk-streak-v1';
  var DAY = 86400000;
  var FLAME = '<svg class="streak-flame" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.4c.7 3.4-.9 5-2.1 6.7C9 10.4 8.6 11.4 8.6 12.6a3.4 3.4 0 0 0 6.8 0c0-1-.4-1.9-1-2.7 2 1.5 3.6 3.6 3.6 6.3a6 6 0 1 1-12 0c0-3.8 2.4-5.9 3.7-7.9.9-1.4 1.7-3.2 2.3-5.9z"/></svg>';
  var WD = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  var data = null;

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
  function dayMs(key) { var p = key.split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2]); }
  function addDays(key, n) {
    var t = new Date(dayMs(key) + n * DAY);
    return t.getUTCFullYear() + '-' + pad(t.getUTCMonth() + 1) + '-' + pad(t.getUTCDate());
  }
  function weekdayLabel(key) { return WD[new Date(dayMs(key)).getUTCDay()]; }

  function blank() { return { v: 1, days: [], progress: { date: '', srsWords: [] } }; }
  function load() {
    if (data) return data;
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var p = JSON.parse(raw);
        if (p && p.v === 1 && Array.isArray(p.days)) {
          data = p;
          if (!data.progress || !Array.isArray(data.progress.srsWords)) data.progress = { date: '', srsWords: [] };
          return data;
        }
      }
    } catch (e) {}
    data = blank();
    return data;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
  }
  function daySet() {
    var s = {};
    load().days.forEach(function (d) { s[d] = 1; });
    return s;
  }
  function currentStreak() {
    var s = daySet(), t = todayKey(), anchor = null;
    if (s[t]) anchor = t;
    else if (s[addDays(t, -1)]) anchor = addDays(t, -1);
    if (!anchor) return 0;
    var n = 0, k = anchor;
    while (s[k]) { n++; k = addDays(k, -1); }
    return n;
  }
  function longest() {
    var days = load().days.slice().sort(), best = 0, run = 0, prev = null;
    days.forEach(function (d) {
      run = (prev && addDays(prev, 1) === d) ? run + 1 : 1;
      if (run > best) best = run;
      prev = d;
    });
    return best;
  }
  function state() {
    var t = todayKey(), s = daySet(), last7 = [];
    for (var i = 6; i >= 0; i--) {
      var k = addDays(t, -i);
      last7.push({ key: k, label: weekdayLabel(k), done: !!s[k], today: i === 0 });
    }
    return { count: currentStreak(), longest: longest(), todayDone: !!s[t], today: t, last7: last7 };
  }

  /* Đánh dấu hôm nay đã học đủ điều kiện. Trả về true nếu hôm nay mới được tính lần đầu. */
  function qualify() {
    var d = load(), t = todayKey();
    if (d.days.indexOf(t) >= 0) return false;
    d.days.push(t);
    save();
    paint(true);
    toast();
    return true;
  }
  function progressToday() {
    var d = load(), t = todayKey();
    if (d.progress.date !== t) d.progress = { date: t, srsWords: [] };
    return d.progress;
  }
  function noteSrsWord(id) {
    if (!id) return;
    var p = progressToday();
    if (p.srsWords.indexOf(id) < 0) {
      p.srsWords.push(id);
      save();
      if (p.srsWords.length >= 5) qualify();
    }
  }
  function noteSrsQueueCleared(n) { if (n >= 1 && n <= 4) qualify(); }
  function notePractice(answered) { if (answered >= 5) qualify(); }
  function noteGame(correctDistinct) { if (correctDistinct >= 5) qualify(); }

  /* ---------- Widget + popover + toast ---------- */
  function statusText(st) {
    if (st.todayDone) return 'Hôm nay bạn đã giữ lửa rồi.';
    if (st.count > 0) return 'Học hôm nay để giữ chuỗi.';
    return 'Học hôm nay để bắt đầu chuỗi mới.';
  }
  function popHTML(st) {
    var cells = st.last7.map(function (d) {
      return '<div class="streak-day' + (d.done ? ' done' : '') + (d.today ? ' today' : '') + '"><span class="streak-day-wd">' + d.label + '</span><span class="streak-day-dot"></span><span class="streak-day-d">' + (+d.key.slice(8)) + '</span></div>';
    }).join('');
    return '<h3 class="streak-pop-title">Chuỗi ' + st.count + ' ngày</h3>' +
      '<p class="streak-pop-status">' + statusText(st) + '</p>' +
      '<div class="streak-week">' + cells + '</div>' +
      '<p class="streak-pop-record">Kỷ lục chuỗi dài nhất: <strong>' + st.longest + ' ngày</strong></p>';
  }
  function buildWidget(slot) {
    slot.innerHTML = '<button class="streak-btn" type="button" data-streak-btn aria-haspopup="dialog" aria-expanded="false" aria-label="Chuỗi ngày học">' + FLAME + '<span class="streak-num">0</span></button>' +
      '<div class="streak-pop" role="dialog" aria-label="Chi tiết chuỗi ngày học" hidden></div>';
    var btn = slot.querySelector('[data-streak-btn]');
    var pop = slot.querySelector('.streak-pop');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      paint(false);
      var open = !pop.hidden;
      closeAllPops();
      if (!open) {
        pop.innerHTML = popHTML(state());
        pop.hidden = false;
        btn.setAttribute('aria-expanded', 'true');
      }
    });
    pop.addEventListener('click', function (e) { e.stopPropagation(); });
  }
  function closeAllPops() {
    var pops = document.querySelectorAll('.streak-pop');
    for (var i = 0; i < pops.length; i++) pops[i].hidden = true;
    var btns = document.querySelectorAll('[data-streak-btn]');
    for (var j = 0; j < btns.length; j++) btns[j].setAttribute('aria-expanded', 'false');
  }
  function paint(justDone) {
    if (typeof document === 'undefined') return;
    var st = state();
    var slots = document.querySelectorAll('[data-streak-slot]');
    for (var i = 0; i < slots.length; i++) {
      var slot = slots[i];
      if (!slot.querySelector('[data-streak-btn]')) buildWidget(slot);
      var btn = slot.querySelector('[data-streak-btn]');
      btn.classList.toggle('is-done', st.todayDone);
      btn.classList.toggle('is-pending', !st.todayDone && st.count > 0);
      btn.classList.toggle('is-none', !st.todayDone && st.count === 0);
      btn.querySelector('.streak-num').textContent = st.count;
      btn.setAttribute('aria-label', 'Chuỗi ngày học: ' + st.count + ' ngày' + (st.todayDone ? ', hôm nay đã giữ lửa' : ''));
      if (justDone) {
        btn.classList.remove('just-done');
        void btn.offsetWidth;
        btn.classList.add('just-done');
        setTimeout(function (b) { return function () { b.classList.remove('just-done'); }; }(btn), 1800);
      }
      var pop = slot.querySelector('.streak-pop');
      if (pop && !pop.hidden) pop.innerHTML = popHTML(st);
    }
  }
  function toast() {
    if (typeof document === 'undefined' || !document.body) return;
    var old = document.querySelector('.streak-toast');
    if (old) old.remove();
    var el = document.createElement('div');
    el.className = 'streak-toast';
    el.setAttribute('role', 'status');
    el.textContent = 'Bạn đã giữ lửa hôm nay!';
    document.body.appendChild(el);
    setTimeout(function () { el.classList.add('show'); }, 20);
    setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () { el.remove(); }, 350);
    }, 3400);
  }

  window.Streak = {
    state: state, todayKey: todayKey, qualify: qualify,
    noteSrsWord: noteSrsWord, noteSrsQueueCleared: noteSrsQueueCleared,
    notePractice: notePractice, noteGame: noteGame, paint: paint,
    exportData: function () { return { days: load().days.slice() }; },
    importData: function (days) {
      if (!Array.isArray(days)) return;
      var d = load(), have = daySet(), changed = false;
      days.forEach(function (k) {
        if (typeof k === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(k) && !have[k]) { d.days.push(k); have[k] = 1; changed = true; }
      });
      if (changed) { save(); paint(false); }
    }
  };

  load();
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { paint(false); });
    else paint(false);
    document.addEventListener('click', function () { closeAllPops(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var openBtn = document.querySelector('[data-streak-btn][aria-expanded="true"]');
        closeAllPops();
        if (openBtn) openBtn.focus();
      }
    });
    /* Đồng bộ giữa các tab: tab khác học đủ điều kiện -> tab này cập nhật ngay */
    window.addEventListener('storage', function (e) {
      if (e.key === KEY) { data = null; load(); paint(false); }
    });
    /* Qua nửa đêm: tính lại trạng thái khi người dùng quay lại tab (không dùng timer chạy mãi) */
    window.addEventListener('focus', function () { paint(false); });
    document.addEventListener('visibilitychange', function () { if (!document.hidden) paint(false); });
  }
})();
