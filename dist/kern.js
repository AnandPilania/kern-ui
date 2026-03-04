(function(window){"use strict";

/* === utils.js === */
function emit(el, name, detail = {}) {
  return el.dispatchEvent(
    new CustomEvent(name, { bubbles: true, cancelable: true, detail })
  );
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function firstFocusable(el) {
  return el?.querySelector(
    'button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"]),input:not([disabled]),select:not([disabled]),textarea:not([disabled])'
  ) ?? null;
}

const $ = (sel, ctx = document) => ctx.querySelector(sel);

const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* === behaviors/accordion.js === */
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

/* === behaviors/toggle.js === */
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

/* === behaviors/table-sort.js === */
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

/* === components/tabs.js === */
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

/* === components/dropdown.js === */
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

/* === components/dialog.js === */
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

/* === components/drawer.js === */
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

/* === components/toaster.js === */
class KernToaster extends HTMLElement {
  connectedCallback() {
    if (!this.hasAttribute('data-position')) {
      this.setAttribute('data-position', 'bottom-right');
    }
    this.setAttribute('aria-live', 'polite');
    this.setAttribute('aria-atomic', 'false');
  }

  
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

/* === api.js === */
const Kern = {
  version: '1.0.0',

  
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

  
  dialog(selector) {
    const el = typeof selector === 'string'
      ? (document.getElementById(selector) ?? document.querySelector(selector))
      : selector;

    const wc = el?.closest?.('kern-dialog') ?? el;

    if (typeof wc?.open === 'function') wc.open();
    else if (el instanceof HTMLDialogElement) el.showModal();

    return wc;
  },

  
  drawer(selector) {
    const el = typeof selector === 'string'
      ? (document.getElementById(selector) ?? document.querySelector(selector))
      : selector;

    const wc = el?.closest?.('kern-drawer') ?? el;

    if (typeof wc?.open === 'function') wc.open();
    return wc;
  },

  
  setAccent(name) {
    document.documentElement.setAttribute('data-accent', name);
  },

  
  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('kern-theme', theme); } catch (_) {}
  },

  
  setRadius(name) {
    if (name === 'default') document.documentElement.removeAttribute('data-radius');
    else document.documentElement.setAttribute('data-radius', name);
  },

  
  init(root = document) {
    initAccordions(root);
    initToggles(root);
    initTableSort(root);
  },
};

/* === boot.js === */
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

if(typeof window!=="undefined")window.Kern=Kern;
})(window);
