/* ===== Bảng xếp hạng HSK: Bục Vinh Danh 3D Xoay Vòng (Top 3 三甲) + Header User Widget + SWR Cache =====
   Điểm chính thức do server (/api/score) tính và xác nhận.
   Khi chạy local (python -m http.server không có /api/*), tự động dùng kho điểm local dự phòng
   để người dùng trải nghiệm đầy đủ Bục 3D Xoay Vòng và tính năng cộng điểm ngay trên localhost. */
(function () {
  'use strict';
  var KEY = 'hoc-hsk-lb-v1';
  var LOCAL_DB_KEY = 'hoc-hsk-lb-local-db-v1';
  var CACHE_TOP = 'hoc-hsk-lb-cache-top';
  var CACHE_ME = 'hoc-hsk-lb-cache-me';

  var SEED_PLAYERS = [
    { id: 'seed-1', name: 'Lâm Minh Châu', points: 380 },
    { id: 'seed-2', name: 'Trần Hoàng Nam', points: 345 },
    { id: 'seed-3', name: 'Nguyễn Phương Thảo', points: 310 },
    { id: 'seed-4', name: 'Phạm Gia Huy', points: 275 },
    { id: 'seed-5', name: 'Vũ Ngọc Ánh', points: 240 },
    { id: 'seed-6', name: 'Đặng Quốc Khánh', points: 215 },
    { id: 'seed-7', name: 'Bùi Thanh Hà', points: 190 },
    { id: 'seed-8', name: 'Hoàng Tuấn Kiệt', points: 165 },
    { id: 'seed-9', name: 'Đỗ Khánh Linh', points: 140 },
    { id: 'seed-10', name: 'Lê Bảo Ngọc', points: 115 }
  ];

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
    try {
      if (p) localStorage.setItem(KEY, JSON.stringify({ id: p.id, name: p.name }));
      else localStorage.removeItem(KEY);
    } catch (e) {}
  }

  function loadLocalDB() {
    try {
      var db = JSON.parse(localStorage.getItem(LOCAL_DB_KEY) || 'null');
      if (db && Array.isArray(db.players) && db.best && db.daily) return db;
    } catch (e) {}
    return {
      players: SEED_PLAYERS.map(function (x) { return { id: x.id, name: x.name, points: x.points }; }),
      best: {},
      daily: {}
    };
  }

  function saveLocalDB(db) {
    try { localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(db)); } catch (e) {}
  }

  function localJoin(name) {
    var db = loadLocalDB();
    var norm = name.toLowerCase();
    var found = null;
    for (var i = 0; i < db.players.length; i++) {
      if (db.players[i].name.toLowerCase() === norm) {
        found = db.players[i];
        break;
      }
    }
    if (!found) {
      found = {
        id: 'local-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8),
        name: name,
        points: 20
      };
      db.players.push(found);
      saveLocalDB(db);
    }
    saveProfile({ id: found.id, name: found.name });
    return localRankInfo(found.id);
  }

  function localAward(activityType, activityId, correct, total) {
    var p = profile();
    if (!p) return;
    var maxMap = { practice: 30, quiz: 30, srs: 30, write: 3, game: 20 };
    var maxPts = maxMap[activityType];
    if (!maxPts || total < 1 || correct < 0 || correct > total) return;
    var pts = Math.round(maxPts * correct / total);
    if (pts <= 0) return;

    var db = loadLocalDB();
    var player = null;
    for (var i = 0; i < db.players.length; i++) {
      if (db.players[i].id === p.id) { player = db.players[i]; break; }
    }
    if (!player) {
      player = { id: p.id, name: p.name, points: 20 };
      db.players.push(player);
    }

    var delta = 0;
    if (activityType === 'game') {
      var dKey = p.id + ':' + activityId + ':' + todayKey();
      var used = db.daily[dKey] || 0;
      delta = Math.max(0, Math.min(pts, 40 - used));
      db.daily[dKey] = used + delta;
    } else {
      var bKey = p.id + ':' + activityId;
      var prev = db.best[bKey] || 0;
      if (pts > prev) {
        delta = pts - prev;
        db.best[bKey] = pts;
      }
    }
    if (delta > 0) {
      player.points += delta;
      saveLocalDB(db);
    }
  }

  function localSortedPlayers() {
    var db = loadLocalDB();
    var p = profile();
    if (p) {
      var exists = db.players.some(function (x) { return x.id === p.id; });
      if (!exists) {
        db.players.push({ id: p.id, name: p.name, points: 20 });
        saveLocalDB(db);
      }
    }
    return db.players.slice().sort(function (a, b) {
      return b.points - a.points || a.name.localeCompare(b.name);
    }).map(function (item, idx) {
      return { rank: idx + 1, id: item.id, name: item.name, points: item.points };
    });
  }

  function localRankInfo(playerId) {
    var all = localSortedPlayers();
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === playerId) {
        return {
          id: all[i].id,
          name: all[i].name,
          points: all[i].points,
          rank: all[i].rank,
          totalPlayers: all.length,
          inTop10: all[i].rank <= 10
        };
      }
    }
    return null;
  }

  function eventId() {
    try { if (window.crypto && crypto.randomUUID) return crypto.randomUUID(); } catch (e) {}
    return 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function cleanName(v) { return String(v || '').replace(/\s+/g, ' ').trim(); }

  function api(path, opts) {
    return fetch(path, opts).then(function (r) {
      if (!r.ok) throw new Error('http ' + r.status);
      return r.json();
    });
  }

  /* Gửi một lượt hoàn thành lên server + cập nhật kho local dự phòng */
  function award(activityType, activityId, correct, total) {
    if (typeof correct !== 'number' || typeof total !== 'number' || total < 1 || correct < 0 || correct > total) return;
    localAward(activityType, activityId, correct, total);
    var p = profile();
    if (!p || typeof fetch !== 'function') return;
    fetch('/api/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId: p.id,
        eventId: eventId(),
        activityType: activityType,
        activityId: activityId,
        correct: correct,
        total: total
      })
    }).then(function (r) {
      if (r.ok) refreshMe();
    }).catch(function () {});
  }

  /* Cache người chơi hiện tại */
  function getCachedMe() {
    try { return JSON.parse(localStorage.getItem(CACHE_ME) || 'null'); } catch (e) { return null; }
  }
  function setCachedMe(data) {
    try { if (data) localStorage.setItem(CACHE_ME, JSON.stringify(data)); } catch (e) {}
  }

  function refreshMe(cb) {
    var p = profile();
    if (!p) {
      setCachedMe(null);
      renderUserSlots();
      if (typeof cb === 'function') cb(null, null);
      return;
    }
    api('/api/me?id=' + encodeURIComponent(p.id)).then(function (r) {
      var meData = {
        id: r.id || p.id,
        name: r.name || p.name,
        points: typeof r.points === 'number' ? r.points : 20,
        rank: r.rank || null,
        totalPlayers: r.totalPlayers || null,
        inTop10: !!r.inTop10
      };
      setCachedMe(meData);
      renderUserSlots();
      window.dispatchEvent(new CustomEvent('hoc-hsk:user-updated', { detail: meData }));
      if (typeof cb === 'function') cb(null, meData);
    }).catch(function () {
      var localInfo = localRankInfo(p.id) || { id: p.id, name: p.name, points: 20, rank: null };
      setCachedMe(localInfo);
      renderUserSlots();
      window.dispatchEvent(new CustomEvent('hoc-hsk:user-updated', { detail: localInfo }));
      if (typeof cb === 'function') cb(null, localInfo);
    });
  }

  function joinUser(name, cb) {
    var clean = cleanName(name);
    if (clean.length < 2) return;
    api('/api/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: clean })
    }).then(function (r) {
      saveProfile({ id: r.id, name: r.name });
      var meData = { id: r.id, name: r.name, points: r.points, rank: r.rank, totalPlayers: r.totalPlayers };
      setCachedMe(meData);
      renderUserSlots();
      window.dispatchEvent(new CustomEvent('hoc-hsk:user-updated', { detail: meData }));
      if (typeof cb === 'function') cb(null, meData);
    }).catch(function () {
      var localInfo = localJoin(clean);
      setCachedMe(localInfo);
      renderUserSlots();
      window.dispatchEvent(new CustomEvent('hoc-hsk:user-updated', { detail: localInfo }));
      if (typeof cb === 'function') cb(null, localInfo);
    });
  }

  /* ===== HEADER USER SLOT WIDGET (Hiển thị tên & nút Đặt tên cạnh ngọn lửa) ===== */
  function closeAllUserPops() {
    var pops = document.querySelectorAll('.user-pop');
    for (var i = 0; i < pops.length; i++) pops[i].hidden = true;
    var btns = document.querySelectorAll('[data-user-btn]');
    for (var j = 0; j < btns.length; j++) btns[j].setAttribute('aria-expanded', 'false');
  }

  function renderUserSlots() {
    var slots = document.querySelectorAll('[data-user-slot]');
    if (!slots.length) return;
    var p = profile();
    var cached = getCachedMe();
    var pts = (cached && typeof cached.points === 'number') ? cached.points : (p ? 20 : 0);
    var rankText = (cached && cached.rank) ? ('Hạng #' + cached.rank) : 'Đang tính…';

    slots.forEach(function (slot) {
      if (!p) {
        // Chưa đăng ký
        slot.innerHTML =
          '<button class="user-btn user-unjoined" type="button" data-user-btn aria-haspopup="dialog" aria-expanded="false" aria-label="Ghi danh Bảng vàng nhận 20 điểm">' +
            '<span class="user-icon" aria-hidden="true">✨</span>' +
            '<span class="user-btn-txt">Nhập tên <strong class="user-bonus">+20đ</strong></span>' +
          '</button>' +
          '<div class="user-pop" role="dialog" aria-label="Ghi danh Bảng vàng HSK" hidden>' +
            '<div class="user-pop-card">' +
              '<div class="user-pop-head">' +
                '<span class="seal-stamp" aria-hidden="true">金榜</span>' +
                '<div>' +
                  '<h4 class="user-pop-title">Ghi danh Bảng vàng HSK</h4>' +
                  '<p class="user-pop-sub">Nhập tên để thi đua và nhận ngay <strong>+20 điểm</strong> chào mừng!</p>' +
                '</div>' +
              '</div>' +
              '<form class="user-pop-form" data-user-join-form novalidate>' +
                '<div class="user-pop-field">' +
                  '<label class="user-pop-lbl" for="userJoinInput">Tên hiển thị của bạn</label>' +
                  '<input id="userJoinInput" class="user-pop-input" type="text" maxlength="40" placeholder="Ví dụ: Hải Anh, Minh Châu..." autocomplete="name" required>' +
                '</div>' +
                '<div class="user-pop-actions">' +
                  '<button class="user-pop-submit" type="submit" disabled>✨ Tham gia (+20đ)</button>' +
                '</div>' +
                '<p class="user-pop-err" hidden></p>' +
                '<p class="user-pop-note">Điểm được cộng tự động khi làm bài luyện tập (tối đa 30đ), trắc nghiệm (30đ), trò chơi (20đ) và <strong>tập viết chữ Hán chuẩn nét</strong> (+1 đến +3đ/từ).</p>' +
              '</form>' +
            '</div>' +
          '</div>';

        var btn = slot.querySelector('[data-user-btn]');
        var pop = slot.querySelector('.user-pop');
        var form = slot.querySelector('[data-user-join-form]');
        var input = slot.querySelector('.user-pop-input');
        var submitBtn = slot.querySelector('.user-pop-submit');
        var errEl = slot.querySelector('.user-pop-err');

        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          var open = !pop.hidden;
          closeAllUserPops();
          if (typeof window.Streak !== 'undefined') {
            var sPops = document.querySelectorAll('.streak-pop');
            for (var k = 0; k < sPops.length; k++) sPops[k].hidden = true;
          }
          if (!open) {
            pop.hidden = false;
            btn.setAttribute('aria-expanded', 'true');
            setTimeout(function () { input.focus(); }, 60);
          }
        });
        pop.addEventListener('click', function (e) { e.stopPropagation(); });

        input.addEventListener('input', function () {
          var val = cleanName(input.value);
          submitBtn.disabled = val.length < 2;
        });

        form.addEventListener('submit', function (e) {
          e.preventDefault();
          var name = cleanName(input.value);
          if (name.length < 2) return;
          submitBtn.disabled = true;
          submitBtn.textContent = 'Đang lưu…';
          joinUser(name, function (err, res) {
            submitBtn.textContent = '✨ Tham gia (+20đ)';
            submitBtn.disabled = false;
            closeAllUserPops();
            if (window.HaiYing3D && typeof HaiYing3D.say === 'function') {
              HaiYing3D.say('Chúc mừng!', 'Chào mừng <strong>' + esc(name) + '</strong>! Bạn đã nhận <strong>20 điểm</strong> chào mừng! Tên của bạn đã hiện ở góc trên rồi nhé!', 'cheer', 9000);
            }
          });
        });
      } else {
        // Đã đăng ký
        slot.innerHTML =
          '<button class="user-btn user-joined" type="button" data-user-btn aria-haspopup="dialog" aria-expanded="false" aria-label="Hồ sơ: ' + esc(p.name) + '">' +
            '<span class="user-avatar" aria-hidden="true">🧑‍🎓</span>' +
            '<span class="user-name">' + esc(p.name) + '</span>' +
            '<span class="user-pts">' + pts + 'đ</span>' +
          '</button>' +
          '<div class="user-pop" role="dialog" aria-label="Hồ sơ học viên" hidden>' +
            '<div class="user-pop-card">' +
              '<div class="user-prof-head">' +
                '<span class="user-prof-avatar" aria-hidden="true">🧑‍🎓</span>' +
                '<div class="user-prof-info">' +
                  '<h4 class="user-prof-name">' + esc(p.name) + '</h4>' +
                  '<p class="user-prof-rank">' + rankText + '</p>' +
                '</div>' +
              '</div>' +
              '<div class="user-prof-stats">' +
                '<div class="user-stat-card">' +
                  '<strong class="user-stat-val">' + pts + '</strong>' +
                  '<span class="user-stat-lbl">Điểm tích lũy</span>' +
                '</div>' +
                '<div class="user-stat-card">' +
                  '<strong class="user-stat-val">' + ((cached && cached.rank) ? ('#' + cached.rank) : '—') + '</strong>' +
                  '<span class="user-stat-lbl">Hạng bảng vàng</span>' +
                '</div>' +
              '</div>' +
              '<div class="user-prof-actions">' +
                '<a class="user-prof-link primary" href="bang-xep-hang">🏆 Xem Bảng xếp hạng</a>' +
                '<button class="user-prof-link secondary" type="button" data-user-rename-toggle>✏️ Đổi tên</button>' +
              '</div>' +
              '<div class="user-rename-panel" data-user-rename-panel hidden>' +
                '<label class="user-pop-lbl" for="userRenameInput">Nhập tên mới:</label>' +
                '<div class="user-rename-row">' +
                  '<input id="userRenameInput" class="user-pop-input" type="text" maxlength="40" value="' + esc(p.name) + '">' +
                  '<button class="user-rename-save" type="button" data-user-rename-save>Lưu</button>' +
                  '<button class="user-rename-cancel" type="button" data-user-rename-cancel>Hủy</button>' +
                '</div>' +
                '<p class="user-pop-err" hidden></p>' +
              '</div>' +
            '</div>' +
          '</div>';

        var jBtn = slot.querySelector('[data-user-btn]');
        var jPop = slot.querySelector('.user-pop');
        var renameToggle = slot.querySelector('[data-user-rename-toggle]');
        var renamePanel = slot.querySelector('[data-user-rename-panel]');
        var renameInput = slot.querySelector('#userRenameInput');
        var renameSave = slot.querySelector('[data-user-rename-save]');
        var renameCancel = slot.querySelector('[data-user-rename-cancel]');

        jBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          var open = !jPop.hidden;
          closeAllUserPops();
          if (typeof window.Streak !== 'undefined') {
            var sPops2 = document.querySelectorAll('.streak-pop');
            for (var m = 0; m < sPops2.length; m++) sPops2[m].hidden = true;
          }
          if (!open) {
            jPop.hidden = false;
            jBtn.setAttribute('aria-expanded', 'true');
            if (renamePanel) renamePanel.hidden = true;
          }
        });
        jPop.addEventListener('click', function (e) { e.stopPropagation(); });

        if (renameToggle && renamePanel) {
          renameToggle.addEventListener('click', function () {
            renamePanel.hidden = !renamePanel.hidden;
            if (!renamePanel.hidden && renameInput) renameInput.focus();
          });
          renameCancel.addEventListener('click', function () {
            renamePanel.hidden = true;
          });
          renameSave.addEventListener('click', function () {
            var newName = cleanName(renameInput.value);
            if (newName.length < 2) return;
            renameSave.disabled = true;
            renameSave.textContent = 'Đang lưu…';
            joinUser(newName, function () {
              renameSave.disabled = false;
              renameSave.textContent = 'Lưu';
              closeAllUserPops();
              if (window.HaiYing3D && typeof HaiYing3D.say === 'function') {
                HaiYing3D.say('Đổi tên thành công!', 'Tên của bạn đã được cập nhật thành <strong>' + esc(newName) + '</strong>!', 'cheer', 6000);
              }
            });
          });
        }
      }
    });
  }

  function initHeaderGuidance() {
    // Nếu người dùng chưa tham gia, hiển thị lời mời thân thiện từ Hải Anh 3D trên trang chủ
    var loc = (typeof window !== 'undefined' && window.location && window.location.pathname) ? window.location.pathname : '';
    var isHome = loc.endsWith('/') || loc.endsWith('index.html') || loc === '';
    if (isHome && !profile()) {
      var welcomed = false;
      try { welcomed = !!sessionStorage.getItem('hy-welcomed-name-prompt'); } catch (e) {}
      if (!welcomed) {
        setTimeout(function () {
          if (window.HaiYing3D && typeof HaiYing3D.say === 'function' && !profile()) {
            HaiYing3D.say(
              'Chào bạn mới!',
              'Hãy bấm nút <strong>[✨ Nhập tên +20đ]</strong> ở góc trên cạnh ngọn lửa để nhận 20 điểm khởi đầu và ghi danh Bảng vàng nhé!',
              'cheer',
              12000
            );
            try { sessionStorage.setItem('hy-welcomed-name-prompt', '1'); } catch (e) {}
          }
        }, 1200);
      }
    }
  }

  window.LB = {
    profile: profile,
    award: award,
    todayKey: todayKey,
    localTop: function () { return localSortedPlayers().slice(0, 10); },
    localMe: function () { var p = profile(); return p ? localRankInfo(p.id) : null; },
    join: joinUser,
    refreshMe: refreshMe,
    renderUserSlots: renderUserSlots
  };

  /* ===== BỤC VINH DANH 3D XOAY VÒNG (TOP 3 三甲) ===== */
  var podiumAnim = {
    raf: 0,
    theta: 0,
    targetTheta: null,
    autoSpin: true,
    dragging: false,
    dragStartX: 0,
    dragStartTheta: 0,
    lastTime: 0,
    mounted: false
  };

  var PODIUM_META = [
    { rank: 1, han: '状', hanFull: '状元', title: 'Trạng nguyên', img: 'assets/podium-top1.png', cls: 'rank-1' },
    { rank: 2, han: '榜', hanFull: '榜眼', title: 'Bảng nhãn', img: 'assets/podium-top2.png', cls: 'rank-2' },
    { rank: 3, han: '探', hanFull: '探花', title: 'Thám hoa', img: 'assets/podium-top3.png', cls: 'rank-3' }
  ];

  function renderPodium3D(topPlayers, meProfile) {
    var sec = document.getElementById('lbPodiumSection');
    if (!sec) return;
    var top3 = [0, 1, 2].map(function (i) {
      return (topPlayers && topPlayers[i]) || {
        rank: i + 1,
        id: 'empty-' + i,
        name: 'Đang chờ vinh danh',
        points: 0
      };
    });

    if (!podiumAnim.mounted) {
      sec.innerHTML =
        '<div class="lb3d-card">' +
          '<div class="lb3d-header">' +
            '<div class="lb3d-title-wrap">' +
              '<span class="seal-stamp">三甲金榜</span>' +
              '<h3 class="lb3d-heading">Điện Vinh Danh Top 3</h3>' +
            '</div>' +
            '<div class="lb3d-controls" role="group" aria-label="Chọn ngôi vị">' +
              '<button class="lb3d-ctrl active" data-lb3d="spin" type="button">⟳ Tự xoay</button>' +
              '<button class="lb3d-ctrl" data-lb3d="0" type="button"><span class="han">状</span> Hạng 1</button>' +
              '<button class="lb3d-ctrl" data-lb3d="1" type="button"><span class="han">榜</span> Hạng 2</button>' +
              '<button class="lb3d-ctrl" data-lb3d="2" type="button"><span class="han">探</span> Hạng 3</button>' +
            '</div>' +
          '</div>' +
          '<div class="lb3d-arena" id="lb3dArena">' +
            '<div class="lb3d-celestial-bg" aria-hidden="true"></div>' +
            '<div class="lb3d-cloud-layer lb3d-cloud-back" aria-hidden="true"></div>' +
            '<div class="lb3d-units" id="lb3dUnits">' +
              PODIUM_META.map(function (m, idx) {
                return (
                  '<div class="lb3d-unit ' + m.cls + '" data-unit-idx="' + idx + '" tabindex="0" role="button" aria-label="Hạng ' + m.rank + ' ' + m.title + '">' +
                    '<div class="lb3d-crown lb3d-crown-' + m.rank + '">' +
                      '<span class="han">' + m.hanFull + '</span> · Hạng ' + m.rank +
                    '</div>' +
                    '<div class="lb3d-char-wrap">' +
                      '<div class="lb3d-char-halo"></div>' +
                      '<img class="lb3d-char-img" src="' + m.img + '" alt="' + m.title + '">' +
                    '</div>' +
                    '<div class="lb3d-pillar lb3d-pillar-' + m.rank + '">' +
                      '<div class="lb3d-pillar-top"></div>' +
                      '<div class="lb3d-pillar-side left"></div>' +
                      '<div class="lb3d-pillar-side right"></div>' +
                      '<div class="lb3d-pillar-front">' +
                        '<span class="lb-medal lb-medal-' + m.rank + ' lb3d-seal"><span class="han">' + m.han + '</span></span>' +
                        '<div class="lb3d-pname" data-lb3d-name="' + idx + '"></div>' +
                        '<div class="lb3d-ptitle">' + m.title + '</div>' +
                        '<div class="lb3d-ppoints" data-lb3d-pts="' + idx + '"></div>' +
                      '</div>' +
                    '</div>' +
                    '<div class="lb3d-floor-shadow"></div>' +
                  '</div>'
                );
              }).join('') +
            '</div>' +
            '<div class="lb3d-cloud-layer lb3d-cloud-front" aria-hidden="true"></div>' +
          '</div>' +
        '</div>';

      podiumAnim.mounted = true;
      wirePodium3DInteractions(sec);
      startPodium3DLoop();
    }

    // Cập nhật tên & điểm số của Top 3
    for (var i = 0; i < 3; i++) {
      var p = top3[i];
      var isMe = meProfile && meProfile.id === p.id;
      var nameEl = sec.querySelector('[data-lb3d-name="' + i + '"]');
      var ptsEl = sec.querySelector('[data-lb3d-pts="' + i + '"]');
      if (nameEl) {
        nameEl.innerHTML = esc(p.name) + (isMe ? ' <span class="lb3d-you">Bạn</span>' : '');
      }
      if (ptsEl) {
        ptsEl.innerHTML = '<strong>' + p.points + '</strong> <small>điểm</small>';
      }
    }
  }

  function wirePodium3DInteractions(sec) {
    var arena = document.getElementById('lb3dArena');
    var ctrls = sec.querySelectorAll('[data-lb3d]');

    function setActiveCtrl(val) {
      ctrls.forEach(function (c) {
        c.classList.toggle('active', c.getAttribute('data-lb3d') === String(val));
      });
    }

    function focusUnit(idx) {
      podiumAnim.autoSpin = false;
      var step = (Math.PI * 2) / 3;
      var desired = -idx * step;
      var diff = ((desired - podiumAnim.theta) % (Math.PI * 2));
      if (diff > Math.PI) diff -= Math.PI * 2;
      if (diff < -Math.PI) diff += Math.PI * 2;
      podiumAnim.targetTheta = podiumAnim.theta + diff;
      setActiveCtrl(idx);
    }

    ctrls.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var mode = btn.getAttribute('data-lb3d');
        if (mode === 'spin') {
          podiumAnim.autoSpin = true;
          podiumAnim.targetTheta = null;
          setActiveCtrl('spin');
        } else {
          focusUnit(Number(mode));
        }
      });
    });

    sec.querySelectorAll('.lb3d-unit').forEach(function (u) {
      u.addEventListener('click', function () {
        var idx = Number(u.getAttribute('data-unit-idx'));
        focusUnit(idx);
      });
    });

    if (!arena) return;
    function onDown(clientX) {
      podiumAnim.dragging = true;
      podiumAnim.dragStartX = clientX;
      podiumAnim.dragStartTheta = podiumAnim.theta;
      podiumAnim.targetTheta = null;
    }
    function onMove(clientX) {
      if (!podiumAnim.dragging) return;
      var dx = clientX - podiumAnim.dragStartX;
      podiumAnim.theta = podiumAnim.dragStartTheta + dx * 0.0085;
    }
    function onUp() {
      podiumAnim.dragging = false;
    }

    arena.addEventListener('mousedown', function (e) { onDown(e.clientX); });
    window.addEventListener('mousemove', function (e) { onMove(e.clientX); }, { passive: true });
    window.addEventListener('mouseup', onUp);

    arena.addEventListener('touchstart', function (e) {
      if (e.touches && e.touches[0]) onDown(e.touches[0].clientX);
    }, { passive: true });
    arena.addEventListener('touchmove', function (e) {
      if (e.touches && e.touches[0]) onMove(e.touches[0].clientX);
    }, { passive: true });
    arena.addEventListener('touchend', onUp);
  }

  function startPodium3DLoop() {
    if (podiumAnim.raf) cancelAnimationFrame(podiumAnim.raf);
    podiumAnim.lastTime = performance.now();

    function tick(now) {
      podiumAnim.raf = requestAnimationFrame(tick);
      var dt = Math.min(0.05, (now - podiumAnim.lastTime) / 1000);
      podiumAnim.lastTime = now;

      var arena = document.getElementById('lb3dArena');
      if (!arena) return;

      if (!podiumAnim.dragging) {
        if (podiumAnim.targetTheta !== null) {
          var delta = podiumAnim.targetTheta - podiumAnim.theta;
          podiumAnim.theta += delta * Math.min(1, dt * 6.5);
          if (Math.abs(delta) < 0.004) {
            podiumAnim.theta = podiumAnim.targetTheta;
            podiumAnim.targetTheta = null;
          }
        } else if (podiumAnim.autoSpin) {
          podiumAnim.theta += dt * 0.55;
        }
      }

      var w = arena.clientWidth || 720;
      var rx = Math.min(230, Math.max(96, w * 0.285));
      var rz = Math.min(115, Math.max(60, w * 0.14));
      var step = (Math.PI * 2) / 3;
      var units = arena.querySelectorAll('.lb3d-unit');

      for (var i = 0; i < units.length; i++) {
        var u = units[i];
        var angle = podiumAnim.theta + i * step;
        var sinA = Math.sin(angle);
        var cosA = Math.cos(angle);

        var x = sinA * rx;
        var z = cosA * rz;
        var y = -cosA * 14;
        var scale = 0.84 + (cosA + 1) * 0.12;
        var pillarYaw = sinA * 18;
        var zIdx = Math.round(25 + cosA * 15);

        u.style.transform =
          'translate3d(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px, ' + z.toFixed(1) + 'px) scale(' + scale.toFixed(3) + ')';
        u.style.zIndex = String(zIdx);
        u.classList.toggle('is-front', cosA > 0.45);
        u.classList.toggle('is-back', cosA < -0.35);

        var pillar = u.querySelector('.lb3d-pillar');
        if (pillar) {
          pillar.style.transform = 'rotateY(' + pillarYaw.toFixed(1) + 'deg)';
        }
      }
    }

    podiumAnim.raf = requestAnimationFrame(tick);
  }

  /* ===== TRANG BẢNG XẾP HẠNG (bang-xep-hang.html) ===== */
  function initLeaderboardPage() {
    var listEl = document.getElementById('lbList');
    if (!listEl) return;
    var meEl = document.getElementById('lbMe');
    var state = { top: null, me: null };

    // SWR Cache: Hiển thị ngay lập tức (0ms) dữ liệu đã cache từ trước
    try {
      var cachedTop = JSON.parse(localStorage.getItem(CACHE_TOP) || 'null');
      if (Array.isArray(cachedTop) && cachedTop.length) {
        state.top = cachedTop;
      }
      var cachedMe = getCachedMe();
      if (cachedMe) {
        state.me = cachedMe;
      }
    } catch (e) {}

    if (window.HaiYing3D && typeof HaiYing3D.say === 'function') {
      setTimeout(function () {
        HaiYing3D.say(
          'Bảng xếp hạng',
          'Chào mừng bạn tới <strong>Điện Vinh Danh 三甲</strong>! Hoàn thành bài tập, trò chơi và <strong>Tập viết chữ Hán ít nét sai</strong> để tích điểm vinh danh nhé!',
          'cheer',
          12000
        );
      }, 250);
    }

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
      renderPodium3D(state.top, me);

      var MEDALS = { 1: { han: '状', title: 'Trạng nguyên' }, 2: { han: '榜', title: 'Bảng nhãn' }, 3: { han: '探', title: 'Thám hoa' } };
      var head = state.top.length >= 3 ? '<li class="lb-top3-head"><span class="han">金榜</span> · Bảng tổng sắp Top 10 Học Sĩ</li>' : '';
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
      if (!me || !me.rank) return 'Đang tính…';
      if (me.rank <= 10) return 'Hạng #' + me.rank;
      return '#' + me.rank + ' · Ngoài Top 10';
    }

    function gapText() {
      var me = state.me, top = state.top;
      if (!me || !me.rank || !top || !top.length) return '';
      if (me.rank === 1) return 'Bạn đang dẫn đầu bảng xếp hạng — giữ vững ngôi Trạng nguyên nhé!';
      if (me.rank <= 10) {
        var above = top[me.rank - 2];
        if (above && above.points > me.points) return 'Kém hạng ' + (me.rank - 1) + ' đúng ' + (above.points - me.points) + ' điểm. Tập viết từ mới và làm bài để bứt phá nhé!';
        return '';
      }
      var tenth = top[top.length - 1];
      if (tenth && tenth.points >= me.points) return 'Cần thêm ' + (tenth.points - me.points + 1) + ' điểm nữa để vào Top 10.';
      return '';
    }

    function renderMe() {
      if (!meEl) return;
      var p = profile();
      if (!p) {
        meEl.innerHTML =
          '<h2>Thứ hạng của bạn</h2>' +
          '<p class="lb-me-note">Bạn chưa ghi danh. Nhập tên ngay để nhận <strong>+20 điểm</strong> chào mừng và leo bảng vàng! (Hoặc có thể bấm vào nút <strong>[✨ Nhập tên +20đ]</strong> ở góc trên cùng)</p>' +
          '<form class="lb-join" id="lbJoinForm" novalidate>' +
            '<label for="lbName">Tên hiển thị của bạn</label>' +
            '<div class="lb-join-row">' +
              '<input id="lbName" type="text" maxlength="40" autocomplete="name" placeholder="Ví dụ: Nguyễn Văn A">' +
              '<button class="pw-go lb-join-btn" id="lbJoinBtn" type="submit" disabled>Tham gia (+20đ)</button>' +
            '</div>' +
            '<p class="lb-join-preview" id="lbPreview" hidden>Tên sẽ hiển thị trên bảng: <strong></strong></p>' +
            '<p class="lb-err" id="lbErr" hidden></p>' +
            '<p class="lb-me-note lb-join-note">Người mới được tặng 20 điểm chào mừng. Điểm cộng khi hoàn thành luyện tập (tối đa 30đ), trắc nghiệm bài khóa (30đ), trò chơi (20đ) và tập viết chữ Hán chuẩn nét (+1 đến +3đ mỗi từ).</p>' +
          '</form>';
        wireJoinForm();
        return;
      }
      var me = state.me;
      var gap = gapText();
      meEl.innerHTML =
        '<div class="lb-me-head-row">' +
          '<h2>Thứ hạng của bạn</h2>' +
          '<button type="button" class="lb-me-rename-btn" id="lbMeRenameBtn">✏️ Đổi tên</button>' +
        '</div>' +
        '<div class="lb-me-row">' +
          '<span class="lb-me-name">' + esc(state.me && state.me.name ? state.me.name : p.name) + '</span>' +
          '<span class="lb-me-points">' + (me && typeof me.points === 'number' ? me.points : '…') + ' điểm</span>' +
          '<span class="lb-me-rank">' + rankText(me) + '</span>' +
        '</div>' +
        (gap ? '<p class="lb-me-gap">' + esc(gap) + '</p>' : '') +
        '<p class="lb-me-note">Điểm được cộng tự động khi bạn hoàn thành bài luyện tập, trắc nghiệm, các ván game và tập viết chữ Hán ít nét sai (+1 đến +3 điểm/từ).</p>';

      var renameBtn = document.getElementById('lbMeRenameBtn');
      if (renameBtn) {
        renameBtn.addEventListener('click', function () {
          var userBtn = document.querySelector('[data-user-btn]');
          if (userBtn) userBtn.click();
        });
      }
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
        joinUser(name, function (error, r) {
          state.me = r;
          renderMe();
          renderTop();
          refresh();
        });
      });
    }

    function refresh() {
      api('/api/leaderboard').then(function (r) {
        state.top = r.players || r.top || [];
        try { localStorage.setItem(CACHE_TOP, JSON.stringify(state.top)); } catch (e) {}
        renderTop();
        if (profile() && state.me) renderMe();
      }).catch(function () {
        state.top = window.LB.localTop();
        renderTop();
        if (profile()) {
          state.me = window.LB.localMe();
          renderMe();
        }
      });
      var p = profile();
      if (p) {
        api('/api/me?id=' + encodeURIComponent(p.id)).then(function (r) {
          state.me = r;
          setCachedMe(r);
          renderMe();
          renderUserSlots();
        }).catch(function () {
          if (!state.me) {
            state.me = window.LB.localMe();
            setCachedMe(state.me);
            renderMe();
          }
        });
      }
    }

    // Render ngay từ cache (0ms)
    renderMe();
    renderTop();
    // Sau đó refresh ngầm từ server
    refresh();

    document.addEventListener('visibilitychange', function () { if (!document.hidden) refresh(); });
    setInterval(function () { if (!document.hidden) refresh(); }, 45000);

    window.addEventListener('hoc-hsk:user-updated', function (e) {
      if (e.detail) state.me = e.detail;
      renderMe();
      renderTop();
    });
  }

  /* Khởi chạy chung cho tất cả các trang */
  function initAll() {
    renderUserSlots();
    refreshMe();
    initHeaderGuidance();
    initLeaderboardPage();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll);
    else initAll();

    document.addEventListener('click', function () { closeAllUserPops(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAllUserPops();
    });

    window.addEventListener('storage', function (e) {
      if (e.key === KEY || e.key === CACHE_ME) {
        renderUserSlots();
      }
    });
  }
})();
