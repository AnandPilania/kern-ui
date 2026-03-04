/**
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

// ── Web Components ──
export { KernTabs } from './components/tabs.js';
export { KernDropdown } from './components/dropdown.js';
export { KernDialog } from './components/dialog.js';
export { KernDrawer } from './components/drawer.js';
export { KernToaster } from './components/toaster.js';

// ── Behaviors ──
export { initAccordions } from './behaviors/accordion.js';
export { initToggles } from './behaviors/toggle.js';
export { initTableSort } from './behaviors/table-sort.js';

// ── API + boot ──
export { Kern } from './api.js';
import './boot.js';  // side-effect: boot sequence + window.Kern

// Expose globally for non-module usage
import { Kern as _K } from './api.js';
if (typeof window !== 'undefined') window.Kern = _K;
