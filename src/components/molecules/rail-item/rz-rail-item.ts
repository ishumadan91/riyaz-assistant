import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { base } from '../../../styles/base.js';

/**
 * rz-rail-item — one row of the sequence rail.
 *
 * @prop  {number} index - 1-based position shown at the left
 * @prop  {string} label - "23 · Todi"
 * @prop  {boolean} active
 * @prop  {boolean} done
 * @fires click - native; the rail turns it into rz-goto
 */
@customElement('rz-rail-item')
export class RzRailItem extends LitElement {
  static styles = [
    base,
    css`
    :host {
      display: block;
    }
    button {
      display: flex;
      align-items: baseline;
      gap: var(--space-2);
      width: 100%;
      text-align: left;
      border: 0;
      background: none;
      cursor: pointer;
      font-family: var(--font-family-base);
      font-size: var(--font-size-md);
      line-height: 1.4;
      color: var(--color-text);
      padding: var(--space-2);
      border-radius: var(--radius-md);
      transition:
        background 0.15s ease,
        color 0.15s ease;
    }
    button:hover {
      background: var(--color-surface-muted);
    }
    button:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: -2px;
    }
    .n {
      font-family: var(--font-mono);
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
      min-width: 1.25rem;
    }
    :host([active]) button {
      background: color-mix(in oklab, var(--color-primary) 10%, transparent);
      color: var(--color-primary);
      font-weight: var(--font-weight-semibold);
    }
    :host([done]) button {
      color: var(--color-text-muted);
    }
  `,
  ];

  @property({ type: Number }) index = 1;
  @property({ type: String }) label = '';
  @property({ type: Boolean, reflect: true }) active = false;
  @property({ type: Boolean, reflect: true }) done = false;

  render() {
    return html`
      <button type="button" aria-current=${this.active ? 'true' : 'false'}>
        <span class="n">${this.index}</span>
        <span>${this.label}</span>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rz-rail-item': RzRailItem;
  }
}
