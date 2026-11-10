/* ===== SRS dùng chung toàn site: lưu trữ (localStorage) + tính lịch ôn + ghi nhận lỗi =====
   Tách khỏi engine.js. Mọi trang nạp file này để dùng window.SRS.
   Lịch ôn MVP: đúng không gợi ý -> tăng bậc 1 -> 3 -> 7 -> 14 -> 30 ngày;
   sai / chưa nhớ -> về bước học lại, hẹn ~10 phút. Đây là lịch ngắt quãng đơn giản, không phải FSRS. */
(function () {
  'use strict';
  var KEY = 'hoc-hsk-srs-v1';
  var INTERVALS = [1, 3, 7, 14, 30];
  var RELEARN_MS = 10 * 60 * 1000;
  var DAY = 86400000;
  var SKILLS = ['pinyin', 'tone', 'meaning', 'hanzi'];
  var SKILL_LABEL = { pinyin: 'Pinyin', tone: 'Thanh điệu', meaning: 'Nghĩa', hanzi: 'Chữ Hán' };
  var COURSES = { 'hsk3': 'HSK 3', 'hsk4-thuong': 'HSK 4 thượng', 'hsk4-ha': 'HSK 4 hạ' };

  var data = null;
  var saveOk = true;
  var salt = Date.now().toString(36) + Math.floor(Math.random() * 1e9).toString(36);
  var seq = 0;
  var seenTurns = {};

  /* --- Chuẩn hóa pinyin: loose bỏ thanh (khớp normPinyin của engine), tone giữ thanh --- */
  var TONE_MAP = { 'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a', 'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e', 'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i', 'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o', 'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u', 'ǖ': 'u', 'ǘ': 'u', 'ǚ': 'u', 'ǜ': 'u', 'ü': 'u', 'Ā': 'a', 'Á': 'a', 'Ǎ': 'a', 'À': 'a', 'Ē': 'e', 'É': 'e', 'Ě': 'e', 'È': 'e', 'Ī': 'i', 'Í': 'i', 'Ǐ': 'i', 'Ì': 'i', 'Ō': 'o', 'Ó': 'o', 'Ǒ': 'o', 'Ò': 'o', 'Ū': 'u', 'Ú': 'u', 'Ǔ': 'u', 'Ù': 'u', 'Ǖ': 'u', 'Ǘ': 'u', 'Ǚ': 'u', 'Ǜ': 'u', 'Ü': 'u' };
  function normLoose(p) {
    return String(p || '').split('').map(function (c) { return TONE_MAP[c] || c; }).join('')
      .toLowerCase().replace(/[\s'’·.,!?]/g, '').replace(/v/g, 'u');
  }
  function normTone(p) {
    return String(p || '').toLowerCase().trim().replace(/\s+/g, ' ').replace(/v/g, 'ü').replace(/u:/g, 'ü');
  }

  /* --- Định danh từ ổn định: chữ Hán + cách đọc (bỏ thanh) + nghĩa --- */
  function keyOf(word, pinyin, meaning) {
    return String(word || '') + '|' + normLoose(pinyin) + '|' + String(meaning || '').trim().toLowerCase();
  }
  function idOf(word, pinyin, meaning) {
    var k = keyOf(word, pinyin, meaning), h = 5381;
    for (var i = 0; i < k.length; i++) h = ((h << 5) + h + k.charCodeAt(i)) >>> 0;
    return 'w' + h.toString(36);
  }

  function blank() { return { schemaVersion: 1, entries: {} }; }
  function load() {
    if (data) return data;
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var p = JSON.parse(raw);
        if (p && p.schemaVersion === 1 && p.entries && typeof p.entries === 'object') { data = p; return data; }
      }
    } catch (e) { /* localStorage không dùng được: chạy với dữ liệu trống trong bộ nhớ */ }
    data = blank();
    return data;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); saveOk = true; }
    catch (e) { saveOk = false; }
    paint();
  }
  function storageAvailable() {
    try { var t = '__srs_test__'; localStorage.setItem(t, '1'); localStorage.removeItem(t); return true; }
    catch (e) { return false; }
  }

  function snapshotOf(v) {
    return {
      word: v.word || '', pinyin: v.pinyin || '', meaning: v.meaning || '', pos: v.pos || '',
      example: v.example || '', examplePinyin: v.examplePinyin || '', exampleVi: v.exampleVi || ''
    };
  }
  function addSource(e, course, lesson) {
    if (!course || !lesson) return;
    for (var i = 0; i < e.sources.length; i++) {
      if (e.sources[i].course === course && e.sources[i].lesson === lesson) return;
    }
    e.sources.push({ course: course, lesson: lesson });
  }
  function newSkill(now) { return { stage: -1, due: now, last: null, wrong: 0, lapses: 0, lastOutcome: null }; }
  function getOrCreate(snap, src) {
    var d = load();
    var id = idOf(snap.word, snap.pinyin, snap.meaning);
    var e = d.entries[id];
    if (!e) {
      e = {
        id: id, word: snap.word, pinyin: snap.pinyin, meaning: snap.meaning, pos: snap.pos || '',
        example: snap.example || '', examplePinyin: snap.examplePinyin || '', exampleVi: snap.exampleVi || '',
        sources: [], loc: null, status: 'active', addedAt: Date.now(), skills: {}
      };
      d.entries[id] = e;
    }
    if (src) {
      addSource(e, src.course, src.lesson);
      if (src.course && src.lesson) e.loc = { course: src.course, lesson: src.lesson, g: (src.g == null ? null : src.g), w: (src.w == null ? null : src.w) };
    }
    return e;
  }

  /* Ghi nhận một lỗi từ game/bài tập. ev: {snap, course, lesson, g, w, skill, outcome:'wrong'|'missed', turnId}
     Trả về true nếu có thay đổi. Từ đang tạm ngưng không bị kích hoạt lại. */
  function record(ev) {
    if (!ev || !ev.snap || !ev.snap.word || SKILLS.indexOf(ev.skill) < 0) return false;
    if (ev.turnId) {
      if (seenTurns[ev.turnId]) return false;
      seenTurns[ev.turnId] = 1;
    }
    var e = getOrCreate(ev.snap, ev);
    if (e.status === 'suspended') return false;
    var now = Date.now();
    var st = e.skills[ev.skill];
    if (!st) { st = newSkill(now); e.skills[ev.skill] = st; }
    st.wrong = (st.wrong || 0) + 1;
    st.lastOutcome = ev.outcome === 'missed' ? 'missed' : 'wrong';
    if (st.due > now) st.due = now; /* có lỗi mới -> đưa về đến hạn ngay, không đổi bậc */
    save();
    return true;
  }

  /* Thêm thủ công từ màn hình học từng từ (kỹ năng Nghĩa). */
  function addManual(snap, src) {
    if (!snap || !snap.word) return null;
    var e = getOrCreate(snap, src);
    if (e.status !== 'suspended' && !e.skills.meaning) {
      e.skills.meaning = newSkill(Date.now());
      save();
    }
    return e;
  }
  function has(snap) {
    if (!snap || !snap.word) return false;
    return !!load().entries[idOf(snap.word, snap.pinyin, snap.meaning)];
  }
  function get(id) { return load().entries[id] || null; }
  function all() {
    var d = load(), out = [];
    for (var id in d.entries) out.push(d.entries[id]);
    return out;
  }

  function isDue(st, now) { return st && st.due <= now; }
  function entryDue(e, now) {
    if (e.status !== 'active') return false;
    for (var s in e.skills) if (isDue(e.skills[s], now)) return true;
    return false;
  }
  function stats(now) {
    now = now || Date.now();
    var due = 0, learning = 0, list = all();
    for (var i = 0; i < list.length; i++) {
      var e = list[i];
      if (entryDue(e, now)) due++;
      if (e.status === 'active') {
        var mastered = true, hasSkill = false;
        for (var s in e.skills) { hasSkill = true; if (e.skills[s].stage < INTERVALS.length - 1) mastered = false; }
        if (hasSkill && !mastered) learning++;
      }
    }
    return { due: due, learning: learning, total: list.length };
  }
  function dueCount(now) { return stats(now).due; }

  /* Các cặp (từ, kỹ năng) cho một phiên ôn: nhóm theo từ, tối đa limitWords từ.
     practice=true: lấy các cặp chưa đến hạn (ôn thêm, không đổi lịch). */
  function sessionPairs(limitWords, practice) {
    var now = Date.now(), pairs = [];
    all().forEach(function (e) {
      if (e.status !== 'active') return;
      for (var s in e.skills) {
        var st = e.skills[s];
        if (practice ? st.due > now : st.due <= now) pairs.push({ id: e.id, skill: s, due: st.due });
      }
    });
    pairs.sort(function (a, b) { return a.due - b.due; });
    var seenWords = {}, out = [];
    for (var i = 0; i < pairs.length; i++) {
      var p = pairs[i];
      if (!seenWords[p.id]) {
        if (Object.keys(seenWords).length >= limitWords) continue;
        seenWords[p.id] = 1;
      }
      out.push({ id: p.id, skill: p.skill });
    }
    return out;
  }

  /* Chấm một lượt ôn. result: 'good' | 'again' | 'hint'. practice=true -> không đổi lịch. */
  function grade(id, skill, result, practice) {
    var e = get(id);
    if (!e || e.status !== 'active') return;
    var st = e.skills[skill];
    if (!st || practice) return;
    var now = Date.now();
    st.last = now;
    if (result === 'good') {
      st.stage = st.stage < 0 ? 0 : Math.min(st.stage + 1, INTERVALS.length - 1);
      st.due = now + INTERVALS[st.stage] * DAY;
      st.lastOutcome = 'good';
    } else if (result === 'again') {
      st.stage = -1;
      st.due = now + RELEARN_MS;
      st.lapses = (st.lapses || 0) + 1;
      st.lastOutcome = 'again';
    } else if (result === 'hint') {
      st.due = now + RELEARN_MS;
      st.lastOutcome = 'hint';
    }
    save();
  }

  function suspend(id, flag) {
    var e = get(id); if (!e) return;
    e.status = flag ? 'suspended' : 'active';
    save();
  }
  function remove(id) {
    var d = load();
    if (d.entries[id]) { delete d.entries[id]; save(); }
  }
  function clearAll() { data = blank(); save(); }

  function exportJSON() {
    var out = { schemaVersion: 1, exportedAt: new Date().toISOString(), entries: all() };
    if (typeof window !== 'undefined' && window.Streak && window.Streak.exportData) out.streak = window.Streak.exportData();
    return JSON.stringify(out, null, 2);
  }
  function validEntry(x) {
    return x && typeof x === 'object' && typeof x.word === 'string' && x.word &&
      typeof x.pinyin === 'string' && typeof x.meaning === 'string' &&
      x.skills && typeof x.skills === 'object' && Array.isArray(x.sources);
  }
  function importJSON(text) {
    var parsed;
    try { parsed = JSON.parse(text); } catch (e) { return { error: 'File không phải JSON hợp lệ.' }; }
    if (!parsed || parsed.schemaVersion !== 1 || !Array.isArray(parsed.entries)) {
      return { error: 'File không đúng định dạng bản sao lưu Ôn tập (thiếu schemaVersion = 1 hoặc danh sách từ).' };
    }
    var d = load(), added = 0, skipped = 0;
    parsed.entries.forEach(function (x) {
      if (!validEntry(x)) { skipped++; return; }
      var id = idOf(x.word, x.pinyin, x.meaning);
      if (d.entries[id]) { skipped++; return; }
      var e = {
        id: id, word: x.word, pinyin: x.pinyin, meaning: x.meaning, pos: x.pos || '',
        example: x.example || '', examplePinyin: x.examplePinyin || '', exampleVi: x.exampleVi || '',
        sources: [], loc: x.loc || null, status: x.status === 'suspended' ? 'suspended' : 'active',
        addedAt: x.addedAt || Date.now(), skills: {}
      };
      x.sources.forEach(function (s) { if (s && s.course && s.lesson) addSource(e, s.course, s.lesson); });
      SKILLS.forEach(function (s) {
        var st = x.skills[s];
        if (st && typeof st.due === 'number') {
          e.skills[s] = {
            stage: typeof st.stage === 'number' ? st.stage : -1, due: st.due, last: st.last || null,
            wrong: st.wrong || 0, lapses: st.lapses || 0, lastOutcome: st.lastOutcome || null
          };
        }
      });
      if (!Object.keys(e.skills).length) { skipped++; return; }
      d.entries[id] = e;
      added++;
    });
    if (parsed.streak && typeof window !== 'undefined' && window.Streak && window.Streak.importData) {
      try { window.Streak.importData(parsed.streak.days); } catch (e) {}
    }
    save();
    return { added: added, skipped: skipped };
  }

  function fmtDue(ts, now) {
    now = now || Date.now();
    if (ts <= now) return 'Đến hạn';
    var mins = Math.round((ts - now) / 60000);
    if (mins < 60) return 'Khoảng ' + Math.max(1, mins) + ' phút nữa';
    var d1 = new Date(now), d2 = new Date(ts);
    var dayDiff = Math.round((new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()) - new Date(d1.getFullYear(), d1.getMonth(), d1.getDate())) / DAY);
    if (dayDiff <= 0) return 'Hôm nay';
    if (dayDiff === 1) return 'Ngày mai';
    if (dayDiff < 30) return dayDiff + ' ngày nữa';
    return d2.getDate() + '/' + (d2.getMonth() + 1) + '/' + d2.getFullYear();
  }

  /* Vẽ badge số từ đến hạn + các số "Hôm nay có X từ cần ôn" nếu trang có những chỗ đó. */
  function paint() {
    if (typeof document === 'undefined') return;
    var n = dueCount();
    var badges = document.querySelectorAll('[data-srs-badge]');
    for (var i = 0; i < badges.length; i++) {
      badges[i].textContent = n;
      badges[i].hidden = n === 0;
    }
    var counts = document.querySelectorAll('[data-srs-due-count]');
    for (var j = 0; j < counts.length; j++) counts[j].textContent = n;
  }

  window.SRS = {
    INTERVALS: INTERVALS, SKILLS: SKILLS, SKILL_LABEL: SKILL_LABEL, COURSES: COURSES,
    normLoose: normLoose, normTone: normTone, idOf: idOf, snapshotOf: snapshotOf,
    record: record, addManual: addManual, has: has, get: get, all: all,
    stats: stats, dueCount: dueCount, entryDue: entryDue, sessionPairs: sessionPairs,
    grade: grade, suspend: suspend, remove: remove, clearAll: clearAll,
    exportJSON: exportJSON, importJSON: importJSON, fmtDue: fmtDue,
    paint: paint, storageAvailable: storageAvailable,
    turnId: function (prefix) { seq++; return prefix + '-' + salt + '-' + seq; },
    saveOk: function () { return saveOk; }
  };

  load();
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paint);
    else paint();
  }
})();
