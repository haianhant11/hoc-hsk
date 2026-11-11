/* ==========================================================================
   海英 (HẢI ANH) — INTERACTIVE 3D PIXAR CHIBI SCHOLAR COMPANION
   + REAL-TIME 3D MOTION, SPARKLES & 3D EDTECH CARD TILT
   ========================================================================== */
(function () {
  "use strict";
  if (window.HaiYing3D) return;

  /* ---------- 1. Inject Corner 3D Companion DOM ---------- */
  var widget = document.createElement("aside");
  widget.className = "hy3d-widget";
  widget.id = "hy3dWidget";
  widget.setAttribute("aria-label", "Người hướng dẫn 3D Hải Anh (海英)");
  widget.innerHTML =
    '<div class="hy3d-bubble" id="hy3dBubble" role="status" aria-live="polite">' +
      '<button class="hy3d-close" id="hy3dClose" type="button" aria-label="Thu gọn lời nhắc">×</button>' +
      '<div class="hy3d-tag" id="hy3dTag"><span class="han">海英</span> · Hướng dẫn</div>' +
      '<div class="hy3d-text" id="hy3dText">Xin chào! Mình là <strong>海英 (Hải Anh)</strong>. Chạm vào mình bất kỳ lúc nào để xem mẹo học nhé!</div>' +
    '</div>' +
    '<div class="hy3d-stage" id="hy3dStage" title="Chạm vào Hải Anh để xem mẹo học">' +
      '<div class="hy3d-figure" id="hy3dFigure">' +
        '<canvas class="hy3d-canvas" id="hy3dCanvas" width="300" height="480"></canvas>' +
      '</div>' +
      '<div class="hy3d-pedestal-label"><span class="han">海英</span></div>' +
    '</div>';

  function mountWidget() {
    if (!document.body) return;
    document.body.appendChild(widget);
    initCharacterCanvas();
    initHomeGreeting();
    init3DCardTilt();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountWidget);
  } else {
    mountWidget();
  }

  /* ---------- 2. State & Public API ---------- */
  var state = {
    mood: "wave",
    jumpVel: 0,
    jumpY: 0,
    waveBoost: 1.5,
    targetX: 0,
    targetY: 0,
    lookX: 0,
    lookY: 0,
    bubbleTimer: null,
    tipIndex: 0,
    sparkles: []
  };

  var GENERAL_TIPS = [
    ["Mẹo học từ", "Hãy bấm loa nghe phát âm chuẩn trước, sau đó đọc to câu ví dụ để nhớ ngữ cảnh tự nhiên nhé!", "teach"],
    ["Bút thuận", "Khi học từng từ, hãy bấm <strong>Tập viết</strong> để tự tay đưa từng nét chữ Hán — nhớ mặt chữ nhanh gấp 3 lần!", "cheer"],
    ["Phản xạ", "Học xong từ vựng và ngữ pháp, bạn nhớ ghé mục <strong>Luyện tập &amp; Trò chơi</strong> để rèn phản xạ nhé!", "wave"],
    ["Ôn tập SRS", "Những từ bạn làm sai trong bài tập sẽ tự động vào mục <strong>Ôn tập</strong> để nhắc lại đúng thời điểm!", "teach"]
  ];

  function spawnBurst(count) {
    for (var i = 0; i < (count || 10); i++) {
      var a = Math.random() * Math.PI * 2;
      var sp = 45 + Math.random() * 90;
      state.sparkles.push({
        x: 150 + (Math.random() - 0.5) * 60,
        y: 230 + (Math.random() - 0.5) * 70,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 40,
        r: 3.5 + Math.random() * 4.5,
        life: 0.75 + Math.random() * 0.45,
        maxLife: 1.0,
        gold: i % 3 !== 0
      });
    }
  }

  function say(tag, html, mood, durationMs) {
    var b = document.getElementById("hy3dBubble");
    var tEl = document.getElementById("hy3dTag");
    var txEl = document.getElementById("hy3dText");
    if (tEl) tEl.innerHTML = tag ? ('<span class="han">海英</span> · ' + tag) : '<span class="han">海英</span>';
    if (txEl && html) txEl.innerHTML = html;
    if (b) b.classList.remove("is-collapsed");
    react(mood || "wave");
    if (state.bubbleTimer) clearTimeout(state.bubbleTimer);
    state.bubbleTimer = setTimeout(function () {
      var bb = document.getElementById("hy3dBubble");
      if (bb) bb.classList.add("is-collapsed");
    }, durationMs || 11000);
  }

  function react(mood) {
    state.mood = mood || "wave";
    state.waveBoost = 2.4;
    if (mood === "cheer" || mood === "jump") {
      state.jumpVel = 220;
      spawnBurst(14);
    } else if (mood === "wave") {
      state.jumpVel = 110;
      spawnBurst(6);
    }
  }

  function setVisible(vis) {
    if (!widget) return;
    widget.classList.toggle("is-hidden", !vis);
  }

  window.HaiYing3D = {
    say: say,
    react: react,
    setVisible: setVisible
  };

  function initHomeGreeting() {
    if (document.getElementById("lessonHead")) return;
    try {
      var due = window.SRS && typeof SRS.dueCount === "function" ? SRS.dueCount() : 0;
      var st = window.Streak && typeof Streak.state === "function" ? Streak.state() : null;
      var sCount = st && st.count ? st.count : 0;
      if (due > 0) {
        say(
          "Nhắc ôn tập",
          "Hôm nay bạn có <strong>" + due + " từ</strong> cần ôn" +
            (sCount > 0 ? " (chuỗi <strong>" + sCount + " ngày</strong>)" : "") +
            ". Ghé mục <strong>Ôn tập</strong> hoặc chọn khóa học bên dưới nhé!",
          "wave",
          12000
        );
      } else if (sCount > 0) {
        say(
          "Chuỗi " + sCount + " ngày",
          "Tuyệt vời! Bạn đang giữ chuỗi <strong>" + sCount + " ngày học liên tiếp</strong>. Chọn một khóa học để bắt đầu hôm nay nhé!",
          "cheer",
          11000
        );
      } else {
        say(
          "",
          "Xin chào! Mình là <strong>海英 (Hải Anh)</strong>. Chọn khóa học HSK bên dưới để mình dẫn bạn học từng bài nhé!",
          "wave",
          11000
        );
      }
    } catch (e) {}
  }

  /* ---------- 3. Real-Time 3D Pixar Character Canvas ---------- */
  function initCharacterCanvas() {
    var canvas = document.getElementById("hy3dCanvas");
    var stage = document.getElementById("hy3dStage");
    var fig = document.getElementById("hy3dFigure");
    var closeBtn = document.getElementById("hy3dClose");
    if (!canvas || !stage) return;

    var ctx = canvas.getContext("2d");
    var img = new Image();
    var loaded = false;
    img.onload = function () {
      loaded = true;
    };
    img.src = "assets/haiying-3d.png";

    window.addEventListener("mousemove", function (e) {
      var rect = stage.getBoundingClientRect();
      var cx = rect.left + rect.width * 0.5;
      var cy = rect.top + rect.height * 0.45;
      state.targetX = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth * 0.45)));
      state.targetY = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight * 0.45)));
    }, { passive: true });

    stage.addEventListener("click", function () {
      var b = document.getElementById("hy3dBubble");
      if (b && b.classList.contains("is-collapsed")) {
        b.classList.remove("is-collapsed");
        react("cheer");
        return;
      }
      var tip = GENERAL_TIPS[state.tipIndex % GENERAL_TIPS.length];
      state.tipIndex++;
      say(tip[0], tip[1], tip[2], 11000);
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        var b = document.getElementById("hy3dBubble");
        if (b) b.classList.add("is-collapsed");
      });
    }

    document.addEventListener("click", function (e) {
      if (widget.classList.contains("is-hidden")) return;
      var btn = e.target.closest ? e.target.closest(".mcq-opt, .quiz-option, #checkDictation, #fillCheck") : null;
      if (btn) {
        setTimeout(function () {
          if (btn.classList.contains("correct") || document.querySelector(".dictation-result.correct")) {
            react("cheer");
          }
        }, 60);
      }
    });

    var lastT = performance.now();
    function render(now) {
      requestAnimationFrame(render);
      if (widget.classList.contains("is-hidden")) return;

      var dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      var t = now * 0.001;

      state.lookX += (state.targetX - state.lookX) * Math.min(1, dt * 7.5);
      state.lookY += (state.targetY - state.lookY) * Math.min(1, dt * 7.5);

      if (state.waveBoost > 0) state.waveBoost = Math.max(0, state.waveBoost - dt);

      if (state.jumpY > 0 || state.jumpVel !== 0) {
        state.jumpY += state.jumpVel * dt;
        state.jumpVel -= 720 * dt;
        if (state.jumpY <= 0) {
          state.jumpY = 0;
          state.jumpVel = 0;
        }
      }

      if (fig) {
        var ry = (state.lookX * 15).toFixed(2);
        var rx = (-state.lookY * 9).toFixed(2);
        fig.style.transform =
          "perspective(560px) rotateY(" + ry + "deg) rotateX(" + rx + "deg)";
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!loaded) return;

      // Smooth floating bob + Pixar squash-and-stretch breathing
      var floatY = Math.sin(t * 2.8) * 6.0 - state.jumpY;
      var breatheX = 1 + Math.sin(t * 2.8) * 0.014 - (state.jumpY > 0 ? 0.02 : 0);
      var breatheY = 1 - Math.sin(t * 2.8) * 0.014 + (state.jumpY > 0 ? 0.035 : 0);
      var swayRot =
        state.lookX * 0.035 +
        Math.sin(t * (state.waveBoost > 0 ? 8.5 : 2.2)) * (state.waveBoost > 0 ? 0.035 : 0.014);

      // Soft ground shadow under the auspicious cloud
      var shadowScale = Math.max(0.6, 1 - (state.jumpY - floatY) * 0.005);
      ctx.save();
      ctx.translate(150, 464);
      ctx.scale(shadowScale, 0.22 * shadowScale);
      var grad = ctx.createRadialGradient(0, 0, 8, 0, 0, 92);
      grad.addColorStop(0, "rgba(25, 59, 57, 0.26)");
      grad.addColorStop(1, "rgba(25, 59, 57, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 92, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw crisp, seamless 3D Pixar Character (with 64px top headroom so jumps never clip)
      var dstW = 208;
      var dstH = 398;
      ctx.save();
      ctx.translate(150 + state.lookX * 4, 462 + floatY);
      ctx.rotate(swayRot);
      ctx.scale(breatheX, breatheY);
      ctx.drawImage(img, -dstW / 2, -dstH, dstW, dstH);
      ctx.restore();

      // Ambient golden sparkles floating around the auspicious cloud
      if (Math.random() < 0.09) {
        state.sparkles.push({
          x: 150 + (Math.random() - 0.5) * 145,
          y: 410 + (Math.random() - 0.5) * 24,
          vx: (Math.random() - 0.5) * 15,
          vy: -24 - Math.random() * 26,
          r: 2.2 + Math.random() * 3.0,
          life: 0.95,
          maxLife: 0.95,
          gold: true
        });
      }

      for (var i = state.sparkles.length - 1; i >= 0; i--) {
        var p = state.sparkles[i];
        p.life -= dt;
        if (p.life <= 0) {
          state.sparkles.splice(i, 1);
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        var alpha = Math.max(0, p.life / p.maxLife);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(t * 3 + i);
        ctx.fillStyle = p.gold
          ? "rgba(242, 198, 75, " + alpha.toFixed(2) + ")"
          : "rgba(52, 163, 137, " + alpha.toFixed(2) + ")";
        ctx.beginPath();
        var r = p.r * alpha;
        ctx.moveTo(0, -r * 1.7);
        ctx.quadraticCurveTo(r * 0.3, -r * 0.3, r * 1.7, 0);
        ctx.quadraticCurveTo(r * 0.3, r * 0.3, 0, r * 1.7);
        ctx.quadraticCurveTo(-r * 0.3, r * 0.3, -r * 1.7, 0);
        ctx.quadraticCurveTo(-r * 0.3, r * 0.3, 0, -r * 1.7);
        ctx.fill();
        ctx.restore();
      }
    }

    requestAnimationFrame(render);
  }

  /* ---------- 4. Interactive 3D EdTech Card Tilt Engine ---------- */
  function init3DCardTilt() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var activeCard = null;
    document.addEventListener("mousemove", function (e) {
      var card = e.target.closest
        ? e.target.closest(".level-card, .gz-card, .vocab-card, .grammar-card, .srs-stat")
        : null;
      if (activeCard && activeCard !== card) {
        activeCard.style.transform = "";
        activeCard = null;
      }
      if (!card) return;
      activeCard = card;
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / (r.width || 1) - 0.5;
      var y = (e.clientY - r.top) / (r.height || 1) - 0.5;
      var rx = (-y * 5.0).toFixed(2);
      var ry = (x * 6.0).toFixed(2);
      card.style.transform = "perspective(900px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) translateY(-4px)";
    }, { passive: true });

    document.addEventListener("mouseleave", function () {
      if (activeCard) {
        activeCard.style.transform = "";
        activeCard = null;
      }
    }, true);
  }
})();
