var Kern = (function (exports) {
  'use strict';

  /**
   * kern/src-js/utils.js
   * Shared utilities used across components and behaviors.
   */

  /** Dispatch a bubbling, cancellable CustomEvent */
  function emit(el, name, detail = {}) {
    return el.dispatchEvent(
      new CustomEvent(name, { bubbles: true, cancelable: true, detail })
    );
  }

  /** HTML-escape a string (for dynamic toast content) */
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** Return the first focusable element inside a container */
  function firstFocusable(el) {
    return el?.querySelector(
      'button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"]),input:not([disabled]),select:not([disabled]),textarea:not([disabled])'
    ) ?? null;
  }

  /**
   * kern/src-js/components/tabs.js
   * <kern-tabs> Web Component
   *
   * Usage:
   *   <kern-tabs>
   *     <div data-tabs-list>
   *       <button data-tab>Tab 1</button>
   *       <button data-tab>Tab 2</button>
   *     </div>
   *     <div data-tab-panel>Panel 1</div>
   *     <div data-tab-panel>Panel 2</div>
   *   </kern-tabs>
   *
   * Variants: data-variant="pills"
   * JS API:   el.goto(index) | el.setActive(index)
   * Events:   kern:tab-change → { index }
   */


  class KernTabs extends HTMLElement {
    connectedCallback() {
      this._init();
    }

    _init() {
      const tabs   = [...this.querySelectorAll('[data-tab]')];
      const panels = [...this.querySelectorAll('[data-tab-panel]')];

      // Find the initial active index (first by default)
      const initialActive = Math.max(0, tabs.findIndex(t => t.hasAttribute('data-active')));

      tabs.forEach((tab, i) => {
        // ARIA
        tab.setAttribute('role', 'tab');
        tab.setAttribute('tabindex', i === initialActive ? '0' : '-1');
        tab.setAttribute('aria-selected', i === initialActive ? 'true' : 'false');

        // Wire panel id
        if (panels[i]) {
          const panelId = panels[i].id || `k-panel-${Math.random().toString(36).slice(2)}`;
          panels[i].id = panelId;
          tab.setAttribute('aria-controls', panelId);
          panels[i].setAttribute('role', 'tabpanel');
          panels[i].setAttribute('aria-labelledby', tab.id || `k-tab-${i}`);
        }

        tab.addEventListener('click', () => this.goto(i));

        tab.addEventListener('keydown', (e) => {
          const count = tabs.length;
          if (e.key === 'ArrowRight') { e.preventDefault(); this.goto((i + 1) % count); }
          if (e.key === 'ArrowLeft')  { e.preventDefault(); this.goto((i - 1 + count) % count); }
          if (e.key === 'Home')       { e.preventDefault(); this.goto(0); }
          if (e.key === 'End')        { e.preventDefault(); this.goto(count - 1); }
        });
      });

      // Activate initial panel (no focus)
      this._activate(initialActive, false);
    }

    goto(index) {
      this._activate(index, true);
    }

    setActive(index) {
      this._activate(index, false);
    }

    _activate(index, focus = false) {
      const tabs   = [...this.querySelectorAll('[data-tab]')];
      const panels = [...this.querySelectorAll('[data-tab-panel]')];

      tabs.forEach((tab, i) => {
        const active = i === index;
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
        tab.setAttribute('tabindex', active ? '0' : '-1');
      });

      panels.forEach((panel, i) => {
        i === index ? panel.setAttribute('data-active', '') : panel.removeAttribute('data-active');
      });

      if (focus && tabs[index]) tabs[index].focus();

      emit(this, 'kern:tab-change', { index });
    }
  }

  customElements.define('kern-tabs', KernTabs);

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


  class KernDropdown extends HTMLElement {
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


  class KernDialog extends HTMLElement {
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


  class KernDrawer extends HTMLElement {
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


  class KernToaster extends HTMLElement {
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

  function initAccordions(root = document) {
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

  /**
   * kern/src-js/behaviors/toggle.js
   * Wires data-toggle="target-id" to open kern WC dialogs/drawers.
   *
   * Usage:
   *   <button data-toggle="my-dialog">Open</button>
   *   <kern-dialog><dialog id="my-dialog">...</dialog></kern-dialog>
   */

  function initToggles(root = document) {
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

  /**
   * kern/src-js/behaviors/table-sort.js
   * Client-side column sorting for <th data-sort> columns.
   *
   * Usage:
   *   <table>
   *     <thead><tr>
   *       <th>Name</th>
   *       <th data-sort>Role</th>   <!-- sortable -->
   *     </tr></thead>
   *     <tbody>...</tbody>
   *   </table>
   *
   * Cycles: unsorted → asc → desc
   */

  function initTableSort(root = document) {
    root.querySelectorAll('th[data-sort]').forEach(th => {
      if (th._kernInit) return;
      th._kernInit = true;

      th.style.cursor = 'pointer';
      th.setAttribute('role', 'columnheader');
      th.setAttribute('aria-sort', 'none');

      th.addEventListener('click', () => {
        const table = th.closest('table');
        const tbody = table?.querySelector('tbody');
        if (!tbody) return;

        const colIndex = [...th.parentElement.children].indexOf(th);
        const current  = th.getAttribute('data-sort');
        const asc      = current !== 'asc';

        // Reset all other sortable headers
        table.querySelectorAll('th[data-sort]').forEach(h => {
          h.setAttribute('data-sort', '');
          h.setAttribute('aria-sort', 'none');
        });

        th.setAttribute('data-sort', asc ? 'asc' : 'desc');
        th.setAttribute('aria-sort', asc ? 'ascending' : 'descending');

        const rows = [...tbody.querySelectorAll('tr')];

        rows.sort((a, b) => {
          const av = a.cells[colIndex]?.textContent.trim() ?? '';
          const bv = b.cells[colIndex]?.textContent.trim() ?? '';

          // Try numeric sort first
          const an = parseFloat(av.replace(/[^0-9.-]/g, ''));
          const bn = parseFloat(bv.replace(/[^0-9.-]/g, ''));

          if (!isNaN(an) && !isNaN(bn)) return asc ? an - bn : bn - an;
          return asc ? av.localeCompare(bv) : bv.localeCompare(av);
        });

        rows.forEach(row => tbody.appendChild(row));
      });
    });
  }

  /**
   * The global Kern API object.
   * Consumed by kern.js and exposed as window.Kern.
   */


  const Kern = {
      version: '0.1.1',

      /**
       * Show a toast notification.
       * @param {string|Object} options - string shorthand or options object
       */
      toast(options = {}) {
          if (typeof options === 'string') options = { message: options };

          const position = options.position ?? 'bottom-right';

          // Find or create a toaster at the given position
          let toaster = document.querySelector(`kern-toaster[data-position="${position}"]`)
              ?? document.querySelector('kern-toaster');

          if (!toaster) {
              toaster = document.createElement('kern-toaster');
              toaster.setAttribute('data-position', position);
              document.body.appendChild(toaster);
          }

          return toaster.add(options);
      },

      /**
       * Open a dialog by ID or selector.
       * @param {string|HTMLElement} selector
       */
      dialog(selector) {
          const el = typeof selector === 'string'
              ? (document.getElementById(selector) ?? document.querySelector(selector))
              : selector;

          const wc = el?.closest?.('kern-dialog') ?? el;

          if (typeof wc?.open === 'function') wc.open();
          else if (el instanceof HTMLDialogElement) el.showModal();

          return wc;
      },

      /**
       * Open a drawer by ID or selector.
       * @param {string|HTMLElement} selector
       */
      drawer(selector) {
          const el = typeof selector === 'string'
              ? (document.getElementById(selector) ?? document.querySelector(selector))
              : selector;

          const wc = el?.closest?.('kern-drawer') ?? el;

          if (typeof wc?.open === 'function') wc.open();
          return wc;
      },

      /**
       * Set the accent color preset.
       * @param {string} name - amber | blue | green | red | violet | rose | cyan | orange
       */
      setAccent(name) {
          document.documentElement.setAttribute('data-accent', name);
      },

      /**
       * Set the theme.
       * @param {'dark'|'light'} theme
       */
      setTheme(theme) {
          document.documentElement.setAttribute('data-theme', theme);
          try { localStorage.setItem('kern-theme', theme); } catch (_) { }
      },

      /**
       * Set the global border radius preset.
       * @param {'none'|'sharp'|'default'|'round'} name
       */
      setRadius(name) {
          if (name === 'default') document.documentElement.removeAttribute('data-radius');
          else document.documentElement.setAttribute('data-radius', name);
      },

      /**
       * (Re-)initialize all vanilla JS behaviors in a root element.
       * Called automatically on boot and for dynamically injected HTML.
       * @param {Element|Document} root
       */
      init(root = document) {
          initAccordions(root);
          initToggles(root);
          initTableSort(root);
      },
  };

  /**
   * kern/src-js/boot.js
   * Initialization sequence:
   *   1. Restore saved theme from localStorage
   *   2. Run Kern.init() on DOMContentLoaded
   *   3. Watch for new DOM nodes via MutationObserver
   */


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

  /**
   * kern/src-js/kern.js
   * Root JavaScript entry point (ESM).
   *
   * Import the whole library:
   *   import 'kern/src-js/kern.js';
   *   // window.Kern is now available, all WCs registered
   *
   * Import a single component:
   *   import { KernTabs } from 'kern/src-js/components/tabs.js';
   *
   * Import only behaviors:
   *   import { initAccordions } from 'kern/src-js/behaviors/accordion.js';
   */

  if (typeof window !== 'undefined') window.Kern = Kern;

  exports.Kern = Kern;
  exports.KernDialog = KernDialog;
  exports.KernDrawer = KernDrawer;
  exports.KernDropdown = KernDropdown;
  exports.KernTabs = KernTabs;
  exports.KernToaster = KernToaster;
  exports.initAccordions = initAccordions;
  exports.initTableSort = initTableSort;
  exports.initToggles = initToggles;

  return exports;

})({});
