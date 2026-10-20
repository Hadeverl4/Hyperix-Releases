(() => {
  'use strict';
  const button = document.getElementById('p2p-wave-button');
  if (!button) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let hovered = false;
  let focused = false;
  let burstTimer = 0;
  const wave = button.querySelector('.p2p-wave-surface');
  function start() {
    if (!reduced.matches) button.dataset.waving = 'true';
  }
  button.addEventListener('pointerenter', () => { hovered = true; start(); });
  button.addEventListener('pointerleave', () => { hovered = false; });
  button.addEventListener('focus', () => { focused = true; start(); });
  button.addEventListener('blur', () => { focused = false; });
  // Allow the currently running wave to finish before stopping on hover exit.
  wave?.addEventListener('animationiteration', event => {
    if (event.animationName === 'p2p-launcher-wave' && !hovered && !focused)
      delete button.dataset.waving;
  });
  button.addEventListener('click', () => {
    clearTimeout(burstTimer);
    button.classList.remove('is-pulsing');
    void button.offsetWidth;
    if (!reduced.matches) button.classList.add('is-pulsing');
    burstTimer = setTimeout(() => button.classList.remove('is-pulsing'), 1300);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { hovered = false; focused = false; delete button.dataset.waving; }
  });
})();