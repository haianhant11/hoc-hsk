/* Khóa học Phát âm chuẩn Pinyin: Bảng chuẩn HSK, Sơ đồ vị trí lưỡi & Ghép âm nghe audio chữ Hán */
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const esc = s => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* Khoa tam khoa Phat am de sua loi: chi mo bang mat ma (chi luu ban bam SHA-256, khong luu mat ma goc) */
  const PY_LOCK_HASH = '71be8726ee2e5dc940f26b2566dfbc0b434f7ef7a9eb81dad088b52cb3183525';
  const PY_UNLOCK_KEY = 'pyUnlock';
  const PY_UNLOCKED = (() => { try { return sessionStorage.getItem(PY_UNLOCK_KEY) === '1'; } catch (e) { return false; } })();
  function pySha256Hex(str) {
    if (!window.crypto || !crypto.subtle) return Promise.resolve('');
    const data = new TextEncoder().encode(str);
    return crypto.subtle.digest('SHA-256', data).then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''));
  }
  function pyRenderLock(msg) {
    const panel = document.querySelector('#pyPanel');
    if (!panel) return;
    panel.innerHTML = '<article class="info-card" style="text-align:center;padding:28px 18px"><h3>Khoa Phat am dang duoc sua</h3><p>Phan Thanh mau, Van mau va Thanh dieu dang duoc chinh sua lai, tam khoa de hoan thien. Nhap mat ma de mo ban thu nghiem.</p><form id="pyLockForm" style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:12px"><input id="pyLockPass" type="password" placeholder="Nhap mat ma" autocomplete="off" style="padding:10px 12px;border:1px solid var(--line);border-radius:10px;min-width:200px"><button class="action" type="submit">Mo khoa</button></form>' + (msg ? '<p style="color:var(--verm);margin-top:10px">' + esc(msg) + '</p>' : '') + '</article>';
    const form = document.querySelector('#pyLockForm');
    const input = document.querySelector('#pyLockPass');
    if (form && input) {
      input.focus();
      form.addEventListener('submit', e => {
        e.preventDefault();
        pySha256Hex(input.value || '').then(hex => {
          if (hex && hex === PY_LOCK_HASH) {
            try { sessionStorage.setItem(PY_UNLOCK_KEY, '1'); } catch (err) {}
            location.reload();
          } else {
            pyRenderLock('Mat ma chua dung, thu lai nhe.');
          }
        });
      });
    }
  }

  let activeTab = 'initials'; // 'initials' | 'finals' | 'tones' | 'mixer'
  let activeInit = 'b';
  let activeFinal = 'a';
  let selInit = 'b';
  let selFinal = 'a';
  let selTone = 1;

  /* Chỉ truyền CHỮ HÁN (汉字) vào speechSynthesis zh-CN để trình duyệt phát âm chuẩn, không đọc theo chữ Latin */
  function speakZh(hanText, rate) {
    if (!hanText || !('speechSynthesis' in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(hanText);
      u.lang = 'zh-CN';
      u.rate = rate || 0.72;
      const vs = speechSynthesis.getVoices();
      u.voice = vs.find(v => /^zh(-|_)?CN/i.test(v.lang)) || vs.find(v => /^zh/i.test(v.lang)) || null;
      speechSynthesis.speak(u);
      if (typeof Streak !== 'undefined' && typeof Streak.qualify === 'function') Streak.qualify();
    } catch (e) {}
  }

  /* Audio that chuan HSK1 (phat theo moc thoi gian trong file 语音.mp3 goc).
     Nguon: audio-timestamps.json — tach bang silence detection + mapping theo thu tu sach.
     Neu khong co clip (mixer/tone) thi dung giong trinh duyet nhu cu. */
  const PY_AUDIO = {
    init: {
      'b': ['h1-phon-1.mp3', 98.62, 98.99],
      'c': ['h1-phon-3.mp3', 74.43, 75.12],
      'ch': ['h1-phon-3.mp3', 65.49, 66.27],
      'd': ['h1-phon-1.mp3', 105.51, 105.95],
      'f': ['h1-phon-1.mp3', 103.68, 104.34],
      'g': ['h1-phon-1.mp3', 112.33, 112.82],
      'h': ['h1-phon-1.mp3', 115.65, 116.33],
      'j': ['h1-phon-2.mp3', 62.51, 63.1],
      'k': ['h1-phon-1.mp3', 113.97, 114.52],
      'l': ['h1-phon-1.mp3', 110.6, 111.18],
      'm': ['h1-phon-1.mp3', 101.95, 102.56],
      'n': ['h1-phon-1.mp3', 108.93, 109.52],
      'p': ['h1-phon-1.mp3', 100.21, 100.85],
      'q': ['h1-phon-2.mp3', 64.7, 65.41],
      'r': ['h1-phon-3.mp3', 70.07, 70.7],
      's': ['h1-phon-3.mp3', 76.69, 77.43],
      'sh': ['h1-phon-3.mp3', 67.84, 68.49],
      't': ['h1-phon-1.mp3', 107.14, 107.7],
      'x': ['h1-phon-2.mp3', 67.05, 67.74],
      'z': ['h1-phon-3.mp3', 72.22, 72.81],
      'zh': ['h1-phon-3.mp3', 63.14, 63.94],
    },
    final: {
      'a': ['h1-phon-1.mp3', 119.53, 120.11],
      'ai': ['h1-phon-1.mp3', 130.44, 131.08],
      'an': ['h1-phon-1.mp3', 137.51, 138.16],
      'ang': ['h1-phon-1.mp3', 141.02, 141.8],
      'ao': ['h1-phon-1.mp3', 133.98, 134.58],
      'e': ['h1-phon-1.mp3', 123.05, 123.68],
      'ei': ['h1-phon-1.mp3', 132.21, 132.9],
      'en': ['h1-phon-1.mp3', 139.2, 139.93],
      'eng': ['h1-phon-1.mp3', 142.89, 143.74],
      'er': ['h1-phon-1.mp3', 128.54, 129.32],
      'i': ['h1-phon-1.mp3', 124.86, 125.7],
      'ia': ['h1-phon-2.mp3', 76.52, 77.43],
      'ian': ['h1-phon-2.mp3', 86.33, 87.06],
      'iang': ['h1-phon-2.mp3', 91.17, 92.05],
      'iao': ['h1-phon-2.mp3', 81.42, 82.26],
      'ie': ['h1-phon-2.mp3', 79.11, 79.75],
      'in': ['h1-phon-2.mp3', 88.76, 89.61],
      'ing': ['h1-phon-2.mp3', 93.73, 94.58],
      'iong': ['h1-phon-2.mp3', 96.13, 97.12],
      'iu': ['h1-phon-2.mp3', 83.82, 84.64],
      'o': ['h1-phon-1.mp3', 121.26, 121.93],
      'ong': ['h1-phon-1.mp3', 144.91, 145.74],
      'ou': ['h1-phon-1.mp3', 135.78, 136.49],
      'u': ['h1-phon-1.mp3', 126.85, 127.54],
      'ua': ['h1-phon-3.mp3', 109.49, 110.26],
      'uai': ['h1-phon-3.mp3', 114.11, 114.81],
      'uan': ['h1-phon-3.mp3', 118.89, 119.73],
      'uang': ['h1-phon-3.mp3', 123.66, 124.45],
      'ueng': ['h1-phon-3.mp3', 126.04, 126.9],
      'ui': ['h1-phon-3.mp3', 116.48, 117.32],
      'un': ['h1-phon-3.mp3', 121.33, 122.04],
      'uo': ['h1-phon-3.mp3', 111.74, 112.33],
      'ü': ['h1-phon-2.mp3', 74.21, 74.87],
      'üan': ['h1-phon-2.mp3', 100.9, 101.75],
      'üe': ['h1-phon-2.mp3', 98.61, 99.3],
      'ün': ['h1-phon-2.mp3', 103.44, 104.32],
    }
  };
  let pyAudioEl = null;
  function playRealAudio(sym, kind, fallbackHan) {
    const m = (PY_AUDIO[kind] || {})[sym];
    if (!m) return false;
    try {
      if (!pyAudioEl) { pyAudioEl = new Audio(); pyAudioEl.preload = 'auto'; }
      const file = m[0], start = m[1], end = m[2];
      const src = 'assets/audio/h1/' + file;
      const stopAt = end + 0.50;
      if (pyAudioEl._pyStop) pyAudioEl.removeEventListener('timeupdate', pyAudioEl._pyStop);
      pyAudioEl._pyStop = function () {
        if (pyAudioEl.currentTime >= stopAt) { pyAudioEl.pause(); pyAudioEl.removeEventListener('timeupdate', pyAudioEl._pyStop); }
      };
      pyAudioEl.addEventListener('timeupdate', pyAudioEl._pyStop);
      pyAudioEl.onerror = function () { if (fallbackHan) speakZh(fallbackHan, 0.72); };
      const playFrom = function () {
        try { pyAudioEl.currentTime = Math.max(0, start - 0.40); } catch (e) {}
        pyAudioEl.play().catch(function () { if (fallbackHan) speakZh(fallbackHan, 0.72); });
      };
      if (pyAudioEl.getAttribute('src') !== src) {
        pyAudioEl.src = src;
        pyAudioEl.addEventListener('loadedmetadata', playFrom, { once: true });
        pyAudioEl.load();
      } else {
        playFrom();
      }
      if (typeof Streak !== 'undefined' && typeof Streak.qualify === 'function') Streak.qualify();
      return true;
    } catch (e) { return false; }
  }

  function findInitial(sym) {
    for (const g of (window.PINYIN_INITIALS || [])) {
      const it = g.items.find(x => x.sym === sym);
      if (it) return { group: g, item: it };
    }
    return null;
  }

  function findFinal(sym) {
    for (const g of (window.PINYIN_FINALS || [])) {
      const it = g.items.find(x => x.sym === sym);
      if (it) return { group: g, item: it };
    }
    return null;
  }

  /* Bảng ma trận Thanh mẫu chuẩn giáo trình HSK */
  const INIT_MATRIX = [
    { pos: 'Hai môi', diagram: 'bilabial', cols: { unasp: 'b', asp: 'p', nasal: 'm', fric: '', voiced: '' } },
    { pos: 'Môi răng', diagram: 'labiodental', cols: { unasp: '', asp: '', nasal: '', fric: 'f', voiced: '' } },
    { pos: 'Đầu lưỡi giữa', diagram: 'alveolar', cols: { unasp: 'd', asp: 't', nasal: 'n', fric: '', voiced: 'l' } },
    { pos: 'Cuống lưỡi', diagram: 'velar', cols: { unasp: 'g', asp: 'k', nasal: '', fric: 'h', voiced: '' } },
    { pos: 'Mặt lưỡi', diagram: 'palatal', cols: { unasp: 'j', asp: 'q', nasal: '', fric: 'x', voiced: '' } },
    { pos: 'Uốn lưỡi (đầu lưỡi sau)', diagram: 'retroflex', cols: { unasp: 'zh', asp: 'ch', nasal: '', fric: 'sh', voiced: 'r' } },
    { pos: 'Thẳng lưỡi (đầu lưỡi trước)', diagram: 'dental', cols: { unasp: 'z', asp: 'c', nasal: '', fric: 's', voiced: '' } }
  ];

  /* Sơ đồ mặt cắt rõ hơn (AccentHero, tô đỏ bộ phận phát âm chính).
     Link chết thì onerror tự quay về ảnh PNG hiện tại trong repo. */
  const PY_EXT_DIAGRAM = {
    bilabial: 'https://accenthero.com/app/assets/phonemes/B.svg',
    labiodental: 'https://accenthero.com/app/assets/phonemes/F.svg',
    alveolar: 'https://accenthero.com/app/assets/phonemes/D.svg',
    velar: 'https://accenthero.com/app/assets/phonemes/G.svg',
    palatal: 'https://accenthero.com/app/assets/phonemes/Y.svg',
    retroflex: 'https://accenthero.com/app/assets/phonemes/ZH.svg',
    dental: 'https://accenthero.com/app/assets/phonemes/Z.svg'
  };

  function renderInitCell(sym) {
    if (!sym) return '<td class="py-td-empty">—</td>';
    const found = findInitial(sym);
    const han = found ? found.item.han : '';
    const isAct = activeInit === sym;
    return `<td><button type="button" class="py-matrix-btn${isAct ? ' active' : ''}" data-pick-guide-init="${esc(sym)}" data-py-han="${esc(han)}"><strong>${esc(sym)}</strong><span class="han">${esc(han)}</span></button></td>`;
  }

  function renderInitials() {
    const cur = findInitial(activeInit) || findInitial('b');
    const g = cur.group;
    const it = cur.item;

    return `<div class="section-intro"><h3>Bảng Thanh mẫu chuẩn HSK (21 âm)</h3><span class="count">Bấm vào ô để nghe</span></div>
      <div class="orig-audio-box"><div class="orig-audio-label">Nghe cả bảng thanh mẫu (21 âm, giọng gốc nhà xuất bản)</div><audio class="orig-audio" controls preload="metadata" src="assets/audio/h1/h1-phon-initials-all.mp3"></audio></div>
      <div class="py-matrix-wrap">
        <table class="py-matrix" aria-label="Bảng phân loại thanh mẫu tiếng Trung">
          <thead>
            <tr>
              <th>Vị trí phát âm</th>
              <th>Không bật hơi</th>
              <th>Bật hơi mạnh</th>
              <th>Âm mũi</th>
              <th>Âm xát</th>
              <th>Âm bên / hữu thanh</th>
            </tr>
          </thead>
          <tbody>
            ${INIT_MATRIX.map(r => `
              <tr>
                <th>${esc(r.pos)}</th>
                ${renderInitCell(r.cols.unasp)}
                ${renderInitCell(r.cols.asp)}
                ${renderInitCell(r.cols.nasal)}
                ${renderInitCell(r.cols.fric)}
                ${renderInitCell(r.cols.voiced)}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <article class="info-card py-detail-card">
        <div class="py-detail-left">
          <div class="py-detail-head">
            <span class="py-sym">${esc(it.sym)}</span>
            <span class="py-air-tag">${esc(it.air)}</span>
            <button type="button" class="action py-listen-btn" data-py-han="${esc(it.han)}" data-py-sym="${esc(it.sym)}" data-py-kind="init">🔊 Nghe (${esc(it.han)} · ${esc(it.read)})</button>
          </div>
          <p class="py-detail-line"><strong>Nhóm:</strong> ${esc(g.name)} — <em>${esc(g.tip)}</em></p>
          <p class="py-detail-line"><strong>Cách phát âm:</strong> ${esc(it.mouth)}</p>
          <p class="py-detail-line"><strong>Âm gần giống tiếng Việt:</strong> ${esc(it.vi)}</p>
          <p class="py-sound-warn"><strong>Lỗi hay gặp:</strong> ${esc(it.mistake)}</p>
        </div>
        <div class="py-detail-img-box">
          <img src="${PY_EXT_DIAGRAM[g.diagram] || ('assets/pinyin-diagrams/' + g.diagram + '.png')}" alt="Sơ đồ mặt cắt vị trí lưỡi cho ${esc(g.name)}" loading="lazy" onerror="this.onerror=null;this.src='assets/pinyin-diagrams/${esc(g.diagram)}.png';">
          <span class="py-img-cap">Phần tô đỏ là bộ phận phát âm chính · Sơ đồ: AccentHero</span>
        </div>
      </article>`;
  }

  function renderFinals() {
    const groups = window.PINYIN_FINALS || [];
    const cur = findFinal(activeFinal) || findFinal('a');
    const it = cur.item;

    return `<div class="section-intro"><h3>Bảng Vận mẫu chuẩn HSK (35 âm)</h3><span class="count">Bấm vào ô để nghe</span></div>
      <div class="stack">
        ${groups.map(g => `
          <article class="info-card py-final-group">
            <h3>${esc(g.name)}</h3>
            <p class="py-group-tip" style="margin-bottom:10px">${esc(g.desc)}</p>
            <div class="py-chip-grid">
              ${g.items.map(x => `<button type="button" class="py-final-btn${activeFinal === x.sym ? ' active' : ''}" data-pick-guide-final="${esc(x.sym)}" data-py-han="${esc(x.han)}"><strong>${esc(x.sym)}</strong> <span class="han">${esc(x.han)}</span></button>`).join('')}
            </div>
          </article>
        `).join('')}

        <article class="info-card py-detail-card">
          <div class="py-detail-left">
            <div class="py-detail-head">
              <span class="py-sym">${esc(it.sym)}</span>
              <span class="py-ex-han han">${esc(it.han)}</span>
              <button type="button" class="action py-listen-btn" data-py-han="${esc(it.han)}" data-py-sym="${esc(it.sym)}" data-py-kind="final">🔊 Nghe (${esc(it.han)} · ${esc(it.read)})</button>
            </div>
            <p class="py-detail-line"><strong>Khẩu hình:</strong> ${esc(it.mouth)}</p>
            <p class="py-detail-line"><strong>Mẹo nhớ:</strong> ${esc(it.tip)}</p>
          </div>
        </article>
      </div>`;
  }

  function toneChartSVG() {
    return `<svg class="py-tone-svg" viewBox="0 0 360 140" role="img" aria-label="Biểu đồ cao độ 4 thanh điệu tiếng Trung">
      <rect width="360" height="140" rx="12" fill="#F7F5EE"/>
      ${[1, 2, 3, 4, 5].map(lv => {
        const y = 122 - (lv - 1) * 24;
        return `<line x1="36" y1="${y}" x2="342" y2="${y}" stroke="#D8DDD4" stroke-width="1" stroke-dasharray="3 3"/><text x="22" y="${y + 4}" text-anchor="middle" font-size="10" fill="#69766C">${lv}</text>`;
      }).join('')}
      <path d="M48 26 L104 26" stroke="#2E7D6B" stroke-width="4" stroke-linecap="round"/>
      <text x="76" y="17" text-anchor="middle" font-size="10.5" font-weight="800" fill="#2E7D6B">1 (55)</text>
      <path d="M126 74 L182 26" stroke="#2C4A6B" stroke-width="4" stroke-linecap="round"/>
      <text x="154" y="17" text-anchor="middle" font-size="10.5" font-weight="800" fill="#2C4A6B">2 (35)</text>
      <path d="M202 98 Q226 125 258 50" stroke="#B98A2F" stroke-width="4" stroke-linecap="round" fill="none"/>
      <text x="230" y="17" text-anchor="middle" font-size="10.5" font-weight="800" fill="#B98A2F">3 (214)</text>
      <path d="M280 26 L334 122" stroke="#A54432" stroke-width="4" stroke-linecap="round"/>
      <text x="307" y="17" text-anchor="middle" font-size="10.5" font-weight="800" fill="#A54432">4 (51)</text>
    </svg>`;
  }

  function renderTones() {
    const tones = window.PINYIN_TONES || [];
    return `<div class="section-intro"><h3>4 Thanh điệu &amp; Thanh nhẹ (声调)</h3><span class="count">Cao độ 1 → 5</span></div>
      <article class="info-card py-tone-hero">
        <div class="py-tone-chart">${toneChartSVG()}</div>
        <div class="py-tone-guide">
          <h3>Bấm vào từng thanh để nghe mẫu (ma)</h3>
          <p>Tiếng Trung chia cao độ giọng nói thành <strong>5 bậc</strong>. Đổi thanh điệu sẽ đổi hoàn toàn nghĩa của từ.</p>
          <div class="py-tone-demo-row">
            ${tones.map(t => `<button type="button" class="py-tone-pill" data-py-han="${esc(t.han)}"><strong>${esc(t.ex)}</strong> <span>${esc(t.han)} (${esc(t.vi)})</span> 🔊</button>`).join('')}
          </div>
        </div>
      </article>
      <div class="grammar-grid" style="margin-top:14px">${tones.map(t => `
        <article class="grammar-card">
          <div class="grammar-title"><span class="g-num">${esc(t.mark)}</span> ${esc(t.name)} · Bậc ${esc(t.pitch)}</div>
          <div class="grammar-body">
            <div class="py-tone-card-ex">
              <span>Ví dụ: <strong class="py-sym-sm">${esc(t.ex)}</strong> (${esc(t.han)} - ${esc(t.vi)})</span>
              <button type="button" class="speak" data-py-han="${esc(t.han)}" aria-label="Nghe ${esc(t.ex)}">▶</button>
            </div>
            <p>${esc(t.desc)}</p>
            <p class="hy-tip-inline"><span class="label">💡 Mẹo tập:</span> ${esc(t.tip)}</p>
          </div>
        </article>
      `).join('')}</div>
      <article class="info-card" style="margin-top:14px">
        <h3>3 Quy tắc biến điệu hay gặp nhất</h3>
        <ul class="natural-list">
          <li><strong>Hai thanh 3 đi liền nhau (3 + 3 → 2 + 3):</strong> Chữ đầu đọc thành thanh 2. Ví dụ: 你好 (nǐ hǎo → đọc thành <em>ní hǎo</em>).</li>
          <li><strong>Biến điệu của 不 (bù):</strong> Bình thường đọc thanh 4 (bù), nhưng trước thanh 4 khác đổi thành thanh 2 (bú). Ví dụ: 不是 (bú shì).</li>
          <li><strong>Biến điệu của 一 (yī):</strong> Đứng một mình đọc thanh 1 (yī); trước thanh 4 đọc thanh 2 (yí, vd: 一定 yídìng); trước thanh 1, 2, 3 đọc thanh 4 (yì, vd: 一起 yìqǐ).</li>
        </ul>
      </article>`;
  }

  function combinePinyin(init, fin) {
    const i = init === '∅' ? '' : init;
    let f = fin;
    if (!i) {
      const stand = {
        i: 'yi', in: 'yin', ing: 'ying', ia: 'ya', ie: 'ye', iao: 'yao', iu: 'you', ian: 'yan', iang: 'yang', iong: 'yong',
        u: 'wu', ua: 'wa', uo: 'wo', uai: 'wai', ui: 'wei', uan: 'wan', un: 'wen', uang: 'wang',
        ü: 'yu', üe: 'yue', üan: 'yuan', ün: 'yun'
      };
      const base = stand[f] || f;
      return { base, valid: !!window.PINYIN_SYLLABLES[base], ex: window.PINYIN_SYLLABLES[base] || '' };
    }
    if ((i === 'j' || i === 'q' || i === 'x') && f.startsWith('ü')) {
      f = 'u' + f.slice(1);
    }
    const base = i + f;
    const ex = window.PINYIN_SYLLABLES[base];
    return { base, valid: !!ex, ex: ex || '' };
  }

  function applyTone(syllable, tone) {
    if (!tone || tone === 0) return syllable;
    const T = {
      a: ['ā', 'á', 'ǎ', 'à'], o: ['ō', 'ó', 'ǒ', 'ò'], e: ['ē', 'é', 'ě', 'è'],
      i: ['ī', 'í', 'ǐ', 'ì'], u: ['ū', 'ú', 'ǔ', 'ù'], ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ']
    };
    const tIdx = tone - 1;
    let pos = -1;
    for (const ch of ['a', 'o', 'e']) { pos = syllable.indexOf(ch); if (pos >= 0) break; }
    if (pos < 0) {
      if (syllable.includes('iu')) pos = syllable.indexOf('u');
      else if (syllable.includes('ui')) pos = syllable.indexOf('i');
      else { for (const ch of ['i', 'u', 'ü']) { pos = syllable.indexOf(ch); if (pos >= 0) break; } }
    }
    if (pos < 0) return syllable;
    const ch = syllable[pos];
    return syllable.slice(0, pos) + (T[ch] ? T[ch][tIdx] : ch) + syllable.slice(pos + 1);
  }

  /* Lấy chữ Hán chuẩn để speechSynthesis zh-CN đọc đúng âm tiết + thanh điệu */
  function hanForSyllableTone(base, tone) {
    const map = (window.PINYIN_TONE_HAN && window.PINYIN_TONE_HAN[base]) || {};
    if (map[tone]) return { han: map[tone], exact: true };
    const anyKey = Object.keys(map)[0];
    if (anyKey !== undefined) return { han: map[anyKey], exact: false, fallbackTone: Number(anyKey) };
    return { han: '', exact: false };
  }

  function renderMixer() {
    const allInits = ['∅'];
    (window.PINYIN_INITIALS || []).forEach(g => g.items.forEach(it => allInits.push(it.sym)));
    const allFinals = [];
    (window.PINYIN_FINALS || []).forEach(g => g.items.forEach(it => allFinals.push(it.sym)));

    const res = combinePinyin(selInit, selFinal);
    const toned = applyTone(res.base, selTone);
    const ttsInfo = res.valid ? hanForSyllableTone(res.base, selTone) : { han: '', exact: false };

    const quickRow = allFinals.map(f => {
      const c = combinePinyin(selInit, f);
      if (!c.valid) return null;
      const th = hanForSyllableTone(c.base, selTone);
      return { f, syl: applyTone(c.base, selTone), ex: c.ex, han: th.han };
    }).filter(Boolean);

    return `<div class="section-intro"><h3>Ghép Thanh mẫu + Vận mẫu &amp; Nghe Audio</h3><span class="count">Đọc theo chữ Hán chuẩn zh-CN</span></div>
      <article class="info-card py-mixer-stage">
        <div class="py-mixer-result ${res.valid ? 'is-ok' : 'is-bad'}">
          <div class="py-res-main">
            <div class="py-res-formula">${esc(selInit === '∅' ? '(không thanh mẫu)' : selInit)} + ${esc(selFinal)} + ${selTone === 0 ? 'Thanh nhẹ' : 'Thanh ' + selTone}</div>
            <div class="py-res-syl">${esc(toned)} ${ttsInfo.han ? `<span class="han py-res-han">${esc(ttsInfo.han)}</span>` : ''}</div>
            <div class="py-res-meta">${res.valid
              ? (ttsInfo.exact
                  ? `Ví dụ từ HSK: <strong class="han">${esc(res.ex)}</strong>`
                  : `Âm ghép hợp lệ (<strong class="han">${esc(res.ex)}</strong>). Loa đọc theo chữ đại diện <strong class="han">${esc(ttsInfo.han)}</strong>.`)
              : 'Tổ hợp này không tồn tại trong tiếng Trung phổ thông — chọn ô sáng bên dưới.'}</div>
          </div>
          <div class="py-res-actions">
            <button type="button" class="action" id="pyPlayBtn" ${ttsInfo.han ? '' : 'disabled'}>🔊 Nghe phát âm</button>
            <button type="button" class="game-other" id="pyPlaySlowBtn" ${ttsInfo.han ? '' : 'disabled'}>🐢 Nghe chậm</button>
          </div>
        </div>

        <div class="py-picker-block">
          <h4>1. Chọn Thanh mẫu</h4>
          <div class="py-chip-grid">
            ${allInits.map(sym => `<button type="button" class="py-chip${selInit === sym ? ' active' : ''}" data-pick-init="${esc(sym)}">${sym === '∅' ? 'Không (∅)' : esc(sym)}</button>`).join('')}
          </div>
        </div>

        <div class="py-picker-block">
          <h4>2. Chọn Vận mẫu <small>(ô mờ là không ghép được với "${esc(selInit)}")</small></h4>
          <div class="py-chip-grid">
            ${allFinals.map(sym => {
              const ok = combinePinyin(selInit, sym).valid;
              return `<button type="button" class="py-chip${selFinal === sym ? ' active' : ''}${ok ? '' : ' is-invalid'}" data-pick-final="${esc(sym)}">${esc(sym)}</button>`;
            }).join('')}
          </div>
        </div>

        <div class="py-picker-block">
          <h4>3. Chọn Thanh điệu</h4>
          <div class="py-chip-grid">
            ${[1, 2, 3, 4, 0].map(t => `<button type="button" class="py-chip${selTone === t ? ' active' : ''}" data-pick-tone="${t}">${t === 0 ? 'Thanh nhẹ' : 'Thanh ' + t}</button>`).join('')}
          </div>
        </div>

        <div class="py-picker-block">
          <h4>Bảng âm ghép nhanh của "${esc(selInit === '∅' ? 'Không thanh mẫu' : selInit)}" (${quickRow.length} âm — bấm để nghe)</h4>
          <div class="py-quick-syl-grid">
            ${quickRow.map(q => `<button type="button" class="py-qsyl-btn" data-py-han="${esc(q.han)}"><strong>${esc(q.syl)}</strong><span>${esc(q.han)} · ${esc(q.ex)}</span></button>`).join('')}
          </div>
        </div>
      </article>`;
  }

  function render() {
    document.querySelectorAll('[data-py-tab]').forEach(b => b.classList.toggle('active', b.dataset.pyTab === activeTab));
    const panel = $('#pyPanel');
    if (!panel) return;
    if (activeTab === 'initials') panel.innerHTML = renderInitials();
    else if (activeTab === 'finals') panel.innerHTML = renderFinals();
    else if (activeTab === 'tones') panel.innerHTML = renderTones();
    else panel.innerHTML = renderMixer();

    if (window.HaiYing3D && typeof window.HaiYing3D.say === 'function') {
      const msgs = {
        initials: ['Bảng Thanh mẫu', 'Bấm vào từng ô trong bảng chuẩn HSK để nghe âm chuẩn và xem sơ đồ đặt lưỡi nhé!', 'teach'],
        finals: ['Bảng Vận mẫu', 'Chạm vào từng vận mẫu để nghe phát âm chuẩn và xem khẩu hình miệng nhé!', 'wave'],
        tones: ['Thanh điệu', 'Chú ý cao độ 5 bậc: Thanh 1 ngang cao, Thanh 2 vút lên, Thanh 3 trầm xuống, Thanh 4 dứt khoát!', 'teach'],
        mixer: ['Ghép âm Pinyin', 'Chọn thanh mẫu + vận mẫu + thanh điệu để nghe phát âm chuẩn zh-CN!', 'cheer']
      };
      const m = msgs[activeTab];
      if (m) window.HaiYing3D.say(m[0], m[1], m[2]);
    }
  }

  if (PY_UNLOCKED) document.addEventListener('click', e => {
    const tabBtn = e.target.closest('[data-py-tab]');
    if (tabBtn) { activeTab = tabBtn.dataset.pyTab; render(); return; }

    const gi = e.target.closest('[data-pick-guide-init]');
    if (gi) {
      activeInit = gi.dataset.pickGuideInit;
      const han = gi.dataset.pyHan;
      render();
      if (!playRealAudio(activeInit, 'init', han) && han) speakZh(han, 0.72);
      return;
    }

    const gf = e.target.closest('[data-pick-guide-final]');
    if (gf) {
      activeFinal = gf.dataset.pickGuideFinal;
      const han = gf.dataset.pyHan;
      render();
      if (!playRealAudio(activeFinal, 'final', han) && han) speakZh(han, 0.72);
      return;
    }

    const spk = e.target.closest('[data-py-han]');
    if (spk) {
      const sym = spk.dataset.pySym, kind = spk.dataset.pyKind;
      if (sym && kind && playRealAudio(sym, kind, spk.dataset.pyHan)) return;
      speakZh(spk.dataset.pyHan, 0.72); return;
    }

    const pi = e.target.closest('[data-pick-init]');
    if (pi) {
      selInit = pi.dataset.pickInit;
      if (!combinePinyin(selInit, selFinal).valid) {
        const allF = [];
        (window.PINYIN_FINALS || []).forEach(g => g.items.forEach(it => allF.push(it.sym)));
        const firstOk = allF.find(f => combinePinyin(selInit, f).valid);
        if (firstOk) selFinal = firstOk;
      }
      render();
      const r = combinePinyin(selInit, selFinal);
      const t = r.valid ? hanForSyllableTone(r.base, selTone) : null;
      if (t && t.han) speakZh(t.han, 0.72);
      return;
    }

    const pf = e.target.closest('[data-pick-final]');
    if (pf) {
      selFinal = pf.dataset.pickFinal;
      render();
      const r = combinePinyin(selInit, selFinal);
      const t = r.valid ? hanForSyllableTone(r.base, selTone) : null;
      if (t && t.han) speakZh(t.han, 0.72);
      return;
    }

    const pt = e.target.closest('[data-pick-tone]');
    if (pt) {
      selTone = parseInt(pt.dataset.pickTone, 10);
      render();
      const r = combinePinyin(selInit, selFinal);
      const t = r.valid ? hanForSyllableTone(r.base, selTone) : null;
      if (t && t.han) speakZh(t.han, 0.72);
      return;
    }

    if (e.target.id === 'pyPlayBtn' || e.target.id === 'pyPlaySlowBtn') {
      const r = combinePinyin(selInit, selFinal);
      const t = r.valid ? hanForSyllableTone(r.base, selTone) : null;
      if (t && t.han) speakZh(t.han, e.target.id === 'pyPlaySlowBtn' ? 0.45 : 0.72);
    }
  });

  document.addEventListener('DOMContentLoaded', () => { if (PY_UNLOCKED) render(); else pyRenderLock(''); });
})();
