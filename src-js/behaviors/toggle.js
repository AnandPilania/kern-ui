/**
 * kern/src-js/behaviors/toggle.js
 * Wires data-toggle="target-id" to open kern WC dialogs/drawers.
 *
 * Usage:
 *   <button data-toggle="my-dialog">Open</button>
 *   <kern-dialog><dialog id="my-dialog">...</dialog></kern-dialog>
 */

export function initToggles(root = document) {
  root.querySelectorAll('[data-toggle]').forEach(el => {
    if (el._kernInit) return;
    el._kernInit = true;

    el.addEventListener('click', () => {
      const targetId = el.getAttribute('data-toggle');
      const target   = document.getElementById(targetId);
      if (!target) return;

      // Walk up to find the WC wrapper (kern-dialog, kern-drawer, etc.)
      const wc = target.closest('kern-dialog, kern-drawer') || target;

      if (typeof wc.toggle === 'function') wc.toggle();
      else if (typeof wc.open  === 'function') wc.open();
    });
  });
}
