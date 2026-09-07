import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { base } from '../../../styles/base.js';

/**
 * rz-card — a white panel with an optional title row.
 *
 * Slots: `title` (left of the row), `badges` (right of it), default (the body).
 * The title row is only rendered when something is slotted into it.
 */
@customElement('rz-card')
export class RzCard extends LitElement {
  static styles = [
    base,
    css`
    :host {
      display: block;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-card);
      padding: var(--space-6);
    }
    @media (max-width: 560px) {
      :host {
        padding: var(--space-4);
      }
    }
    .title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
      margin-bottom: var(--space-3);
    }
    .badges {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: var(--space-2);
    }
    ::slotted([slot='title']) {
      margin: 0;
      font-family: var(--font-family-base);
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-heading);
    }
  `,
  ];

  /** Set when nothing is slotted into `title`/`badges`, to drop the row. */
  @property({ type: Boolean, reflect: true, attribute: 'no-header' }) noHeader = false;

  render() {
    return html`
      ${this.noHeader
        ? ''
        : html`<div class="title-row">
            <slot name="title"></slot>
            <div class="badges"><slot name="badges"></slot></div>
          </div>`}
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rz-card': RzCard;
  }
}
