(function () {
  'use strict';
  const widget = document.getElementById('music-widget');
  const status = document.getElementById('soundtrack-label');
  const mount = document.getElementById('spotify-embed');
  const trigger = document.getElementById('spotify-vinyl-trigger');
  const artwork = trigger?.querySelector('.official-vinyl-cover');
  if (!widget || !status || !mount || !trigger) return;

  // Spotify's iframe events expose a track URI, not its artwork. Resolve that
  // URI via Spotify's public oEmbed endpoint without requesting user tokens.
  const playlistArtwork = artwork?.getAttribute('src') || '';
  if (artwork) {
    artwork.addEventListener('error', () => {
      if (artwork.getAttribute('src') !== playlistArtwork) artwork.src = playlistArtwork;
    });
  }
  const artworkCache = new Map();
  let artworkRequest = 0;
  async function updateTrackArtwork(playingURI) {
    if (!artwork) return;
    const match = /^spotify:track:([A-Za-z0-9]{22})$/.exec(playingURI || '');
    if (!match) return;
    const request = ++artworkRequest;
    const trackId = match[1];
    try {
      let thumbnail = artworkCache.get(trackId);
      if (!thumbnail) {
        const trackURL = 'https://open.spotify.com/track/' + trackId;
        const response = await fetch('https://open.spotify.com/oembed?url=' + encodeURIComponent(trackURL));
        if (!response.ok) throw new Error('Spotify metadata unavailable');
        const metadata = await response.json();
        const candidate = new URL(metadata.thumbnail_url);
        if (candidate.protocol !== 'https:' ||
          !/(^|\.)(spotifycdn\.com|scdn\.co)$/.test(candidate.hostname)) {
          throw new Error('Untrusted Spotify artwork URL');
        }
        thumbnail = candidate.href;
        artworkCache.set(trackId, thumbnail);
      }
      if (request === artworkRequest) artwork.src = thumbnail;
    } catch (_) {
      if (request === artworkRequest) artwork.src = playlistArtwork;
    }
  }

  function setExpanded(expanded) {
    widget.classList.toggle('is-expanded', expanded);
    trigger.setAttribute('aria-expanded', String(expanded));
    trigger.setAttribute('aria-label', expanded ? 'Close Spotify music player' : 'Open Spotify music player');
  }
  trigger.addEventListener('click', () => setExpanded(!widget.classList.contains('is-expanded')));
  widget.addEventListener('mouseenter', () => setExpanded(true));
  widget.addEventListener('mouseleave', () => { if (!widget.contains(document.activeElement)) setExpanded(false); });
  widget.addEventListener('focusin', () => setExpanded(true));
  widget.addEventListener('focusout', event => {
    if (!widget.contains(event.relatedTarget) && !widget.matches(':hover')) setExpanded(false);
  });
  widget.addEventListener('keydown', event => {
    if (event.key === 'Escape') { setExpanded(false); trigger.blur(); }
  });
  document.addEventListener('pointerdown', event => {
    if (!widget.contains(event.target)) setExpanded(false);
  }, { passive:true });

  // Preserve the cinematic intro timeout independently of the soundtrack.
  const fallback = window.setTimeout(() => document.body.classList.add('cinematic-timeout'),
    Math.max(0, 3000 - (performance.now() - (window.hyperixSplashStart || performance.now()))));
  const observer = new MutationObserver(() => {
    if (!document.body.classList.contains('cinematic-loaded')) return;
    window.clearTimeout(fallback);
    observer.disconnect();
  });
  observer.observe(document.body, { attributes:true, attributeFilter:['class'] });

  // The Spotify Embed is always visible, remains unmodified, and owns playback.
  // Best-effort autoplay is permitted only if the browser/Spotify allows it.
  let controller = null;
  let firstGestureAttempted = false;
  let playbackActive = false;
  let resumeAfterTabReturn = false;
  function syncTabPlayback() {
    if (!controller) return;
    if (document.hidden) {
      resumeAfterTabReturn = playbackActive;
      if (playbackActive) {
        try { controller.pause(); } catch (_) { /* Spotify owns playback. */ }
      }
    } else if (resumeAfterTabReturn) {
      resumeAfterTabReturn = false;
      try { controller.resume(); } catch (_) {
        try { controller.play(); } catch (_) { /* May require user interaction. */ }
      }
    }
  }
  document.addEventListener('visibilitychange', syncTabPlayback);
  window.onSpotifyIframeApiReady = (IFrameAPI) => {
    IFrameAPI.createController(mount, {
      uri: 'spotify:playlist:5T4KWhz9Q8r98skQBimtlH',
      width: '100%',
      height: 152
    }, (ready) => {
      controller = ready;
      status.textContent = 'Official Spotify player';
      controller.addListener('playback_started', ({data}) => {
        if (data?.playingURI) updateTrackArtwork(data.playingURI);
      });
      controller.addListener('playback_update', ({data}) => {
        if (!data) return;
        playbackActive = !data.isPaused;
        widget.classList.toggle('is-playing', playbackActive && !data.isBuffering);
        if (document.hidden && playbackActive) {
          resumeAfterTabReturn = true;
          try { controller.pause(); } catch (_) { /* Best effort. */ }
        }
        if (!data.isBuffering) status.textContent = data.isPaused ? 'Ready to play' : 'Now playing';
      });
      // Spotify may block this until a user gesture, and may offer previews only.
      if (!document.hidden) {
        try { controller.play(); } catch (_) { status.textContent = 'Press play on Spotify'; }
      }
    });
  };

  const script = document.createElement('script');
  script.src = 'https://open.spotify.com/embed/iframe-api/v1';
  script.async = true;
  script.onerror = () => { status.textContent = 'Spotify unavailable — use the link below'; };
  document.head.appendChild(script);

  function tryAfterGesture() {
    if (firstGestureAttempted || !controller || document.hidden) return;
    firstGestureAttempted = true;
    try { controller.play(); } catch (_) { status.textContent = 'Press play on Spotify'; }
  }
  // Attempt once again after the first real interaction. Spotify playback still
  // depends on its own restrictions; never synthesize user gestures.
  document.addEventListener('pointerdown', tryAfterGesture, { passive:true });
  document.addEventListener('keydown', tryAfterGesture);
})();