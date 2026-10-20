(() => {
  'use strict';
  const toggle = document.getElementById('hash-toggle');
  const panel = document.getElementById('hash-container');
  if (!toggle || !panel) return;
  function label() {
    const vi = document.documentElement.lang === 'vi';
    return toggle.getAttribute('aria-expanded') === 'true'
      ? (vi ? 'Ẩn mã SHA-256' : 'Hide SHA-256 checksum')
      : (vi ? 'Hiện mã SHA-256' : 'Show SHA-256 checksum');
  }
  function sync() {
    toggle.textContent = label();
    // Avoid stale language translation mapping when language switch rerenders labels.
    toggle.removeAttribute('data-i18n');
  }
  toggle.addEventListener('click', () => {
    const expand = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(expand));
    panel.hidden = !expand;
    sync();
  });
  document.querySelectorAll('.lang-btn').forEach(btn =>
    btn.addEventListener('click', () => requestAnimationFrame(sync)));
  sync();
})();