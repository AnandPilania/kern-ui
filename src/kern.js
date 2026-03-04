/**
 * KERN UI — JavaScript layer
 * Web Components + imperative API
 * Zero dependencies, ~3KB gzipped
 */

(function (global) {
    'use strict';

    // ============================================================
    // Utilities
    // ============================================================
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
    const emit = (el, name, detail = {}) => el.dispatchEvent(new CustomEvent(name, { bubbles: true, cancelable: true, detail }));

    // ============================================================
    // kern-tabs
    // ============================================================
    class KernTabs extends HTMLElement {
        connectedCallback() {
            this._init();
        }
        _init() {
            const tabs = $$('[data-tab]', this);
            const panels = $$('[data-tab-panel]', this);
            tabs.forEach((tab, i) => {
                tab.setAttribute('role', 'tab');
                tab.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
                tab.setAttribute('tabindex', i === 0 ? '0' : '-1');
                if (panels[i]) tab.setAttribute('aria-controls', panels[i].id || (panels[i].id = `k-panel-${i}`));
                tab.addEventListener('click', () => this.goto(i));
                tab.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowRight') this.goto((i + 1) % tabs.length);
                    if (e.key === 'ArrowLeft') this.goto((i - 1 + tabs.length) % tabs.length);
                    if (e.key === 'Home') this.goto(0);
                    if (e.key === 'End') this.goto(tabs.length - 1);
                });
            });
            // show first panel
            const active = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
            if (panels[active >= 0 ? active : 0]) panels[active >= 0 ? active : 0].setAttribute('data-active', '');
        }
        goto(index) {
            const tabs = $$('[data-tab]', this);
            const panels = $$('[data-tab-panel]', this);
            tabs.forEach((t, i) => {
                t.setAttribute('aria-selected', i === index ? 'true' : 'false');
                t.setAttribute('tabindex', i === index ? '0' : '-1');
            });
            panels.forEach((p, i) => {
                if (i === index) p.setAttribute('data-active', '');
                else p.removeAttribute('data-active');
            });
            if (tabs[index]) tabs[index].focus();
            emit(this, 'kern:tab-change', { index, tab: tabs[index] });
        }
        setActive(index) { this.goto(index); }
    }
    customElements.define('kern-tabs', KernTabs);


    // ============================================================
    // kern-dropdown
    // ============================================================
    class KernDropdown extends HTMLElement {
        connectedCallback() {
            const trigger = $('[data-dropdown-trigger]', this) || this.firstElementChild;
            if (!trigger) return;
            trigger.setAttribute('aria-haspopup', 'true');
            trigger.setAttribute('aria-expanded', 'false');
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                this.hasAttribute('open') ? this.close() : this.open();
            });
            // close on outside click
            document.addEventListener('click', (e) => {
                if (!this.contains(e.target)) this.close();
            });
            // keyboard
            const content = $('[data-dropdown-content]', this);
            trigger.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') this.close();
                if ((e.key === 'Enter' || e.key === ' ') && !this.hasAttribute('open')) { e.preventDefault(); this.open(); }
                if (e.key === 'ArrowDown') { e.preventDefault(); this.open(); this._focusItem(0); }
            });
            if (content) {
                content.addEventListener('keydown', (e) => {
                    const items = $$('[data-dropdown-item]:not([disabled])', content);
                    const idx = items.indexOf(document.activeElement);
                    if (e.key === 'ArrowDown') { e.preventDefault(); this._focusItem(Math.min(idx + 1, items.length - 1)); }
                    if (e.key === 'ArrowUp') { e.preventDefault(); idx > 0 ? this._focusItem(idx - 1) : trigger.focus(); }
                    if (e.key === 'Escape') { this.close(); trigger.focus(); }
                });
                $$('[data-dropdown-item]', content).forEach(item => {
                    item.setAttribute('role', 'menuitem');
                    item.setAttribute('tabindex', '-1');
                });
            }
        }
        open() {
            this.setAttribute('open', '');
            const trigger = $('[data-dropdown-trigger]', this) || this.firstElementChild;
            if (trigger) trigger.setAttribute('aria-expanded', 'true');
            emit(this, 'kern:dropdown-open');
        }
        close() {
            this.removeAttribute('open');
            const trigger = $('[data-dropdown-trigger]', this) || this.firstElementChild;
            if (trigger) trigger.setAttribute('aria-expanded', 'false');
            emit(this, 'kern:dropdown-close');
        }
        toggle() { this.hasAttribute('open') ? this.close() : this.open(); }
        _focusItem(index) {
            const items = $$('[data-dropdown-item]:not([disabled])', this);
            if (items[index]) items[index].focus();
        }
    }
    customElements.define('kern-dropdown', KernDropdown);


    // ============================================================
    // kern-dialog
    // ============================================================
    class KernDialog extends HTMLElement {
        connectedCallback() {
            // wrap in native <dialog> if not already
            const dlg = $('dialog', this);
            if (dlg) {
                this._dialog = dlg;
                this._setup(dlg);
            }
        }
        _setup(dlg) {
            // close button
            $$('[data-dialog-close]', dlg).forEach(btn => btn.addEventListener('click', () => this.close()));
            // backdrop click
            dlg.addEventListener('click', (e) => {
                if (e.target === dlg && !dlg.hasAttribute('data-no-backdrop-close')) this.close();
            });
            // escape handled natively
            dlg.addEventListener('cancel', (e) => { e.preventDefault(); this.close(); });
        }
        open() {
            if (!this._dialog) return;
            this._dialog.showModal();
            emit(this, 'kern:dialog-open');
            // trap focus
            const focusable = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', this._dialog);
            if (focusable[0]) focusable[0].focus();
        }
        close() {
            if (!this._dialog) return;
            this._dialog.close();
            emit(this, 'kern:dialog-close');
        }
        toggle() { this._dialog?.open ? this.close() : this.open(); }
    }
    customElements.define('kern-dialog', KernDialog);


    // ============================================================
    // kern-drawer
    // ============================================================
    class KernDrawer extends HTMLElement {
        connectedCallback() {
            $$('[data-drawer-close]', this).forEach(btn => btn.addEventListener('click', () => this.close()));
            const backdrop = $('[data-drawer-backdrop]', this);
            if (backdrop) backdrop.addEventListener('click', () => this.close());
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.hasAttribute('open')) this.close();
            });
        }
        open() {
            this.setAttribute('open', '');
            document.body.style.overflow = 'hidden';
            emit(this, 'kern:drawer-open');
            const focusable = $$('button, [href], input, [tabindex]:not([tabindex="-1"])', this);
            if (focusable[0]) setTimeout(() => focusable[0].focus(), 50);
        }
        close() {
            this.removeAttribute('open');
            document.body.style.overflow = '';
            emit(this, 'kern:drawer-close');
        }
        toggle() { this.hasAttribute('open') ? this.close() : this.open(); }
    }
    customElements.define('kern-drawer', KernDrawer);


    // ============================================================
    // kern-toaster + Toast API
    // ============================================================
    class KernToaster extends HTMLElement {
        connectedCallback() {
            if (!this.hasAttribute('data-position')) {
                this.setAttribute('data-position', 'bottom-right');
            }
            this.setAttribute('aria-live', 'polite');
            this.setAttribute('aria-atomic', 'false');
        }
        add({ title = '', message = '', color = '', duration = 4000, dismissible = true } = {}) {
            const toast = document.createElement('div');
            toast.setAttribute('data-toast', '');
            toast.setAttribute('role', 'status');
            if (color) toast.setAttribute('data-color', color);

            toast.innerHTML = `
        <div data-toast-body>
          ${title ? `<div data-toast-title>${_esc(title)}</div>` : ''}
          ${message ? `<div data-toast-message>${_esc(message)}</div>` : ''}
        </div>
        ${dismissible ? `<button data-toast-close aria-label="Dismiss">✕</button>` : ''}
      `;
            const close = $('[data-toast-close]', toast);
            if (close) close.addEventListener('click', () => this._remove(toast));
            this.appendChild(toast);
            emit(this, 'kern:toast-add', { toast });

            if (duration > 0) setTimeout(() => this._remove(toast), duration);
            return toast;
        }
        _remove(toast) {
            if (!toast.isConnected) return;
            toast.setAttribute('data-removing', '');
            toast.addEventListener('animationend', () => { toast.remove(); emit(this, 'kern:toast-remove'); }, { once: true });
        }
        clear() { $$('[data-toast]', this).forEach(t => this._remove(t)); }
    }
    customElements.define('kern-toaster', KernToaster);

    function _esc(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }


    // ============================================================
    // Accordion (vanilla JS, no WC needed)
    // ============================================================
    function initAccordions(root = document) {
        $$('[data-accordion-trigger]', root).forEach(trigger => {
            if (trigger._kernInit) return;
            trigger._kernInit = true;
            trigger.setAttribute('aria-expanded', 'false');
            const content = trigger.closest('[data-accordion-item]')?.querySelector('[data-accordion-content]');
            if (!content) return;
            trigger.addEventListener('click', () => {
                const expanded = trigger.getAttribute('aria-expanded') === 'true';
                const accordion = trigger.closest('[data-accordion]');
                // close others if not multi
                if (accordion && !accordion.hasAttribute('data-multi')) {
                    $$('[data-accordion-trigger]', accordion).forEach(t => {
                        t.setAttribute('aria-expanded', 'false');
                        const c = t.closest('[data-accordion-item]')?.querySelector('[data-accordion-content]');
                        if (c) c.removeAttribute('data-open');
                    });
                }
                trigger.setAttribute('aria-expanded', expanded ? 'false' : 'true');
                if (expanded) content.removeAttribute('data-open');
                else content.setAttribute('data-open', '');
                emit(trigger, 'kern:accordion-change', { open: !expanded });
            });
        });
    }


    // ============================================================
    // data-toggle — wire any element to open/close a WC
    // ============================================================
    function initToggles(root = document) {
        $$('[data-toggle]', root).forEach(el => {
            if (el._kernInit) return;
            el._kernInit = true;
            el.addEventListener('click', () => {
                const target = document.getElementById(el.getAttribute('data-toggle')) || $(el.getAttribute('data-toggle'));
                if (!target) return;
                if (typeof target.toggle === 'function') target.toggle();
                else if (typeof target.open === 'function') target.open();
            });
        });
    }


    // ============================================================
    // Table sorting
    // ============================================================
    function initTables(root = document) {
        $$('th[data-sort]', root).forEach(th => {
            if (th._kernInit) return;
            th._kernInit = true;
            th.addEventListener('click', () => {
                const table = th.closest('table');
                if (!table) return;
                const tbody = table.querySelector('tbody');
                const col = [...th.parentElement.children].indexOf(th);
                const asc = th.getAttribute('data-sort') !== 'asc';

                $$('th[data-sort]', table).forEach(h => h.setAttribute('data-sort', ''));
                th.setAttribute('data-sort', asc ? 'asc' : 'desc');

                const rows = [...tbody.querySelectorAll('tr')];
                rows.sort((a, b) => {
                    const av = a.cells[col]?.textContent.trim() ?? '';
                    const bv = b.cells[col]?.textContent.trim() ?? '';
                    const n = parseFloat(av) - parseFloat(bv);
                    if (!isNaN(n)) return asc ? n : -n;
                    return asc ? av.localeCompare(bv) : bv.localeCompare(av);
                });
                rows.forEach(r => tbody.appendChild(r));
                emit(table, 'kern:sort', { column: col, ascending: asc });
            });
        });
    }


    // ============================================================
    // Theme toggle (data-theme-toggle)
    // ============================================================
    function initThemeToggles(root = document) {
        $$('[data-theme-toggle]', root).forEach(el => {
            if (el._kernInit) return;
            el._kernInit = true;
            el.addEventListener('click', () => {
                const current = document.documentElement.getAttribute('data-theme');
                const next = current === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', next);
                try { localStorage.setItem('kern-theme', next); } catch (e) { }
                emit(document, 'kern:theme-change', { theme: next });
            });
        });
    }


    // ============================================================
    // Public API: Kern
    // ============================================================
    const Kern = {
        version: '0.1.0',

        /** Toast shorthand */
        toast(options = {}) {
            const toaster = $('kern-toaster') || (() => {
                const t = document.createElement('kern-toaster');
                t.setAttribute('data-position', options.position || 'bottom-right');
                document.body.appendChild(t);
                return t;
            })();
            if (typeof options === 'string') options = { message: options };
            return toaster.add(options);
        },

        /** Open a dialog by id or selector */
        dialog(selector) {
            const el = typeof selector === 'string'
                ? (document.getElementById(selector) || $(selector))
                : selector;
            if (el instanceof KernDialog) el.open();
            else if (el instanceof HTMLDialogElement) el.showModal();
            return el;
        },

        /** Open a drawer by id or selector */
        drawer(selector) {
            const el = typeof selector === 'string'
                ? (document.getElementById(selector) || $(selector))
                : selector;
            if (el instanceof KernDrawer) el.open();
            return el;
        },

        /** Set accent color */
        setAccent(name) {
            document.documentElement.setAttribute('data-accent', name);
        },

        /** Set theme */
        setTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            try { localStorage.setItem('kern-theme', theme); } catch (e) { }
        },

        /** Set radius preset */
        setRadius(name) {
            document.documentElement.setAttribute('data-radius', name);
        },

        /** Re-init dynamic behaviors (call after DOM mutations) */
        init(root = document) {
            initAccordions(root);
            initToggles(root);
            initTables(root);
            initThemeToggles(root);
        }
    };

    // ============================================================
    // Boot
    // ============================================================
    function boot() {
        // restore saved theme
        try {
            const saved = localStorage.getItem('kern-theme');
            if (saved) document.documentElement.setAttribute('data-theme', saved);
        } catch (e) { }

        Kern.init();

        // re-init on DOM mutations
        if (typeof MutationObserver !== 'undefined') {
            new MutationObserver((mutations) => {
                mutations.forEach(m => m.addedNodes.forEach(n => {
                    if (n.nodeType === 1) Kern.init(n);
                }));
            }).observe(document.body, { childList: true, subtree: true });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    // Expose globally
    global.Kern = Kern;

})(typeof window !== 'undefined' ? window : globalThis);
