/* ===== Trang Ôn tập (/on-tap): thống kê, Sổ từ, phiên ôn theo kỹ năng, sao lưu dữ liệu ===== */
(function () {
  'use strict';
  function $(s) { return document.querySelector(s); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function shuffle(a) {
    var r = a.slice();
    for (var i = r.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = r[i]; r[i] = r[j]; r[j] = t; }
    return r;
  }
  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    try {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN'; u.rate = 0.78;
      var vs = speechSynthesis.getVoices();
      u.voice = vs.find(function (v) { return /^zh(-|_)?CN/i.test(v.lang); }) || vs.find(function (v) { return /^zh/i.test(v.lang); }) || null;
      speechSynthesis.speak(u);
    } catch (e) {}
  }
  function courseName(slug) { return SRS.COURSES[slug] || slug; }
  function sourceLink(e) {
    if (e.loc && e.loc.course && e.loc.lesson) {
      var u = '/' + e.loc.course + '/' + e.loc.lesson + '/tu-vung';
      if (e.loc.g != null && e.loc.w != null) u += '?g=' + e.loc.g + '&w=' + e.loc.w;
      return u;
    }
    if (e.sources.length) return '/' + e.sources[0].course + '/' + e.sources[0].lesson + '/tu-vung';
    return './';
  }
  function sourceText(e) {
    if (!e.sources.length) return '';
    return e.sources.map(function (s) { return courseName(s.course) + ' · Bài ' + s.lesson; }).join(' · ');
  }

  /* ---------- Sinh phương án thanh điệu ---------- */
  var TONES = { a: ['a', 'ā', 'á', 'ǎ', 'à'], e: ['e', 'ē', 'é', 'ě', 'è'], i: ['i', 'ī', 'í', 'ǐ', 'ì'], o: ['o', 'ō', 'ó', 'ǒ', 'ò'], u: ['u', 'ū', 'ú', 'ǔ', 'ù'], 'ü': ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ'] };
  var MARKED = {};
  Object.keys(TONES).forEach(function (b) { TONES[b].forEach(function (c, t) { if (t > 0) MARKED[c] = { base: b, tone: t }; }); });
  function sylTone(syl) { for (var i = 0; i < syl.length; i++) if (MARKED[syl[i]]) return MARKED[syl[i]].tone; return 0; }
  function setSylTone(syl, tone) {
    var base = syl.split('').map(function (c) { return MARKED[c] ? MARKED[c].base : c; }).join('');
    if (tone === 0) return base;
    var idx = -1;
    if (base.indexOf('a') >= 0) idx = base.indexOf('a');
    else if (base.indexOf('e') >= 0) idx = base.indexOf('e');
    else if (base.indexOf('ou') >= 0) idx = base.indexOf('ou');
    else for (var i = base.length - 1; i >= 0; i--) if ('iouü'.indexOf(base[i]) >= 0) { idx = i; break; }
    if (idx < 0) return syl;
    return base.slice(0, idx) + TONES[base[idx]][tone] + base.slice(idx + 1);
  }
  function toneVariants(pinyin) {
    var syls = String(pinyin || '').trim().split(/\s+/).filter(Boolean);
    if (!syls.length) return [];
    var correct = syls.join(' ');
    var out = [], seen = {};
    seen[SRS.normTone(correct)] = 1;
    function add(v) { var k = SRS.normTone(v); if (v && !seen[k]) { seen[k] = 1; out.push(v); } }
    for (var i = 0; i < syls.length && out.length < 3; i++) {
      var t = sylTone(syls[i]);
      var c1 = syls.slice(); c1[i] = setSylTone(syls[i], t === 0 ? 2 : (t % 4) + 1); add(c1.join(' '));
    }
    if (out.length < 3) add(syls.map(function (s) { var t = sylTone(s); return setSylTone(s, t === 0 ? 3 : (t % 4) + 1); }).join(' '));
    if (out.length < 3) add(syls.map(function (s) { return setSylTone(s, 0); }).join(' '));
    for (var tt = 1; tt <= 4 && out.length < 3; tt++) add(syls.map(function (s) { return setSylTone(s, tt); }).join(' '));
    return shuffle(out.slice(0, 3).concat([correct]));
  }

  /* ---------- Render chính ---------- */
  var filters = { q: '', course: '', skill: '', status: '' };

  function renderStats() {
    var st = SRS.stats();
    $('#statDue').textContent = st.due;
    $('#statLearning').textContent = st.learning;
    $('#statTotal').textContent = st.total;
    var start = $('#srsStart'), more = $('#srsMore'), hint = $('#srsStartHint');
    if (st.due > 0) {
      start.hidden = false;
      start.textContent = 'Ôn ngay (' + st.due + ' từ)';
      hint.textContent = 'Mỗi phiên tối đa 10 từ.';
    } else {
      start.hidden = true;
      hint.textContent = st.total ? 'Hôm nay không còn từ nào đến hạn.' : '';
    }
    more.hidden = SRS.sessionPairs(10, true).length === 0;
  }

  function renderToday() {
    var box = $('#srsToday');
    var list = SRS.all();
    if (!list.length) {
      box.innerHTML = '<div class="srs-empty"><p>Từ bạn làm sai khi luyện tập sẽ xuất hiện ở đây.</p><p class="srs-empty-links"><a href="/hsk3">HSK 3</a><a href="/hsk4-thuong">HSK 4 thượng</a><a href="/hsk4-ha">HSK 4 hạ</a></p></div>';
      return;
    }
    var now = Date.now();
    var due = list.filter(function (e) { return SRS.entryDue(e, now); });
    if (!due.length) {
      box.innerHTML = '<p class="srs-done">Đã ôn xong phần đến hạn — hôm nay không còn từ nào cần ôn. Bạn có thể nghỉ, hoặc bấm “Ôn thêm 10 từ” nếu muốn luyện tiếp (ôn trước hạn không đổi lịch ôn chính).</p>';
      return;
    }
    box.innerHTML = '<div class="srs-today-list">' + due.map(function (e) {
      var skills = Object.keys(e.skills).filter(function (s) { return e.skills[s].due <= now; })
        .map(function (s) { return SRS.SKILL_LABEL[s]; }).join(' · ');
      return '<div class="srs-today-item"><span class="han">' + esc(e.word) + '</span><span class="pinyin">' + esc(e.pinyin) + '</span><span class="srs-today-meaning">' + esc(e.meaning) + '</span><span class="srs-chip">' + esc(skills) + '</span></div>';
    }).join('') + '</div>';
  }

  function renderBook() {
    var box = $('#srsBook');
    var now = Date.now();
    var list = SRS.all().filter(function (e) {
      if (filters.course && !e.sources.some(function (s) { return s.course === filters.course; })) return false;
      if (filters.skill && !e.skills[filters.skill]) return false;
      if (filters.status === 'suspended' && e.status !== 'suspended') return false;
      if (filters.status === 'active' && e.status !== 'active') return false;
      if (filters.status === 'due' && !SRS.entryDue(e, now)) return false;
      if (filters.q) {
        var q = filters.q.toLowerCase();
        var hay = (e.word + ' ' + e.pinyin + ' ' + SRS.normLoose(e.pinyin) + ' ' + e.meaning).toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
    list.sort(function (a, b) {
      var da = Math.min.apply(null, Object.keys(a.skills).map(function (s) { return a.skills[s].due; }).concat([Infinity]));
      var db = Math.min.apply(null, Object.keys(b.skills).map(function (s) { return b.skills[s].due; }).concat([Infinity]));
      return da - db;
    });
    if (!list.length) {
      box.innerHTML = '<p class="srs-done">' + (SRS.all().length ? 'Không có từ nào khớp với bộ lọc hiện tại.' : 'Sổ từ đang trống.') + '</p>';
      return;
    }
    box.innerHTML = list.map(function (e) {
      var chips = Object.keys(e.skills).map(function (s) {
        var st = e.skills[s];
        return '<span class="srs-chip">' + SRS.SKILL_LABEL[s] + ' · ôn tiếp: ' + SRS.fmtDue(st.due, now) + (st.wrong ? ' · sai ' + st.wrong + ' lần' : '') + '</span>';
      }).join('');
      if (e.status === 'suspended') chips += '<span class="srs-chip srs-chip-off">Tạm ngưng</span>';
      return '<article class="srs-item' + (e.status === 'suspended' ? ' is-suspended' : '') + '">' +
        '<div class="srs-item-main"><div class="srs-item-word"><span class="han">' + esc(e.word) + '</span><span class="pinyin">' + esc(e.pinyin) + '</span>' + (e.pos ? '<span class="pos">' + esc(e.pos) + '</span>' : '') + '</div>' +
        '<div class="srs-item-meaning">' + esc(e.meaning) + '</div>' +
        '<div class="srs-item-meta">' + esc(sourceText(e)) + ' · <a href="' + esc(sourceLink(e)) + '">Về bài gốc</a></div>' +
        '<div class="srs-chips">' + chips + '</div></div>' +
        '<div class="srs-item-actions"><button class="game-other" type="button" data-act="toggle" data-id="' + e.id + '">' + (e.status === 'suspended' ? 'Tiếp tục ôn' : 'Tạm ngưng') + '</button>' +
        '<button class="game-other srs-danger" type="button" data-act="remove" data-id="' + e.id + '">Bỏ khỏi sổ</button></div></article>';
    }).join('');
  }

  function renderAll() { renderStats(); renderToday(); renderBook(); SRS.paint(); }

  /* ---------- Phiên ôn ---------- */
  var session = null;

  function startSession(practice) {
    var pairs = SRS.sessionPairs(10, practice);
    if (!pairs.length) return;
    session = { pairs: pairs, i: 0, practice: !!practice, seen: {}, good: 0, hintN: 0, again: 0, card: null, dueAtStart: practice ? 0 : SRS.stats().due };
    $('#srsMain').hidden = true;
    $('#srsSession').hidden = false;
    renderCard();
    window.scrollTo({ top: 0 });
  }
  function exitSession() {
    session = null;
    $('#srsSession').hidden = true;
    $('#srsMain').hidden = false;
    renderAll();
    window.scrollTo({ top: 0 });
  }
  function endSession() {
    if (session && !session.practice && window.Streak) Streak.noteSrsQueueCleared(session.dueAtStart || 0);
    if (session && !session.practice && window.LB) { var lbTot = session.good + session.hintN + session.again; if (lbTot > 0) LB.award('srs', 'srs:' + LB.todayKey(), session.good, lbTot); }
    var more = SRS.sessionPairs(10, true).length > 0;
    $('#srsSession').innerHTML = '<div class="score-card srs-end"><span class="level-badge">Hoàn thành phiên ôn</span>' +
      '<h3>' + (session.practice ? 'Ôn thêm — xong rồi' : 'Đã ôn xong lượt này') + '</h3>' +
      '<p>Đúng ngay: <strong>' + session.good + '</strong> · Đúng sau gợi ý: <strong>' + session.hintN + '</strong> · Chưa nhớ: <strong>' + session.again + '</strong></p>' +
      (session.again ? '<p class="srs-note">Từ chưa nhớ sẽ quay lại sau khoảng 10 phút.</p>' : '') +
      '<div class="srs-end-row"><button class="action" id="srsExit" type="button">Về trang Ôn tập</button>' +
      (more ? '<button class="game-other" id="srsMore2" type="button">Ôn thêm 10 từ</button>' : '') + '</div></div>';
    $('#srsExit').addEventListener('click', exitSession);
    var m = $('#srsMore2');
    if (m) m.addEventListener('click', function () { startSession(true); });
    SRS.paint();
  }

  function cardHead(e, skill) {
    return '<div class="srs-card-head"><span class="srs-chip">' + SRS.SKILL_LABEL[skill] + '</span>' +
      '<span class="srs-card-src">' + esc(sourceText(e)) + '</span>' +
      '<span class="srs-card-prog">Thẻ ' + (session.i + 1) + '/' + session.pairs.length + '</span>' +
      '<button class="game-other srs-quit" id="srsQuit" type="button">Thoát</button></div>';
  }
  function listenRow(word) {
    return '<div class="srs-listen"><button class="action" id="srsListen" type="button">Nghe từ này</button><span class="srs-note">âm thanh máy (TTS)</span></div>';
  }
  function answerBlock(e) {
    return '<div class="srs-answer"><div class="srs-answer-word"><span class="han">' + esc(e.word) + '</span><span class="pinyin">' + esc(e.pinyin) + '</span>' + (e.pos ? '<span class="pos">' + esc(e.pos) + '</span>' : '') + '</div>' +
      '<p class="meaning">' + esc(e.meaning) + '</p>' +
      (e.example ? '<div class="srs-example"><p class="han">' + esc(e.example) + '</p><p class="pinyin">' + esc(e.examplePinyin) + '</p><p class="vi">' + esc(e.exampleVi) + '</p></div>' : '') +
      '<div class="srs-answer-row"><button class="game-other" id="srsListen2" type="button">Nghe lại</button><a class="game-other srs-linklike" href="' + esc(sourceLink(e)) + '">Về bài gốc</a></div></div>';
  }

  function renderCard() {
    var sec = $('#srsSession');
    if (!session || session.i >= session.pairs.length) { endSession(); return; }
    var pair = session.pairs[session.i];
    var e = SRS.get(pair.id);
    if (!e) { session.i++; renderCard(); return; }
    var key = pair.id + ':' + pair.skill;
    session.card = { pair: pair, key: key, hint: false, answered: false, first: !session.seen[key] };
    var h = '<div class="srs-card">' + cardHead(e, pair.skill);
    if (pair.skill === 'pinyin') {
      h += '<div class="srs-prompt"><div class="srs-big-han">' + esc(e.word) + '</div>' + (e.pos ? '<span class="pos">' + esc(e.pos) + '</span>' : '') +
        '<p class="srs-ask">Nhập pinyin của từ này (không cần gõ thanh điệu):</p>' +
        '<form id="srsForm"><input id="srsInput" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Ví dụ: qingchu" aria-label="Nhập pinyin"><button class="pw-go" type="submit">Kiểm tra</button></form>' +
        '<button class="srs-hintbtn" id="srsHint" type="button">Xem đáp án</button><div id="srsFb"></div></div>';
    } else if (pair.skill === 'hanzi') {
      h += '<div class="srs-prompt">' + listenRow(e.word) +
        '<p class="srs-ask"><span class="pinyin">' + esc(e.pinyin) + '</span> — ' + esc(e.meaning) + '</p>' +
        '<p class="srs-ask">Nghe và viết lại chữ Hán của từ này:</p>' +
        '<form id="srsForm"><input id="srsInput" type="text" autocomplete="off" spellcheck="false" placeholder="Nhập chữ Hán" aria-label="Nhập chữ Hán"><button class="pw-go" type="submit">Kiểm tra</button></form>' +
        '<button class="srs-hintbtn" id="srsHint" type="button">Xem đáp án</button><div id="srsFb"></div></div>';
    } else if (pair.skill === 'tone') {
      var opts = toneVariants(e.pinyin);
      h += '<div class="srs-prompt">' + listenRow(e.word) +
        '<div class="srs-big-han">' + esc(e.word) + '</div>' +
        '<p class="srs-ask">Chọn pinyin đúng thanh điệu của từ này:</p>' +
        '<div class="srs-opts">' + opts.map(function (o) { return '<button class="srs-opt" type="button" data-opt="' + esc(o) + '">' + esc(o) + '</button>'; }).join('') + '</div>' +
        '<button class="srs-hintbtn" id="srsHint" type="button">Xem đáp án</button><div id="srsFb"></div></div>';
    } else { /* meaning */
      h += '<div class="srs-prompt"><div class="srs-big-han">' + esc(e.word) + '</div><div class="pinyin">' + esc(e.pinyin) + '</div>' + listenRow(e.word) +
        '<p class="srs-ask">Bạn có nhớ nghĩa của từ này không?</p>' +
        '<button class="pw-go" id="srsReveal" type="button">Xem nghĩa</button><div id="srsFb"></div></div>';
    }
    h += '</div>';
    sec.innerHTML = h;
    $('#srsQuit').addEventListener('click', exitSession);
    var li = $('#srsListen'); if (li) li.addEventListener('click', function () { speak(e.word); });
    var form = $('#srsForm');
    if (form) {
      var input = $('#srsInput');
      var composing = false;
      input.addEventListener('compositionstart', function () { composing = true; });
      input.addEventListener('compositionend', function () { composing = false; });
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        if (composing || session.card.answered) return;
        submitInput(e, pair.skill, input.value);
      });
      setTimeout(function () { input.focus(); }, 30);
    }
    var hint = $('#srsHint');
    if (hint) hint.addEventListener('click', function () {
      if (session.card.answered) return;
      session.card.hint = true;
      hint.outerHTML = '<p class="srs-hint-answer">Đáp án: <strong>' + (pair.skill === 'hanzi' ? esc(e.word) : esc(e.pinyin)) + '</strong></p>';
    });
    var opts2 = sec.querySelectorAll('[data-opt]');
    opts2.forEach(function (b) {
      b.addEventListener('click', function () {
        if (session.card.answered) return;
        var ok = SRS.normTone(b.getAttribute('data-opt')) === SRS.normTone(e.pinyin);
        opts2.forEach(function (x) {
          x.disabled = true;
          if (SRS.normTone(x.getAttribute('data-opt')) === SRS.normTone(e.pinyin)) x.classList.add('right');
        });
        if (!ok) b.classList.add('wrong');
        finishCard(e, pair.skill, ok ? (session.card.hint ? 'hint' : 'good') : 'again', ok);
      });
    });
    var rev = $('#srsReveal');
    if (rev) rev.addEventListener('click', function () {
      rev.remove();
      $('#srsFb').innerHTML = answerBlock(e) +
        '<div class="srs-grade-row"><button class="pw-go" id="gGood" type="button">Đã nhớ</button><button class="game-other" id="gAgain" type="button">Chưa nhớ</button></div>';
      var l2 = $('#srsListen2'); if (l2) l2.addEventListener('click', function () { speak(e.word); });
      $('#gGood').addEventListener('click', function () { finishCard(e, 'meaning', 'good', true, true); });
      $('#gAgain').addEventListener('click', function () { finishCard(e, 'meaning', 'again', false, true); });
    });
    if (pair.skill === 'tone') speak(e.word);
  }

  function submitInput(e, skill, value) {
    var ok;
    if (skill === 'pinyin') {
      ok = SRS.normLoose(String(value).replace(/[1-5]/g, '')) === SRS.normLoose(e.pinyin);
    } else { /* hanzi */
      var norm = function (s) { return String(s || '').replace(/[\s，。！？、,.!?；：;:""''《》<>·…—-]/g, ''); };
      ok = norm(value) === norm(e.word);
    }
    var inp = $('#srsInput');
    if (inp) { inp.disabled = true; inp.classList.add(ok ? 'is-right' : 'is-wrong'); }
    var btn = $('#srsForm .pw-go'); if (btn) btn.disabled = true;
    finishCard(e, skill, ok ? (session.card.hint ? 'hint' : 'good') : 'again', ok);
  }

  /* Ghi kết quả lượt này, hiện phản hồi + nút Tiếp tục. quiet=true khi thẻ Nghĩa đã hiện sẵn đáp án. */
  function finishCard(e, skill, result, ok, quiet) {
    var card = session.card;
    if (card.answered) return;
    card.answered = true;
    if (card.first) {
      session.seen[card.key] = 1;
      if (window.Streak) Streak.noteSrsWord(e.id);
      if (!session.practice) SRS.grade(e.id, skill, result, false);
      if (result === 'good') session.good++;
      else if (result === 'hint') session.hintN++;
      else session.again++;
      if (result === 'again') {
        var pos = Math.min(session.i + 3, session.pairs.length);
        session.pairs.splice(pos, 0, { id: e.id, skill: skill });
      }
    }
    var fb = $('#srsFb');
    if (!fb) return;
    var st = SRS.get(e.id).skills[skill];
    var nextText;
    if (session.practice) nextText = 'Ôn thêm không làm thay đổi lịch ôn chính.';
    else if (!card.first) nextText = 'Lượt này chỉ để sửa trong phiên, lịch ôn đã chốt ở lượt đầu.';
    else if (result === 'good') nextText = 'Lần ôn tiếp theo: ' + SRS.fmtDue(st.due) + '.';
    else nextText = 'Chưa nhớ — từ này sẽ quay lại sau khoảng 10 phút.';
    var head = '<p class="srs-result ' + (ok ? 'ok' : 'bad') + '">' + (ok ? (result === 'hint' ? 'Đúng, nhưng có xem gợi ý nên chưa tính là tự nhớ.' : 'Đúng rồi!') : 'Chưa đúng.') + '</p>';
    fb.innerHTML = (quiet ? '' : head + answerBlock(e)) +
      '<p class="srs-note">' + nextText + '</p>' +
      '<button class="pw-go" id="srsNext" type="button">Tiếp tục</button>';
    var l2 = $('#srsListen2'); if (l2) l2.addEventListener('click', function () { speak(e.word); });
    $('#srsNext').addEventListener('click', function () { session.i++; renderCard(); });
    if (!quiet) speak(e.word);
  }

  /* ---------- Sự kiện trang ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    renderAll();
    if (!SRS.storageAvailable()) { var w = $('#srsStorageWarn'); if (w) w.hidden = false; }
    $('#srsStart').addEventListener('click', function () { startSession(false); });
    $('#srsMore').addEventListener('click', function () { startSession(true); });
    ['fSearch', 'fCourse', 'fSkill', 'fStatus'].forEach(function (id) {
      var el = document.getElementById(id);
      el.addEventListener('input', function () {
        filters.q = $('#fSearch').value.trim();
        filters.course = $('#fCourse').value;
        filters.skill = $('#fSkill').value;
        filters.status = $('#fStatus').value;
        renderBook();
      });
    });
    $('#srsBook').addEventListener('click', function (ev) {
      var b = ev.target.closest ? ev.target.closest('[data-act]') : null;
      if (!b) return;
      var id = b.getAttribute('data-id');
      var e = SRS.get(id);
      if (!e) return;
      if (b.getAttribute('data-act') === 'toggle') SRS.suspend(id, e.status !== 'suspended');
      else if (b.getAttribute('data-act') === 'remove') {
        if (window.confirm('Bỏ “' + e.word + '” khỏi Sổ từ? Lịch ôn của từ này sẽ bị xóa.')) SRS.remove(id);
      }
      renderAll();
    });
    $('#srsExport').addEventListener('click', function () {
      var blob = new Blob([SRS.exportJSON()], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'on-tap-sao-luu.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
      $('#srsDataMsg').textContent = 'Đã xuất bản sao lưu gồm ' + SRS.all().length + ' từ.';
    });
    var file = $('#srsImportFile');
    $('#srsImportBtn').addEventListener('click', function () { file.click(); });
    file.addEventListener('change', function () {
      if (!file.files || !file.files[0]) return;
      var reader = new FileReader();
      reader.onload = function () {
        var r = SRS.importJSON(String(reader.result || ''));
        $('#srsDataMsg').textContent = r.error ? r.error : ('Đã nhập xong: thêm ' + r.added + ' từ mới, bỏ qua ' + r.skipped + ' mục đã có hoặc không hợp lệ.');
        renderAll();
        file.value = '';
      };
      reader.readAsText(file.files[0]);
    });
    $('#srsClear').addEventListener('click', function () {
      if (!SRS.all().length) { $('#srsDataMsg').textContent = 'Chưa có dữ liệu ôn tập để xóa.'; return; }
      if (window.confirm('Xóa toàn bộ dữ liệu ôn tập trên trình duyệt này? Hành động này không hoàn tác được nếu chưa xuất sao lưu.')) {
        SRS.clearAll();
        renderAll();
        $('#srsDataMsg').textContent = 'Đã xóa toàn bộ dữ liệu ôn tập.';
      }
    });
  });
})();
