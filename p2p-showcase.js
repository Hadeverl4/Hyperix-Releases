(() => {
  'use strict';
  const section = document.getElementById('p2p-cinematic-showcase');
  const image = document.getElementById('p2p-showcase-image');
  if (!section || !image) return;
  const sources = {
    en: './assets/screenshots/play-with-friendsmd-en.png',
    vi: './assets/screenshots/play-with-friendsmd-vi.png'
  };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let animationPending = false;
  function syncImage() {
    const locale = document.documentElement.lang === 'vi' ? 'vi' : 'en';
    const next = sources[locale];
    if (image.getAttribute('src') !== next) image.setAttribute('src', next);
    image.alt = locale === 'vi'
      ? 'Ảnh giao diện Chơi cùng bạn bè trong Hyperix Launcher'
      : 'Play with friends preview in Hyperix Launcher';
  }
  function update() {
    animationPending = false;
    if (reduced.matches) {
      section.style.setProperty('--p2p-visibility', '1');
      return;
    }
    const rect = section.getBoundingClientRect();
    const height = window.innerHeight;
    const enter = Math.max(0, Math.min(1, (height - rect.top) / (height * 0.65)));
    const leave = Math.max(0, Math.min(1, rect.bottom / (height * 0.65)));
    const presence = Math.min(enter, leave);
    section.style.setProperty('--p2p-visibility', presence.toFixed(3));
    section.classList.toggle('is-in-view', presence > 0.06 && !document.hidden);
  }
  function schedule() {
    if (animationPending) return;
    animationPending = true;
    requestAnimationFrame(update);
  }
  syncImage();
  update();
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule, {passive:true});
  document.addEventListener('visibilitychange', schedule);
  document.querySelectorAll('.lang-btn').forEach(button =>
    button.addEventListener('click', () => window.setTimeout(syncImage, 0)));
})();
