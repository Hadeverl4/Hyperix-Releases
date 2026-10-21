/* Hyperix cinematic playlist: public Mux HLS, no third-party player UI. */
(function () {
  'use strict';
  const backdrop = document.querySelector('.hero-video-backdrop');
  const poster = document.querySelector('.hero-video-poster');
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
  video.defaultMuted = true;
  video.setAttribute('muted', '');
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
  let mediaReady = false;
  let attemptedAssets = 0;
  const targetHeight = window.matchMedia('(max-width: 760px)').matches ? 720 : 1080;
  let hdLevel = -1;
  let revealCheck = 0;
  let transitioning = false;
  const TRANSITION_MS = 550;
  let transitionTimer = 0;
  let revealedAsset = -1;

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
  function showPosterOnError(reason) {
    if (failed) return;
    failed = true;
    window.clearTimeout(startupTimer);
    window.clearInterval(revealCheck);
    window.clearTimeout(transitionTimer);
    video.pause();
    if (hls) { hls.destroy(); hls = null; }
    backdrop.classList.remove('is-frame-ready', 'is-playing');
    toggle.classList.remove('is-visible');
    setMode(false);
    console.warn('Hyperix: Mux hero playback unavailable; retaining static background.', reason || 'unknown', assets[active] && assets[active].name, 'readyState=' + video.readyState, 'networkState=' + video.networkState);
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
    if (!mediaReady && !video.currentSrc && !video.src) return;
    const result = video.play();
    if (result && typeof result.catch === 'function') result.catch(function (err) {
      console.warn('Hyperix Mux play() failed:', err && err.name);
    });
  }
  function select(index) {
    transitioning = true;
    active = index;
    if (poster) poster.style.setProperty('--mux-poster',
      'url("https://image.mux.com/' + assets[index].id + '/thumbnail.jpg?width=1920&time=2")');
    attemptedAssets++;
    backdrop.classList.remove('is-frame-ready');
    revealedAsset = -1;
    video.pause();
    mediaReady = false;
    window.clearInterval(revealCheck);
    window.clearTimeout(startupTimer);
    // A stalled/unavailable Mux asset must never leave the Hero empty.
    startupTimer = window.setTimeout(function () {
      console.warn('Hyperix Mux startup timeout:', assets[active].name, 'readyState=' + video.readyState, 'networkState=' + video.networkState);
      if (attemptedAssets < assets.length) select(nextIndex());
      else showPosterOnError('all assets timed out');
    }, 9000);
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
    // A pause/resume event must not restart a reveal animation for the same
    // asset; it would flash the poster during normal HLS state changes.
    if (revealedAsset === active) return;
    // Never reveal a 270p/480p rendition merely because it is playing.
    window.clearInterval(revealCheck);
    const checkHD = function () {
      if (!shouldPlay()) return;
      const level = hls && hls.levels[hls.currentLevel];
      const qualityOK = hls ? Boolean(level && level.height >= targetHeight) :
        video.videoHeight >= targetHeight;
      const t = video.currentTime;
      const buffered = video.buffered;
      let secondsAhead = 0;
      for (let i = 0; i < buffered.length; i++) {
        if (buffered.start(i) <= t && buffered.end(i) >= t) {
          secondsAhead = buffered.end(i) - t;
          break;
        }
      }
      if (!qualityOK || secondsAhead < 1.5) return;
      window.clearTimeout(startupTimer);
      window.clearInterval(revealCheck);
      attemptedAssets = 0;
      revealedAsset = active;
      // Keep the entire transition masked until the next HD frame is decoded.
      // Remove the exit mask BEFORE enabling the entry opacity transition.
      backdrop.classList.remove('is-switching-video');
      backdrop.classList.add('is-frame-ready');
      transitioning = false;
      document.body.classList.add('cinematic-loaded');
      setMode(true);
      toggle.classList.add('is-visible');
    };
    checkHD();
    revealCheck = window.setInterval(checkHD, 180);
  });
  video.addEventListener('ended', function () {
    if (failed || transitioning) return;
    // Fade to the next video's Mux thumbnail before swapping HLS sources.
    // The following reveal only occurs after the HD quality/buffer gate passes.
    transitioning = true;
    backdrop.classList.add('is-switching-video');
    window.clearTimeout(transitionTimer);
    transitionTimer = window.setTimeout(function () {
      select(nextIndex());
    }, reduced.matches ? 0 : TRANSITION_MS);
  });
  video.addEventListener('loadeddata', function () { mediaReady = true; playIfAllowed(); });
  video.addEventListener('canplay', function () { mediaReady = true; playIfAllowed(); });
  video.addEventListener('error', function () {
    console.warn('Hyperix Mux HTMLVideoElement error:', video.error && video.error.code);
    if (attemptedAssets < assets.length) select(nextIndex());
    else showPosterOnError('video element error');
  });
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
  // Prefer hls.js on MSE-capable browsers. Some Windows browsers report
  // partial HLS support but reject direct .m3u8 with MEDIA_ERR_SRC_NOT_SUPPORTED.
  // Native HLS is used only when Media Source Extensions are unavailable.
  if (window.MediaSource && typeof window.MediaSource.isTypeSupported === 'function') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
    script.async = true;
    script.onload = function () {
      if (!window.Hls || !window.Hls.isSupported()) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) select(nextIndex());
        else showPosterOnError('HLS unsupported');
        return;
      }
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: false, capLevelToPlayerSize: false, startLevel: -1, abrEwmaDefaultEstimate: 5000000 });
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        const levels = hls.levels;
        hdLevel = levels.findIndex(level => level.height >= targetHeight);
        if (hdLevel === -1) {
          showPosterOnError('no HD rendition meets ' + targetHeight + 'p');
          return;
        }
        // Pin the chosen HD rendition; never downgrade into blurred video.
        hls.startLevel = hdLevel;
        hls.loadLevel = hdLevel;
      });
      hls.on(window.Hls.Events.ERROR, function (_, data) {
        if (!data.fatal) return;
        console.warn('Hyperix Mux HLS fatal error:', data.type, data.details);
        if (attemptedAssets < assets.length) select(nextIndex());
        else showPosterOnError(data.details);
      });
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MEDIA_ATTACHED, function () { select(nextIndex()); });
    };
    script.onerror = showPosterOnError;
    document.head.appendChild(script);
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    select(nextIndex());
  } else {
    showPosterOnError('Neither MSE nor native HLS is available');
  }
})();