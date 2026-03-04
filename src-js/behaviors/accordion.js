/**
 * kern/src-js/behaviors/accordion.js
 * Wires [data-accordion-trigger] click behavior.
 * Called by kern.js boot + MutationObserver.
 *
 * HTML:
 *   <div data-accordion>            <!-- add data-multi for multi-open -->
 *     <div data-accordion-item>
 *       <button data-accordion-trigger>Title</button>
 *       <div data-accordion-content>
 *         <div data-accordion-body>Body text</div>
 *       </div>
 *     </div>
 *   </div>
 */

export function initAccordions(root = document) {
  root.querySelectorAll('[data-accordion-trigger]').forEach(trigger => {
    if (trigger._kernInit) return;
    trigger._kernInit = true;

    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('type', 'button');

    const content = trigger
      .closest('[data-accordion-item]')
      ?.querySelector('[data-accordion-content]');

    if (!content) return;

    trigger.addEventListener('click', () => {
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      const accordion = trigger.closest('[data-accordion]');

      // Close others unless data-multi is present
      if (accordion && !accordion.hasAttribute('data-multi')) {
        accordion.querySelectorAll('[data-accordion-trigger]').forEach(other => {
          if (other === trigger) return;
          other.setAttribute('aria-expanded', 'false');
          other
            .closest('[data-accordion-item]')
            ?.querySelector('[data-accordion-content]')
            ?.removeAttribute('data-open');
        });
      }

      trigger.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      isOpen ? content.removeAttribute('data-open') : content.setAttribute('data-open', '');
    });
  });
}
