/**
 * kern/src-js/boot.js
 * Initialization sequence:
 *   1. Restore saved theme from localStorage
 *   2. Run Kern.init() on DOMContentLoaded
 *   3. Watch for new DOM nodes via MutationObserver
 */

import { Kern } from './api.js';

function boot() {
  // Restore persisted theme before first paint
  try {
    const saved = localStorage.getItem('kern-theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
  } catch (_) {}

  // Initialize existing DOM
  Kern.init();

  // Auto-initialize dynamically injected HTML (htmx, alpine, fetch-swapped content, etc.)
  new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          Kern.init(node);
        }
      });
    });
  }).observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
