/**
 * kern/src-js/utils.js
 * Shared utilities used across components and behaviors.
 */

/** Dispatch a bubbling, cancellable CustomEvent */
export function emit(el, name, detail = {}) {
  return el.dispatchEvent(
    new CustomEvent(name, { bubbles: true, cancelable: true, detail })
  );
}

/** HTML-escape a string (for dynamic toast content) */
export function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Return the first focusable element inside a container */
export function firstFocusable(el) {
  return el?.querySelector(
    'button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"]),input:not([disabled]),select:not([disabled]),textarea:not([disabled])'
  ) ?? null;
}

/** Shorthand querySelector */
export const $ = (sel, ctx = document) => ctx.querySelector(sel);

/** Shorthand querySelectorAll → Array */
export const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
