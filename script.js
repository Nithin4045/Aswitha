(() => {
  "use strict";
  const C = window.CONFIG;
  const $ = (s) => document.querySelector(s);
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const params = new URLSearchParams(location.search);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- Theme & names ---------- */
  document.body.dataset.theme = params.get("theme") || C.theme || "cinema";
  document.querySelectorAll("[data-her]").forEach(n => n.textContent = C.her);
  document.querySelectorAll("[data-me]").forEach(n => n.textContent = C.me);
  document.querySelectorAll("[data-her-initial]").forEach(n => n.textContent = C.her.charAt(0));
  document.title = "For " + C.her;

  /* ---------- Time helpers ---------- */
  const pad = (n) => String(n).padStart(2, "0");
  const addMonths = (d, n) => { const x = new Date(d); x.setMonth(x.getMonth() + n); return x; };
  function parts(from, to) {
    let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
    if (addMonths(from, months) > to) months--;
    months = Math.max(0, months);
    let r = Math.max(0, to - addMonths(from, months));
    const S = 1e3, M = 60 * S, H = 60 * M, D = 24 * H, W = 7 * D;
    const weeks = Math.floor(r / W); r -= weeks * W;
    const days = Math.floor(r / D); r -= days * D;
    const hours = Math.floor(r / H); r -= hours * H;
    const mins = Math.floor(r / M); r -= mins * M;
    return { Months: months, Weeks: weeks, Days: days, Hours: hours, Minutes: mins, Seconds: Math.floor(r / S) };
  }
  function renderClock(node, obj) {
    if (!node.children.length) Object.keys(obj).forEach(k => { const u = el("div", "unit"); u.append(el("b"), el("span", null, k)); node.append(u); });
    Object.values(obj).forEach((v, i) => node.children[i].firstChild.textContent = pad(v));
  }

  /* ---------- Music ---------- */
  const audio = $("#music"), musicBtn = $("#music-btn");
  let musicOk = !!C.music;
  if (musicOk) {
    audio.src = C.music;
    audio.addEventListener("error", () => { musicOk = false; musicBtn.classList.add("hidden"); });
    musicBtn.addEventListener("click", () => audio.paused ? playMusic() : pauseMusic());
  }
  function playMusic() {
    if (!musicOk) return;
    audio.volume = 0;
    audio.play().then(() => {
      musicBtn.classList.remove("hidden"); musicBtn.classList.add("on");
      let v = 0; const f = setInterval(() => { v = Math.min(.6, v + .03); audio.volume = v; if (v >= .6) clearInterval(f); }, 120);
    }).catch(() => {});
  }
  function pauseMusic() { audio.pause(); musicBtn.classList.remove("on"); }

  /* ---------- Flow ---------- */
  const screens = ["#countdown", "#gate", "#opening"];
  const show = (id) => screens.forEach(s => $(s).classList.toggle("hidden", s !== id));
  const bday = new Date(C.birthday);

  function startCountdown() {
    show("#countdown");
    const clock = $("#cd-clock");
    const tick = () => {
      const ms = bday - Date.now();
      if (ms <= 0) { clearInterval(t); startGate(); return; }
      const s = Math.floor(ms / 1000);
      renderClock(clock, { Days: Math.floor(s / 86400), Hours: Math.floor(s % 86400 / 3600), Minutes: Math.floor(s % 3600 / 60), Seconds: s % 60 });
    };
    const t = setInterval(tick, 1000); tick();
  }

  function startGate() {
    if (!C.passcode) { show("#gate"); $("#gate-form").classList.add("hidden"); $("#gate").addEventListener("click", () => { playMusic(); startOpening(); }, { once: true }); $("#gate-hint").textContent = "Tap your ticket to enter"; return; }
    show("#gate");
    $("#gate-hint").textContent = C.passcodeHint || "";
    $("#gate-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const v = $("#gate-input").value.replace(/\D/g, "");
      if (v === String(C.passcode).replace(/\D/g, "")) {
        playMusic();          // the tap on "Enter" lets the browser start the music
        startOpening();
      } else {
        $("#gate-error").textContent = "Not quite… think of a blue T-shirt 💙";
        const t = $(".ticket"); t.classList.remove("shake"); void t.offsetWidth; t.classList.add("shake");
      }
    });
  }

  function startOpening() {
    show("#opening");
    const num = $("#leader-num"), sweep = $(".leader-sweep");
    let n = 3;
    const runTitles = () => { $("#leader").classList.add("hidden"); $("#titles").classList.remove("hidden"); };
    if (reduced) return runTitles();
    const step = () => {
      num.textContent = n;
      const t0 = performance.now();
      const anim = (now) => {
        const k = Math.min(1, (now - t0) / 1000);
        sweep.style.setProperty("--a", (k * 360) + "deg");
        if (k < 1) requestAnimationFrame(anim);
        else if (--n > 0) step(); else runTitles();
      };
      requestAnimationFrame(anim);
    };
    step();
  }

  $("#begin-btn").addEventListener("click", () => {
    if (audio.paused) playMusic();
    const o = $("#opening"); o.classList.add("fade-out");
    setTimeout(() => {
      o.classList.add("hidden");
      const m = $("#movie"); m.classList.remove("hidden"); m.classList.add("enter");
      window.scrollTo(0, 0);
      observeAll();
    }, 900);
  });

  if (C.lockUntilBirthday && Date.now() < bday && !params.has("preview")) startCountdown();
  else startGate();

  /* ---------- Live counter ---------- */
  const firstSaw = new Date(C.firstSaw), live = $("#live-clock");
  const liveTick = () => renderClock(live, parts(firstSaw, new Date()));
  liveTick(); setInterval(liveTick, 1000);

  /* ---------- Media ---------- */
  const isVideo = (f) => /\.(mp4|webm|mov|m4v)$/i.test(f);
  const norm = (m) => typeof m === "string" ? { file: m, caption: "" } : m;
  const rotations = [-3, 2.5, -1.5, 3, -2.5, 1.5];
  let rot = 0;

  function placeholder(file) {
    const p = el("div", "placeholder");
    p.append(el("div", "ic", isVideo(file) ? "🎬" : "📷"), el("div", null, "Add " + (isVideo(file) ? "video" : "photo") + ":"), el("code", null, "media/" + file));
    return p;
  }
  function mediaNode(file, onMissing) {
    const src = "media/" + file;
    if (isVideo(file)) {
      const v = el("video"); v.src = src; v.controls = true; v.playsInline = true; v.preload = "metadata";
      v.addEventListener("error", () => { v.replaceWith(placeholder(file)); onMissing && onMissing(); });
      v.addEventListener("play", () => {
        if (!audio.paused) { pauseMusic(); const back = () => playMusic(); v.addEventListener("pause", back, { once: true }); v.addEventListener("ended", back, { once: true }); }
      });
      return v;
    }
    const i = el("img"); i.src = src; i.alt = ""; i.loading = "lazy"; i.decoding = "async";
    i.addEventListener("error", () => { i.replaceWith(placeholder(file)); onMissing && onMissing(); });
    return i;
  }
  function polaroid(m) {
    m = norm(m);
    const f = el("figure", "polaroid");
    f.style.setProperty("--r", rotations[rot++ % rotations.length] + "deg");
    const node = mediaNode(m.file, () => f.classList.add("empty"));
    f.append(node, el("figcaption", null, m.caption || ""));
    if (!isVideo(m.file)) f.addEventListener("click", () => !f.classList.contains("empty") && openLightbox(m));
    return f;
  }
  function mediaGroup(list) {
    const g = el("div", "media" + (list.length === 2 ? " two" : ""));
    list.forEach(m => g.append(polaroid(m)));
    return g;
  }

  /* ---------- Lightbox ---------- */
  const lb = $("#lightbox"), lbInner = $("#lb-inner");
  function openLightbox(m) {
    lbInner.innerHTML = "";
    const n = isVideo(m.file) ? el("video") : el("img");
    n.src = "media/" + m.file; if (n.tagName === "VIDEO") { n.controls = true; n.autoplay = true; n.playsInline = true; } else n.alt = "";
    lbInner.append(n); if (m.caption) lbInner.append(el("p", null, m.caption));
    lb.classList.remove("hidden");
  }
  const closeLb = () => { lb.classList.add("hidden"); lbInner.innerHTML = ""; };
  $("#lb-close").addEventListener("click", closeLb);
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeLb(); });

  /* ---------- Chapters ---------- */
  const wrap = $("#chapters");
  const reelAfter = Math.floor(C.chapters.length / 2) - 1;
  let flip = false;
  C.chapters.forEach((ch, i) => {
    const has = ch.media && ch.media.length;
    const s = el("section", "chapter reveal " + (has ? "has-media" : "no-media"));
    if (has) { if (flip) s.classList.add("flip"); flip = !flip; }

    const t = el("div", "ch-text");
    t.append(el("div", "ch-num", pad(i + 1)),
             el("p", "ch-label", "Chapter " + (i + 1)),
             el("p", "ch-date", ch.date),
             el("p", "ch-place", ch.place),
             el("h2", "ch-title", ch.title));
    ch.text.forEach(p => t.append(el("p", "story", p)));

    if (ch.gap) {
      const from = new Date(ch.gap.from), to = new Date(ch.gap.to), ms = to - from;
      const g = el("div", "gap"), c = el("div", "clock");
      const fmt = (n) => n.toLocaleString("en-IN");
      g.append(el("p", "eyebrow", ch.gap.label), c,
        el("p", "total", `${fmt(Math.round(ms / 864e5))} days · ${fmt(ms / 36e5)} hours · ${fmt(ms / 6e4)} minutes · ${fmt(ms / 1e3)} seconds`));
      renderClock(c, parts(from, from));
      s._onShow = () => {
        if (reduced) return renderClock(c, parts(from, to));
        const t0 = performance.now(), dur = 3800;
        const run = (now) => { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
          renderClock(c, parts(from, new Date(from.getTime() + ms * e))); if (k < 1) requestAnimationFrame(run); };
        requestAnimationFrame(run);
      };
      t.append(g);
    }
    s.append(t);
    if (has) s.append(mediaGroup(ch.media));
    wrap.append(s);

    if (i === reelAfter && C.reel && C.reel.length) {
      const im = el("section", "intermission reveal");
      im.append(el("p", "eyebrow", "Intermission"), el("h2", null, "Our Little Reel"));
      const strip = el("div", "filmstrip"), reel = el("div", "reel");
      C.reel.forEach(m => {
        m = norm(m);
        const cell = el("div", "cell");
        const node = mediaNode(m.file, () => cell.classList.add("empty"));
        cell.append(node);
        if (!isVideo(m.file)) cell.addEventListener("click", () => !cell.classList.contains("empty") && openLightbox(m));
        reel.append(cell);
      });
      strip.append(reel);
      im.append(strip, el("p", "hint reel-hint", "swipe ←  →"));
      wrap.append(im);
    }
  });

  /* ---------- Birthday ---------- */
  if (C.birthdayPhoto) $("#bday-media").append(mediaGroup([C.birthdayPhoto]));
  $("#bday-note").textContent = C.birthdayNote;
  $("#hbd").textContent = "Happy Birthday, " + C.her;
  const cake = $("#cake");
  function blow() {
    if (cake.classList.contains("out")) return;
    cake.classList.add("out"); $("#flame").classList.add("out");
    cake.append(el("div", "smoke"));
    $("#cake-hint").textContent = "Your wish is safe with me ✨";
    $("#mic-btn").classList.add("hidden");
    $("#hbd").classList.remove("hidden");
    confetti(260);
    stopMic();
  }
  cake.addEventListener("click", blow);
  cake.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); blow(); } });

  // Blow into the microphone
  let micStream = null, micCtx = null;
  const stopMic = () => { if (micStream) micStream.getTracks().forEach(t => t.stop()); if (micCtx) micCtx.close().catch(() => {}); micStream = micCtx = null; };
  const micBtn = $("#mic-btn");
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) micBtn.classList.add("hidden");
  micBtn.addEventListener("click", async () => {
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micCtx = new (window.AudioContext || window.webkitAudioContext)();
      const an = micCtx.createAnalyser(); an.fftSize = 512;
      micCtx.createMediaStreamSource(micStream).connect(an);
      const buf = new Uint8Array(an.fftSize);
      micBtn.textContent = "Listening… blow now 🌬️";
      let loud = 0;
      const listen = () => {
        if (!micStream) return;
        an.getByteTimeDomainData(buf);
        let sum = 0; for (const v of buf) sum += ((v - 128) / 128) ** 2;
        const rms = Math.sqrt(sum / buf.length);
        loud = rms > 0.22 ? loud + 1 : Math.max(0, loud - 1);
        if (loud > 8) blow(); else requestAnimationFrame(listen);
      };
      listen();
    } catch (e) {
      micBtn.textContent = "No mic? Just tap the candle 🙂";
    }
  });

  /* ---------- Ending ---------- */
  const waysNum = $("#ways-num");
  function countWays() {
    const target = 1e9, t0 = performance.now(), dur = reduced ? 1 : 3200;
    const run = (now) => { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      waysNum.textContent = Math.round(target * e).toLocaleString("en-US"); if (k < 1) requestAnimationFrame(run); };
    requestAnimationFrame(run);
  }

  const chatBody = $("#chat-body"), typing = $("#typing"), chatStatus = $("#chat-status");
  const bubbles = C.endingChat.map(text => {
    const b = el("div", "bubble me", text); b.append(el("span", "tick", "✓✓"));
    chatBody.insertBefore(b, typing); return b;
  });
  typing.style.display = "none";
  function playChat() {
    bubbles.forEach((b, i) => setTimeout(() => b.classList.add("show"), 700 + i * 1300));
    setTimeout(() => { typing.style.display = ""; typing.classList.add("show"); chatStatus.textContent = "typing…"; }, 900 + bubbles.length * 1300);
  }
  $("#waiting").textContent = C.endingLast;

  function showHerReply(text) {
    typing.remove();
    const b = el("div", "bubble her", text); chatBody.append(b);
    requestAnimationFrame(() => b.classList.add("show"));
    chatStatus.textContent = "online";
  }

  const form = $("#reply-form"), status = $("#form-status"), wa = $("#wa-btn");
  if (!C.replyBox) form.remove();
  else {
    const prev = store.get("reply");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const msg = $("#reply-text").value.trim(); if (!msg) return;
      const when = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      wa.href = "https://wa.me/" + C.whatsapp + "?text=" + encodeURIComponent(msg);
      const btn = $("#send-btn"); btn.disabled = true; status.textContent = "Sending…";
      try {
        const res = await fetch("https://formsubmit.co/ajax/" + encodeURIComponent(C.email), {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ _subject: `💌 ${C.her} wrote back to you`, _template: "box", _captcha: "false", message: msg, sent_at: when })
        });
        if (!res.ok) throw new Error("send failed");
        store.set("reply", msg);
        form.classList.add("hidden");
        showHerReply(msg);
        $("#waiting").textContent = C.me + " got your message ❤️";
        confetti(160);
      } catch (err) {
        btn.disabled = false;
        status.textContent = "It didn't go through — tap below to send it on WhatsApp.";
        wa.classList.remove("hidden");
      }
    });
    if (prev) { form.classList.add("hidden"); playChat = (orig => () => { orig(); setTimeout(() => showHerReply(prev), 1200 + bubbles.length * 1300); })(playChat); }
  }

  /* ---------- Credits ---------- */
  const roll = $("#roll");
  roll.append(el("p", "role", "A film by"), el("p", "who", C.me));
  C.credits.forEach(([role, who]) => { const d = el("div"); d.append(el("p", "role", role), el("p", "who", who)); roll.append(d); });
  roll.append(el("p", "tbc", "to be continued…"), el("p", "script sign", C.me + " ♥ " + C.her));

  /* ---------- Observers & progress ---------- */
  function observeAll() {
    const io = new IntersectionObserver((entries) => entries.forEach(en => {
      if (!en.isIntersecting) return;
      const t = en.target;
      t.classList.add("in");
      if (t._onShow) t._onShow();
      if (t.classList.contains("ways")) countWays();
      if (t.id === "chat") playChat();
      if (t.id === "credits") roll.classList.add("play");
      io.unobserve(t);
    }), { threshold: 0.2 });
    document.querySelectorAll(".reveal, #credits").forEach(n => io.observe(n));
  }
  const bar = $("#progress-bar");
  addEventListener("scroll", () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%";
  }, { passive: true });

  /* ---------- Night sky ---------- */
  (function sky() {
    const cv = $("#sky"), ctx = cv.getContext("2d");
    const rgb = getComputedStyle(document.body).getPropertyValue("--star").trim();
    let W, H, stars = [], shoot = null;
    const fit = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = Array.from({ length: Math.round(W * H / 9000) }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.2 + .2, p: Math.random() * 6.28, s: .5 + Math.random() * 1.5 }));
    };
    fit(); addEventListener("resize", fit);
    const draw = (t) => {
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        const a = reduced ? .5 : .25 + .45 * (0.5 + 0.5 * Math.sin(s.p + t / 1000 * s.s));
        ctx.fillStyle = `rgba(${rgb},${a})`; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.28); ctx.fill();
      }
      if (!reduced) {
        if (!shoot && Math.random() < .003) shoot = { x: Math.random() * W * .7, y: Math.random() * H * .4, l: 0 };
        if (shoot) {
          shoot.l += 9; const x2 = shoot.x + shoot.l, y2 = shoot.y + shoot.l * .45;
          const g = ctx.createLinearGradient(shoot.x + shoot.l - 120, shoot.y + (shoot.l - 120) * .45, x2, y2);
          g.addColorStop(0, `rgba(${rgb},0)`); g.addColorStop(1, `rgba(${rgb},.85)`);
          ctx.strokeStyle = g; ctx.lineWidth = 1.4; ctx.beginPath();
          ctx.moveTo(Math.max(shoot.x, x2 - 120), y2 - Math.min(120, shoot.l) * .45); ctx.lineTo(x2, y2); ctx.stroke();
          if (shoot.l > 320) shoot = null;
        }
        requestAnimationFrame(draw);
      }
    };
    requestAnimationFrame(draw);
  })();

  /* ---------- Confetti & hearts ---------- */
  function heart(ctx, x, y, s) {
    ctx.beginPath(); ctx.moveTo(x, y + s / 4);
    ctx.bezierCurveTo(x, y, x - s / 2, y, x - s / 2, y + s / 4);
    ctx.bezierCurveTo(x - s / 2, y + s / 2, x, y + s * .7, x, y + s);
    ctx.bezierCurveTo(x, y + s * .7, x + s / 2, y + s / 2, x + s / 2, y + s / 4);
    ctx.bezierCurveTo(x + s / 2, y, x, y, x, y + s / 4); ctx.fill();
  }
  function confetti(n) {
    if (reduced) return;
    const cv = $("#fx"), ctx = cv.getContext("2d");
    cv.width = innerWidth; cv.height = innerHeight;
    const cs = getComputedStyle(document.body);
    const cols = [cs.getPropertyValue("--gold"), cs.getPropertyValue("--rose"), "#ffffff", "#ff5c7a"].map(c => c.trim());
    const bits = Array.from({ length: n }, (_, i) => {
      const left = i % 2 === 0;
      return { x: left ? -10 : innerWidth + 10, y: innerHeight * (.55 + Math.random() * .3),
        vx: (left ? 1 : -1) * (6 + Math.random() * 10), vy: -(10 + Math.random() * 14),
        r: 3 + Math.random() * 5, c: cols[i % cols.length], h: Math.random() < .35, rot: Math.random() * 6, vr: (Math.random() - .5) * .3 };
    });
    let f = 0;
    (function loop() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      for (const b of bits) {
        b.vy += .32; b.vx *= .985; b.vy *= .99; b.x += b.vx; b.y += b.vy; b.rot += b.vr;
        ctx.fillStyle = b.c;
        if (b.h) heart(ctx, b.x, b.y, b.r * 2.6);
        else { ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.rot); ctx.fillRect(-b.r, -b.r / 3, b.r * 2, b.r * .7); ctx.restore(); }
      }
      if (++f < 300) requestAnimationFrame(loop); else ctx.clearRect(0, 0, cv.width, cv.height);
    })();
  }
})();
