/**
 * kern/src-js/components/dialog.js
 * <kern-dialog> Web Component — wraps native <dialog>
 *
 * Usage:
 *   <kern-dialog>
 *     <dialog id="my-dialog">
 *       <div data-dialog-header>
 *         <div><div data-dialog-title>Title</div></div>
 *         <button data-dialog-close>✕</button>
 *       </div>
 *       <div data-dialog-body>...</div>
 *       <div data-dialog-footer>...</div>
 *     </dialog>
 *   </kern-dialog>
 *
 * Trigger: data-toggle="dialog-id" on any element
 * JS API:  el.open() | el.close() | el.toggle()
 *          Kern.dialog('id')
 * Events:  kern:dialog-open | kern:dialog-close
 */

import { emit, firstFocusable } from '../utils.js';

export class KernDialog extends HTMLElement {
  connectedCallback() {
    this._dialog = this.querySelector('dialog');
    if (!this._dialog) return;
    this._setup();
  }

  _setup() {
    const d = this._dialog;

    // Wire close buttons
    this.querySelectorAll('[data-dialog-close]').forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });

    // Backdrop click to close (unless opted out)
    d.addEventListener('click', (e) => {
      if (e.target === d && !d.hasAttribute('data-no-backdrop-close')) this.close();
    });

    // ESC (native cancel event)
    d.addEventListener('cancel', (e) => {
      e.preventDefault();
      this.close();
    });
  }

  open() {
    if (!this._dialog) return;
    this._dialog.showModal();
    // Focus first focusable element
    const f = firstFocusable(this._dialog);
    if (f) setTimeout(() => f.focus(), 40);
    emit(this, 'kern:dialog-open');
  }

  close() {
    if (!this._dialog || !this._dialog.open) return;
    this._dialog.close();
    emit(this, 'kern:dialog-close');
  }

  toggle() {
    this._dialog?.open ? this.close() : this.open();
  }
}

customElements.define('kern-dialog', KernDialog);
