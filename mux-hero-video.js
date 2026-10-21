/* Hyperix cinematic playlist: public Mux HLS, no third-party player UI. */
(function () {
  'use strict';
  const backdrop = document.querySelector('.hero-video-backdrop');
  const wrap = document.getElementById('mux-player');
  const hero = document.getElementById('top');
  const toggle = document.getElementById('video-toggle-btn');
  const label = document.getElementById('video-toggle-label');
  if (!backdrop || !wrap || !hero || !toggle) return;

  const assets = [
    { name: 'MC1', id: '00m4KvMbPUiaNbc02QT8U83UvsiG89200uB5yTbpWkobHY' },
    { name: 'MC2', id: 'seVqgltNya0099900pZysNjdlXJbrw4cUd4P9Dgo2sQFk' },
    { name: 'MC3', id: 'rhA866nNT8M02v7eO7qyjVX34wf9KqEKAbQIFKGiQ8CE' }
  ];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const video = document.createElement('video');
  video.muted = true;
  video.autoplay = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.setAttribute('playsinline', '');
  video.setAttribute('aria-hidden', 'true');
  video.controls = false;
  let hls = null;
  let userPaused = false;
  let visible = true;
  let active = -1;
  let queue = [];
  let failed = false;
  let startupTimer = 0;
  let scrollQueued = false;
  let stagePresence = 1;

  function translate(key, fallback) {
    if (typeof translations === 'undefined' || typeof currentLang === 'undefined') return fallback;
    return (translations[currentLang] || translations.en)[key] || fallback;
  }
  function syncToggle() {
    toggle.classList.toggle('is-paused', userPaused);
    toggle.classList.toggle('user-paused', userPaused);
    toggle.setAttribute('aria-pressed', String(!userPaused));
    if (label) label.textContent = userPaused
      ? translate('video_ambient_paused', 'Video Paused')
      : translate('video_ambient_label', 'Ambient Video');
  }
  function shouldPlay() {
    return !failed && visible && !document.hidden && !userPaused && !reduced.matches;
  }
  function setMode(enabled) {
    backdrop.classList.toggle('is-playing', enabled);
    if (enabled || document.hidden || stagePresence < 0.02 || reduced.matches) {
      if (typeof window.stopThreeScene === 'function') window.stopThreeScene();
    } else if (typeof window.startThreeScene === 'function') window.startThreeScene();
  }
  function showPosterOnError() {
    if (failed) return;
    failed = true;
    window.clearTimeout(startupTimer);
    video.pause();
    if (hls) { hls.destroy(); hls = null; }
    backdrop.classList.remove('is-frame-ready', 'is-playing');
    toggle.classList.remove('is-visible');
    setMode(false);
    console.warn('Hyperix: Mux hero playback unavailable; retaining static background.');
  }
  function shuffleQueue() {
    const pool = assets.map((_, i) => i).filter(i => i !== active);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    queue = pool;
  }
  function nextIndex() {
    if (!queue.length) shuffleQueue();
    return queue.shift();
  }
  function playIfAllowed() {
    if (!shouldPlay()) { video.pause(); return; }
    const result = video.play();
    if (result && typeof result.catch === 'function') result.catch(function () {
      // Autoplay may be blocked; keep the static poster rather than looping.
    });
  }
  function select(index) {
    active = index;
    backdrop.classList.remove('is-frame-ready');
    video.pause();
    window.clearTimeout(startupTimer);
    // A stalled/unavailable Mux asset must never leave the Hero empty.
    startupTimer = window.setTimeout(showPosterOnError, 14000);
    const url = 'https://stream.mux.com/' + assets[index].id + '.m3u8';
    if (hls) hls.loadSource(url);
    else { video.src = url; video.load(); }
    playIfAllowed();
  }
  function updateVisibility() {
    const box = hero.getBoundingClientRect();
    // Hysteresis prevents rapid pause/play while scrolling at the edge.
    visible = visible ? box.bottom > 0 : box.bottom > window.innerHeight * 0.12;
    playIfAllowed();
  }
  function updateStage() {
    const box = hero.getBoundingClientRect();
    const top = window.scrollY + box.top;
    const bottom = window.scrollY + box.bottom;
    const start = top + box.height * 0.12;
    const end = Math.max(start + 1, bottom - window.innerHeight * 0.24);
    const t = Math.max(0, Math.min(1, (window.scrollY - start) / (end - start)));
    const smooth = t * t * t * (t * (t * 6 - 15) + 10);
    stagePresence = 1 - smooth;
    backdrop.style.setProperty('--hero-presence', stagePresence.toFixed(4));
    toggle.classList.toggle('is-offstage', stagePresence < 0.02);
    updateVisibility();
  }
  function scrollUpdate() {
    if (scrollQueued) return;
    scrollQueued = true;
    window.requestAnimationFrame(function () { scrollQueued = false; updateStage(); });
  }

  video.addEventListener('playing', function () {
    if (!shouldPlay()) { video.pause(); return; }
    window.clearTimeout(startupTimer);
    backdrop.classList.add('is-frame-ready');
    document.body.classList.add('cinematic-loaded');
    setMode(true);
    toggle.classList.add('is-visible');
  });
  video.addEventListener('ended', function () { select(nextIndex()); });
  video.addEventListener('canplay', playIfAllowed);
  video.addEventListener('error', showPosterOnError);
  video.addEventListener('waiting', function () {
    // Keep the last displayed frame during buffering; do not flash poster.
  });
  toggle.addEventListener('click', function () {
    userPaused = !userPaused;
    syncToggle();
    playIfAllowed();
    if (userPaused) setMode(false);
  });
  document.querySelectorAll('.lang-btn').forEach(function (b) { b.addEventListener('click', syncToggle); });
  document.addEventListener('visibilitychange', playIfAllowed);
  window.addEventListener('scroll', scrollUpdate, { passive: true });
  window.addEventListener('resize', scrollUpdate, { passive: true });
  if (typeof reduced.addEventListener === 'function') reduced.addEventListener('change', playIfAllowed);

  // Mux is the sole media source. On failure the cinematic backdrop stays static.
  wrap.appendChild(video);
  syncToggle();
  updateStage();
  if (reduced.matches) { setMode(false); return; }
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    select(nextIndex());
  } else {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
    script.async = true;
    script.onload = function () {
      if (!window.Hls || !window.Hls.isSupported()) { showPosterOnError(); return; }
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: false, capLevelToPlayerSize: true });
      hls.on(window.Hls.Events.ERROR, function (_, data) { if (data.fatal) showPosterOnError(); });
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MEDIA_ATTACHED, function () { select(nextIndex()); });
    };
    script.onerror = showPosterOnError;
    document.head.appendChild(script);
  }
})();