/**
 * Hyperix cinematic hero: YouTube is a third-party iframe, so keep it hidden
 * during startup, seeks, pauses, and buffering. Fade the entire fixed stage on
 * scroll instead of animating a costly cross-origin iframe.
 */
(function () {
  'use strict';

  const backdrop = document.querySelector('.hero-video-backdrop');
  const poster = document.querySelector('.hero-video-poster');
  const hero = document.getElementById('top');
  const toggle = document.getElementById('video-toggle-btn');
  const toggleLabel = document.getElementById('video-toggle-label');
  if (!backdrop || !poster || !hero || !toggle) return;

  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const PLAYER_PLAYING = 1;
  const PLAYER_PAUSED = 2;
  const PLAYER_ENDED = 0;
  const PLAYER_BUFFERING = 3;
  // Smart Reveal: YouTube overlays are iframe-owned. Wait for stable playback
  // on first load, but use a shorter check when resuming an existing player.
  // A fresh document reload also creates YouTube's own transient play bezel.
  // Treat first playback like a resume instead of taking the fast reveal path.
  const INITIAL_REVEAL_MS = 4800;
  const INITIAL_PROGRESS_SECONDS = 4.0;
  // Resume should not repeat the initial multi-second concealment delay.
  const RESUME_REVEAL_MS = 480;
  const RESUME_PROGRESS_SECONDS = 0.25;
  let player = null;
  let playerReady = false;
  let apiRequested = false;
  let userPaused = false;
  let heroIntersecting = true;
  let scrollAllowsPlayback = true;
  let scrollPending = false;
  let revealTimer = 0;
  let revealGeneration = 0;
  let stagePresence = 1;
  let hasRevealedOnce = false;

  function getTranslation(key, fallback) {
    if (typeof translations === 'undefined' || typeof currentLang === 'undefined') return fallback;
    const dictionary = translations[currentLang] || translations.en;
    return dictionary[key] || fallback;
  }

  function syncToggle() {
    toggle.classList.toggle('is-paused', userPaused);
    toggle.classList.toggle('user-paused', userPaused);
    toggle.setAttribute('aria-pressed', String(!userPaused));
    if (toggleLabel) {
      toggleLabel.textContent = userPaused
        ? getTranslation('video_ambient_paused', 'Video Paused')
        : getTranslation('video_ambient_label', 'Ambient Video');
    }
  }

  function extractYouTubeId(value) {
    if (typeof value !== 'string') return '';
    const input = value.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
    try {
      const url = new URL(input);
      if (url.hostname === 'youtu.be' || url.hostname === 'www.youtu.be') {
        return /^[a-zA-Z0-9_-]{11}$/.test(url.pathname.slice(1)) ? url.pathname.slice(1) : '';
      }
      if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)) {
        const candidate = url.pathname === '/watch'
          ? url.searchParams.get('v')
          : url.pathname.match(/^\/(?:embed|shorts|live)\/([a-zA-Z0-9_-]{11})/)?.[1];
        return candidate && /^[a-zA-Z0-9_-]{11}$/.test(candidate) ? candidate : '';
      }
    } catch (_) {
      return '';
    }
    return '';
  }

  function setPoster(id) {
    // ID is validated before it reaches this stylesheet URL.
    poster.style.backgroundImage =
      'linear-gradient(130deg, rgba(9, 11, 25, 0.25), rgba(28, 19, 60, 0.32)), ' +
      'url("https://i.ytimg.com/vi/' + id + '/maxresdefault.jpg")';
  }

  function state() {
    try {
      return player && typeof player.getPlayerState === 'function' ? player.getPlayerState() : -1;
    } catch (_) {
      return -1;
    }
  }

  function currentTime() {
    try {
      return player && typeof player.getCurrentTime === 'function' ? Number(player.getCurrentTime()) : NaN;
    } catch (_) {
      return NaN;
    }
  }

  function bufferedSecondsAhead(position) {
    try {
      if (!player || typeof player.getVideoLoadedFraction !== 'function' ||
          typeof player.getDuration !== 'function') return NaN;
      const fraction = Number(player.getVideoLoadedFraction());
      const duration = Number(player.getDuration());
      if (!Number.isFinite(fraction) || fraction <= 0 || fraction > 1 ||
          !Number.isFinite(duration) || duration <= 0) return NaN;
      return Math.max(0, fraction * duration - position);
    } catch (_) {
      return NaN;
    }
  }

  function concealFrame() {
    revealGeneration++;
    window.clearTimeout(revealTimer);
    revealTimer = 0;
    backdrop.classList.remove('is-frame-ready');
  }

  function shouldPlay() {
    return !userPaused && !motionPreference.matches && !document.hidden &&
      heroIntersecting && scrollAllowsPlayback;
  }

  function setVideoMode(enabled) {
    backdrop.classList.toggle('is-playing', enabled);
    // Suspend the Three.js render loop whenever video owns the background.
    if (enabled || document.hidden || stagePresence < 0.02 || motionPreference.matches) {
      if (typeof window.stopThreeScene === 'function') window.stopThreeScene();
    } else if (typeof window.startThreeScene === 'function') {
      window.startThreeScene();
    }
  }

  function revealAfterStablePlayback() {
    concealFrame();
    const generation = revealGeneration;
    const startedAt = performance.now();
    let previousTime = currentTime();
    const initialTime = previousTime;
    let progressingSamples = 0;
    let stalledSamples = 0;

    function probe() {
      if (generation !== revealGeneration || !shouldPlay() || state() !== PLAYER_PLAYING) return;
      const now = currentTime();
      if (Number.isFinite(now) && Number.isFinite(previousTime)) {
        const advance = now - previousTime;
        if (advance > 0.045 && advance < 0.8) {
          progressingSamples++;
          stalledSamples = 0;
        } else if (advance <= 0.045 || advance >= 0.8) {
          stalledSamples++;
          if (stalledSamples >= 3) progressingSamples = 0;
        }
      }
      if (Number.isFinite(now)) previousTime = now;
      const elapsed = performance.now() - startedAt;
      const progress = now - initialTime;
      // YouTube does not expose overlay visibility through its IFrame API.
      const normal = elapsed >= (hasRevealedOnce ? RESUME_REVEAL_MS : INITIAL_REVEAL_MS) &&
        progress >= (hasRevealedOnce ? RESUME_PROGRESS_SECONDS : INITIAL_PROGRESS_SECONDS) &&
        progressingSamples >= (hasRevealedOnce ? 2 : 8);
      if (stalledSamples === 0 && normal) {
        if (hasRevealedOnce) backdrop.classList.add('has-revealed-before');
        backdrop.classList.add('is-frame-ready');
        hasRevealedOnce = true;
        document.body.classList.add('cinematic-loaded');
        return;
      }
      // No unconditional timeout reveal: offline/stalled players keep the poster.
      if (elapsed < 20000) revealTimer = window.setTimeout(probe, 160);
    }
    revealTimer = window.setTimeout(probe, 160);
  }

  function onPlayerStateChange(event) {
    if (event.data === PLAYER_PLAYING) {
      if (!shouldPlay()) {
        concealFrame();
        event.target.pauseVideo();
        return;
      }
      setVideoMode(true);
      revealAfterStablePlayback();
    } else if (event.data === PLAYER_BUFFERING) {
      // The iframe owns the spinner: hide the whole iframe, not just a CSS overlay.
      concealFrame();
    } else if (event.data === PLAYER_PAUSED) {
      concealFrame();
      if (userPaused) setVideoMode(false);
    } else if (event.data === PLAYER_ENDED) {
      concealFrame();
      if (shouldPlay()) {
        // Loop without YouTube playlist controls. The next interval is concealed
        // until stable again, so seek/play overlays cannot flash onscreen.
        event.target.seekTo(0, true);
        event.target.playVideo();
      }
    }
    syncToggle();
  }

  function syncPlayback() {
    if (!player || !playerReady) {
      if (document.hidden || motionPreference.matches) setVideoMode(false);
      return;
    }
    if (!shouldPlay()) {
      concealFrame();
      const playbackState = state();
      if (playbackState === PLAYER_PLAYING || playbackState === PLAYER_BUFFERING) player.pauseVideo();
      if (userPaused || motionPreference.matches) setVideoMode(false);
      return;
    }
    const playbackState = state();
    if (playbackState !== PLAYER_PLAYING && playbackState !== PLAYER_BUFFERING) player.playVideo();
  }

  function createPlayer() {
    if (player || !window.YT || typeof window.YT.Player !== 'function' || motionPreference.matches) return;
    player = new window.YT.Player('yt-player', {
      videoId: window.HERO_YOUTUBE_ID,
      playerVars: {
        autoplay: 1,
        mute: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        rel: 0,
        playsinline: 1,
        iv_load_policy: 3,
        enablejsapi: 1,
        origin: window.location.origin.startsWith('http') ? window.location.origin : undefined
      },
      events: {
        onReady: function (event) {
          playerReady = true;
          event.target.mute();
          toggle.classList.add('is-visible');
          syncToggle();
          // Avoid a second eager playVideo() that produces the initial [||] bezel.
          // Attempt fallback only when autoplay has clearly not begun.
          window.setTimeout(function () {
            if (shouldPlay() && state() !== PLAYER_PLAYING && state() !== PLAYER_BUFFERING) {
              event.target.playVideo();
            }
          }, 1400);
        },
        onStateChange: onPlayerStateChange,
        onError: function () {
          concealFrame();
          setVideoMode(false);
          toggle.classList.add('is-visible');
        }
      }
    });
  }

  function requestYouTubeApi() {
    if (apiRequested || motionPreference.matches) return;
    apiRequested = true;
    if (window.YT && window.YT.Player) {
      createPlayer();
      return;
    }
    window.onYouTubeIframeAPIReady = createPlayer;
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = function () {
      concealFrame();
      setVideoMode(false);
    };
    document.head.appendChild(script);
  }

  function updateScrollStage() {
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

    // Hysteresis avoids rapid pause/resume at the bottom of the fade.
    const nextAllowsPlayback = scrollAllowsPlayback
      ? stagePresence > 0.005
      : stagePresence > 0.10;
    if (nextAllowsPlayback !== scrollAllowsPlayback) {
      scrollAllowsPlayback = nextAllowsPlayback;
      syncPlayback();
    }
    if (!backdrop.classList.contains('is-playing')) setVideoMode(false);
  }

  function queueScrollUpdate() {
    if (scrollPending) return;
    scrollPending = true;
    window.requestAnimationFrame(function () {
      scrollPending = false;
      updateScrollStage();
    });
  }

  window.setHeroVideo = function (urlOrId) {
    const id = extractYouTubeId(urlOrId);
    if (!id) {
      console.warn('Invalid YouTube video link or ID');
      return;
    }
    window.HERO_YOUTUBE_ID = id;
    window.localStorage.setItem('hyperix_hero_video', id);
    setPoster(id);
    concealFrame();
    if (player && playerReady) {
      if (shouldPlay()) player.loadVideoById(id);
      else player.cueVideoById(id);
    } else if (!player) requestYouTubeApi();
  };

  const params = new URLSearchParams(window.location.search);
  const configuredId = extractYouTubeId(params.get('video') ||
    window.localStorage.getItem('hyperix_hero_video') || window.HERO_YOUTUBE_ID);
  window.HERO_YOUTUBE_ID = configuredId || 'hmdfhspeU_Q';
  setPoster(window.HERO_YOUTUBE_ID);

  toggle.addEventListener('click', function () {
    if (!player || !playerReady) return;
    const playingOrLoading = state() === PLAYER_PLAYING || state() === PLAYER_BUFFERING;
    userPaused = !userPaused && playingOrLoading;
    if (userPaused) {
      concealFrame();
      setVideoMode(false);
      player.pauseVideo();
    } else {
      concealFrame();
      if (shouldPlay()) player.playVideo();
    }
    syncToggle();
  });

  // Keep the user's manual pause label correct after switching EN / VI.
  document.querySelectorAll('.lang-btn').forEach(function (button) {
    button.addEventListener('click', syncToggle);
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      heroIntersecting = entries[0].isIntersecting;
      syncPlayback();
    }, { threshold: 0 });
    observer.observe(hero);
  }

  window.addEventListener('scroll', queueScrollUpdate, { passive: true });
  window.addEventListener('resize', queueScrollUpdate, { passive: true });
  document.addEventListener('visibilitychange', syncPlayback);
  if (typeof motionPreference.addEventListener === 'function') {
    motionPreference.addEventListener('change', function () {
      syncPlayback();
      if (!motionPreference.matches) requestYouTubeApi();
    });
  }
  syncToggle();
  updateScrollStage();
  requestYouTubeApi();
})();
