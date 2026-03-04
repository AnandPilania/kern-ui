/**
 * kern/src-js/components/dropdown.js
 * <kern-dropdown> Web Component
 *
 * Usage:
 *   <kern-dropdown>
 *     <button data-dropdown-trigger>Open ▾</button>
 *     <div data-dropdown-content>
 *       <a data-dropdown-item href="#">Item</a>
 *     </div>
 *   </kern-dropdown>
 *
 * Alignment: data-align="end"
 * JS API:    el.open() | el.close() | el.toggle()
 * Events:    kern:dropdown-open | kern:dropdown-close
 */

import { emit } from '../utils.js';

export class KernDropdown extends HTMLElement {
  connectedCallback() {
    this._trigger  = this.querySelector('[data-dropdown-trigger]') || this.firstElementChild;
    this._content  = this.querySelector('[data-dropdown-content]');
    this._onOutside = (e) => { if (!this.contains(e.target)) this.close(); };

    if (!this._trigger) return;

    this._trigger.setAttribute('aria-haspopup', 'true');
    this._trigger.setAttribute('aria-expanded', 'false');

    this._trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      this.hasAttribute('open') ? this.close() : this.open();
    });

    this._trigger.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); this.open(); this._focusFirst(); }
      if (e.key === 'Escape')    this.close();
    });

    if (this._content) {
      const items = () => [...this._content.querySelectorAll('[data-dropdown-item]:not([disabled])')];

      this._content.addEventListener('keydown', (e) => {
        const list = items();
        const idx  = list.indexOf(document.activeElement);
        if (e.key === 'ArrowDown')  { e.preventDefault(); list[idx + 1]?.focus() ?? list[0]?.focus(); }
        if (e.key === 'ArrowUp')    { e.preventDefault(); idx > 0 ? list[idx - 1]?.focus() : this._trigger.focus(); }
        if (e.key === 'Escape')     { this.close(); this._trigger.focus(); }
        if (e.key === 'Tab')        this.close();
      });

      items().forEach(item => {
        item.setAttribute('role', 'menuitem');
        item.setAttribute('tabindex', '-1');
      });
    }
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._onOutside);
  }

  open() {
    this.setAttribute('open', '');
    this._trigger?.setAttribute('aria-expanded', 'true');
    document.addEventListener('click', this._onOutside);
    emit(this, 'kern:dropdown-open');
  }

  close() {
    this.removeAttribute('open');
    this._trigger?.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', this._onOutside);
    emit(this, 'kern:dropdown-close');
  }

  toggle() {
    this.hasAttribute('open') ? this.close() : this.open();
  }

  _focusFirst() {
    const first = this._content?.querySelector('[data-dropdown-item]:not([disabled])');
    setTimeout(() => first?.focus(), 10);
  }
}

customElements.define('kern-dropdown', KernDropdown);
