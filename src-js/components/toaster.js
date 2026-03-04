/**
 * kern/src-js/components/toaster.js
 * <kern-toaster> Web Component
 *
 * Usage:
 *   <kern-toaster data-position="bottom-right"></kern-toaster>
 *
 * Positions: top-right | top-left | top-center | bottom-right | bottom-left | bottom-center
 *
 * JS API (direct):
 *   document.querySelector('kern-toaster').add({ title, message, color, duration, dismissible })
 *
 * JS API (global shorthand):
 *   Kern.toast('Message')
 *   Kern.toast({ title: 'Done', message: 'Saved.', color: 'success', duration: 4000 })
 *
 * Colors: (default info) success | warning | danger | accent
 * Events: kern:toast-add | kern:toast-remove
 */

import { emit, esc } from '../utils.js';

export class KernToaster extends HTMLElement {
  connectedCallback() {
    if (!this.hasAttribute('data-position')) {
      this.setAttribute('data-position', 'bottom-right');
    }
    this.setAttribute('aria-live', 'polite');
    this.setAttribute('aria-atomic', 'false');
  }

  /**
   * @param {Object|string} options
   * @param {string}  [options.title]
   * @param {string}  [options.message]
   * @param {string}  [options.color]       - success | warning | danger | accent
   * @param {number}  [options.duration]    - ms; 0 = persistent
   * @param {boolean} [options.dismissible] - show ✕ button (default true)
   * @returns {HTMLElement} the toast element
   */
  add(options = {}) {
    if (typeof options === 'string') options = { message: options };

    const {
      title       = '',
      message     = '',
      color       = '',
      duration    = 4000,
      dismissible = true,
    } = options;

    const toast = document.createElement('div');
    toast.setAttribute('data-toast', '');
    toast.setAttribute('role', 'status');
    if (color) toast.setAttribute('data-color', color);

    toast.innerHTML = `
      <div data-toast-body>
        ${title   ? `<div data-toast-title>${esc(title)}</div>` : ''}
        ${message ? `<div data-toast-message>${esc(message)}</div>` : ''}
      </div>
      ${dismissible ? `<button data-toast-close aria-label="Dismiss">✕</button>` : ''}
    `.trim();

    toast.querySelector('[data-toast-close]')?.addEventListener('click', () => this._remove(toast));

    this.appendChild(toast);
    emit(this, 'kern:toast-add', { toast, color, title, message });

    if (duration > 0) setTimeout(() => this._remove(toast), duration);

    return toast;
  }

  _remove(toast) {
    if (!toast.isConnected) return;
    toast.setAttribute('data-removing', '');
    toast.addEventListener('animationend', () => {
      toast.remove();
      emit(this, 'kern:toast-remove', { toast });
    }, { once: true });
  }

  clear() {
    [...this.querySelectorAll('[data-toast]')].forEach(t => this._remove(t));
  }
}

customElements.define('kern-toaster', KernToaster);
