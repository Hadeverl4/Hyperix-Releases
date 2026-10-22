(() => {
  'use strict';
  const section = document.getElementById('p2p-cinematic-showcase');
  const parent = document.getElementById('p2p-preview');
  const heading = parent && parent.querySelector('.p2p-preview-heading');
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
      section.classList.add('is-in-view');
      return;
    }
    const rect = section.getBoundingClientRect();
    const height = window.innerHeight;
    const inView = rect.top < height && rect.bottom > 0 && !document.hidden;
    section.classList.toggle('is-in-view', inView);
  }
  function schedule() {
    if (animationPending) return;
    animationPending = true;
    requestAnimationFrame(update);
  }
  syncImage();
  if (parent && heading) {
    if (reduced.matches || !('IntersectionObserver' in window)) {
      parent.classList.add('is-showcase-revealed');
    } else {
      const revealObserver = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        parent.classList.add('is-showcase-revealed');
        revealObserver.disconnect();
      }, {threshold:0.15,rootMargin:'0px 0px -12% 0px'});
      revealObserver.observe(heading);
    }
  }
  update();
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule, {passive:true});
  document.addEventListener('visibilitychange', schedule);
  document.querySelectorAll('.lang-btn').forEach(button =>
    button.addEventListener('click', () => window.setTimeout(syncImage, 0)));
})();
