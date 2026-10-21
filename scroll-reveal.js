(() => {
  'use strict';

  // Keep the hero's cinematic opening separate from section entrance effects.
  const selectors = [
    '#installation .download-notice',
    '#features .features-intro',
    '#features .principle-card',
    '#p2p-preview .p2p-preview-heading',
    '#p2p-preview .p2p-demo',
    '#p2p-preview .p2p-preview-lede',
    '#p2p-preview .p2p-preview-step',
    '#p2p-preview .p2p-preview-foot',
    '#content-sources .content-sources-intro',
    '#content-sources .content-source-copy',
    '#content-sources .content-sources-disclaimer',
    // Gallery heading and screenshots share one entrance trigger below.
    '#changelog .changelog-header',
    '#changelog .release-entry',
    '#changelog .changelog-expand-bar',
    '#content-policy > *',
    '.editorial-status > *'
  ];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!('IntersectionObserver' in window) || reduced.matches) return;

  const thresholds = Array.from({ length: 21 }, (_, index) => index / 20);
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const height = Math.max(1, entry.boundingClientRect.height);
      // The 85% reveal threshold is unreachable for blocks taller than a
      // viewport. Instead wait until they occupy ~70% of the visible height.
      // End-of-page elements might never fill 85% of the viewport: their
      // scrollable range ends before the threshold can be reached.
      const atPageEnd = window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 48;
      const isEnding = !!entry.target.closest('.editorial-status');
      const required = atPageEnd && isEnding
        ? 0.01 : Math.min(isEnding ? 0.25 : 0.85, (window.innerHeight * 0.7) / height);
      if (entry.intersectionRatio + 0.001 < required) return;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    });
  }, { threshold: thresholds, rootMargin: '0px 0px -10% 0px' });

  let order = 0;
  function register(item) {
    if (!(item instanceof HTMLElement) ||
        item.classList.contains('scroll-reveal') ||
        item.classList.contains('gallery-entrance')) return;
    const isGalleryStage = item.id === 'gallery-track';
    item.classList.add(isGalleryStage ? 'gallery-entrance' : 'scroll-reveal');
    item.style.setProperty('--reveal-delay', ((order++ % 3) * 35) + 'ms');
    observer.observe(item);
  }

  document.querySelectorAll(selectors.join(',')).forEach(register);

  // Gallery must remain visible even if an observer never fires (small
  // viewports, browser throttling, browser back/forward cache, JS failures).
  // Entrance is an enhancement, never a prerequisite for seeing screenshots.
  const gallery = document.getElementById('gallery');
  const galleryTrack = document.getElementById('gallery-track');
  const galleryHeading = gallery && gallery.querySelector('.showcase-heading > div');
  const galleryToolbar = gallery && gallery.querySelector('.gallery-toolbar');
  if (gallery && galleryTrack && !reduced.matches) {
    let entered = false;
    const enterGallery = () => {
      if (entered) return;
      entered = true;
      galleryTrack.classList.add('gallery-entrance');
      if (galleryHeading) galleryHeading.classList.add('gallery-entrance');
      if (galleryToolbar) galleryToolbar.classList.add('gallery-entrance');
      galleryObserver.disconnect();
    };
    const galleryObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) enterGallery();
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
    galleryObserver.observe(gallery);
  }

  // New GitHub release entries can be inserted after the initial page parse.
  // Register only newly added cards; do not reanimate already revealed items.
  const stream = document.querySelector('#changelog .timeline-stream');
  if (stream) {
    const updates = new MutationObserver(records => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches('.release-entry')) register(node);
          node.querySelectorAll?.('.release-entry').forEach(register);
        }
      }
    });
    updates.observe(stream, { childList: true });
  }
})();