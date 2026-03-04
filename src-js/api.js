/**
 * The global Kern API object.
 * Consumed by kern.js and exposed as window.Kern.
 */

import { initAccordions } from './behaviors/accordion.js';
import { initToggles } from './behaviors/toggle.js';
import { initTableSort } from './behaviors/table-sort.js';

export const Kern = {
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
