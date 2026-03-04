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

import { emit } from '../utils.js';

export class KernTabs extends HTMLElement {
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
