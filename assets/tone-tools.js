/* ===== Pinyin tone tools: single source of truth for tone maps (FIX 1 dedup) =====
   Replaces 9 duplicated tone literals in 5 files (engine.js, srs.js, srs-page.js,
   custom-review.js, pinyin-course.js), which disagreed on direction, numbering and
   ü handling. Every consumer below loads this file first; see the notes on the
   deliberate divergences, all proven by tests/fix1-test.js before the old maps
   were deleted.

   - TONES: base vowel -> [toneless, tone 1, tone 2, tone 3, tone 4].
   - stripMarks(p): ü-PRESERVING normalizer (marked -> base, ǖ->ü, ê stays ê).
     Same bytes as the old engine.js stripTones. Used by the karaoke matcher
     (kkBasePy) and the tone-game display; KK_SYLS holds ü finals, so ü must
     survive. NOTE: like the old stripTones it has NO uppercase map entries,
     so 'Ā' stays 'Ā'; callers that need case-insensitivity lowercase after
     (kkBasePy does). This is deliberate: keep the old behavior exactly.
   - stripMarksLoose(p): loose normalizer (marked -> base with ü->u, ê->e,
     plus lowercase, strip of spaces/apostrophes/·, v->u). Same bytes as the
     old engine.js normPinyin. Used for SRS/cannon identity keys.
     Deliberate divergences from the old srs.js normLoose, none of which
     affects any real vocab pinyin (verified: 1024/1024 identical):
       (1) ê/Ê -> 'e' here, kept as 'ê' by srs.js (no live pinyin has ê);
       (2) '.', ',', '!', '?' are KEPT here, stripped by srs.js (they only
           occur in sentence-level pinyin, never in vocab pinyin);
       (3) null/undefined -> 'undefined' here (String(p)), '' in srs.js.
   - toneNumber(markedChar): 1-BASED tone number 1-4, 0 for toneless/unknown.
     Matches the old WB_TONE_MAP and MARKED (both 1-based), NOT the old
     TONE_OF (0-based).
   - applyTone(syllable, tone): tone 1-4 (0 or other falsy = strip marks and
     return the toneless base). Placement follows the old setSylTone rule
     (a > e > ou > LAST of iouü), applied AFTER stripping any existing marks
     (also the setSylTone behaviour). The two old placement rules agree on
     all 401 single syllables, so the mixer (whose inputs are always single
     toneless syllables) is unaffected either way; they differ only on
     no-space multi-syllable tokens, which only setSylTone's callers ever
     produce (SRS and custom-review tone-option generation). Using the
     setSylTone rule keeps all 1024 vocab option sets byte-identical:
     zero live change. Proven: identical to old setSylTone on every input
     (all 401 syllables x tones 0-5, all 3247 distinct live-data tokens),
     and identical to the old pinyin-course applyTone on every toneless
     single syllable.
     Deliberate divergence from the old pinyin-course.js applyTone, which
     never stripped: on an already-marked input it either returned the input
     unchanged (864 of 1604 marked forms) or added a SECOND tone mark
     (740 of 1604, e.g. 'bāi' -> 'bāī', 'bāo' -> 'bāō'). The old course
     never passed marked input (its mixer inputs are always toneless bases),
     so no live behaviour changes; the new form re-tones correctly.
     Out-of-range tones (e.g. 5) index the table exactly like the old
     functions did, so even that input produces identical output. */
(function () {
  'use strict';
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
  /* ü-preserving strip map: exact copy of the old engine.js stripTones map. */
  var STRIP_MAP = {
    'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a',
    'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
    'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
    'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
    'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
    'ǖ': 'ü', 'ǘ': 'ü', 'ǚ': 'ü', 'ǜ': 'ü',
    'ê': 'ê'
  };
  /* Loose strip map: exact copy of the old engine.js normPinyin map. */
  var LOOSE_MAP = {
    'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a',
    'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
    'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
    'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
    'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
    'ǖ': 'u', 'ǘ': 'u', 'ǚ': 'u', 'ǜ': 'u',
    'ü': 'u', 'ê': 'e',
    'Ā': 'a', 'Á': 'a', 'Ǎ': 'a', 'À': 'a',
    'Ē': 'e', 'É': 'e', 'Ě': 'e', 'È': 'e',
    'Ī': 'i', 'Í': 'i', 'Ǐ': 'i', 'Ì': 'i',
    'Ō': 'o', 'Ó': 'o', 'Ǒ': 'o', 'Ò': 'o',
    'Ū': 'u', 'Ú': 'u', 'Ǔ': 'u', 'Ù': 'u',
    'Ǖ': 'u', 'Ǘ': 'u', 'Ǚ': 'u', 'Ǜ': 'u',
    'Ü': 'u', 'Ê': 'e'
  };
  function stripMarks(p) {
    return String(p).split('').map(function (c) { return STRIP_MAP[c] || c; }).join('');
  }
  function stripMarksLoose(p) {
    return String(p).split('').map(function (c) { return LOOSE_MAP[c] || c; }).join('')
      .toLowerCase().replace(/[\s'’·]/g, '').replace(/v/g, 'u');
  }
  function toneNumber(ch) {
    var m = MARKED[ch];
    return m ? m.tone : 0;
  }
  function applyTone(syllable, tone) {
    var base = stripMarks(syllable);
    if (!tone) return base;
    var pos = -1;
    var i, ch;
    /* Placement follows the old setSylTone rule (a > e > ou > LAST of iouü),
       NOT the old pinyin-course rule (a/o/e first, then iu->u, ui->i, then
       first of i/u/ü). The two rules agree on all 401 single syllables, so
       the mixer (whose inputs are always single toneless syllables) is
       unaffected either way; they differ only on no-space multi-syllable
       tokens, which only setSylTone's callers ever produce (SRS and
       custom-review tone-option generation). Using the setSylTone rule keeps
       all 1024 vocab option sets byte-identical: zero live change. */
    if (base.indexOf('a') >= 0) pos = base.indexOf('a');
    else if (base.indexOf('e') >= 0) pos = base.indexOf('e');
    else if (base.indexOf('ou') >= 0) pos = base.indexOf('ou');
    else {
      for (i = base.length - 1; i >= 0; i--) {
        if ('iouü'.indexOf(base[i]) >= 0) { pos = i; break; }
      }
    }
    if (pos < 0) return base;
    ch = base[pos];
    if (!TONES[ch]) return base;
    return base.slice(0, pos) + TONES[ch][tone] + base.slice(pos + 1);
  }
  window.ToneTools = {
    TONES: TONES,
    stripMarks: stripMarks,
    stripMarksLoose: stripMarksLoose,
    toneNumber: toneNumber,
    applyTone: applyTone
  };
})();
