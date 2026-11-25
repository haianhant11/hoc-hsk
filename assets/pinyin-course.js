/* Khóa học Phát âm chuẩn Pinyin: Thanh mẫu, Vận mẫu, Thanh điệu & Bộ ghép âm */
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const esc = s => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let activeTab = 'initials'; // 'initials' | 'finals' | 'tones' | 'mixer'
  let selInit = 'b';
  let selFinal = 'a';
  let selTone = 1;

  function speakZh(text, rate) {
    if (!('speechSynthesis' in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN';
      u.rate = rate || 0.72;
      const vs = speechSynthesis.getVoices();
      u.voice = vs.find(v => /^zh(-|_)?CN/i.test(v.lang)) || vs.find(v => /^zh/i.test(v.lang)) || null;
      speechSynthesis.speak(u);
      if (typeof Streak !== 'undefined' && typeof Streak.qualify === 'function') Streak.qualify();
    } catch (e) {}
  }

  /* Sơ đồ mặt cắt khoang miệng chuẩn ngữ âm học cho 7 nhóm thanh mẫu */
  function mouthDiagramSVG(type) {
    const labels = {
      bilabial: ['Hai môi khép', 'Hơi bật / lên mũi'],
      labiodental: ['Răng trên chạm môi dưới', 'Luồng hơi xát nhẹ'],
      alveolar: ['Đầu lưỡi chạm lợi trên', 'Lợi (nướu) trên'],
      velar: ['Cuống lưỡi chạm ngạc mềm', 'Ngạc mềm (sau)'],
      palatal: ['Mặt lưỡi sát ngạc cứng', 'Đầu lưỡi sau răng dưới'],
      retroflex: ['Đầu lưỡi uốn cong', 'Trước ngạc cứng'],
      dental: ['Đầu lưỡi duỗi thẳng', 'Mặt sau răng trên']
    };
    const lbl = labels[type] || ['', ''];

    // Khung khoang miệng chuẩn (viewBox 0 0 260 175)
    let tongue = '';
    let airflow = '';
    let contact = '';

    if (type === 'bilabial') {
      tongue = '<path d="M58 145 Q115 112 175 116 Q210 120 225 148 L225 162 L58 162 Z" fill="#E89A8C" stroke="#A54432" stroke-width="2"/>';
      contact = '<circle cx="48" cy="100" r="7" fill="#A54432" opacity=".3"/><circle cx="48" cy="100" r="3" fill="#A54432"/>';
      airflow = '<path d="M180 100 Q110 95 52 100" stroke="#2E7D6B" stroke-width="2.2" stroke-dasharray="4 3" fill="none"/><path d="M35 100 L16 100 M22 95 L15 100 L22 105" stroke="#2E7D6B" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
    } else if (type === 'labiodental') {
      tongue = '<path d="M62 145 Q115 116 175 118 Q210 122 225 148 L225 162 L62 162 Z" fill="#E89A8C" stroke="#A54432" stroke-width="2"/>';
      contact = '<circle cx="52" cy="104" r="6" fill="#A54432" opacity=".32"/><circle cx="52" cy="104" r="2.8" fill="#A54432"/>';
      airflow = '<path d="M175 95 Q100 94 56 102 L18 106 M25 101 L17 106 L25 110" stroke="#2E7D6B" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
    } else if (type === 'alveolar') {
      tongue = '<path d="M74 90 Q95 96 140 106 Q190 115 225 148 L225 162 L66 162 L66 125 Q68 95 74 90 Z" fill="#E89A8C" stroke="#A54432" stroke-width="2"/>';
      contact = '<circle cx="76" cy="87" r="6.5" fill="#A54432" opacity=".32"/><circle cx="76" cy="87" r="3" fill="#A54432"/>';
      airflow = '<path d="M175 88 Q125 84 85 95 L22 102 M29 97 L21 102 L29 107" stroke="#2E7D6B" stroke-width="2.2" stroke-dasharray="4 3" fill="none" stroke-linecap="round"/>';
    } else if (type === 'velar') {
      tongue = '<path d="M68 136 Q105 130 148 90 Q176 72 205 112 L225 148 L225 162 L68 162 Z" fill="#E89A8C" stroke="#A54432" stroke-width="2"/>';
      contact = '<circle cx="164" cy="76" r="7" fill="#A54432" opacity=".32"/><circle cx="164" cy="76" r="3" fill="#A54432"/>';
      airflow = '<path d="M200 120 Q180 86 155 82 L22 102 M29 97 L21 102 L29 107" stroke="#2E7D6B" stroke-width="2.2" stroke-dasharray="4 3" fill="none" stroke-linecap="round"/>';
    } else if (type === 'palatal') {
      tongue = '<path d="M64 114 Q86 80 126 76 Q175 82 225 148 L225 162 L64 162 Z" fill="#E89A8C" stroke="#A54432" stroke-width="2"/>';
      contact = '<circle cx="118" cy="74" r="7" fill="#A54432" opacity=".32"/><circle cx="118" cy="74" r="3" fill="#A54432"/>';
      airflow = '<path d="M175 86 Q140 68 100 78 L22 101 M29 96 L21 101 L29 106" stroke="#2E7D6B" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
    } else if (type === 'retroflex') {
      tongue = '<path d="M96 76 Q82 95 115 106 Q175 115 225 148 L225 162 L70 162 L70 132 Q85 116 96 76 Z" fill="#E89A8C" stroke="#A54432" stroke-width="2"/>';
      contact = '<circle cx="98" cy="74" r="6.5" fill="#A54432" opacity=".32"/><circle cx="98" cy="74" r="3" fill="#A54432"/>';
      airflow = '<path d="M175 85 Q130 78 100 84 L22 102 M29 97 L21 102 L29 107" stroke="#2E7D6B" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
    } else {
      tongue = '<path d="M60 98 Q115 102 175 114 Q210 122 225 148 L225 162 L60 162 Z" fill="#E89A8C" stroke="#A54432" stroke-width="2"/>';
      contact = '<circle cx="62" cy="96" r="6" fill="#A54432" opacity=".32"/><circle cx="62" cy="96" r="2.8" fill="#A54432"/>';
      airflow = '<path d="M175 90 Q115 88 64 95 L20 101 M27 96 L19 101 L27 106" stroke="#2E7D6B" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
    }

    const lipClose = type === 'bilabial'
      ? '<path d="M44 76 Q54 88 48 100 Q54 110 44 124" stroke="#193B39" stroke-width="2.2" fill="none"/>'
      : '<path d="M44 74 Q52 84 48 92" stroke="#193B39" stroke-width="2.2" fill="none"/><path d="M46 110 Q52 118 44 126" stroke="#193B39" stroke-width="2.2" fill="none"/>';

    return `<svg class="py-diagram-svg" viewBox="0 0 260 175" role="img" aria-label="Sơ đồ vị trí đặt lưỡi: ${esc(lbl[0])}">
      <rect width="260" height="175" rx="12" fill="#F7F5EE"/>
      <!-- Vòm miệng trên: mũi, lợi, ngạc cứng, ngạc mềm -->
      <path d="M44 74 L56 64 Q72 28 135 28 Q195 28 220 75 L220 42 L44 42 Z" fill="#E2E8E3" opacity=".45"/>
      <path d="M50 88 Q68 82 82 76 Q118 60 160 66 Q186 70 194 94" fill="none" stroke="#193B39" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Răng trên và răng dưới -->
      <rect x="52" y="88" width="8" height="13" rx="2" fill="#FFFFFF" stroke="#193B39" stroke-width="1.5"/>
      <rect x="52" y="108" width="8" height="12" rx="2" fill="#FFFFFF" stroke="#193B39" stroke-width="1.5"/>
      <!-- Môi -->
      ${lipClose}
      <!-- Lưỡi -->
      ${tongue}
      <!-- Điểm tiếp xúc & luồng hơi -->
      ${airflow}
      ${contact}
      <!-- Chú thích ngắn -->
      <text x="148" y="20" text-anchor="middle" font-size="10.5" font-weight="700" fill="#193B39">${esc(lbl[0])}</text>
      <text x="148" y="34" text-anchor="middle" font-size="9.5" fill="#2E7D6B">${esc(lbl[1])}</text>
    </svg>`;
  }

  /* Biểu đồ đường nét cao độ 5 bậc cho thanh điệu */
  function toneChartSVG() {
    return `<svg class="py-tone-svg" viewBox="0 0 360 140" role="img" aria-label="Biểu đồ cao độ 4 thanh điệu tiếng Trung">
      <rect width="360" height="140" rx="12" fill="#F7F5EE"/>
      ${[1, 2, 3, 4, 5].map(lv => {
        const y = 122 - (lv - 1) * 24;
        return `<line x1="36" y1="${y}" x2="342" y2="${y}" stroke="#D8DDD4" stroke-width="1" stroke-dasharray="3 3"/><text x="22" y="${y + 4}" text-anchor="middle" font-size="10" fill="#69766C">${lv}</text>`;
      }).join('')}
      <!-- Thanh 1: 55 -->
      <path d="M48 26 L104 26" stroke="#2E7D6B" stroke-width="4" stroke-linecap="round"/>
      <text x="76" y="17" text-anchor="middle" font-size="10.5" font-weight="800" fill="#2E7D6B">1 (55)</text>
      <!-- Thanh 2: 35 -->
      <path d="M126 74 L182 26" stroke="#2C4A6B" stroke-width="4" stroke-linecap="round"/>
      <text x="154" y="17" text-anchor="middle" font-size="10.5" font-weight="800" fill="#2C4A6B">2 (35)</text>
      <!-- Thanh 3: 214 -->
      <path d="M202 98 Q226 125 258 50" stroke="#B98A2F" stroke-width="4" stroke-linecap="round" fill="none"/>
      <text x="230" y="17" text-anchor="middle" font-size="10.5" font-weight="800" fill="#B98A2F">3 (214)</text>
      <!-- Thanh 4: 51 -->
      <path d="M280 26 L334 122" stroke="#A54432" stroke-width="4" stroke-linecap="round"/>
      <text x="307" y="17" text-anchor="middle" font-size="10.5" font-weight="800" fill="#A54432">4 (51)</text>
    </svg>`;
  }

  /* Quy tắc ghép âm Pinyin chuẩn */
  function combinePinyin(init, fin) {
    let i = init === '∅' ? '' : init;
    let f = fin;
    // Tự ghép thành âm tiết đứng độc lập
    if (!i) {
      const stand = {
        i: 'yi', in: 'yin', ing: 'ying', ia: 'ya', ie: 'ye', iao: 'yao', iu: 'you', ian: 'yan', iang: 'yang', iong: 'yong',
        u: 'wu', ua: 'wa', uo: 'wo', uai: 'wai', ui: 'wei', uan: 'wan', un: 'wen', uang: 'wang',
        ü: 'yu', üe: 'yue', üan: 'yuan', ün: 'yun'
      };
      const base = stand[f] || f;
      return { base, valid: !!window.PINYIN_SYLLABLES[base], ex: window.PINYIN_SYLLABLES[base] || '' };
    }
    // j, q, x đi với nhóm ü thì bỏ dấu 2 chấm
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
      a: ['ā', 'á', 'ǎ', 'à'],
      o: ['ō', 'ó', 'ǒ', 'ò'],
      e: ['ē', 'é', 'ě', 'è'],
      i: ['ī', 'í', 'ǐ', 'ì'],
      u: ['ū', 'ú', 'ǔ', 'ù'],
      ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ']
    };
    const tIdx = tone - 1;
    // Quy tắc a > o > e > i/u/ü (iu -> u, ui -> i)
    let pos = -1;
    for (const ch of ['a', 'o', 'e']) {
      pos = syllable.indexOf(ch);
      if (pos >= 0) break;
    }
    if (pos < 0) {
      if (syllable.includes('iu')) pos = syllable.indexOf('u');
      else if (syllable.includes('ui')) pos = syllable.indexOf('i');
      else {
        for (const ch of ['i', 'u', 'ü']) {
          pos = syllable.indexOf(ch);
          if (pos >= 0) break;
        }
      }
    }
    if (pos < 0) return syllable;
    const ch = syllable[pos];
    return syllable.slice(0, pos) + (T[ch] ? T[ch][tIdx] : ch) + syllable.slice(pos + 1);
  }

  function renderInitials() {
    const groups = window.PINYIN_INITIALS || [];
    return `<div class="section-intro"><h3>21 Thanh mẫu tiếng Trung (声母)</h3><span class="count">7 nhóm vị trí phát âm</span></div>
      <p class="py-lead">Chạm vào từng thanh mẫu để nghe phát âm mẫu. Quan sát kỹ sơ đồ vị trí đặt lưỡi, môi và cách đẩy luồng hơi (bật hơi hay không bật hơi).</p>
      <div class="stack">${groups.map(g => `
        <article class="info-card py-group-card">
          <div class="py-group-top">
            <div class="py-group-info">
              <h3>${esc(g.name)}</h3>
              <p class="py-group-tip"><strong>Cách đặt lưỡi/môi:</strong> ${esc(g.tip)}</p>
            </div>
            <div class="py-diagram-box">${mouthDiagramSVG(g.diagram)}</div>
          </div>
          <div class="py-item-grid">
            ${g.items.map(it => `
              <div class="py-sound-card">
                <div class="py-sound-head">
                  <span class="py-sym">${esc(it.sym)}</span>
                  <span class="py-air-tag">${esc(it.air)}</span>
                  <button type="button" class="speak" data-py-speak="${esc(it.read)}" aria-label="Nghe âm ${esc(it.sym)}">▶</button>
                </div>
                <div class="py-sound-ex">Đọc mẫu: <strong>${esc(it.read)}</strong> (${esc(it.han)}) · Gần với <em>${esc(it.vi)}</em></div>
                <p class="py-sound-desc">${esc(it.mouth)}</p>
                <p class="py-sound-warn"><strong>Lưu ý:</strong> ${esc(it.mistake)}</p>
              </div>
            `).join('')}
          </div>
        </article>
      `).join('')}</div>`;
  }

  function renderFinals() {
    const groups = window.PINYIN_FINALS || [];
    return `<div class="section-intro"><h3>35 Vận mẫu tiếng Trung (韵母)</h3><span class="count">Đơn · Kép · Mũi</span></div>
      <p class="py-lead">Vận mẫu đứng sau thanh mẫu (tương tự vần trong tiếng Việt). Chạm nút ▶ để nghe phát âm chuẩn và giữ đúng khẩu hình miệng.</p>
      <div class="stack">${groups.map(g => `
        <article class="info-card py-group-card">
          <h3>${esc(g.name)}</h3>
          <p class="py-group-tip">${esc(g.desc)}</p>
          <div class="py-item-grid">
            ${g.items.map(it => `
              <div class="py-sound-card">
                <div class="py-sound-head">
                  <span class="py-sym">${esc(it.sym)}</span>
                  <span class="py-ex-han han">${esc(it.han)}</span>
                  <button type="button" class="speak" data-py-speak="${esc(it.read)}" aria-label="Nghe vận mẫu ${esc(it.sym)}">▶</button>
                </div>
                <p class="py-sound-desc"><strong>Khẩu hình:</strong> ${esc(it.mouth)}</p>
                <p class="py-sound-note"><strong>Mẹo nhớ:</strong> ${esc(it.tip)}</p>
              </div>
            `).join('')}
          </div>
        </article>
      `).join('')}</div>`;
  }

  function renderTones() {
    const tones = window.PINYIN_TONES || [];
    return `<div class="section-intro"><h3>4 Thanh điệu &amp; Thanh nhẹ (声调)</h3><span class="count">Cao độ 1 → 5</span></div>
      <article class="info-card py-tone-hero">
        <div class="py-tone-chart">${toneChartSVG()}</div>
        <div class="py-tone-guide">
          <h3>Cách đọc biểu đồ cao độ</h3>
          <p>Tiếng Trung chia cao độ giọng nói thành <strong>5 bậc</strong> (1 là thấp nhất, 5 là cao nhất). Đổi thanh điệu sẽ đổi hoàn toàn nghĩa của từ.</p>
          <div class="py-tone-demo-row">
            ${tones.map(t => `<button type="button" class="py-tone-pill" data-py-speak="${esc(t.ex)}"><strong>${esc(t.ex)}</strong> <span>${esc(t.han)} (${esc(t.vi)})</span> 🔊</button>`).join('')}
          </div>
        </div>
      </article>
      <div class="grammar-grid" style="margin-top:14px">${tones.map(t => `
        <article class="grammar-card">
          <div class="grammar-title"><span class="g-num">${esc(t.mark)}</span> ${esc(t.name)} · Bậc ${esc(t.pitch)}</div>
          <div class="grammar-body">
            <div class="py-tone-card-ex">
              <span>Ví dụ: <strong class="py-sym-sm">${esc(t.ex)}</strong> (${esc(t.han)} - ${esc(t.vi)})</span>
              <button type="button" class="speak" data-py-speak="${esc(t.ex)}" aria-label="Nghe ${esc(t.ex)}">▶</button>
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
          <li><strong>Biến điệu của 不 (bù):</strong> Bình thường đọc thanh 4 (bù), nhưng khi đứng trước một chữ thanh 4 khác thì đổi thành thanh 2 (bú). Ví dụ: 不是 (bú shì), 不对 (bú duì).</li>
          <li><strong>Biến điệu của 一 (yī):</strong> Đứng một mình hoặc đếm số đọc thanh 1 (yī); trước thanh 4 đọc thanh 2 (yí, vd: 一定 yídìng); trước thanh 1, 2, 3 đọc thanh 4 (yì, vd: 一般 yìbān, 一起 yìqǐ).</li>
        </ul>
      </article>`;
  }

  function renderMixer() {
    const allInits = ['∅'];
    (window.PINYIN_INITIALS || []).forEach(g => g.items.forEach(it => allInits.push(it.sym)));
    const allFinals = [];
    (window.PINYIN_FINALS || []).forEach(g => g.items.forEach(it => allFinals.push(it.sym)));

    const res = combinePinyin(selInit, selFinal);
    const toned = applyTone(res.base, selTone);

    // Các âm tiết hợp lệ nhanh của thanh mẫu đang chọn
    const quickRow = allFinals.map(f => {
      const c = combinePinyin(selInit, f);
      if (!c.valid) return null;
      return { f, syl: applyTone(c.base, selTone), ex: c.ex };
    }).filter(Boolean);

    return `<div class="section-intro"><h3>Ghép Thanh mẫu + Vận mẫu &amp; Nghe Audio</h3><span class="count">Chuẩn zh-CN</span></div>
      <article class="info-card py-mixer-stage">
        <div class="py-mixer-result ${res.valid ? 'is-ok' : 'is-bad'}">
          <div class="py-res-main">
            <div class="py-res-formula">${esc(selInit === '∅' ? '(không thanh mẫu)' : selInit)} + ${esc(selFinal)} + Thanh ${selTone === 0 ? 'nhẹ' : selTone}</div>
            <div class="py-res-syl">${esc(toned)}</div>
            <div class="py-res-meta">${res.valid ? `Ví dụ thông dụng: <strong class="han">${esc(res.ex)}</strong>` : 'Tổ hợp này không tồn tại trong tiếng Trung phổ thông — hãy thử vận mẫu khác bên dưới.'}</div>
          </div>
          <div class="py-res-actions">
            <button type="button" class="action" id="pyPlayBtn" ${res.valid ? '' : 'disabled'}>🔊 Nghe phát âm</button>
            <button type="button" class="game-other" id="pyPlaySlowBtn" ${res.valid ? '' : 'disabled'}>🐢 Nghe chậm</button>
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
          <h4>Bảng âm ghép nhanh của "${esc(selInit === '∅' ? 'Không thanh mẫu' : selInit)}" (${quickRow.length} âm hợp lệ — bấm để nghe)</h4>
          <div class="py-quick-syl-grid">
            ${quickRow.map(q => `<button type="button" class="py-qsyl-btn" data-py-speak="${esc(q.syl)}"><strong>${esc(q.syl)}</strong><span>${esc(q.ex)}</span></button>`).join('')}
          </div>
        </div>
      </article>`;
  }

  function render() {
    document.querySelectorAll('[data-py-tab]').forEach(b => {
      b.classList.toggle('active', b.dataset.pyTab === activeTab);
    });
    const panel = $('#pyPanel');
    if (!panel) return;
    if (activeTab === 'initials') panel.innerHTML = renderInitials();
    else if (activeTab === 'finals') panel.innerHTML = renderFinals();
    else if (activeTab === 'tones') panel.innerHTML = renderTones();
    else panel.innerHTML = renderMixer();

    if (window.HaiYing3D && typeof window.HaiYing3D.say === 'function') {
      const msgs = {
        initials: ['Thanh mẫu', 'Chạm vào từng thanh mẫu để nghe và xem sơ đồ đặt lưỡi, môi, luồng hơi nhé!', 'teach'],
        finals: ['Vận mẫu', 'Giữ nguyên khẩu hình miệng khi đọc nguyên âm đơn, lướt mượt với vận mẫu kép nhé!', 'wave'],
        tones: ['Thanh điệu', 'Chú ý cao độ 5 bậc: Thanh 1 ngang cao, Thanh 2 vút lên, Thanh 3 trầm xuống, Thanh 4 dứt khoát!', 'teach'],
        mixer: ['Ghép âm Pinyin', 'Chọn thanh mẫu + vận mẫu + thanh điệu để nghe phát âm chuẩn zh-CN!', 'cheer']
      };
      const m = msgs[activeTab];
      if (m) window.HaiYing3D.say(m[0], m[1], m[2]);
    }
  }

  document.addEventListener('click', e => {
    const tabBtn = e.target.closest('[data-py-tab]');
    if (tabBtn) {
      activeTab = tabBtn.dataset.pyTab;
      render();
      return;
    }
    const spk = e.target.closest('[data-py-speak]');
    if (spk) {
      speakZh(spk.dataset.pySpeak, 0.72);
      return;
    }
    const pi = e.target.closest('[data-pick-init]');
    if (pi) {
      selInit = pi.dataset.pickInit;
      // Nếu tổ hợp hiện tại không hợp lệ thì tự chuyển sang vận mẫu hợp lệ đầu tiên
      if (!combinePinyin(selInit, selFinal).valid) {
        const allF = [];
        (window.PINYIN_FINALS || []).forEach(g => g.items.forEach(it => allF.push(it.sym)));
        const firstOk = allF.find(f => combinePinyin(selInit, f).valid);
        if (firstOk) selFinal = firstOk;
      }
      render();
      const r = combinePinyin(selInit, selFinal);
      if (r.valid) speakZh(applyTone(r.base, selTone), 0.72);
      return;
    }
    const pf = e.target.closest('[data-pick-final]');
    if (pf) {
      selFinal = pf.dataset.pickFinal;
      render();
      const r = combinePinyin(selInit, selFinal);
      if (r.valid) speakZh(applyTone(r.base, selTone), 0.72);
      return;
    }
    const pt = e.target.closest('[data-pick-tone]');
    if (pt) {
      selTone = parseInt(pt.dataset.pickTone, 10);
      render();
      const r = combinePinyin(selInit, selFinal);
      if (r.valid) speakZh(applyTone(r.base, selTone), 0.72);
      return;
    }
    if (e.target.id === 'pyPlayBtn') {
      const r = combinePinyin(selInit, selFinal);
      if (r.valid) speakZh(applyTone(r.base, selTone), 0.72);
      return;
    }
    if (e.target.id === 'pyPlaySlowBtn') {
      const r = combinePinyin(selInit, selFinal);
      if (r.valid) speakZh(applyTone(r.base, selTone), 0.45);
      return;
    }
  });

  document.addEventListener('DOMContentLoaded', render);
})();
