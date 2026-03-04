# kern ui

**Attribute-driven, zero-build UI library.**
Configure in HTML. Theme in CSS. Control in JS. No build step. Ever.

```html
<link rel="stylesheet" href="https://unpkg.com/kern-ui@0.1.3/dist/kern.min.css">
<script src="https://unpkg.com/kern-ui@0.1.3/dist/kern.min.js"></script>
```

**50 KB CSS · 15 KB JS — 13 KB + 2 KB gzipped — Zero dependencies**

---

## Table of contents

- [Why Kern](#why-kern)
- [Quick start](#quick-start)
- [Theming](#theming)
- [Components A–Z](#components)
- [Layout utilities](#layout)
- [JavaScript API](#javascript-api)
- [Modular imports](#modular-imports)
- [Project structure](#project-structure)
- [Browser support](#browser-support)

---

## Why Kern

Most UI libraries demand a build step, a framework, or hundreds of KB of JS. Kern does not.

- **Attributes, not classes.** `<button data-variant="outline">` instead of `class="btn btn-outline btn-md"`.
- **Zero build step.** Two files via CDN. Works with Rails, Laravel, Django, plain HTML — anything.
- **Full dark mode.** One attribute on `<html>`. No per-element class toggling.
- **HSL accent system.** Change one CSS variable to repaint your entire UI.
- **Modular by design.** Import only the CSS and JS you need. ESM tree-shakeable.
- **Accessible out of the box.** ARIA attributes, keyboard navigation, and focus trapping built in.

---

## Quick start

### CDN (simplest)

```html
<!DOCTYPE html>
<html lang="en" data-theme="dark" data-accent="violet">
<head>
  <link rel="stylesheet" href="https://unpkg.com/kern-ui@0.1.3/dist/kern.min.css">
</head>
<body>
  <button>Primary</button>
  <button data-variant="outline">Outline</button>

  <kern-dropdown>
    <button data-dropdown-trigger>Options ▾</button>
    <div data-dropdown-content>
      <a data-dropdown-item href="#">Edit</a>
      <a data-dropdown-item data-color="danger" href="#">Delete</a>
    </div>
  </kern-dropdown>

  <script src="https://unpkg.com/kern-ui@0.1.3/dist/kern.min.js"></script>
  <script>
    Kern.toast({ title: 'Hello!', message: 'Kern is ready.', color: 'success' });
  </script>
</body>
</html>
```

### npm

```bash
npm install kern-ui
```

```js
import 'kern-ui';                                           // full library
import { KernDialog } from 'kern-ui/components/dialog.js'; // single component
```

```css
@import 'kern-ui/dist/kern.css';              /* full CSS */
@import 'kern-ui/src/components/button.css';  /* single component */
```

---

## Theming

### Dark / light mode

```html
<html data-theme="dark">   <!-- force dark  -->
<html data-theme="light">  <!-- force light -->
<html>                     <!-- system default (prefers-color-scheme) -->
```

```js
Kern.setTheme('dark');   // sets attribute + persists to localStorage
Kern.setTheme('light');
```

### Accent colors

Six built-in presets. One attribute change repaints every interactive element.

| Value    | Hue               |
| -------- | ----------------- |
| `amber`  | 38° warm gold     |
| `blue`   | 214° classic blue |
| `violet` | 262° purple       |
| `green`  | 142° emerald      |
| `rose`   | 346° pink-red     |
| `cyan`   | 192° teal         |
| `orange` | 24° orange        |
| `red`    | 4° red            |

```html
<html data-accent="violet">
```

```js
Kern.setAccent('violet');
```

**Custom accent — one CSS variable change:**

```css
:root {
  --k-accent-h: 220;  /* hue: 0–360 */
  --k-accent-s: 85%;
  --k-accent-l: 52%;
}
```

### Border radius presets

```html
<html data-radius="none">    <!-- 0px — sharp everywhere -->
<html data-radius="sharp">   <!-- 2px — subtle rounding  -->
<!-- no attribute -->         <!-- 6px — default          -->
<html data-radius="round">   <!-- 12px — soft corners    -->
```

```js
Kern.setRadius('round');
Kern.setRadius('default');  // removes the attribute
```

### Key CSS custom properties

Override any token at `:root` or scoped to a selector:

```css
:root {
  /* Fonts */
  --k-font-sans: 'Inter', sans-serif;
  --k-font-mono: 'JetBrains Mono', monospace;

  /* Component sizing */
  --k-btn-height:    36px;
  --k-btn-height-sm: 28px;
  --k-btn-height-lg: 44px;
  --k-input-height:  36px;
  --k-card-padding:  1.25rem;
  --k-sidebar-width: 260px;

  /* Colors (dark mode example) */
  --k-bg:       hsl(0, 0%, 5%);
  --k-surface:  hsl(0, 0%, 8%);
  --k-surface-2: hsl(0, 0%, 11%);
  --k-text:     hsl(0, 0%, 95%);
  --k-text-2:   hsl(0, 0%, 65%);
  --k-text-3:   hsl(0, 0%, 40%);
  --k-border:   hsl(0, 0%, 16%);
}
```

Full token reference: [`src/tokens/`](src/tokens/)

---

## Components

### Button

```html
<!-- Variants -->
<button>Primary</button>
<button data-variant="secondary">Secondary</button>
<button data-variant="outline">Outline</button>
<button data-variant="ghost">Ghost</button>
<button data-variant="danger">Danger</button>
<button data-variant="link">Link</button>

<!-- Sizes -->
<button data-size="sm">Small</button>
<button>Default</button>
<button data-size="lg">Large</button>
<button data-size="icon">★</button>

<!-- States -->
<button data-loading>Saving…</button>
<button disabled>Disabled</button>
<button data-color="success">Success</button>
<button data-color="warning">Warning</button>
<button data-color="info">Info</button>

<!-- Button group -->
<div role="group">
  <button data-variant="outline">Day</button>
  <button>Week</button>
  <button data-variant="outline">Month</button>
</div>
```

---

### Form inputs

```html
<!-- Field wrapper with label, hint, and validation -->
<div data-field>
  <label data-required>Email address</label>
  <input type="email" placeholder="you@example.com">
  <span data-hint>We'll never share your email.</span>
</div>

<!-- Validation states -->
<input type="text" data-state="success" value="Valid value">
<span data-hint data-state="success">Looks good!</span>

<input type="text" data-state="error" value="bad@">
<span data-hint data-state="error">Enter a valid email address.</span>

<!-- Sizes: sm | default | lg -->
<input data-size="sm" type="text" placeholder="Small">
<input type="text" placeholder="Default">
<input data-size="lg" type="text" placeholder="Large">

<!-- Textarea -->
<textarea rows="4" placeholder="Write something…"></textarea>
<textarea disabled>Cannot edit</textarea>
```

---

### Select

```html
<div data-field>
  <label>Country</label>
  <select>
    <option>United States</option>
    <option>United Kingdom</option>
    <option>Germany</option>
  </select>
</div>

<select disabled><option>Locked</option></select>
```

---

### Checkbox & Radio

```html
<label><input type="checkbox" checked> Notifications</label>
<label><input type="checkbox"> Marketing emails</label>
<label><input type="checkbox" disabled> Disabled</label>

<label><input type="radio" name="plan" checked> Starter</label>
<label><input type="radio" name="plan"> Pro</label>
<label><input type="radio" name="plan" disabled> Unavailable</label>
```

---

### Switch

```html
<label data-switch>
  <input type="checkbox" checked>
  <div data-switch-track></div>
  Dark mode
</label>

<!-- Small -->
<label data-switch data-size="sm">
  <input type="checkbox">
  <div data-switch-track></div>
  Compact switch
</label>

<!-- Disabled -->
<label data-switch>
  <input type="checkbox" disabled>
  <div data-switch-track></div>
  <span style="color:var(--k-text-3)">Disabled</span>
</label>
```

---

### Range

```html
<div data-field>
  <label>Volume — 70%</label>
  <input type="range" min="0" max="100" value="70">
</div>
```

---

### Input group

```html
<!-- Prefix -->
<div data-input-group>
  <span data-addon>https://</span>
  <input type="text" placeholder="yoursite.com">
</div>

<!-- Suffix -->
<div data-input-group>
  <input type="text" placeholder="username">
  <span data-addon>@kern.ui</span>
</div>

<!-- Both sides -->
<div data-input-group>
  <span data-addon>$</span>
  <input type="number" placeholder="0.00">
  <span data-addon>USD</span>
</div>

<!-- Button suffix -->
<div data-input-group>
  <input type="text" placeholder="Search…">
  <button>Search</button>
</div>
```

---

### Card

```html
<!-- Structured slots: header, title, desc, footer -->
<div data-card>
  <div data-card-header>
    <div>
      <div data-card-title>Card title</div>
      <div data-card-desc>Supporting description.</div>
    </div>
    <span data-badge data-color="accent">New</span>
  </div>
  <p>Card body content.</p>
  <div data-card-footer>
    <button>Confirm</button>
    <button data-variant="ghost">Cancel</button>
  </div>
</div>

<!-- Variants -->
<div data-card data-variant="flat">…</div>    <!-- no shadow, border only  -->
<div data-card data-variant="raised">…</div>  <!-- stronger shadow          -->
<div data-card data-variant="inset">…</div>   <!-- recessed surface         -->
<div data-card data-variant="ghost">…</div>   <!-- transparent, no border   -->
<div data-card data-clickable>…</div>         <!-- hover lift + cursor       -->
```

---

### Badge

```html
<!-- Colors: accent | success | warning | danger | info | (default) -->
<span data-badge>Default</span>
<span data-badge data-color="accent">Accent</span>
<span data-badge data-color="success">Success</span>
<span data-badge data-color="warning">Warning</span>
<span data-badge data-color="danger">Danger</span>
<span data-badge data-color="info">Info</span>

<!-- Variants -->
<span data-badge data-variant="solid" data-color="accent">Solid</span>
<span data-badge data-variant="pill"  data-color="success">New</span>

<!-- Status dot -->
<span data-badge data-color="success" data-dot>Online</span>
<span data-badge data-color="danger"  data-dot>Critical</span>
<span data-badge                      data-dot>Offline</span>
```

---

### Alert

```html
<div data-alert>
  <div>
    <div data-alert-title>Heads up</div>
    This is an informational alert.
  </div>
</div>

<div data-alert data-color="success">…</div>
<div data-alert data-color="warning">…</div>
<div data-alert data-color="danger">…</div>
<div data-alert data-color="neutral">…</div>
```

---

### Avatar

```html
<!-- Sizes: sm | default | lg | xl -->
<div data-avatar data-size="sm">JD</div>
<div data-avatar>JD</div>
<div data-avatar data-size="lg">JD</div>
<div data-avatar data-size="xl">JD</div>

<!-- Custom color -->
<div data-avatar style="background:hsl(262,30%,22%);color:hsl(262,75%,65%)">AM</div>

<!-- Overlapping group -->
<div data-avatar-group>
  <div data-avatar>JD</div>
  <div data-avatar>AM</div>
  <div data-avatar>SR</div>
  <div data-avatar style="font-size:.7rem">+4</div>
</div>
```

---

### Tooltip

Pure CSS — no JavaScript required.

```html
<!-- Default: top -->
<button data-tooltip="Saved to clipboard">Copy</button>

<!-- Placements -->
<button data-tooltip="Below me"  data-placement="bottom">Bottom</button>
<button data-tooltip="Left of me" data-placement="left">Left</button>
<button data-tooltip="Right of me" data-placement="right">Right</button>

<!-- Works on any element -->
<span data-badge data-color="info" data-tooltip="3 pending tasks">3</span>
```

---

### Tabs

Web Component. Arrow keys, Home, End keyboard navigation built in.

```html
<kern-tabs>
  <div data-tabs-list>
    <button data-tab>Overview</button>
    <button data-tab>Analytics</button>
    <button data-tab>Settings</button>
    <button data-tab>Billing</button>
  </div>
  <div data-tab-panel>Overview content</div>
  <div data-tab-panel>Analytics content</div>
  <div data-tab-panel>Settings content</div>
  <div data-tab-panel>Billing content</div>
</kern-tabs>

<!-- Pills variant -->
<kern-tabs data-variant="pills">…</kern-tabs>
```

**JS API:**

```js
const tabs = document.querySelector('kern-tabs');
tabs.goto(2);         // switch to panel at index 2 (with focus)
tabs.setActive(0);    // switch without moving focus

// Event emitted on every tab change
tabs.addEventListener('kern:tab-change', e => {
  console.log('Active index:', e.detail.index);
});
```

---

### Accordion

```html
<!-- Single open (default) — opening one closes others -->
<div data-accordion>
  <div data-accordion-item>
    <button data-accordion-trigger>What is Kern UI?</button>
    <div data-accordion-content>
      <div data-accordion-body>
        An attribute-driven UI library. No build step required.
      </div>
    </div>
  </div>
  <div data-accordion-item>
    <button data-accordion-trigger>How do I install it?</button>
    <div data-accordion-content>
      <div data-accordion-body>Drop in one CSS and one JS file via CDN or npm.</div>
    </div>
  </div>
</div>

<!-- Multi-open — all panels independent -->
<div data-accordion data-multi>…</div>
```

---

### Breadcrumb

```html
<!-- Slash separator (default) -->
<nav data-breadcrumb>
  <a href="#">Home</a>
  <span data-breadcrumb-sep></span>
  <a href="#">Products</a>
  <span data-breadcrumb-sep></span>
  <span aria-current="page">Kern UI</span>
</nav>

<!-- Other separators -->
<nav data-breadcrumb data-sep="dot">…</nav>
<nav data-breadcrumb data-sep="arrow">…</nav>
```

---

### Pagination

```html
<div data-pagination>
  <button data-page disabled>←</button>
  <button data-page aria-current="page">1</button>
  <button data-page>2</button>
  <button data-page>3</button>
  <span data-page style="border:none;background:none;cursor:default">…</span>
  <button data-page>12</button>
  <button data-page>→</button>
</div>
```

---

### Stepper

```html
<div data-stepper>
  <div data-step data-done>
    <div data-step-marker></div>
    <div data-step-label>Account</div>
  </div>
  <div data-step data-active>
    <div data-step-marker></div>
    <div data-step-label>Profile</div>
  </div>
  <div data-step>
    <div data-step-marker></div>
    <div data-step-label>Payment</div>
  </div>
  <div data-step>
    <div data-step-marker></div>
    <div data-step-label>Done</div>
  </div>
</div>
```

| State    | Attr          | Appearance           |
| -------- | ------------- | -------------------- |
| Upcoming | *(none)*      | Numbered circle      |
| Current  | `data-active` | Accent-filled circle |
| Complete | `data-done`   | ✓ checkmark          |

---

### Dialog

Wraps native `<dialog>`. Provides focus trapping, ESC-to-close, backdrop click to close, and auto-focus on first focusable element.

```html
<!-- Trigger — any element -->
<button data-toggle="confirm-dialog">Delete</button>

<!-- Dialog -->
<kern-dialog>
  <dialog id="confirm-dialog" data-size="sm">
    <div data-dialog-header>
      <div>
        <div data-dialog-title>Delete workspace?</div>
        <div data-dialog-desc>This cannot be undone.</div>
      </div>
      <button data-dialog-close>✕</button>
    </div>
    <div data-dialog-body>
      <div data-alert data-color="danger">
        <div>All projects and data will be permanently deleted.</div>
      </div>
    </div>
    <div data-dialog-footer>
      <button data-variant="ghost" data-dialog-close>Cancel</button>
      <button data-variant="danger">Delete</button>
    </div>
  </dialog>
</kern-dialog>
```

**Sizes:** `data-size="sm"` · *(default)* · `data-size="lg"` · `data-size="xl"` · `data-size="full"`

**JS API:**

```js
// Open by ID
Kern.dialog('confirm-dialog');

// Via element reference
const wc = document.querySelector('kern-dialog');
wc.open();
wc.close();
wc.toggle();

// Events
wc.addEventListener('kern:dialog-open',  () => {});
wc.addEventListener('kern:dialog-close', () => {});
```

---

### Drawer

```html
<kern-drawer>
  <div data-drawer-backdrop></div>
  <div data-drawer-panel data-side="right" data-size="default">
    <div data-drawer-header>
      <span data-drawer-title>Notifications</span>
      <button data-drawer-close>✕</button>
    </div>
    <div data-drawer-body>
      <!-- content -->
    </div>
    <div data-drawer-footer>
      <button>Mark all read</button>
    </div>
  </div>
</kern-drawer>
```

**Sides:** `data-side="right"` *(default)* · `data-side="left"`
**Sizes:** `data-size="sm"` · *(default)* · `data-size="lg"`

```js
Kern.drawer('my-drawer');

const wc = document.querySelector('kern-drawer');
wc.open();
wc.close();
wc.toggle();
```

---

### Dropdown

Web Component. Click outside, Escape, and full keyboard navigation handled automatically.

```html
<kern-dropdown>
  <button data-dropdown-trigger>Options ▾</button>
  <div data-dropdown-content>
    <div data-dropdown-label>Actions</div>
    <a data-dropdown-item href="#">Edit</a>
    <a data-dropdown-item href="#">Duplicate</a>
    <a data-dropdown-item href="#">Archive</a>
    <div data-dropdown-sep></div>
    <a data-dropdown-item data-color="danger" href="#">Delete</a>
  </div>
</kern-dropdown>

<!-- Align to right edge of trigger -->
<kern-dropdown data-align="end">…</kern-dropdown>
```

**JS API:**

```js
const dd = document.querySelector('kern-dropdown');
dd.open();
dd.close();
dd.toggle();
```

---

### Toast

Global API — no HTML boilerplate required. `<kern-toaster>` is created automatically.

```js
// Quick string
Kern.toast('Changes saved.');

// Full options
Kern.toast({
  title:       'Payment received',
  message:     '$1,240 from Alex Morgan.',
  color:       'success',       // success | warning | danger | accent | (default)
  duration:    4000,            // ms — set 0 for persistent toast
  dismissible: true,
  position:    'bottom-right',  // top-right | top-left | top-center
                                // bottom-right | bottom-left | bottom-center
});
```

**Optional explicit placement:**

```html
<kern-toaster data-position="top-right"></kern-toaster>
```

**JS API on the element:**

```js
const toaster = document.querySelector('kern-toaster');
toaster.add({ title: 'Done', color: 'success' });
toaster.clear(); // dismiss all toasts
```

---

### Progress & Spinner

```html
<!-- Basic bar -->
<div data-progress>
  <div data-progress-bar style="width: 65%"></div>
</div>

<!-- Colors: success | warning | danger | (default = accent) -->
<div data-progress data-color="success">
  <div data-progress-bar style="width: 80%"></div>
</div>

<!-- Sizes: sm | default | lg -->
<div data-progress data-size="sm">…</div>
<div data-progress data-size="lg">…</div>

<!-- Animated stripe -->
<div data-progress data-animated>
  <div data-progress-bar style="width: 70%"></div>
</div>

<!-- Indeterminate (infinite loop) -->
<div data-progress data-indeterminate>
  <div data-progress-bar></div>
</div>

<!-- Spinner -->
<div data-spinner></div>
<div data-spinner data-size="sm"></div>
<div data-spinner data-size="lg"></div>
<div data-spinner data-color="text"></div>
```

---

### Skeleton

```html
<!-- Rectangle (default) -->
<div data-skeleton style="height: 120px; border-radius: var(--k-r-md)"></div>

<!-- Circle -->
<div data-skeleton data-shape="circle" style="width: 40px; height: 40px"></div>

<!-- Text line -->
<div data-skeleton data-shape="text" style="width: 60%; height: .875rem"></div>

<!-- Typical card loading pattern -->
<div data-stack data-gap="sm">
  <div data-row data-gap="sm">
    <div data-skeleton data-shape="circle" style="width:40px;height:40px;flex-shrink:0"></div>
    <div data-stack data-gap="sm" style="flex:1">
      <div data-skeleton data-shape="text" style="width:60%;height:.875rem"></div>
      <div data-skeleton data-shape="text" style="width:40%;height:.75rem"></div>
    </div>
  </div>
  <div data-skeleton style="height:120px;border-radius:var(--k-r-md)"></div>
  <div data-skeleton data-shape="text" style="height:.875rem"></div>
  <div data-skeleton data-shape="text" style="width:75%;height:.875rem"></div>
</div>
```

---

### Table

Client-side column sort via `data-sort` on `<th>`. Click cycles: unsorted → ascending → descending.

```html
<div data-table-wrap>
  <table data-hover>
    <thead>
      <tr>
        <th>Name</th>
        <th data-sort>Role</th>
        <th data-sort>Status</th>
        <th data-sort>Joined</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Jane Doe</td>
        <td>Admin</td>
        <td><span data-badge data-color="success" data-dot>Active</span></td>
        <td>Jan 12, 2024</td>
        <td><button data-variant="ghost" data-size="sm">Edit</button></td>
      </tr>
    </tbody>
  </table>
</div>
```

**Table variants:**

| Attribute                    | Effect                     |
| ---------------------------- | -------------------------- |
| `data-hover`                 | Row highlight on hover     |
| `data-variant="striped"`     | Alternating row background |
| `data-variant="bordered"`    | Cell borders               |
| `data-variant="compact"`     | Reduced padding            |
| `data-variant="comfortable"` | Increased padding          |

---

## Layout

### Grid

Responsive column grid. Collapses to 1 column on mobile.

```html
<div data-grid="2">…</div>
<div data-grid="3">…</div>
<div data-grid="4">…</div>
<div data-grid="auto">…</div>  <!-- auto-fill, min 240px per col -->

<!-- Gap sizes: xs | sm | md (default) | lg | xl -->
<div data-grid="3" data-gap="sm">…</div>
<div data-grid="3" data-gap="lg">…</div>
```

### Stack & Row

```html
<!-- Vertical stack -->
<div data-stack>…</div>
<div data-stack data-gap="sm">…</div>
<div data-stack data-gap="lg">…</div>

<!-- Horizontal row -->
<div data-row>…</div>
<div data-row data-gap="md">…</div>
<div data-row data-align="center">…</div>
<div data-row data-justify="between">…</div>
<div data-row data-justify="center">…</div>
```

### Divider

```html
<div data-divider></div>

<!-- With text label -->
<div data-divider>Or continue with</div>
<div data-divider>Section break</div>
```

---

## JavaScript API

The `Kern` global is available immediately after the script loads.

```js
// Notifications
Kern.toast(messageOrOptions)

// Overlays
Kern.dialog(idOrElement)      // open a kern-dialog
Kern.drawer(idOrElement)      // open a kern-drawer

// Theming (all persist to localStorage)
Kern.setTheme('dark' | 'light')
Kern.setAccent('violet' | 'amber' | 'blue' | 'green' | 'rose' | 'cyan')
Kern.setRadius('none' | 'sharp' | 'default' | 'round')

// Dynamic content — re-run behavior init on injected HTML
Kern.init(rootElement)         // default: document
```

**Re-initializing dynamic content:**

Kern's `MutationObserver` handles most dynamic insertion automatically. For content injected outside the observed tree, call `Kern.init()` manually:

```js
const partial = document.getElementById('server-partial');
Kern.init(partial);
```

---

## Modular imports

### CSS — import only what you need

```css
/* Tokens only (for custom components using Kern variables) */
@import 'kern-ui/src/tokens/index.css';

/* Tokens + base + specific components */
@import 'kern-ui/src/tokens/index.css';
@import 'kern-ui/src/base/index.css';
@import 'kern-ui/src/components/button.css';
@import 'kern-ui/src/components/card.css';
@import 'kern-ui/src/components/form.css';
@import 'kern-ui/src/components/table.css';

/* Full library */
@import 'kern-ui/src/kern.css';
```

### JS — import only what you need

```js
// Individual web components
import { KernTabs }     from 'kern-ui/src-js/components/tabs.js';
import { KernDialog }   from 'kern-ui/src-js/components/dialog.js';
import { KernDrawer }   from 'kern-ui/src-js/components/drawer.js';
import { KernDropdown } from 'kern-ui/src-js/components/dropdown.js';
import { KernToaster }  from 'kern-ui/src-js/components/toaster.js';

// Behaviors (no web components, pure vanilla JS)
import { initAccordions } from 'kern-ui/src-js/behaviors/accordion.js';
import { initToggles }    from 'kern-ui/src-js/behaviors/toggle.js';
import { initTableSort }  from 'kern-ui/src-js/behaviors/table-sort.js';

// API object only (no auto-boot)
import { Kern } from 'kern-ui/src-js/api.js';

// Full library (registers WCs, boots, sets window.Kern)
import 'kern-ui/src-js/kern.js';
```

---

## Project structure

```
kern-ui/
├── src/                          CSS source — 42 modular files
│   ├── tokens/
│   │   ├── colors.css            Neutral scale, semantic surfaces, status colors
│   │   ├── accent.css            HSL accent system + 8 presets
│   │   ├── typography.css        Font family + size scale
│   │   ├── spacing.css           Space scale (4px base grid)
│   │   ├── radius.css            Radius scale + preset overrides
│   │   ├── shadow.css            Shadow scale (sm → xl)
│   │   ├── motion.css            Easing curves + duration tokens
│   │   ├── z-index.css           Z-index scale
│   │   ├── components.css        Per-component size/spacing tokens
│   │   └── index.css
│   ├── base/
│   │   ├── reset.css
│   │   ├── typography.css        h1–h6, p, a, code, pre, kbd, mark, blockquote
│   │   └── index.css
│   ├── components/               22 component files (one per component)
│   │   ├── button.css
│   │   ├── form.css
│   │   ├── card.css
│   │   ├── badge.css
│   │   ├── alert.css
│   │   ├── avatar.css
│   │   ├── tooltip.css
│   │   ├── tabs.css
│   │   ├── accordion.css
│   │   ├── breadcrumb.css
│   │   ├── pagination.css
│   │   ├── stepper.css
│   │   ├── dialog.css
│   │   ├── drawer.css
│   │   ├── dropdown.css
│   │   ├── toast.css
│   │   ├── progress.css
│   │   ├── skeleton.css
│   │   ├── table.css
│   │   ├── switch.css
│   │   ├── sidebar.css
│   │   └── index.css
│   ├── layout/
│   │   ├── grid.css
│   │   ├── stack.css
│   │   ├── divider.css
│   │   └── index.css
│   ├── utils/
│   │   ├── helpers.css           sr-only, truncate, container, surface utils
│   │   ├── keyframes.css         All @keyframes (spin, pulse, slide-in, etc.)
│   │   ├── responsive.css        Mobile breakpoint overrides
│   │   └── index.css
│   └── kern.css                  Root entry — @imports everything
│
├── src-js/                       JS source — 12 ESM modules
│   ├── components/
│   │   ├── tabs.js               <kern-tabs> — keyboard nav, ARIA, goto() API
│   │   ├── dropdown.js           <kern-dropdown> — positioning, keyboard, outside-click
│   │   ├── dialog.js             <kern-dialog> — focus trap, backdrop, auto-focus
│   │   ├── drawer.js             <kern-drawer> — slide panels, body scroll lock
│   │   └── toaster.js            <kern-toaster> — toast queue, 6 positions, auto-dismiss
│   ├── behaviors/
│   │   ├── accordion.js          initAccordions(root) — single/multi open
│   │   ├── toggle.js             initToggles(root) — data-toggle="id" attr
│   │   └── table-sort.js         initTableSort(root) — asc/desc, numeric detection
│   ├── utils.js                  emit(), esc(), firstFocusable(), $, $$
│   ├── api.js                    Kern.toast/dialog/drawer/setTheme/setAccent/setRadius/init
│   ├── boot.js                   DOMContentLoaded listener + MutationObserver
│   └── kern.js                   Root ESM entry — re-exports all, runs boot
│
├── dist/                         Production builds
│   ├── kern.css                  Readable concatenated CSS (43 KB)
│   ├── kern.min.css              Minified CSS (41 KB · 7 KB gzipped)
│   ├── kern.js                   IIFE bundle (15 KB)
│   └── kern.min.js               Minified IIFE (12 KB · 3 KB gzipped)
│
├── docs/
│   ├── demo.html                 Complete demo — all 26 components + 7 app pages
│   └── showcase.html             Themed app showcase (analytics/inbox/travel/SaaS/shop)
│
├── scripts/
│   └── build.js                  CSS build — resolves @imports, concatenates, minifies
│
├── package.json
└── README.md
```

---

## Browser support

Kern targets all evergreen browsers. No Internet Explorer. No polyfills.

| Feature used          | Chrome | Firefox | Safari |
| --------------------- | ------ | ------- | ------ |
| CSS custom properties | 49     | 31      | 9.1    |
| Custom Elements v1    | 54     | 63      | 10.1   |
| Native `<dialog>`     | 37     | 98      | 15.4   |
| `:has()` selector     | 105    | 121     | 15.4   |
| `@layer` (optional)   | 99     | 97      | 15.4   |

---

## License

MIT © Kern UI
