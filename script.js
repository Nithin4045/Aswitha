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
  function fmtTime(sec) {
    const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    return pad(m) + ":" + pad(s);
  }

  /* ---- Music: plays media/bgm.mp3 if present, synth fallback otherwise ---- */
  const musicBtn = $("#music-btn");
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  let musicPlaying = false;
  let usingFile    = false;
  let audioEl = null, fadeIv = null;
  const FILE_VOL = 0.6;

  function fadeAudio(from, to, ms, done) {
    clearInterval(fadeIv);
    const steps = 30, dv = (to - from) / steps;
    let v = from, n = 0;
    fadeIv = setInterval(() => {
      v = Math.max(0, Math.min(1, v + dv)); n++;
      if (audioEl) audioEl.volume = v;
      if (n >= steps) { clearInterval(fadeIv); if (done) done(); }
    }, ms / steps);
  }

  const chords    = [[60,64,67,72],[59,62,67,71],[57,60,64,69],[53,57,60,65]];
  const bassN     = [36,43,45,41];
  const melA      = [72,74,76,74,72,71,69,71];
  const melB      = [76,74,72,71,72,74,76,77];
  const arpPat    = [0,2,1,3,2,3,1,2];
  const beat      = 60/88, barLen = beat*4;
  const activeNotes = new Set();
  let musicCtx = null, musicGain = null;
  let musicTimer = null, suspendTimer = null;
  let nextBarAt = 0, musicBar = 0;

  function stopNotes() { activeNotes.forEach(o=>{try{o.stop();}catch(e){}}); activeNotes.clear(); }

  function playNote(midi,t,dur,type,vol) {
    const osc=musicCtx.createOscillator(), env=musicCtx.createGain();
    osc.type=type; osc.frequency.value=440*Math.pow(2,(midi-69)/12);
    env.gain.setValueAtTime(0.0001,t);
    env.gain.exponentialRampToValueAtTime(vol,t+0.08);
    env.gain.setValueAtTime(vol,t+dur*0.7);
    env.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    osc.connect(env); env.connect(musicGain);
    osc.onended=()=>{activeNotes.delete(osc);osc.disconnect();env.disconnect();};
    activeNotes.add(osc); osc.start(t); osc.stop(t+dur+0.04);
  }

  function buildReverb() {
    const len=musicCtx.sampleRate*1.8, buf=musicCtx.createBuffer(2,len,musicCtx.sampleRate);
    for(let c=0;c<2;c++){const d=buf.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.5);}
    const conv=musicCtx.createConvolver(); conv.buffer=buf;
    const wet=musicCtx.createGain(); wet.gain.value=0.18;
    conv.connect(wet); wet.connect(musicGain);
  }

  function scheduleMusicBar() {
    if (!musicPlaying || usingFile) return;
    const t0=Math.max(musicCtx.currentTime+0.04,nextBarAt), ci=musicBar%chords.length;
    const chord=chords[ci], bass=bassN[ci], mel=musicBar%4<2?melA:melB;
    chord.forEach((n,ni)=>playNote(n,t0+ni*0.06,barLen*0.92,"sine",0.07));
    playNote(bass,t0,barLen*0.88,"sine",0.13);
    playNote(bass+12,t0+barLen*0.5,barLen*0.38,"sine",0.07);
    mel.forEach((n,i)=>playNote(n,t0+i*beat*0.5,beat*0.68,"triangle",0.11));
    arpPat.forEach((ci2,i)=>playNote(chord[ci2%chord.length]+12,t0+i*(barLen/arpPat.length),beat*0.32,"sine",0.04));
    musicBar++; nextBarAt=t0+barLen;
    musicTimer=setTimeout(scheduleMusicBar,Math.max(0,(nextBarAt-musicCtx.currentTime-0.25)*1000));
  }

  function setMusicButton(on, label) {
    musicBtn.classList.toggle("on", on);
    musicBtn.setAttribute("aria-pressed", String(on));
    musicBtn.setAttribute("aria-label", label);
    musicBtn.title = label;
    musicBtn.querySelector(".music-label").textContent = on ? "Music on" : label;
  }

  function playMusic() {
    musicBtn.classList.remove("hidden");
    const bgmSrc = C.bgmFile ? "media/" + C.bgmFile : null;
    if (bgmSrc) {
      if (!audioEl) {
        audioEl = new Audio();
        audioEl.loop = true;
        audioEl.volume = 0;
        audioEl.preload = "auto";
        audioEl.src = bgmSrc;

        let altTried = false;
        audioEl.addEventListener("error", () => {
          if (!altTried && C.bgmFile) {
            altTried = true;
            const alt = C.bgmFile.endsWith(".mp3.mp3")
              ? C.bgmFile.replace(/\.mp3\.mp3$/, ".mp3")
              : (C.bgmFile.endsWith(".mp3") ? C.bgmFile + ".mp3" : C.bgmFile + ".mp3");
            audioEl.src = "media/" + alt;
            audioEl.load();
            if (musicPlaying) {
              audioEl.play().catch(() => {});
            }
            return;
          }
          usingFile = false;
          playMusicSynth();
        });
      }

      usingFile = true;
      audioEl.play().then(() => {
        fadeAudio(audioEl.volume || 0, FILE_VOL, 1400);
        musicPlaying = true;
        setMusicButton(true, "Pause background music");
      }).catch((err) => {
        if (err && err.name === "NotAllowedError") {
          musicPlaying = false;
          setMusicButton(false, "Tap to play background music");
        } else if (!usingFile) {
          playMusicSynth();
        } else {
          setMusicButton(false, "Tap to play background music");
        }
      });
      return;
    }
    playMusicSynth();
  }

  function playMusicSynth() {
    if (!AudioContextClass) { setMusicButton(false, "Music unavailable"); return; }
    if (!musicCtx) {
      musicCtx = new AudioContextClass();
      musicGain = musicCtx.createGain();
      musicGain.gain.value = 0;
      musicGain.connect(musicCtx.destination);
      setTimeout(() => { try { buildReverb(); } catch(e) {} }, 100);
    }
    clearTimeout(suspendTimer);
    musicCtx.resume().then(() => {
      if (musicPlaying) return;
      musicPlaying = true;
      musicGain.gain.cancelScheduledValues(musicCtx.currentTime);
      musicGain.gain.setTargetAtTime(0.6, musicCtx.currentTime, 0.8);
      nextBarAt = musicCtx.currentTime + 0.05;
      scheduleMusicBar();
      setMusicButton(true, "Pause background music");
    }).catch(() => setMusicButton(false, "Tap to play background music"));
  }

  function pauseMusic() {
    musicPlaying = false;
    if (usingFile && audioEl) {
      fadeAudio(audioEl.volume || FILE_VOL, 0, 700, () => audioEl.pause());
      setMusicButton(false, "Play background music");
      return;
    }
    clearTimeout(musicTimer); stopNotes();
    if (musicCtx && musicGain) {
      musicGain.gain.cancelScheduledValues(musicCtx.currentTime);
      musicGain.gain.setTargetAtTime(0, musicCtx.currentTime, 0.12);
      suspendTimer = setTimeout(() => { if (!musicPlaying) musicCtx.suspend(); }, 500);
    }
    setMusicButton(false, "Play background music");
  }

  musicBtn.addEventListener("click", () => musicPlaying ? pauseMusic() : playMusic());
  musicBtn.classList.remove("hidden");
  setMusicButton(false, "Tap to play background music");
  playMusic();

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
    if (!C.passcode) {
      show("#gate");
      $("#gate-form").classList.add("hidden");
      $("#gate").addEventListener("click", () => { playMusic(); startOpening(); }, { once: true });
      $("#gate-hint").textContent = "Tap your ticket to enter";
      return;
    }
    show("#gate");
    $("#gate-hint").textContent = C.passcodeHint || "";
    $("#gate-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const v = $("#gate-input").value.replace(/\D/g, "");
      if (v === String(C.passcode).replace(/\D/g, "")) {
        playMusic();
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
    if (!musicPlaying) playMusic();
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

  /* ---------- Media helpers ---------- */
  const isVideo = (f) => /\.(mp4|webm|mov|m4v)$/i.test(f);
  const norm = (m) => typeof m === "string" ? { file: m, caption: "" } : m;
  const rotations = [-3, 2.5, -1.5, 3, -2.5, 1.5];
  let rot = 0;

  /* Keep track of all videos so we can pause others when one plays */
  const allVideos = new Set();

  function placeholder(file) {
    const p = el("div", "placeholder");
    p.append(el("div", "ic", isVideo(file) ? "🎬" : "📷"), el("div", null, "Add " + (isVideo(file) ? "video" : "photo") + ":"), el("code", null, "media/" + file));
    return p;
  }

  /* Build a custom video player that has AUDIO (not muted) */
  function buildVideoPlayer(src, onMissing) {
    const wrap = el("div", "vid-wrap");

    const vid = el("video");
    vid.src = src;
    vid.playsInline = true;
    vid.preload = "metadata";
    // Do NOT set muted — let audio play natively

    // Play button overlay
    const playBtn = el("button", "play-btn");
    playBtn.setAttribute("aria-label", "Play video");
    playBtn.innerHTML = `<svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="26" cy="26" r="25" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.8)" stroke-width="1.5"/>
      <path d="M21 16.5L37 26L21 35.5V16.5Z" fill="white"/>
    </svg>`;

    // Controls bar
    const controls = el("div", "vid-controls");
    const progress = el("div", "vid-progress");
    const fill = el("div", "vid-progress-fill");
    const muteBtn = el("button", "vid-mute");
    muteBtn.title = "Toggle mute";
    muteBtn.textContent = "🔊";
    const timeLabel = el("span", "vid-time", "0:00");
    progress.append(fill);
    controls.append(progress, muteBtn, timeLabel);

    wrap.append(vid, playBtn, controls);

    // Toggle play/pause
    function togglePlay() {
      if (vid.paused) {
        // Pause all other videos
        allVideos.forEach(v => { if (v !== vid && !v.paused) v.pause(); });
        if (musicPlaying) {
          pauseMusic();
          const resume = () => { playMusic(); };
          vid.addEventListener("pause", resume, { once: true });
          vid.addEventListener("ended", resume, { once: true });
        }
        vid.play().catch(() => {});
        wrap.classList.add("playing");
        playBtn.innerHTML = `<svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="26" cy="26" r="25" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.8)" stroke-width="1.5"/>
          <rect x="17" y="16" width="6" height="20" rx="2" fill="white"/>
          <rect x="29" y="16" width="6" height="20" rx="2" fill="white"/>
        </svg>`;
      } else {
        vid.pause();
        wrap.classList.remove("playing");
        playBtn.innerHTML = `<svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="26" cy="26" r="25" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.8)" stroke-width="1.5"/>
          <path d="M21 16.5L37 26L21 35.5V16.5Z" fill="white"/>
        </svg>`;
      }
    }

    playBtn.addEventListener("click", (e) => { e.stopPropagation(); togglePlay(); });
    vid.addEventListener("click", () => togglePlay());

    // Mute toggle
    muteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      vid.muted = !vid.muted;
      muteBtn.textContent = vid.muted ? "🔇" : "🔊";
    });

    // Progress bar
    vid.addEventListener("timeupdate", () => {
      if (!vid.duration) return;
      fill.style.width = (vid.currentTime / vid.duration * 100) + "%";
      timeLabel.textContent = fmtTime(vid.currentTime) + " / " + fmtTime(vid.duration);
    });
    progress.addEventListener("click", (e) => {
      const rect = progress.getBoundingClientRect();
      vid.currentTime = ((e.clientX - rect.left) / rect.width) * vid.duration;
    });

    // Ended state
    vid.addEventListener("ended", () => {
      wrap.classList.remove("playing");
      playBtn.innerHTML = `<svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="26" cy="26" r="25" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.8)" stroke-width="1.5"/>
        <path d="M21 16.5L37 26L21 35.5V16.5Z" fill="white"/>
      </svg>`;
    });

    vid.addEventListener("error", () => { wrap.replaceWith(placeholder(src.replace("media/", ""))); onMissing && onMissing(); });

    allVideos.add(vid);
    return wrap;
  }

  function mediaNode(file, onMissing) {
    const src = "media/" + file;
    if (isVideo(file)) {
      return buildVideoPlayer(src, onMissing);
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
    // Lightbox only for images
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
    n.src = "media/" + m.file;
    if (n.tagName === "VIDEO") { n.controls = true; n.autoplay = true; n.playsInline = true; }
    else n.alt = "";
    lbInner.append(n);
    if (m.caption) lbInner.append(el("p", null, m.caption));
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
        if (isVideo(m.file)) {
          cell.style.cursor = "default";
          cell.append(buildVideoPlayer("media/" + m.file, () => cell.classList.add("empty")));
        } else {
          const img = el("img"); img.src = "media/" + m.file; img.alt = ""; img.loading = "lazy";
          img.addEventListener("error", () => { img.replaceWith(placeholder(m.file)); cell.classList.add("empty"); });
          cell.append(img);
          cell.addEventListener("click", () => !cell.classList.contains("empty") && openLightbox(m));
        }
        reel.append(cell);
      });
      strip.append(reel);
      im.append(strip, el("p", "hint reel-hint", "swipe ←  →"));
      wrap.append(im);
    }
  });

  /* ---------- Gallery ---------- */
  const gallerySection = document.getElementById("our-gallery");
  const galleryGrid = document.getElementById("gallery-grid");
  const galleryList = (C.gallery || []).map(norm);

  if (!galleryList.length) {
    // Show friendly empty state
    const empty = el("div", "gallery-empty");
    empty.innerHTML = `<div class="gallery-empty-icon">🌸</div>
      <p>Our gallery is being curated…</p>
      <small>Drop photos into the <b>gallery</b> folder and list the filenames in config.js → <code>gallery: []</code></small>`;
    galleryGrid.append(empty);
  } else {
    galleryList.forEach((m, i) => {
      const item = el("div", "gallery-item");
      // Vary row-span for a masonry feel
      const heights = [180, 240, 200, 280, 160, 220];
      item.style.setProperty("--h", heights[i % heights.length] + "px");

      const img = el("img");
      img.src = "gallery/" + m.file;
      img.alt = m.caption || "";
      img.loading = "lazy";
      img.decoding = "async";
      img.style.minHeight = heights[i % heights.length] + "px";
      img.style.maxHeight = "360px";

      img.addEventListener("error", () => {
        item.innerHTML = "";
        const ph = el("div", "placeholder");
        ph.style.minHeight = "160px";
        ph.append(el("div", "ic", "📷"), el("div", null, "Add photo:"), el("code", null, "gallery/" + m.file));
        item.append(ph);
        item.classList.add("empty");
        item.style.cursor = "default";
      });

      const overlay = el("div", "gallery-overlay");
      if (m.caption) overlay.append(el("span", "gallery-caption", m.caption));

      item.append(img, overlay);
      item.addEventListener("click", () => {
        if (!item.classList.contains("empty")) {
          lbInner.innerHTML = "";
          const ln = el("img"); ln.src = "gallery/" + m.file; ln.alt = m.caption || "";
          lbInner.append(ln);
          if (m.caption) lbInner.append(el("p", null, m.caption));
          lb.classList.remove("hidden");
        }
      });

      galleryGrid.append(item);
    });
  }

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
    }), { threshold: 0.15 });
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