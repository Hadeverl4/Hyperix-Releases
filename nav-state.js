(function () {
  'use strict';
  const nav = document.querySelector('main > nav');
  const hero = document.getElementById('top');
  if (!nav || !hero) return;
  let scheduled = false;
  function updateNav() {
    scheduled = false;
    const heroBottom = hero.getBoundingClientRect().bottom;
    nav.classList.toggle('is-scrolled', heroBottom <= nav.getBoundingClientRect().bottom);
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(updateNav);
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('pageshow', schedule);
  updateNav();
})();