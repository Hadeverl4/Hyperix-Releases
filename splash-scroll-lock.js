(() => {
  'use strict';
  const root = document.documentElement;
  const intro = document.getElementById('cinematic-intro');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const resetTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  resetTop();
  window.addEventListener('pageshow', resetTop);
  window.addEventListener('load', resetTop, { once: true });
  let finishing = false;
  let fallback = 0;
  const finish = () => {
    if (!root.classList.contains('splash-locked')) return;
    window.clearTimeout(fallback);
    resetTop();
    root.classList.remove('splash-locked');
  };
  const beginFinish = () => {
    if (finishing) return;
    finishing = true;
    if (!intro || reduced.matches) { finish(); return; }
    const onEnd = event => {
      if (event.target !== intro || event.propertyName !== 'opacity') return;
      intro.removeEventListener('transitionend', onEnd);
      finish();
    };
    intro.addEventListener('transitionend', onEnd);
    // The intro opacity fade takes 1.7s; a watchdog handles interrupted transitions.
    fallback = window.setTimeout(() => {
      intro.removeEventListener('transitionend', onEnd);
      finish();
    }, 2100);
  };
  const ready = () => document.body.classList.contains('cinematic-loaded') ||
    document.body.classList.contains('cinematic-timeout');
  if (ready()) beginFinish();
  else {
    const observer = new MutationObserver(() => {
      if (!ready()) return;
      observer.disconnect();
      beginFinish();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }
  // Never leave scrolling permanently disabled if cinematic state fails.
  window.setTimeout(() => { if (!finishing) beginFinish(); }, 11000);
})();