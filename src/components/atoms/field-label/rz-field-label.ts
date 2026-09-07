import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

/**
 * rz-field-label — the small uppercase label above a group of content:
 * "Aroha", "Avaroha", "Sequence", "Tempo".
 */
@customElement('rz-field-label')
export class RzFieldLabel extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--font-family-base);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--color-text-muted);
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rz-field-label': RzFieldLabel;
  }
}
