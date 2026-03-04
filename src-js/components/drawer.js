/**
 * kern/src-js/components/drawer.js
 * <kern-drawer> Web Component
 *
 * Usage:
 *   <kern-drawer>
 *     <div data-drawer-backdrop></div>
 *     <div data-drawer-panel>
 *       <div data-drawer-header>
 *         <span data-drawer-title>Title</span>
 *         <button data-drawer-close>✕</button>
 *       </div>
 *       <div data-drawer-body>...</div>
 *       <div data-drawer-footer>...</div>
 *     </div>
 *   </kern-drawer>
 *
 * Options: data-side="left"  data-size="sm|lg"
 * JS API:  el.open() | el.close() | el.toggle()
 * Events:  kern:drawer-open | kern:drawer-close
 */

import { emit, firstFocusable } from '../utils.js';

export class KernDrawer extends HTMLElement {
  connectedCallback() {
    this._panel    = this.querySelector('[data-drawer-panel]');
    this._backdrop = this.querySelector('[data-drawer-backdrop]');

    this._onKey = (e) => { if (e.key === 'Escape') this.close(); };

    this.querySelectorAll('[data-drawer-close]').forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });

    this._backdrop?.addEventListener('click', () => this.close());
  }

  open() {
    this.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', this._onKey);
    const f = firstFocusable(this._panel);
    if (f) setTimeout(() => f.focus(), 60);
    emit(this, 'kern:drawer-open');
  }

  close() {
    this.removeAttribute('open');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', this._onKey);
    emit(this, 'kern:drawer-close');
  }

  toggle() {
    this.hasAttribute('open') ? this.close() : this.open();
  }
}

customElements.define('kern-drawer', KernDrawer);
