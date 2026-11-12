/* ==========================================================================
   ÔN TẬP TỰ CHỌN · LUYỆN ĐỀ TỔNG HỢP NGẪU NHIÊN (assets/custom-review.js)
   - Hỗ trợ 2 chế độ trên trang /on-tap:
     1) Ôn tập Tự chọn (Luyện đề chuẩn 20 câu random từ khóa học hoặc nhóm >= 2 bài)
     2) Ôn tập SRS (Lặp lại ngắt quãng hiện có)
   - Cấu trúc cố định của 1 Đề Ôn Tập Chuẩn (20 câu · 100 điểm · 5 điểm/câu):
     + Phần I   (Câu 1–6,  30đ): Từ vựng & Phiên âm (2 câu Chữ Hán→Nghĩa, 2 câu Nghĩa→Chữ Hán, 2 câu Pinyin & Thanh điệu)
     + Phần II  (Câu 7–12, 30đ): Điền từ & Ngữ pháp trọng tâm (4 câu Điền từ vào chỗ trống, 2 câu Hoàn thành câu ngữ pháp)
     + Phần III (Câu 13–17,25đ): Đọc hiểu & Tình huống Bài khóa (5 câu trắc nghiệm từ ngân hàng bài khóa)
     + Phần IV  (Câu 18–20,15đ): Nghe chép câu Hán tự (3 câu nghe chép có ghép từ & gõ trực tiếp)
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'hsk.customReview.v1';

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function shuffle(arr) {
    var a = (arr || []).slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function normalizeChinese(s) {
    return String(s || '')
      .replace(/[\s\u3000，。！？、；：“”‘’（）()《》【】…—,.!?;:'"\-]/g, '')
      .trim();
  }

  function speakZh(text, rate) {
    if (!('speechSynthesis' in window) || !text) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(String(text));
      u.lang = 'zh-CN';
      u.rate = rate || 0.82;
      var vs = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
      var zhVoice = vs.find(function (v) { return /^zh(-|_)?CN/i.test(v.lang); }) ||
                    vs.find(function (v) { return /^zh/i.test(v.lang); });
      if (zhVoice) u.voice = zhVoice;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  /* ---------- Bộ sinh biến thể Pinyin / Thanh điệu ---------- */
  var TONES = {
    a: ['a', 'ā', 'á', 'ǎ', 'à'],
    e: ['e', 'ē', 'é', 'ě', 'è'],
    i: ['i', 'ī', 'í', 'ǐ', 'ì'],
    o: ['o', 'ō', 'ó', 'ǒ', 'ò'],
    u: ['u', 'ū', 'ú', 'ǔ', 'ù'],
    'ü': ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ']
  };
  var MARKED = {};
  Object.keys(TONES).forEach(function (base) {
    TONES[base].forEach(function (ch, toneIdx) {
      if (toneIdx > 0) MARKED[ch] = { base: base, tone: toneIdx };
    });
  });

  function sylTone(syl) {
    for (var i = 0; i < syl.length; i++) {
      if (MARKED[syl[i]]) return MARKED[syl[i]].tone;
    }
    return 0;
  }

  function setSylTone(syl, tone) {
    var base = syl.split('').map(function (c) { return MARKED[c] ? MARKED[c].base : c; }).join('');
    if (tone === 0) return base;
    var idx = -1;
    if (base.indexOf('a') >= 0) idx = base.indexOf('a');
    else if (base.indexOf('e') >= 0) idx = base.indexOf('e');
    else if (base.indexOf('ou') >= 0) idx = base.indexOf('ou');
    else {
      for (var i = base.length - 1; i >= 0; i--) {
        if ('iouü'.indexOf(base[i]) >= 0) { idx = i; break; }
      }
    }
    if (idx < 0 || !TONES[base[idx]]) return syl;
    return base.slice(0, idx) + TONES[base[idx]][tone] + base.slice(idx + 1);
  }

  function makePinyinOptions(correctPy, poolPinyins) {
    var clean = String(correctPy || '').trim();
    var syls = clean.split(/\s+/).filter(Boolean);
    var out = [];
    var seen = {};
    var normKey = function (s) { return String(s || '').trim().toLowerCase().replace(/\s+/g, ''); };
    seen[normKey(clean)] = true;

    function addOpt(cand) {
      var k = normKey(cand);
      if (cand && !seen[k]) {
        seen[k] = true;
        out.push(cand);
      }
    }

    if (syls.length) {
      for (var i = 0; i < syls.length && out.length < 3; i++) {
        var t = sylTone(syls[i]);
        for (var dt = 1; dt <= 3 && out.length < 3; dt++) {
          var nextTone = ((t === 0 ? 1 : t - 1) + dt) % 4 + 1;
          if (nextTone !== t) {
            var copy = syls.slice();
            copy[i] = setSylTone(syls[i], nextTone);
            addOpt(copy.join(' '));
          }
        }
      }
      if (out.length < 3 && syls.length >= 2) {
        var multi = syls.map(function (s, idx) {
          var t = sylTone(s);
          return setSylTone(s, ((t + idx) % 4) + 1);
        });
        addOpt(multi.join(' '));
      }
    }

    var shuffledPool = shuffle(poolPinyins || []);
    for (var p = 0; p < shuffledPool.length && out.length < 3; p++) {
      addOpt(shuffledPool[p]);
    }

    var finalOpts = shuffle(out.slice(0, 3).concat([clean]));
    return {
      options: finalOpts,
      answer: finalOpts.indexOf(clean)
    };
  }

  /* ---------- Ruby Pinyin trên từng chữ Hán cho câu đáp án ---------- */
  function isHanChar(ch) {
    var code = ch.charCodeAt(0);
    return (code >= 0x4E00 && code <= 0x9FFF) || (code >= 0x3400 && code <= 0x4DBF);
  }

  function renderRubySentence(hanSentence, pyArr) {
    if (!Array.isArray(pyArr) || !pyArr.length) return esc(hanSentence);
    var idx = 0;
    var html = '';
    for (var i = 0; i < hanSentence.length; i++) {
      var ch = hanSentence[i];
      if (isHanChar(ch) && idx < pyArr.length) {
        html += '<ruby>' + esc(ch) + '<rt>' + esc(pyArr[idx++]) + '</rt></ruby>';
      } else {
        html += esc(ch);
      }
    }
    return html;
  }

  /* ---------- Gom toàn bộ kho dữ liệu 3 khóa học (29 bài) ---------- */
  var COURSE_META = [
    {
      id: 'hsk3',
      title: 'HSK 3 · Trọn khóa',
      shortTitle: 'HSK 3',
      badge: 'Bài 10 – Bài 18',
      desc: '9 bài học trọng tâm HSK 3: câu chữ 把, câu bị động 被, thời tiết, du lịch, văn hóa & công sở.',
      lessonRange: '9 bài (Bài 10–18)',
      courseSlug: 'hsk3'
    },
    {
      id: 'hsk4-thuong',
      title: 'HSK 4 Thượng · 10 bài đầu',
      shortTitle: 'HSK 4 Thượng',
      badge: 'Bài 1 – Bài 10',
      desc: '10 bài đầu HSK 4: đời sống du học, thuê nhà, thanh toán số, ẩm thực, khám bệnh & công việc.',
      lessonRange: '10 bài (Bài 1–10)',
      courseSlug: 'hsk4-thuong'
    },
    {
      id: 'hsk4-ha',
      title: 'HSK 4 Hạ · 10 bài sau',
      shortTitle: 'HSK 4 Hạ',
      badge: 'Bài 11 – Bài 20',
      desc: '10 bài sau HSK 4: học tập suốt đời, gia đình, truyền thống, tuyển dụng, thể thao & nghệ thuật.',
      lessonRange: '10 bài (Bài 11–20)',
      courseSlug: 'hsk4-ha'
    }
  ];

  function buildCatalog() {
    var byKey = {};
    var byCourse = { 'hsk3': [], 'hsk4-thuong': [], 'hsk4-ha': [] };
    var allLessons = [];

    function registerLesson(courseId, courseShort, rawLesson, fillObj, quizArr, dictArr, dictPyArr) {
      if (!rawLesson) return;
      var numStr = String(rawLesson.num);
      var key = courseId + ':' + numStr;
      var fillItems = (fillObj && Array.isArray(fillObj.items)) ? fillObj.items : [];
      var fillBank = (fillObj && Array.isArray(fillObj.bank)) ? fillObj.bank : [];
      var flatQuiz = [];
      if (Array.isArray(quizArr)) {
        quizArr.forEach(function (scene) {
          if (scene && Array.isArray(scene.qs)) {
            scene.qs.forEach(function (qItem) {
              flatQuiz.push({
                sceneTitle: scene.title || ('Bài ' + numStr),
                q: qItem.q,
                py: qItem.py || '',
                options: (qItem.options || []).slice(),
                answer: qItem.answer,
                explain: qItem.explain || ''
              });
            });
          }
        });
      }
      var dicts = [];
      if (Array.isArray(dictArr)) {
        dictArr.forEach(function (d, dIdx) {
          if (Array.isArray(d) && d[0]) {
            dicts.push({
              zh: d[0],
              vi: d[1] || '',
              focus: d[2] || '',
              pyArr: (Array.isArray(dictPyArr) && Array.isArray(dictPyArr[dIdx])) ? dictPyArr[dIdx] : null
            });
          }
        });
      }

      var entry = {
        key: key,
        courseId: courseId,
        courseShort: courseShort,
        num: rawLesson.num,
        label: courseShort + ' · Bài ' + rawLesson.num,
        shortLabel: 'Bài ' + rawLesson.num,
        emoji: rawLesson.emoji || '📘',
        han: rawLesson.han || '',
        pinyin: rawLesson.pinyin || '',
        translation: rawLesson.translation || '',
        theme: rawLesson.theme || rawLesson.translation || '',
        vocab: Array.isArray(rawLesson.vocab) ? rawLesson.vocab : [],
        grammar: Array.isArray(rawLesson.grammar) ? rawLesson.grammar : [],
        fillBank: fillBank,
        fillItems: fillItems,
        textQuiz: flatQuiz,
        dictations: dicts
      };
      byKey[key] = entry;
      byCourse[courseId].push(entry);
      allLessons.push(entry);
    }

    var h3 = window.lessonsHSK3 || [];
    var f3 = window.fillData3 || {};
    var q3 = window.textQuiz3 || {};
    var d3 = window.dictations || {};
    var dp3 = (typeof dictPy3 !== 'undefined' && dictPy3) ? dictPy3 : (window.dictPy3 || {});
    h3.forEach(function (l) {
      var n = String(l.num);
      registerLesson('hsk3', 'HSK 3', l, f3[n], q3[n], d3[n], dp3[n]);
    });

    var h4s = window.lessons4 || [];
    var q4s = window.textQuiz4 || {};
    var d4s = window.dictations4 || {};
    var dp4s = window.dictPy4 || {};
    h4s.forEach(function (l) {
      var n = String(l.num);
      registerLesson('hsk4-thuong', 'HSK 4 Thượng', l, l.fill, q4s[n], d4s[n], dp4s[n]);
    });

    var h4x = window.lessons4xia || [];
    var q4x = window.textQuizX || {};
    var d4x = window.dictationsX || {};
    var dp4x = window.dictPyX || {};
    h4x.forEach(function (l) {
      var n = String(l.num);
      registerLesson('hsk4-ha', 'HSK 4 Hạ', l, l.fill, q4x[n], d4x[n], dp4x[n]);
    });

    return {
      byKey: byKey,
      byCourse: byCourse,
      all: allLessons
    };
  }

  var CATALOG = buildCatalog();

  /* ---------- Lưu / đọc trạng thái lựa chọn bài ôn ---------- */
  function loadSavedPrefs() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function savePrefs(prefs) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) {}
  }

  /* ---------- Thuật toán lấy mẫu phân tầng (Stratified Sampling) ----------
     Đảm bảo mỗi bài học trong nhóm được chọn đều có số câu hỏi phân bổ đều nhau. */
  function pickStratified(lessonsList, count, extractorFn) {
    var buckets = lessonsList.map(function (lesson) {
      var rawItems = extractorFn(lesson) || [];
      return {
        lesson: lesson,
        items: shuffle(rawItems.slice())
      };
    }).filter(function (b) { return b.items.length > 0; });

    if (!buckets.length) return [];
    buckets = shuffle(buckets);

    var picked = [];
    var ptrs = buckets.map(function () { return 0; });
    var safety = 0;

    while (picked.length < count && safety < 500) {
      safety++;
      var addedInPass = false;
      for (var b = 0; b < buckets.length && picked.length < count; b++) {
        var bucket = buckets[b];
        if (ptrs[b] < bucket.items.length) {
          picked.push({
            lesson: bucket.lesson,
            data: bucket.items[ptrs[b]]
          });
          ptrs[b]++;
          addedInPass = true;
        }
      }
      if (!addedInPass) break;
    }
    return shuffle(picked);
  }

  /* ---------- Kiểm tra câu tự viết ngữ pháp (tương thích engine.js) ---------- */
  function checkGrammarAnswer(item, userRaw) {
    var clean = normalizeChinese(userRaw);
    if (!clean) {
      return { ok: false, msg: 'Bạn hãy chọn phương án đúng hoặc gõ câu tiếng Trung vào ô trả lời nhé.' };
    }
    if (clean === normalizeChinese(item.model)) {
      return { ok: true, msg: 'Chính xác! Câu trả lời khớp hoàn toàn với đáp án chuẩn.' };
    }
    var reqs = item.required || [];
    for (var i = 0; i < reqs.length; i++) {
      var rClean = normalizeChinese(reqs[i]);
      if (rClean && clean.indexOf(rClean) === -1) {
        return { ok: false, msg: 'Câu cần sử dụng điểm ngữ pháp bắt buộc: “' + reqs[i] + '”.' };
      }
    }
    if (item.minLength && clean.length < item.minLength) {
      return { ok: false, msg: 'Câu trả lời hơi ngắn (cần ít nhất ' + item.minLength + ' chữ Hán để trọn ý).' };
    }
    return { ok: true, msg: 'Hợp lệ! Bạn đã vận dụng đúng cấu trúc “' + (item.grammarPoint || '') + '”.' };
  }

  /* ---------- Tạo 4 phương án cho câu Ngữ pháp (để vừa chọn trắc nghiệm vừa gõ được) ---------- */
  function buildGrammarOptions(item, lesson, allSelectedLessons) {
    var correct = String(item.model || '').trim();
    var distractors = [];
    var seen = {};
    seen[normalizeChinese(correct)] = true;

    function addCand(str) {
      var s = String(str || '').trim();
      var k = normalizeChinese(s);
      if (s && k && !seen[k]) {
        seen[k] = true;
        distractors.push(s);
      }
    }

    // Tạo phương án nhiễu ngữ pháp hợp lý (đảo trật tự hoặc thay từ khóa sai thường gặp)
    var req = (item.required && item.required[0]) ? item.required[0] : '';
    if (correct.length <= 5) {
      // Câu điền từ ngữ pháp ngắn (như 任何, 要是, 随着, 就是说, 即使, 无论...)
      var shortPool = ['任何', '要是', '随着', '由于', '不过', '不仅', '即使', '无论', '究竟', '对于', '加上', '却', '说不定', '难道', '就是说', '看来', '只能', '或者', '还是'];
      shuffle(shortPool).forEach(function (w) {
        if (distractors.length < 3) addCand(w);
      });
    } else {
      // Câu hoàn chỉnh vế ngữ pháp: lấy model của các câu ngữ pháp khác cùng bài / nhóm bài và tạo biến thể sai ngữ pháp
      if (req && correct.indexOf(req) >= 0) {
        var stripped = correct.replace(req, '');
        if (stripped.length >= 3) {
          addCand(stripped + req);
        }
      }
      if (correct.indexOf('也') >= 0) addCand(correct.replace('也', '但是'));
      if (correct.indexOf('就') >= 0) addCand(correct.replace('就', '才'));
      if (correct.indexOf('才') >= 0) addCand(correct.replace('才', '就'));
      if (correct.indexOf('把') >= 0) {
        var baSwap = correct.replace(/把([^，。]{1,4})([看写做洗放拿改读学完好]+)/, '$2把$1');
        if (baSwap !== correct) addCand(baSwap);
      }

      var otherGrammarModels = [];
      allSelectedLessons.forEach(function (l) {
        (l.fillItems || []).forEach(function (fi) {
          if (fi.type === 'grammar' && fi.model && fi.model.length > 4) {
            otherGrammarModels.push(fi.model);
          }
        });
      });
      shuffle(otherGrammarModels).forEach(function (m) {
        if (distractors.length < 3) addCand(m);
      });
    }

    var opts = shuffle(distractors.slice(0, 3).concat([correct]));
    return {
      options: opts,
      answer: opts.indexOf(correct)
    };
  }

  /* ---------- Tách câu chữ Hán thành các mảnh ghép từ (Word Bank) cho Phần IV Nghe chép ---------- */
  function buildDictationTiles(hanSentence, lessonVocab, allVocabPool) {
    var cleanSent = String(hanSentence || '').replace(/[，。！？、；：“”‘’（）()《》【】…—,.!?;:'"\s]/g, '');
    if (!cleanSent) return [];

    // Ưu tiên tách theo từ vựng có trong bài (2-4 chữ), phần còn lại tách cụm 1-2 chữ
    var knownWords = (lessonVocab || [])
      .map(function (v) { return String(v.word || '').trim(); })
      .filter(function (w) { return w.length >= 2 && w.length <= 4; })
      .sort(function (a, b) { return b.length - a.length; });

    var segments = [];
    var i = 0;
    while (i < cleanSent.length) {
      var matched = '';
      for (var k = 0; k < knownWords.length; k++) {
        var kw = knownWords[k];
        if (cleanSent.slice(i, i + kw.length) === kw) {
          matched = kw;
          break;
        }
      }
      if (matched) {
        segments.push(matched);
        i += matched.length;
      } else {
        var step = (cleanSent.length - i >= 2 && segments.length < 9) ? 2 : 1;
        segments.push(cleanSent.slice(i, i + step));
        i += step;
      }
    }

    // Thêm 2 mảnh gây nhiễu nhẹ từ từ vựng trong nhóm bài
    var distractors = [];
    var shuffledVocab = shuffle(allVocabPool || []);
    for (var v = 0; v < shuffledVocab.length && distractors.length < 2; v++) {
      var w = String(shuffledVocab[v].word || '').trim();
      if (w && cleanSent.indexOf(w) === -1 && w.length <= 2) {
        distractors.push(w);
      }
    }

    return shuffle(segments.concat(distractors)).map(function (txt, idx) {
      return { id: 'tile_' + idx, text: txt };
    });
  }

  /* ==========================================================================
     SINH ĐỀ ÔN TẬP TỔNG HỢP THEO CẤU TRÚC CỐ ĐỊNH (20 CÂU · 100 ĐIỂM)
     ========================================================================== */
  function generateExam(selectedLessons) {
    var allVocab = [];
    selectedLessons.forEach(function (l) {
      (l.vocab || []).forEach(function (v) {
        allVocab.push({ lesson: l, vocab: v });
      });
    });

    var allMeanings = allVocab.map(function (x) { return x.vocab.meaning; }).filter(Boolean);
    var allWords = allVocab.map(function (x) { return x.vocab.word; }).filter(Boolean);
    var allPinyins = allVocab.map(function (x) { return x.vocab.pinyin; }).filter(Boolean);

    var questions = [];
    var qNumber = 1;

    /* ----- PHẦN I: TỪ VỰNG & PHIÊN ÂM (6 câu: Câu 1–6) ----- */
    var vocabPicks = pickStratified(selectedLessons, 6, function (l) { return l.vocab || []; });

    vocabPicks.forEach(function (pick, idx) {
      var l = pick.lesson;
      var v = pick.data;
      var subType = idx < 2 ? 'han_to_vi' : (idx < 4 ? 'vi_to_han' : 'han_to_py');

      if (subType === 'han_to_vi') {
        var wrongVi = shuffle(allMeanings.filter(function (m) { return m !== v.meaning; })).slice(0, 3);
        var optsVi = shuffle(wrongVi.concat([v.meaning]));
        questions.push({
          num: qNumber++,
          sectionId: 'part1',
          sectionTitle: 'Phần I · Từ vựng & Phiên âm',
          kind: 'mcq',
          subKind: 'han_to_vi',
          typeBadge: 'Từ vựng · Nghĩa tiếng Việt',
          lessonKey: l.key,
          lessonLabel: l.label,
          courseId: l.courseId,
          lessonNum: l.num,
          vocabRef: v,
          promptTag: 'Chọn nghĩa tiếng Việt đúng của từ trong ngữ cảnh:',
          hanPrompt: v.word,
          pyPrompt: v.pinyin,
          posPrompt: v.pos || '',
          contextZh: v.example || '',
          contextPy: v.examplePinyin || '',
          contextVi: v.exampleVi || '',
          audioText: v.word,
          options: optsVi,
          answer: optsVi.indexOf(v.meaning),
          userChoice: null,
          checked: false,
          isCorrect: false,
          explain: '“' + v.word + '” (' + v.pinyin + (v.pos ? ' · ' + v.pos : '') + ') nghĩa là: ' + v.meaning + '.' +
                   (v.example ? ' Ví dụ: ' + v.example + ' (' + v.exampleVi + ')' : '')
        });
      } else if (subType === 'vi_to_han') {
        var wrongHan = shuffle(allWords.filter(function (w) { return w !== v.word; })).slice(0, 3);
        var optsHan = shuffle(wrongHan.concat([v.word]));
        var maskedEx = v.example && v.example.indexOf(v.word) >= 0
          ? v.example.replace(v.word, '＿＿')
          : '';
        questions.push({
          num: qNumber++,
          sectionId: 'part1',
          sectionTitle: 'Phần I · Từ vựng & Phiên âm',
          kind: 'mcq',
          subKind: 'vi_to_han',
          typeBadge: 'Từ vựng · Nhận diện chữ Hán',
          lessonKey: l.key,
          lessonLabel: l.label,
          courseId: l.courseId,
          lessonNum: l.num,
          vocabRef: v,
          promptTag: 'Chọn từ chữ Hán khớp với nghĩa và câu ví dụ sau:',
          viPrompt: v.meaning,
          posPrompt: v.pos || '',
          contextZh: maskedEx,
          contextVi: v.exampleVi || '',
          audioText: v.word,
          options: optsHan,
          isHanOptions: true,
          answer: optsHan.indexOf(v.word),
          userChoice: null,
          checked: false,
          isCorrect: false,
          explain: 'Đáp án đúng là “' + v.word + '” (' + v.pinyin + ') — ' + v.meaning + '.' +
                   (v.example ? ' Câu hoàn chỉnh: ' + v.example : '')
        });
      } else {
        var pyPack = makePinyinOptions(v.pinyin, allPinyins);
        questions.push({
          num: qNumber++,
          sectionId: 'part1',
          sectionTitle: 'Phần I · Từ vựng & Phiên âm',
          kind: 'mcq',
          subKind: 'han_to_py',
          typeBadge: 'Ngữ âm · Chuẩn Pinyin & Thanh điệu',
          lessonKey: l.key,
          lessonLabel: l.label,
          courseId: l.courseId,
          lessonNum: l.num,
          vocabRef: v,
          promptTag: 'Chọn phiên âm Pinyin đúng dấu thanh cho từ sau:',
          hanPrompt: v.word,
          viPrompt: v.meaning,
          posPrompt: v.pos || '',
          audioText: v.word,
          options: pyPack.options,
          answer: pyPack.answer,
          userChoice: null,
          checked: false,
          isCorrect: false,
          explain: '“' + v.word + '” đọc chuẩn là “' + v.pinyin + '” (' + v.meaning + ').'
        });
      }
    });

    /* ----- PHẦN II: ĐIỀN TỪ & NGỮ PHÁP TRỌNG TÂM (6 câu: Câu 7–12) ----- */
    // 4 câu Điền từ vào chỗ trống (type === 'bank')
    var bankPicks = pickStratified(selectedLessons, 4, function (l) {
      return (l.fillItems || []).filter(function (it) { return it.type === 'bank'; });
    });

    bankPicks.forEach(function (pick) {
      var l = pick.lesson;
      var item = pick.data;
      var bankWords = (l.fillBank || []).map(function (b) { return b.w; }).filter(Boolean);
      var wrongWords = shuffle(bankWords.filter(function (w) { return w !== item.answer; }));
      if (wrongWords.length < 3) {
        var extra = shuffle(allWords.filter(function (w) { return w !== item.answer && wrongWords.indexOf(w) < 0; }));
        wrongWords = wrongWords.concat(extra);
      }
      var opts = shuffle(wrongWords.slice(0, 3).concat([item.answer]));
      var pyLookup = {};
      (l.fillBank || []).forEach(function (b) { pyLookup[b.w] = b.py; });

      var matchedVocab = (l.vocab || []).find(function (v) { return v.word === item.answer; }) || null;

      questions.push({
        num: qNumber++,
        sectionId: 'part2',
        sectionTitle: 'Phần II · Điền từ & Ngữ pháp trọng tâm',
        kind: 'fill_bank',
        typeBadge: 'Điền từ vào chỗ trống',
        lessonKey: l.key,
        lessonLabel: l.label,
        courseId: l.courseId,
        lessonNum: l.num,
        vocabRef: matchedVocab,
        promptTag: 'Chọn từ thích hợp điền vào chỗ trống (＿＿):',
        sentence: item.sentence,
        hintVi: item.hintVi || '',
        fullSentence: item.fullSentence || item.sentence.replace('＿＿', item.answer),
        fullPinyin: item.fullPinyin || '',
        audioText: item.fullSentence || item.sentence.replace('＿＿', item.answer),
        options: opts,
        optionPinyins: opts.map(function (w) { return pyLookup[w] || ''; }),
        isHanOptions: true,
        answer: opts.indexOf(item.answer),
        correctWord: item.answer,
        userChoice: null,
        checked: false,
        isCorrect: false,
        explain: 'Câu hoàn chỉnh: “' + (item.fullSentence || '') + '” (' + (item.fullPinyin || '') + ') — ' + (item.hintVi || '')
      });
    });

    // 2 câu Hoàn thành câu Ngữ pháp (type === 'grammar')
    var grammarPicks = pickStratified(selectedLessons, 2, function (l) {
      return (l.fillItems || []).filter(function (it) { return it.type === 'grammar'; });
    });

    grammarPicks.forEach(function (pick) {
      var l = pick.lesson;
      var item = pick.data;
      var gPack = buildGrammarOptions(item, l, selectedLessons);
      var fullSample = String(item.sentence || '').replace('＿＿', item.model || '');

      questions.push({
        num: qNumber++,
        sectionId: 'part2',
        sectionTitle: 'Phần II · Điền từ & Ngữ pháp trọng tâm',
        kind: 'fill_grammar',
        typeBadge: 'Ngữ pháp · ' + (item.grammarPoint || 'Vận dụng cấu trúc'),
        lessonKey: l.key,
        lessonLabel: l.label,
        courseId: l.courseId,
        lessonNum: l.num,
        promptTag: 'Hoàn thành chỗ trống theo điểm ngữ pháp yêu cầu (chọn phương án đúng hoặc tự gõ):',
        grammarPoint: item.grammarPoint || '',
        sentence: item.sentence,
        hintVi: item.hintVi || '',
        required: item.required || [],
        minLength: item.minLength || 2,
        model: item.model || '',
        modelPinyin: item.modelPinyin || '',
        fullSentence: fullSample,
        audioText: fullSample,
        options: gPack.options,
        isHanOptions: true,
        answer: gPack.answer,
        inputMode: 'choice', // 'choice' | 'type'
        userChoice: null,
        userText: '',
        checked: false,
        isCorrect: false,
        feedbackMsg: '',
        explain: 'Đáp án chuẩn: “' + (item.model || '') + '” (' + (item.modelPinyin || '') + '). Câu đầy đủ: ' + fullSample
      });
    });

    /* ----- PHẦN III: ĐỌC HIỂU & TÌNH HUỐNG BÀI KHÓA (5 câu: Câu 13–17) ----- */
    var quizPicks = pickStratified(selectedLessons, 5, function (l) { return l.textQuiz || []; });

    quizPicks.forEach(function (pick) {
      var l = pick.lesson;
      var qData = pick.data;
      questions.push({
        num: qNumber++,
        sectionId: 'part3',
        sectionTitle: 'Phần III · Đọc hiểu & Tình huống Bài khóa',
        kind: 'text_quiz',
        typeBadge: 'Bài khóa · ' + (qData.sceneTitle || l.shortLabel),
        lessonKey: l.key,
        lessonLabel: l.label,
        courseId: l.courseId,
        lessonNum: l.num,
        promptTag: 'Trả lời câu hỏi tình huống bài khóa:',
        sceneTitle: qData.sceneTitle || '',
        hanQuestion: qData.q,
        pyQuestion: qData.py || '',
        audioText: qData.q,
        options: (qData.options || []).slice(),
        isHanOptions: true,
        answer: qData.answer,
        userChoice: null,
        checked: false,
        isCorrect: false,
        explain: qData.explain || ''
      });
    });

    /* ----- PHẦN IV: NGHE CHÉP CÂU HÁN TỰ (3 câu: Câu 18–20) ----- */
    var dictPicks = pickStratified(selectedLessons, 3, function (l) { return l.dictations || []; });

    dictPicks.forEach(function (pick) {
      var l = pick.lesson;
      var dData = pick.data;
      var vocabPool = allVocab.map(function (x) { return x.vocab; });
      var tiles = buildDictationTiles(dData.zh, l.vocab, vocabPool);

      questions.push({
        num: qNumber++,
        sectionId: 'part4',
        sectionTitle: 'Phần IV · Nghe chép câu Hán tự',
        kind: 'dictation',
        typeBadge: 'Nghe chép câu · 听写句子',
        lessonKey: l.key,
        lessonLabel: l.label,
        courseId: l.courseId,
        lessonNum: l.num,
        promptTag: 'Nghe câu tiếng Trung và gõ lại câu chữ Hán (hoặc bấm ghép các từ bên dưới):',
        targetZh: dData.zh,
        targetVi: dData.vi || '',
        focusPoints: dData.focus || '',
        pyArr: dData.pyArr || null,
        audioText: dData.zh,
        tiles: tiles,
        usedTileIds: [],
        userText: '',
        showViHint: false,
        checked: false,
        isCorrect: false,
        explain: dData.vi || ''
      });
    });

    return questions;
  }

  /* ==========================================================================
     STATE & GIAO DIỆN CHÍNH CỦA TRANG ÔN TẬP TỰ CHỌN
     ========================================================================== */
  var saved = loadSavedPrefs();
  var defaultSelectedKeys = (saved && Array.isArray(saved.selectedKeys) && saved.selectedKeys.length >= 2)
    ? saved.selectedKeys.filter(function (k) { return !!CATALOG.byKey[k]; })
    : ['hsk3:12', 'hsk3:13', 'hsk3:14'];
  if (defaultSelectedKeys.length < 2) {
    defaultSelectedKeys = ['hsk3:12', 'hsk3:13', 'hsk3:14'];
  }

  var state = {
    topMode: 'custom',            // 'custom' | 'srs'
    screen: 'setup',              // 'setup' | 'exam' | 'result'
    courseFilter: 'all',          // 'all' | 'hsk3' | 'hsk4-thuong' | 'hsk4-ha'
    selectedKeys: defaultSelectedKeys,
    activeScopeTitle: '',
    examLayout: 'single',         // 'single' (Từng câu) | 'sheet' (Toàn bộ đề 20 câu)
    questions: [],
    currentIndex: 0,
    startedAt: 0,
    elapsedSec: 0,
    timerId: null,
    submitted: false,
    awardedExam: false
  };

  function persistSelected() {
    savePrefs({
      selectedKeys: state.selectedKeys
    });
  }

  function getSelectedLessons() {
    return state.selectedKeys
      .map(function (k) { return CATALOG.byKey[k]; })
      .filter(Boolean);
  }

  function formatDuration(sec) {
    var s = Math.max(0, Math.floor(sec || 0));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return (m < 10 ? '0' + m : String(m)) + ':' + (r < 10 ? '0' + r : String(r));
  }

  function stopTimer() {
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function startTimer() {
    stopTimer();
    state.startedAt = Date.now();
    state.elapsedSec = 0;
    state.timerId = setInterval(function () {
      if (state.screen !== 'exam' || state.submitted) return;
      state.elapsedSec = Math.floor((Date.now() - state.startedAt) / 1000);
      var el = $('#crTimerVal');
      if (el) el.textContent = formatDuration(state.elapsedSec);
    }, 1000);
  }

  /* ---------- Chuyển đổi giữa 2 tab lớn: Ôn tập Tự chọn & Ôn tập SRS ---------- */
  function setTopMode(mode, skipHash) {
    state.topMode = (mode === 'srs') ? 'srs' : 'custom';
    var btnCustom = $('#modeCustomBtn');
    var btnSrs = $('#modeSrsBtn');
    var viewCustom = $('#customReviewView');
    var viewSrs = $('#srsView');
    var sub = $('#reviewModeSub');

    if (btnCustom && btnSrs && viewCustom && viewSrs) {
      var isCustom = state.topMode === 'custom';
      btnCustom.classList.toggle('active', isCustom);
      btnCustom.setAttribute('aria-selected', isCustom ? 'true' : 'false');
      btnSrs.classList.toggle('active', !isCustom);
      btnSrs.setAttribute('aria-selected', !isCustom ? 'true' : 'false');
      viewCustom.hidden = !isCustom;
      viewSrs.hidden = isCustom;

      if (sub) {
        sub.textContent = isCustom
          ? 'Chọn ôn trọn khóa học (HSK 3, HSK 4 Thượng, HSK 4 Hạ) hoặc tự gom nhóm ít nhất 2 bài bất kỳ — hệ thống sẽ random một đề tổng hợp 20 câu chuẩn theo ngân hàng đề.'
          : 'Ôn lại đúng những từ và kỹ năng bạn còn yếu. Lịch ôn đơn giản: nhớ đúng thì giãn dần 1 → 3 → 7 → 14 → 30 ngày, chưa nhớ thì gặp lại sau khoảng 10 phút.';
      }
      if (!skipHash && window.history && window.history.replaceState) {
        var newHash = isCustom ? '#tu-chon' : '#srs';
        window.history.replaceState(null, '', window.location.pathname + window.location.search + newHash);
      }
    }
  }

  /* ---------- Mô tả phạm vi đề hiện tại ---------- */
  function computeScopeSummary(lessons) {
    if (!lessons.length) return 'Chưa chọn bài';
    var keys = lessons.map(function (l) { return l.key; });
    for (var c = 0; c < COURSE_META.length; c++) {
      var cm = COURSE_META[c];
      var courseLessons = CATALOG.byCourse[cm.id] || [];
      if (courseLessons.length === keys.length && courseLessons.every(function (cl) { return keys.indexOf(cl.key) >= 0; })) {
        return cm.title + ' (' + courseLessons.length + ' bài)';
      }
    }
    // Nhóm theo khóa
    var groups = {};
    lessons.forEach(function (l) {
      if (!groups[l.courseShort]) groups[l.courseShort] = [];
      groups[l.courseShort].push(l.num);
    });
    var parts = Object.keys(groups).map(function (cName) {
      return cName + ' · Bài ' + groups[cName].join(', ');
    });
    return parts.join(' + ') + ' (' + lessons.length + ' bài)';
  }

  /* ---------- Bắt đầu 1 đề mới ---------- */
  function startNewExam(customScopeTitle) {
    var selected = getSelectedLessons();
    if (selected.length < 2) return;
    persistSelected();
    state.activeScopeTitle = customScopeTitle || computeScopeSummary(selected);
    state.questions = generateExam(selected);
    state.currentIndex = 0;
    state.submitted = false;
    state.awardedExam = false;
    state.screen = 'exam';
    startTimer();
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- Chấm 1 câu hỏi ---------- */
  function evaluateQuestion(q) {
    if (!q) return false;
    if (q.kind === 'mcq' || q.kind === 'fill_bank' || q.kind === 'text_quiz') {
      if (q.userChoice == null) return false;
      q.checked = true;
      q.isCorrect = (q.userChoice === q.answer);
    } else if (q.kind === 'fill_grammar') {
      if (q.inputMode === 'type') {
        var check = checkGrammarAnswer(q, q.userText);
        if (!normalizeChinese(q.userText)) return false;
        q.checked = true;
        q.isCorrect = check.ok;
        q.feedbackMsg = check.msg;
      } else {
        if (q.userChoice == null) return false;
        q.checked = true;
        q.isCorrect = (q.userChoice === q.answer);
        q.feedbackMsg = q.isCorrect
          ? 'Chính xác! Bạn đã chọn đúng cấu trúc ngữ pháp chuẩn.'
          : 'Chưa chính xác. Hãy xem đáp án mẫu và điểm ngữ pháp bên dưới nhé.';
      }
    } else if (q.kind === 'dictation') {
      var uClean = normalizeChinese(q.userText);
      if (!uClean) return false;
      var tClean = normalizeChinese(q.targetZh);
      q.checked = true;
      q.isCorrect = (uClean === tClean);
    }

    // Nếu sai và câu có gắn từ vựng, tự động ghi vào SRS để ôn lại
    if (q.checked && !q.isCorrect && q.vocabRef && window.SRS && typeof window.SRS.recordWrong === 'function') {
      var skill = (q.subKind === 'han_to_py') ? 'tone' : (q.subKind === 'vi_to_han' ? 'hanzi' : 'meaning');
      try {
        window.SRS.recordWrong({
          word: q.vocabRef.word,
          pinyin: q.vocabRef.pinyin,
          meaning: q.vocabRef.meaning,
          pos: q.vocabRef.pos || '',
          example: q.vocabRef.example || '',
          examplePinyin: q.vocabRef.examplePinyin || '',
          exampleVi: q.vocabRef.exampleVi || '',
          course: q.courseId,
          lesson: q.lessonNum
        }, skill);
      } catch (e) {}
    }

    return true;
  }

  /* ---------- Nộp bài & Chấm toàn bộ 20 câu ---------- */
  function submitFullExam() {
    stopTimer();
    state.questions.forEach(function (q) {
      if (!q.checked) {
        if (q.kind === 'mcq' || q.kind === 'fill_bank' || q.kind === 'text_quiz') {
          if (q.userChoice != null) {
            evaluateQuestion(q);
          } else {
            q.checked = true;
            q.isCorrect = false;
          }
        } else if (q.kind === 'fill_grammar') {
          if ((q.inputMode === 'type' && normalizeChinese(q.userText)) || (q.inputMode !== 'type' && q.userChoice != null)) {
            evaluateQuestion(q);
          } else {
            q.checked = true;
            q.isCorrect = false;
            q.feedbackMsg = 'Bạn đã bỏ trống câu này.';
          }
        } else if (q.kind === 'dictation') {
          if (normalizeChinese(q.userText)) {
            evaluateQuestion(q);
          } else {
            q.checked = true;
            q.isCorrect = false;
          }
        }
      }
    });

    state.submitted = true;
    state.screen = 'result';

    // Cộng điểm Bảng xếp hạng & Streak nếu có câu đúng
    var correctCount = state.questions.filter(function (q) { return q.isCorrect; }).length;
    if (!state.awardedExam && correctCount > 0) {
      state.awardedExam = true;
      if (window.Streak && typeof window.Streak.qualify === 'function') {
        try { window.Streak.qualify(); } catch (e) {}
      }
      if (window.LB && typeof window.LB.award === 'function') {
        var pts = correctCount * 2 + (correctCount >= 16 ? 10 : 0);
        try { window.LB.award(pts, 'custom-review'); } catch (e) {}
      }
    }

    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ==========================================================================
     RENDER MÀN HÌNH 1: THIẾT LẬP & GOM NHÓM BÀI ÔN TẬP (#crSetup)
     ========================================================================== */
  function renderSetupScreen() {
    var selectedLessons = getSelectedLessons();
    var selectedSet = {};
    state.selectedKeys.forEach(function (k) { selectedSet[k] = true; });

    // Tính tổng kho câu hỏi của các bài đang chọn
    var poolStats = { vocab: 0, fill: 0, quiz: 0, dict: 0 };
    selectedLessons.forEach(function (l) {
      poolStats.vocab += (l.vocab || []).length;
      poolStats.fill += (l.fillItems || []).length;
      poolStats.quiz += (l.textQuiz || []).length;
      poolStats.dict += (l.dictations || []).length;
    });
    var totalPoolItems = poolStats.vocab + poolStats.fill + poolStats.quiz + poolStats.dict;

    // 1. Khối 3 khóa học trọn bộ
    var courseCardsHtml = COURSE_META.map(function (cm) {
      var cLessons = CATALOG.byCourse[cm.id] || [];
      var allInCourseSelected = cLessons.length > 0 && cLessons.every(function (l) { return !!selectedSet[l.key]; });
      var someInCourseSelected = cLessons.some(function (l) { return !!selectedSet[l.key]; });
      var cVocab = 0, cEx = 0;
      cLessons.forEach(function (l) {
        cVocab += (l.vocab || []).length;
        cEx += (l.fillItems || []).length + (l.textQuiz || []).length + (l.dictations || []).length;
      });

      return (
        '<article class="cr-course-card' + (allInCourseSelected ? ' is-selected' : (someInCourseSelected ? ' is-partial' : '')) + '">' +
          '<div class="cr-course-top">' +
            '<span class="cr-course-badge">' + esc(cm.badge) + '</span>' +
            '<span class="cr-course-count">' + cLessons.length + ' bài</span>' +
          '</div>' +
          '<h3 class="cr-course-title">' + esc(cm.title) + '</h3>' +
          '<p class="cr-course-desc">' + esc(cm.desc) + '</p>' +
          '<div class="cr-course-meta">' +
            '<span>📚 ' + cVocab + ' từ vựng</span>' +
            '<span>🎯 ' + cEx + ' câu bài tập</span>' +
          '</div>' +
          '<div class="cr-course-actions">' +
            '<button class="cr-btn-primary" type="button" data-quick-course="' + esc(cm.id) + '">🎲 Làm đề khóa này</button>' +
            '<button class="cr-btn-ghost" type="button" data-select-course="' + esc(cm.id) + '">' +
              (allInCourseSelected ? '✓ Đã chọn cả khóa' : 'Chọn ' + cLessons.length + ' bài này') +
            '</button>' +
          '</div>' +
        '</article>'
      );
    }).join('');

    // 2. Danh sách bài học để tự gom nhóm (ít nhất 2 bài)
    var visibleLessons = state.courseFilter === 'all'
      ? CATALOG.all
      : (CATALOG.byCourse[state.courseFilter] || []);

    var lessonsGridHtml = visibleLessons.map(function (l) {
      var isSel = !!selectedSet[l.key];
      var qCount = (l.vocab || []).length + (l.fillItems || []).length + (l.textQuiz || []).length + (l.dictations || []).length;
      return (
        '<button type="button" class="cr-lesson-card' + (isSel ? ' is-selected' : '') + '" data-toggle-lesson="' + esc(l.key) + '" aria-pressed="' + (isSel ? 'true' : 'false') + '">' +
          '<div class="cr-lesson-card-top">' +
            '<span class="cr-lesson-tag">' + esc(l.label) + '</span>' +
            '<span class="cr-lesson-check" aria-hidden="true">' + (isSel ? '✓' : '+') + '</span>' +
          '</div>' +
          '<div class="cr-lesson-han han">' + esc(l.han) + '</div>' +
          '<div class="cr-lesson-theme">' + esc(l.theme) + '</div>' +
          '<div class="cr-lesson-foot">' +
            '<span>' + (l.vocab || []).length + ' từ</span>' +
            '<span>·</span>' +
            '<span>' + ((l.fillItems || []).length + (l.textQuiz || []).length + (l.dictations || []).length) + ' câu hỏi</span>' +
          '</div>' +
        '</button>'
      );
    }).join('');

    // Các chip bài đang chọn
    var selectedChipsHtml = selectedLessons.length
      ? selectedLessons.map(function (l) {
          return (
            '<span class="cr-sel-chip">' +
              '<strong>' + esc(l.label) + '</strong>' +
              '<button type="button" class="cr-sel-remove" data-remove-lesson="' + esc(l.key) + '" aria-label="Bỏ chọn ' + esc(l.label) + '">×</button>' +
            '</span>'
          );
        }).join('')
      : '<span class="cr-sel-empty">Chưa có bài nào được chọn. Hãy chọn ít nhất 2 bài bên trên!</span>';

    var canStart = selectedLessons.length >= 2;

    return (
      '<div class="cr-setup">' +
        /* Khối 1: Ôn nhanh theo khóa học */
        '<section class="srs-block srs-panel cr-panel">' +
          '<div class="cr-section-head">' +
            '<div>' +
              '<span class="cr-step-pill">Cách 1 · Ôn trọn khóa học</span>' +
              '<h2>Chọn nhanh theo cấp độ</h2>' +
              '<p class="srs-note">Bấm <strong>“Làm đề khóa này”</strong> để hệ thống rút ngẫu nhiên 20 câu trải đều toàn bộ các bài trong khóa.</p>' +
            '</div>' +
          '</div>' +
          '<div class="cr-course-grid">' + courseCardsHtml + '</div>' +
        '</section>' +

        /* Khối 2: Tự gom nhóm bài học (ít nhất 2 bài) */
        '<section class="srs-block srs-panel cr-panel" id="crCustomGroupSection">' +
          '<div class="cr-section-head">' +
            '<div>' +
              '<span class="cr-step-pill">Cách 2 · Tự gom nhóm bài học (Tối thiểu 2 bài)</span>' +
              '<h2>Tự chọn các bài muốn ghép chung thành 1 đề</h2>' +
              '<p class="srs-note">Ví dụ: chọn <strong>Bài 12, 13, 14</strong> của HSK 3 (hoặc gộp bất kỳ các bài bạn vừa học xong). Mỗi lần tạo đề sẽ random một bộ 20 câu mới từ đúng các bài đã chọn.</p>' +
            '</div>' +
          '</div>' +

          '<div class="cr-filter-bar">' +
            '<div class="cr-course-tabs" role="tablist" aria-label="Lọc bài học theo khóa">' +
              '<button type="button" class="cr-filter-tab' + (state.courseFilter === 'all' ? ' active' : '') + '" data-course-filter="all">Tất cả (29 bài)</button>' +
              '<button type="button" class="cr-filter-tab' + (state.courseFilter === 'hsk3' ? ' active' : '') + '" data-course-filter="hsk3">HSK 3 (Bài 10–18)</button>' +
              '<button type="button" class="cr-filter-tab' + (state.courseFilter === 'hsk4-thuong' ? ' active' : '') + '" data-course-filter="hsk4-thuong">HSK 4 Thượng (Bài 1–10)</button>' +
              '<button type="button" class="cr-filter-tab' + (state.courseFilter === 'hsk4-ha' ? ' active' : '') + '" data-course-filter="hsk4-ha">HSK 4 Hạ (Bài 11–20)</button>' +
            '</div>' +
            '<div class="cr-quick-presets">' +
              '<button type="button" class="cr-preset-btn" data-preset="hsk3:12,hsk3:13,hsk3:14">⚡ Mẫu HSK 3: Bài 12, 13, 14</button>' +
              '<button type="button" class="cr-preset-btn" data-preset="hsk4-thuong:1,hsk4-thuong:2,hsk4-thuong:3">⚡ Mẫu HSK 4 Thượng: Bài 1, 2, 3</button>' +
              '<button type="button" class="cr-preset-btn" data-preset="hsk4-ha:11,hsk4-ha:12,hsk4-ha:13">⚡ Mẫu HSK 4 Hạ: Bài 11, 12, 13</button>' +
              '<button type="button" class="cr-preset-btn" data-select-visible="1">Chọn tất cả bài đang hiển thị</button>' +
              '<button type="button" class="cr-preset-btn is-clear" data-clear-all="1">Bỏ chọn hết</button>' +
            '</div>' +
          '</div>' +

          '<div class="cr-lesson-grid">' + lessonsGridHtml + '</div>' +
        '</section>' +

        /* Khối 3: Cấu trúc đề chuẩn & Bảng điều khiển Bắt đầu */
        '<section class="srs-block srs-panel cr-panel cr-blueprint-panel">' +
          '<div class="cr-blueprint-head">' +
            '<div>' +
              '<span class="cr-step-pill">Cấu trúc cố định của 1 Đề Ôn Tập Chuẩn</span>' +
              '<h2>20 câu hỏi tổng hợp · Thang điểm 100</h2>' +
              '<p class="srs-note">Đề thi được thiết kế cân đối cả 4 kỹ năng cốt lõi (Từ vựng, Ngữ pháp, Đọc hiểu Bài khóa, Nghe chép câu), rút ngẫu nhiên có phân tầng đều từ các bài bạn đã chọn:</p>' +
            '</div>' +
          '</div>' +

          '<div class="cr-blueprint-grid">' +
            '<div class="cr-bp-item">' +
              '<span class="cr-bp-part">Phần I · Câu 1–6 (30đ)</span>' +
              '<strong>Từ vựng &amp; Phiên âm</strong>' +
              '<p>2 câu nhận diện nghĩa ngữ cảnh, 2 câu chọn từ chữ Hán, 2 câu chuẩn Pinyin &amp; dấu thanh.</p>' +
            '</div>' +
            '<div class="cr-bp-item">' +
              '<span class="cr-bp-part">Phần II · Câu 7–12 (30đ)</span>' +
              '<strong>Điền từ &amp; Ngữ pháp</strong>' +
              '<p>4 câu chọn từ điền vào chỗ trống (＿＿) và 2 câu hoàn thành cấu trúc ngữ pháp trọng tâm.</p>' +
            '</div>' +
            '<div class="cr-bp-item">' +
              '<span class="cr-bp-part">Phần III · Câu 13–17 (25đ)</span>' +
              '<strong>Đọc hiểu Bài khóa</strong>' +
              '<p>5 câu hỏi trắc nghiệm tình huống hội thoại &amp; đoạn văn trích từ ngân hàng bài khóa.</p>' +
            '</div>' +
            '<div class="cr-bp-item">' +
              '<span class="cr-bp-part">Phần IV · Câu 18–20 (15đ)</span>' +
              '<strong>Nghe chép câu Hán tự</strong>' +
              '<p>3 câu nghe âm thanh chuẩn/chậm rồi gõ lại câu hoặc ghép các cụm từ Hán tự.</p>' +
            '</div>' +
          '</div>' +

          '<div class="cr-launch-box' + (canStart ? ' is-ready' : ' is-warn') + '">' +
            '<div class="cr-launch-info">' +
              '<div class="cr-launch-title">' +
                '<strong>Nhóm bài đã chọn (' + selectedLessons.length + ' bài):</strong> ' +
                (canStart
                  ? '<span class="cr-pool-badge">Kho nguồn: ' + totalPoolItems + ' mục (' + poolStats.vocab + ' từ · ' + poolStats.fill + ' câu điền · ' + poolStats.quiz + ' câu bài khóa · ' + poolStats.dict + ' câu nghe chép)</span>'
                  : '<span class="cr-warn-badge">⚠️ Vui lòng chọn ít nhất 2 bài học để ghép thành đề tổng hợp</span>') +
              '</div>' +
              '<div class="cr-sel-chips">' + selectedChipsHtml + '</div>' +
            '</div>' +
            '<div class="cr-launch-cta">' +
              '<button type="button" class="cr-btn-start" id="crStartExamBtn"' + (canStart ? '' : ' disabled') + '>' +
                '🎲 Tạo đề ngẫu nhiên (' + selectedLessons.length + ' bài)' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</section>' +
      '</div>'
    );
  }

  /* ==========================================================================
     RENDER CÂU HỎI TRONG ĐỀ (DÙNG CHUNG CHO CHẾ ĐỘ TỪNG CÂU & TOÀN BỘ ĐỀ)
     ========================================================================== */
  function renderQuestionCard(q, idx, isSheetMode) {
    var letterLabels = ['A', 'B', 'C', 'D', 'E'];
    var bodyHtml = '';

    /* --- 1. Câu trắc nghiệm Từ vựng / Phiên âm (Phần I) --- */
    if (q.kind === 'mcq') {
      var promptBox = '';
      if (q.subKind === 'han_to_vi') {
        promptBox =
          '<div class="cr-q-focus">' +
            '<div class="cr-q-han-row">' +
              '<span class="cr-q-big-han han">' + esc(q.hanPrompt) + '</span>' +
              (q.posPrompt ? '<span class="cr-q-pos">' + esc(q.posPrompt) + '</span>' : '') +
              '<button type="button" class="cr-audio-btn" data-speak="' + esc(q.audioText) + '" title="Nghe phát âm">🔊 Nghe</button>' +
            '</div>' +
            (q.contextZh
              ? '<div class="cr-q-context"><span>Ngữ cảnh trong bài:</span> <strong class="han">' + esc(q.contextZh) + '</strong></div>'
              : '') +
          '</div>';
      } else if (q.subKind === 'vi_to_han') {
        promptBox =
          '<div class="cr-q-focus">' +
            '<div class="cr-q-vi-main">' +
              '<span class="cr-q-vi-text">“' + esc(q.viPrompt) + '”</span>' +
              (q.posPrompt ? '<span class="cr-q-pos">' + esc(q.posPrompt) + '</span>' : '') +
            '</div>' +
            (q.contextZh
              ? '<div class="cr-q-context"><span>Điền vào câu:</span> <strong class="han">' + esc(q.contextZh) + '</strong>' +
                (q.contextVi ? ' <em>(' + esc(q.contextVi) + ')</em>' : '') + '</div>'
              : '') +
          '</div>';
      } else {
        promptBox =
          '<div class="cr-q-focus">' +
            '<div class="cr-q-han-row">' +
              '<span class="cr-q-big-han han">' + esc(q.hanPrompt) + '</span>' +
              '<span class="cr-q-vi-inline">— ' + esc(q.viPrompt) + '</span>' +
              '<button type="button" class="cr-audio-btn" data-speak="' + esc(q.audioText) + '" title="Nghe phát âm">🔊 Nghe từ</button>' +
            '</div>' +
          '</div>';
      }

      var optsHtml = q.options.map(function (opt, oIdx) {
        var cls = 'cr-opt-btn' + (q.isHanOptions ? ' is-han' : '');
        if (q.userChoice === oIdx) cls += ' is-chosen';
        if (q.checked) {
          if (oIdx === q.answer) cls += ' is-right';
          else if (q.userChoice === oIdx) cls += ' is-wrong';
        }
        return (
          '<button type="button" class="' + cls + '" data-q-idx="' + idx + '" data-opt-idx="' + oIdx + '"' + (q.checked ? ' disabled' : '') + '>' +
            '<span class="cr-opt-letter">' + letterLabels[oIdx] + '</span>' +
            '<span class="cr-opt-text' + (q.isHanOptions ? ' han' : '') + '">' + esc(opt) + '</span>' +
          '</button>'
        );
      }).join('');

      bodyHtml = promptBox + '<div class="cr-opts-grid">' + optsHtml + '</div>';
    }

    /* --- 2. Câu Điền từ vào chỗ trống (Phần II - fill_bank) --- */
    else if (q.kind === 'fill_bank') {
      var filledPreview = esc(q.sentence).replace(
        '＿＿',
        q.checked
          ? '<span class="cr-blank is-filled ' + (q.isCorrect ? 'ok' : 'bad') + ' han">' + esc(q.correctWord) + '</span>'
          : (q.userChoice != null
              ? '<span class="cr-blank is-picked han">' + esc(q.options[q.userChoice]) + '</span>'
              : '<span class="cr-blank">＿＿</span>')
      );

      var bankOptsHtml = q.options.map(function (opt, oIdx) {
        var cls = 'cr-opt-btn is-han';
        if (q.userChoice === oIdx) cls += ' is-chosen';
        if (q.checked) {
          if (oIdx === q.answer) cls += ' is-right';
          else if (q.userChoice === oIdx) cls += ' is-wrong';
        }
        var py = (q.optionPinyins && q.optionPinyins[oIdx]) ? q.optionPinyins[oIdx] : '';
        return (
          '<button type="button" class="' + cls + '" data-q-idx="' + idx + '" data-opt-idx="' + oIdx + '"' + (q.checked ? ' disabled' : '') + '>' +
            '<span class="cr-opt-letter">' + letterLabels[oIdx] + '</span>' +
            '<span class="cr-opt-stack">' +
              '<span class="cr-opt-text han">' + esc(opt) + '</span>' +
              (py ? '<small class="cr-opt-py">' + esc(py) + '</small>' : '') +
            '</span>' +
          '</button>'
        );
      }).join('');

      bodyHtml =
        '<div class="cr-q-focus">' +
          '<div class="cr-q-sentence han">' + filledPreview + '</div>' +
          (q.hintVi ? '<div class="cr-q-hintvi">💡 Nghĩa câu: ' + esc(q.hintVi) + '</div>' : '') +
        '</div>' +
        '<div class="cr-opts-grid">' + bankOptsHtml + '</div>';
    }

    /* --- 3. Câu Hoàn thành Ngữ pháp (Phần II - fill_grammar) --- */
    else if (q.kind === 'fill_grammar') {
      var gPreview = esc(q.sentence).replace(/\n/g, '<br>').replace(
        '＿＿',
        q.checked
          ? '<span class="cr-blank is-filled ' + (q.isCorrect ? 'ok' : 'bad') + ' han">' + esc(q.model) + '</span>'
          : '<span class="cr-blank">＿＿</span>'
      );

      var modeSwitchHtml =
        '<div class="cr-gmode-bar">' +
          '<span class="cr-greq-pill">Trọng tâm: <strong>' + esc(q.grammarPoint) + '</strong>' +
            (q.required && q.required.length ? ' (Bắt buộc có: ' + esc(q.required.join(' … ')) + ')' : '') +
          '</span>' +
          (!q.checked
            ? '<div class="cr-gmode-toggle">' +
                '<button type="button" class="cr-gmode-btn' + (q.inputMode !== 'type' ? ' active' : '') + '" data-gmode="choice" data-q-idx="' + idx + '">Chọn phương án</button>' +
                '<button type="button" class="cr-gmode-btn' + (q.inputMode === 'type' ? ' active' : '') + '" data-gmode="type" data-q-idx="' + idx + '">Tự gõ câu</button>' +
              '</div>'
            : '') +
        '</div>';

      var gInputArea = '';
      if (q.inputMode === 'type') {
        gInputArea =
          '<div class="cr-type-box">' +
            '<input type="text" class="cr-text-input han" data-grammar-input="' + idx + '" value="' + esc(q.userText) + '" placeholder="Gõ phần tiếng Trung điền vào chỗ trống (có chứa ' + esc((q.required || []).join(', ')) + ')..."' + (q.checked ? ' disabled' : '') + '>' +
          '</div>';
      } else {
        var gOptsHtml = q.options.map(function (opt, oIdx) {
          var cls = 'cr-opt-btn is-han is-fullwidth';
          if (q.userChoice === oIdx) cls += ' is-chosen';
          if (q.checked) {
            if (oIdx === q.answer) cls += ' is-right';
            else if (q.userChoice === oIdx) cls += ' is-wrong';
          }
          return (
            '<button type="button" class="' + cls + '" data-q-idx="' + idx + '" data-opt-idx="' + oIdx + '"' + (q.checked ? ' disabled' : '') + '>' +
              '<span class="cr-opt-letter">' + letterLabels[oIdx] + '</span>' +
              '<span class="cr-opt-text han">' + esc(opt) + '</span>' +
            '</button>'
          );
        }).join('');
        gInputArea = '<div class="cr-opts-grid is-single-col">' + gOptsHtml + '</div>';
      }

      bodyHtml =
        '<div class="cr-q-focus">' +
          modeSwitchHtml +
          '<div class="cr-q-sentence han">' + gPreview + '</div>' +
          (q.hintVi ? '<div class="cr-q-hintvi">💡 Gợi ý nghĩa: ' + esc(q.hintVi) + '</div>' : '') +
        '</div>' +
        gInputArea;
    }

    /* --- 4. Câu Đọc hiểu & Tình huống Bài khóa (Phần III - text_quiz) --- */
    else if (q.kind === 'text_quiz') {
      var tOptsHtml = q.options.map(function (opt, oIdx) {
        var cls = 'cr-opt-btn is-han';
        if (q.userChoice === oIdx) cls += ' is-chosen';
        if (q.checked) {
          if (oIdx === q.answer) cls += ' is-right';
          else if (q.userChoice === oIdx) cls += ' is-wrong';
        }
        return (
          '<button type="button" class="' + cls + '" data-q-idx="' + idx + '" data-opt-idx="' + oIdx + '"' + (q.checked ? ' disabled' : '') + '>' +
            '<span class="cr-opt-letter">' + letterLabels[oIdx] + '</span>' +
            '<span class="cr-opt-text han">' + esc(opt) + '</span>' +
          '</button>'
        );
      }).join('');

      bodyHtml =
        '<div class="cr-q-focus">' +
          (q.sceneTitle ? '<div class="cr-scene-tag">📖 Bối cảnh: ' + esc(q.sceneTitle) + '</div>' : '') +
          '<div class="cr-q-han-row">' +
            '<div class="cr-q-sentence han">' + esc(q.hanQuestion) + '</div>' +
            '<button type="button" class="cr-audio-btn" data-speak="' + esc(q.audioText) + '">🔊 Nghe câu hỏi</button>' +
          '</div>' +
          (q.pyQuestion ? '<div class="cr-q-py">' + esc(q.pyQuestion) + '</div>' : '') +
        '</div>' +
        '<div class="cr-opts-grid">' + tOptsHtml + '</div>';
    }

    /* --- 5. Câu Nghe chép câu Hán tự (Phần IV - dictation) --- */
    else if (q.kind === 'dictation') {
      var tilesHtml = (q.tiles || []).map(function (tile) {
        var isUsed = (q.usedTileIds || []).indexOf(tile.id) >= 0;
        return (
          '<button type="button" class="cr-word-tile han' + (isUsed ? ' is-used' : '') + '" data-dict-tile="' + esc(tile.id) + '" data-q-idx="' + idx + '"' + (q.checked ? ' disabled' : '') + '>' +
            esc(tile.text) +
          '</button>'
        );
      }).join('');

      bodyHtml =
        '<div class="cr-q-focus">' +
          '<div class="cr-dict-audio-row">' +
            '<button type="button" class="cr-audio-btn is-primary" data-speak="' + esc(q.audioText) + '">🔊 Nghe câu chuẩn</button>' +
            '<button type="button" class="cr-audio-btn" data-speak="' + esc(q.audioText) + '" data-rate="0.62">🐢 Nghe chậm (0.65×)</button>' +
            '<button type="button" class="cr-hint-toggle" data-toggle-vihint="' + idx + '">' +
              (q.showViHint ? 'Ẩn gợi ý nghĩa' : '💡 Xem gợi ý nghĩa tiếng Việt') +
            '</button>' +
          '</div>' +
          (q.focusPoints ? '<div class="cr-dict-focus">Trọng tâm: <strong class="han">' + esc(q.focusPoints) + '</strong></div>' : '') +
          (q.showViHint ? '<div class="cr-q-hintvi">🇻🇳 Nghĩa câu: “' + esc(q.targetVi) + '”</div>' : '') +
        '</div>' +
        '<div class="cr-dict-input-wrap">' +
          '<div class="cr-dict-input-row">' +
            '<input type="text" class="cr-text-input han" data-dict-input="' + idx + '" value="' + esc(q.userText) + '" placeholder="Gõ câu tiếng Trung nghe được hoặc bấm chọn các từ bên dưới..."' + (q.checked ? ' disabled' : '') + '>' +
            (!q.checked && q.userText
              ? '<button type="button" class="cr-clear-input" data-dict-clear="' + idx + '" title="Xóa nội dung">Xóa</button>'
              : '') +
          '</div>' +
          '<div class="cr-dict-tiles-wrap">' +
            '<span class="cr-tiles-label">Ghép nhanh bằng từ gợi ý:</span>' +
            '<div class="cr-dict-tiles">' + tilesHtml + '</div>' +
          '</div>' +
        '</div>';
    }

    /* --- Khối Giải thích / Đáp án sau khi kiểm tra --- */
    var feedbackHtml = '';
    if (q.checked) {
      var statusBanner = q.isCorrect
        ? '<div class="cr-fb-status ok">✓ Chính xác (+5 điểm)</div>'
        : '<div class="cr-fb-status bad">✗ Chưa chính xác</div>';

      var detailHtml = '';
      if (q.kind === 'dictation') {
        detailHtml =
          '<div class="cr-fb-dict">' +
            '<div class="cr-fb-ruby answer-line han">' + renderRubySentence(q.targetZh, q.pyArr) + '</div>' +
            '<div class="cr-fb-vi"><strong>Nghĩa:</strong> ' + esc(q.targetVi) + '</div>' +
            (!q.isCorrect && q.userText ? '<div class="cr-fb-user">Bạn đã viết: <span class="han">' + esc(q.userText) + '</span></div>' : '') +
          '</div>';
      } else {
        detailHtml =
          (q.feedbackMsg ? '<div class="cr-fb-msg">' + esc(q.feedbackMsg) + '</div>' : '') +
          '<div class="cr-fb-explain">' + esc(q.explain) + '</div>';
      }

      feedbackHtml =
        '<div class="cr-feedback-box ' + (q.isCorrect ? 'is-ok' : 'is-bad') + '">' +
          '<div class="cr-fb-head">' +
            statusBanner +
            '<button type="button" class="cr-audio-btn is-sm" data-speak="' + esc(q.audioText) + '">🔊 Nghe lại</button>' +
          '</div>' +
          detailHtml +
        '</div>';
    }

    /* --- Thanh nút kiểm tra câu (ở chế độ từng câu hoặc chưa chấm) --- */
    var actionRowHtml = '';
    if (!q.checked) {
      var needManualCheckBtn = (q.kind === 'dictation' || (q.kind === 'fill_grammar' && q.inputMode === 'type'));
      if (needManualCheckBtn) {
        actionRowHtml =
          '<div class="cr-q-card-actions">' +
            '<button type="button" class="cr-btn-check" data-check-q="' + idx + '">Kiểm tra câu này</button>' +
          '</div>';
      }
    }

    return (
      '<article class="cr-q-card' + (q.checked ? (q.isCorrect ? ' is-card-ok' : ' is-card-bad') : '') + '" id="crQuestion_' + idx + '">' +
        '<div class="cr-q-card-head">' +
          '<span class="cr-q-num">Câu ' + q.num + '/20</span>' +
          '<span class="cr-q-type">' + esc(q.typeBadge) + '</span>' +
          '<span class="cr-q-source">' + esc(q.lessonLabel) + '</span>' +
        '</div>' +
        '<p class="cr-q-prompt-tag">' + esc(q.promptTag) + '</p>' +
        bodyHtml +
        actionRowHtml +
        feedbackHtml +
      '</article>'
    );
  }

  /* ==========================================================================
     RENDER MÀN HÌNH 2: LÀM ĐỀ ÔN TẬP (#crExam)
     ========================================================================== */
  function renderExamScreen() {
    var qs = state.questions;
    var answeredCount = qs.filter(function (q) { return q.checked; }).length;
    var correctCount = qs.filter(function (q) { return q.checked && q.isCorrect; }).length;

    // Nhóm câu hỏi theo 4 phần trên bản đồ câu hỏi
    var sectionsMeta = [
      { id: 'part1', short: 'Phần I · Từ vựng (1–6)', range: [0, 5] },
      { id: 'part2', short: 'Phần II · Điền từ & Ngữ pháp (7–12)', range: [6, 11] },
      { id: 'part3', short: 'Phần III · Bài khóa (13–17)', range: [12, 16] },
      { id: 'part4', short: 'Phần IV · Nghe chép (18–20)', range: [17, 19] }
    ];

    var qmapHtml = sectionsMeta.map(function (sec) {
      var dots = '';
      for (var i = sec.range[0]; i <= sec.range[1] && i < qs.length; i++) {
        var q = qs[i];
        var cls = 'cr-qdot';
        if (state.examLayout === 'single' && i === state.currentIndex) cls += ' is-current';
        if (q.checked) cls += q.isCorrect ? ' is-ok' : ' is-bad';
        dots += '<button type="button" class="' + cls + '" data-jump-q="' + i + '" title="Câu ' + q.num + ' (' + esc(q.lessonLabel) + ')">' + q.num + '</button>';
      }
      return (
        '<div class="cr-qmap-group">' +
          '<span class="cr-qmap-label">' + esc(sec.short) + '</span>' +
          '<div class="cr-qmap-dots">' + dots + '</div>' +
        '</div>'
      );
    }).join('');

    var mainContentHtml = '';
    if (state.examLayout === 'single') {
      var curQ = qs[state.currentIndex];
      mainContentHtml =
        '<div class="cr-single-stage">' +
          '<div class="cr-section-banner">' +
            '<strong>' + esc(curQ.sectionTitle) + '</strong>' +
            '<span>5 điểm / câu</span>' +
          '</div>' +
          renderQuestionCard(curQ, state.currentIndex, false) +
          '<div class="cr-single-nav">' +
            '<button type="button" class="cr-btn-ghost" id="crPrevQBtn"' + (state.currentIndex === 0 ? ' disabled' : '') + '>← Câu trước</button>' +
            '<span class="cr-single-pos">Câu <strong>' + (state.currentIndex + 1) + '</strong> / ' + qs.length + '</span>' +
            (state.currentIndex < qs.length - 1
              ? '<button type="button" class="cr-btn-primary" id="crNextQBtn">Câu tiếp theo →</button>'
              : '<button type="button" class="cr-btn-submit" id="crFinishBtnBottom">Nộp bài &amp; Xem điểm ✓</button>') +
          '</div>' +
        '</div>';
    } else {
      // Chế độ hiển thị toàn bộ tờ đề 20 câu chia 4 phần
      var lastSec = '';
      var allCardsHtml = qs.map(function (q, idx) {
        var headerBanner = '';
        if (q.sectionId !== lastSec) {
          lastSec = q.sectionId;
          headerBanner =
            '<div class="cr-section-banner is-sheet-banner">' +
              '<strong>' + esc(q.sectionTitle) + '</strong>' +
              '<span>5 điểm / câu</span>' +
            '</div>';
        }
        return headerBanner + renderQuestionCard(q, idx, true);
      }).join('');

      mainContentHtml =
        '<div class="cr-sheet-stage">' +
          allCardsHtml +
          '<div class="cr-sheet-footer">' +
            '<button type="button" class="cr-btn-submit is-lg" id="crFinishBtnSheet">Nộp bài &amp; Xem bảng điểm tổng kết (20 câu)</button>' +
          '</div>' +
        '</div>';
    }

    return (
      '<div class="cr-exam-wrap">' +
        /* Thanh Header Đề Thi */
        '<div class="srs-panel cr-exam-topbar">' +
          '<div class="cr-exam-info">' +
            '<span class="cr-scope-pill">Đề ngẫu nhiên chuẩn · 20 câu</span>' +
            '<h2 class="cr-exam-scope-title">' + esc(state.activeScopeTitle) + '</h2>' +
          '</div>' +
          '<div class="cr-exam-metrics">' +
            '<div class="cr-metric-chip"><span>⏱ Thời gian</span><strong id="crTimerVal">' + formatDuration(state.elapsedSec) + '</strong></div>' +
            '<div class="cr-metric-chip"><span>Đã làm</span><strong>' + answeredCount + '/20</strong></div>' +
            '<div class="cr-metric-chip is-score"><span>Điểm hiện tại</span><strong>' + (correctCount * 5) + '/100</strong></div>' +
          '</div>' +
          '<div class="cr-exam-actions">' +
            '<div class="cr-layout-switch" role="group" aria-label="Chế độ xem đề">' +
              '<button type="button" class="cr-layout-btn' + (state.examLayout === 'single' ? ' active' : '') + '" data-exam-layout="single">Từng câu</button>' +
              '<button type="button" class="cr-layout-btn' + (state.examLayout === 'sheet' ? ' active' : '') + '" data-exam-layout="sheet">Toàn bộ đề</button>' +
            '</div>' +
            '<button type="button" class="cr-btn-ghost" id="crRerollBtn" title="Random một đề 20 câu mới từ cùng các bài đã chọn">🎲 Đổi đề mới</button>' +
            '<button type="button" class="cr-btn-ghost" id="crBackSetupBtn">Đổi bài ôn</button>' +
            '<button type="button" class="cr-btn-submit" id="crSubmitExamBtn">Nộp bài</button>' +
          '</div>' +
        '</div>' +

        /* Bản đồ 20 câu theo 4 phần */
        '<div class="srs-panel cr-qmap-panel">' + qmapHtml + '</div>' +

        /* Nội dung câu hỏi */
        mainContentHtml +
      '</div>'
    );
  }

  /* ==========================================================================
     RENDER MÀN HÌNH 3: KẾT QUẢ & XEM LẠI CHI TIẾT ĐỀ (#crResult)
     ========================================================================== */
  function renderResultScreen() {
    var qs = state.questions;
    var total = qs.length || 20;
    var correct = qs.filter(function (q) { return q.isCorrect; }).length;
    var score100 = correct * 5;

    var rankTitle = 'Cần củng cố thêm';
    var rankComment = 'Bạn hãy xem lại lời giải chi tiết các câu sai bên dưới và bấm “Làm đề ngẫu nhiên mới” để luyện lại nhóm bài này nhé!';
    if (score100 >= 90) {
      rankTitle = 'Xuất sắc · Nắm rất chắc bài!';
      rankComment = 'Tuyệt vời! Bạn đã làm chủ cả từ vựng, ngữ pháp, bài khóa và nghe chép của nhóm bài này.';
    } else if (score100 >= 75) {
      rankTitle = 'Khá giỏi · Nền tảng vững vàng';
      rankComment = 'Kết quả rất khả quan! Chỉ còn một vài chi tiết nhỏ cần lưu ý thêm.';
    } else if (score100 >= 55) {
      rankTitle = 'Đạt yêu cầu · Tiếp tục rèn luyện';
      rankComment = 'Bạn đã nắm được ý chính của các bài, hãy thử random thêm một đề nữa để đạt trên 80 điểm nhé.';
    }

    // Thống kê theo 4 Phần
    var partDefs = [
      { id: 'part1', name: 'Phần I · Từ vựng & Phiên âm' },
      { id: 'part2', name: 'Phần II · Điền từ & Ngữ pháp' },
      { id: 'part3', name: 'Phần III · Đọc hiểu Bài khóa' },
      { id: 'part4', name: 'Phần IV · Nghe chép câu' }
    ];
    var partStatsHtml = partDefs.map(function (pd) {
      var pQs = qs.filter(function (q) { return q.sectionId === pd.id; });
      var pOk = pQs.filter(function (q) { return q.isCorrect; }).length;
      var pct = pQs.length ? Math.round((pOk / pQs.length) * 100) : 0;
      return (
        '<div class="cr-stat-row">' +
          '<div class="cr-stat-row-top">' +
            '<strong>' + esc(pd.name) + '</strong>' +
            '<span>' + pOk + '/' + pQs.length + ' câu (' + pct + '%)</span>' +
          '</div>' +
          '<div class="cr-progress-track"><div class="cr-progress-fill" style="width:' + pct + '%"></div></div>' +
        '</div>'
      );
    }).join('');

    // Thống kê theo từng Bài học đã chọn
    var lessonStatsMap = {};
    qs.forEach(function (q) {
      if (!lessonStatsMap[q.lessonKey]) {
        lessonStatsMap[q.lessonKey] = { label: q.lessonLabel, total: 0, ok: 0 };
      }
      lessonStatsMap[q.lessonKey].total++;
      if (q.isCorrect) lessonStatsMap[q.lessonKey].ok++;
    });

    var lessonBadgesHtml = Object.keys(lessonStatsMap).map(function (k) {
      var st = lessonStatsMap[k];
      var pct = st.total ? Math.round((st.ok / st.total) * 100) : 0;
      return (
        '<div class="cr-lesson-stat-chip' + (pct >= 80 ? ' is-good' : (pct < 50 ? ' is-low' : '')) + '">' +
          '<strong>' + esc(st.label) + '</strong>' +
          '<span>Đúng ' + st.ok + '/' + st.total + ' câu</span>' +
        '</div>'
      );
    }).join('');

    // Toàn bộ 20 câu kèm đáp án & lời giải để đối chiếu
    var reviewCardsHtml = qs.map(function (q, idx) {
      return renderQuestionCard(q, idx, true);
    }).join('');

    return (
      '<div class="cr-result-wrap">' +
        '<section class="srs-block srs-panel cr-summary-card">' +
          '<div class="cr-summary-hero">' +
            '<div class="cr-score-circle">' +
              '<span class="cr-score-num">' + score100 + '</span>' +
              '<span class="cr-score-den">/ 100 điểm</span>' +
            '</div>' +
            '<div class="cr-summary-text">' +
              '<span class="cr-scope-pill">' + esc(state.activeScopeTitle) + '</span>' +
              '<h2>' + esc(rankTitle) + '</h2>' +
              '<p class="srs-note">' + esc(rankComment) + '</p>' +
              '<div class="cr-summary-pills">' +
                '<span>✓ Đúng: <strong>' + correct + '/' + total + ' câu</strong></span>' +
                '<span>⏱ Thời gian: <strong>' + formatDuration(state.elapsedSec) + '</strong></span>' +
                '<span>📌 Các từ làm sai đã được lưu vào Sổ từ SRS</span>' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<div class="cr-summary-breakdown">' +
            '<div class="cr-breakdown-col">' +
              '<h3>Kết quả theo 4 Phần kỹ năng</h3>' +
              partStatsHtml +
            '</div>' +
            '<div class="cr-breakdown-col">' +
              '<h3>Độ vững theo từng Bài học trong đề</h3>' +
              '<div class="cr-lesson-stat-grid">' + lessonBadgesHtml + '</div>' +
            '</div>' +
          '</div>' +

          '<div class="cr-summary-actions">' +
            '<button type="button" class="cr-btn-start" id="crNewRandomExamBtn">🎲 Làm đề ngẫu nhiên mới (Cùng nhóm bài)</button>' +
            '<button type="button" class="cr-btn-ghost" id="crChangeScopeBtn">📚 Chọn lại bài ôn tập</button>' +
          '</div>' +
        '</section>' +

        '<section class="srs-block">' +
          '<h2 class="cr-review-heading">Chi tiết đáp án &amp; lời giải 20 câu</h2>' +
          '<div class="cr-sheet-stage">' + reviewCardsHtml + '</div>' +
        '</section>' +
      '</div>'
    );
  }

  /* ==========================================================================
     HÀM RENDER TỔNG & GẮN SỰ KIỆN
     ========================================================================== */
  function render() {
    var root = $('#customReviewView');
    if (!root) return;

    if (state.screen === 'setup') {
      root.innerHTML = renderSetupScreen();
    } else if (state.screen === 'exam') {
      root.innerHTML = renderExamScreen();
    } else {
      root.innerHTML = renderResultScreen();
    }
  }

  function bindEvents() {
    // 1. Chuyển tab trên cùng: Ôn tập Tự chọn vs Ôn tập SRS
    var btnCustom = $('#modeCustomBtn');
    var btnSrs = $('#modeSrsBtn');
    if (btnCustom) {
      btnCustom.addEventListener('click', function () { setTopMode('custom'); });
    }
    if (btnSrs) {
      btnSrs.addEventListener('click', function () { setTopMode('srs'); });
    }

    // 2. Event delegation trong #customReviewView
    var view = $('#customReviewView');
    if (!view) return;

    view.addEventListener('click', function (e) {
      var target = e.target;

      // Phát âm thanh tiếng Trung
      var spkBtn = target.closest('[data-speak]');
      if (spkBtn) {
        var txt = spkBtn.getAttribute('data-speak');
        var rate = parseFloat(spkBtn.getAttribute('data-rate') || '0.82');
        speakZh(txt, rate);
        return;
      }

      // [SETUP] Bấm "Làm đề khóa này" (1 chạm tạo đề ngay cho cả khóa)
      var quickCourseBtn = target.closest('[data-quick-course]');
      if (quickCourseBtn) {
        var cId = quickCourseBtn.getAttribute('data-quick-course');
        var cLessons = CATALOG.byCourse[cId] || [];
        if (cLessons.length >= 2) {
          state.selectedKeys = cLessons.map(function (l) { return l.key; });
          var cm = COURSE_META.find(function (m) { return m.id === cId; });
          startNewExam(cm ? cm.title + ' (' + cLessons.length + ' bài)' : '');
        }
        return;
      }

      // [SETUP] Bấm "Chọn X bài này" trên thẻ khóa học
      var selCourseBtn = target.closest('[data-select-course]');
      if (selCourseBtn) {
        var scId = selCourseBtn.getAttribute('data-select-course');
        var scLessons = CATALOG.byCourse[scId] || [];
        state.selectedKeys = scLessons.map(function (l) { return l.key; });
        state.courseFilter = scId;
        persistSelected();
        render();
        var groupSec = $('#crCustomGroupSection');
        if (groupSec) groupSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      // [SETUP] Lọc hiển thị bài học theo khóa
      var filterBtn = target.closest('[data-course-filter]');
      if (filterBtn) {
        state.courseFilter = filterBtn.getAttribute('data-course-filter') || 'all';
        render();
        return;
      }

      // [SETUP] Chọn mẫu preset nhanh (VD: Bài 12, 13, 14)
      var presetBtn = target.closest('[data-preset]');
      if (presetBtn) {
        var keys = (presetBtn.getAttribute('data-preset') || '').split(',').filter(function (k) { return !!CATALOG.byKey[k]; });
        if (keys.length >= 2) {
          state.selectedKeys = keys;
          persistSelected();
          render();
        }
        return;
      }

      // [SETUP] Chọn tất cả bài đang hiển thị
      if (target.closest('[data-select-visible]')) {
        var vis = state.courseFilter === 'all' ? CATALOG.all : (CATALOG.byCourse[state.courseFilter] || []);
        var setMap = {};
        state.selectedKeys.forEach(function (k) { setMap[k] = true; });
        vis.forEach(function (l) { setMap[l.key] = true; });
        state.selectedKeys = CATALOG.all.map(function (l) { return l.key; }).filter(function (k) { return !!setMap[k]; });
        persistSelected();
        render();
        return;
      }

      // [SETUP] Bỏ chọn tất cả
      if (target.closest('[data-clear-all]')) {
        state.selectedKeys = [];
        persistSelected();
        render();
        return;
      }

      // [SETUP] Bật/tắt chọn 1 bài học
      var lessonCard = target.closest('[data-toggle-lesson]');
      if (lessonCard) {
        var lKey = lessonCard.getAttribute('data-toggle-lesson');
        var idxInSel = state.selectedKeys.indexOf(lKey);
        if (idxInSel >= 0) {
          state.selectedKeys.splice(idxInSel, 1);
        } else {
          state.selectedKeys.push(lKey);
          // Giữ thứ tự chuẩn theo danh mục
          var orderMap = {};
          state.selectedKeys.forEach(function (k) { orderMap[k] = true; });
          state.selectedKeys = CATALOG.all.map(function (l) { return l.key; }).filter(function (k) { return !!orderMap[k]; });
        }
        persistSelected();
        render();
        return;
      }

      // [SETUP] Gỡ 1 bài khỏi thanh chip
      var removeChipBtn = target.closest('[data-remove-lesson]');
      if (removeChipBtn) {
        var rKey = removeChipBtn.getAttribute('data-remove-lesson');
        state.selectedKeys = state.selectedKeys.filter(function (k) { return k !== rKey; });
        persistSelected();
        render();
        return;
      }

      // [SETUP] Bấm nút chính "Tạo đề ngẫu nhiên"
      if (target.closest('#crStartExamBtn')) {
        startNewExam();
        return;
      }

      // [EXAM] Đổi chế độ hiển thị Từng câu / Toàn bộ đề
      var layoutBtn = target.closest('[data-exam-layout]');
      if (layoutBtn) {
        state.examLayout = layoutBtn.getAttribute('data-exam-layout') || 'single';
        render();
        return;
      }

      // [EXAM] Nhảy tới câu bất kỳ trên thanh bản đồ 20 câu
      var jumpBtn = target.closest('[data-jump-q]');
      if (jumpBtn) {
        var qIdx = parseInt(jumpBtn.getAttribute('data-jump-q'), 10);
        if (!isNaN(qIdx) && qIdx >= 0 && qIdx < state.questions.length) {
          state.currentIndex = qIdx;
          if (state.examLayout === 'single') {
            render();
          } else {
            var cardEl = $('#crQuestion_' + qIdx);
            if (cardEl) cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
        return;
      }

      // [EXAM] Chọn đáp án trắc nghiệm (Phần I, II, III)
      var optBtn = target.closest('[data-opt-idx]');
      if (optBtn) {
        var qi = parseInt(optBtn.getAttribute('data-q-idx'), 10);
        var oi = parseInt(optBtn.getAttribute('data-opt-idx'), 10);
        var qObj = state.questions[qi];
        if (qObj && !qObj.checked) {
          qObj.userChoice = oi;
          evaluateQuestion(qObj);
          render();
        }
        return;
      }

      // [EXAM] Đổi phương thức trả lời câu Ngữ pháp (Chọn phương án vs Tự gõ)
      var gModeBtn = target.closest('[data-gmode]');
      if (gModeBtn) {
        var gQi = parseInt(gModeBtn.getAttribute('data-q-idx'), 10);
        var gMode = gModeBtn.getAttribute('data-gmode');
        if (state.questions[gQi] && !state.questions[gQi].checked) {
          state.questions[gQi].inputMode = gMode;
          render();
        }
        return;
      }

      // [EXAM] Bật/tắt gợi ý nghĩa tiếng Việt ở câu Nghe chép
      var viHintBtn = target.closest('[data-toggle-vihint]');
      if (viHintBtn) {
        var hQi = parseInt(viHintBtn.getAttribute('data-toggle-vihint'), 10);
        if (state.questions[hQi]) {
          state.questions[hQi].showViHint = !state.questions[hQi].showViHint;
          render();
        }
        return;
      }

      // [EXAM] Bấm vào mảnh ghép từ (Word Bank) ở Phần IV Nghe chép
      var tileBtn = target.closest('[data-dict-tile]');
      if (tileBtn) {
        var tQi = parseInt(tileBtn.getAttribute('data-q-idx'), 10);
        var tileId = tileBtn.getAttribute('data-dict-tile');
        var dQ = state.questions[tQi];
        if (dQ && !dQ.checked) {
          var tileObj = (dQ.tiles || []).find(function (t) { return t.id === tileId; });
          if (tileObj) {
            var usedPos = dQ.usedTileIds.indexOf(tileId);
            if (usedPos >= 0) {
              dQ.usedTileIds.splice(usedPos, 1);
              dQ.userText = dQ.userText.replace(tileObj.text, '');
            } else {
              dQ.usedTileIds.push(tileId);
              dQ.userText = (dQ.userText || '') + tileObj.text;
            }
            render();
          }
        }
        return;
      }

      // [EXAM] Xóa nhanh ô nhập Nghe chép
      var clearDictBtn = target.closest('[data-dict-clear]');
      if (clearDictBtn) {
        var cQi = parseInt(clearDictBtn.getAttribute('data-dict-clear'), 10);
        if (state.questions[cQi] && !state.questions[cQi].checked) {
          state.questions[cQi].userText = '';
          state.questions[cQi].usedTileIds = [];
          render();
        }
        return;
      }

      // [EXAM] Bấm nút "Kiểm tra câu này" (cho câu tự gõ ngữ pháp & nghe chép)
      var checkQBtn = target.closest('[data-check-q]');
      if (checkQBtn) {
        var ckIdx = parseInt(checkQBtn.getAttribute('data-check-q'), 10);
        var ckQ = state.questions[ckIdx];
        if (ckQ && !ckQ.checked) {
          evaluateQuestion(ckQ);
          render();
        }
        return;
      }

      // [EXAM] Điều hướng Câu trước / Câu tiếp theo
      if (target.closest('#crPrevQBtn')) {
        if (state.currentIndex > 0) {
          state.currentIndex--;
          render();
        }
        return;
      }
      if (target.closest('#crNextQBtn')) {
        if (state.currentIndex < state.questions.length - 1) {
          state.currentIndex++;
          render();
        }
        return;
      }

      // [EXAM] Đổi đề ngẫu nhiên mới (cùng phạm vi bài)
      if (target.closest('#crRerollBtn') || target.closest('#crNewRandomExamBtn')) {
        startNewExam(state.activeScopeTitle);
        return;
      }

      // [EXAM / RESULT] Quay về màn hình chọn bài
      if (target.closest('#crBackSetupBtn') || target.closest('#crChangeScopeBtn')) {
        stopTimer();
        state.screen = 'setup';
        render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // [EXAM] Nộp bài & Xem bảng điểm
      if (target.closest('#crSubmitExamBtn') || target.closest('#crFinishBtnBottom') || target.closest('#crFinishBtnSheet')) {
        submitFullExam();
        return;
      }
    });

    // Cập nhật nội dung khi người dùng gõ vào ô input Ngữ pháp / Nghe chép
    view.addEventListener('input', function (e) {
      var t = e.target;
      if (t.matches('[data-grammar-input]')) {
        var gi = parseInt(t.getAttribute('data-grammar-input'), 10);
        if (state.questions[gi]) state.questions[gi].userText = t.value;
      } else if (t.matches('[data-dict-input]')) {
        var di = parseInt(t.getAttribute('data-dict-input'), 10);
        if (state.questions[di]) state.questions[di].userText = t.value;
      }
    });

    // Nhấn Enter trong ô input để kiểm tra ngay câu đó
    view.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var t = e.target;
      if (t.matches('[data-grammar-input]')) {
        e.preventDefault();
        var gi = parseInt(t.getAttribute('data-grammar-input'), 10);
        if (state.questions[gi] && !state.questions[gi].checked) {
          evaluateQuestion(state.questions[gi]);
          render();
        }
      } else if (t.matches('[data-dict-input]')) {
        e.preventDefault();
        var di = parseInt(t.getAttribute('data-dict-input'), 10);
        if (state.questions[di] && !state.questions[di].checked) {
          evaluateQuestion(state.questions[di]);
          render();
        }
      }
    });
  }

  /* ---------- Khởi tạo ---------- */
  function init() {
    bindEvents();
    var hash = (window.location.hash || '').toLowerCase();
    var search = (window.location.search || '').toLowerCase();
    if (hash === '#srs' || search.indexOf('mode=srs') >= 0) {
      setTopMode('srs', true);
    } else {
      setTopMode('custom', true);
    }
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
