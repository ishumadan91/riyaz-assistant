import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type BadgeTone = 'primary' | 'secondary';

/**
 * rz-badge — a pill label. Used for the session's two thaat chips and the
 * thaat name on the alankar card; `primary` marks Bilawal, the constant one.
 *
 * @prop {BadgeTone} tone
 */
@customElement('rz-badge')
export class RzBadge extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      font-family: var(--font-family-base);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      line-height: 1;
      padding: var(--space-1) var(--space-3);
      border: 1px solid transparent;
      border-radius: var(--radius-pill);
    }
    :host([tone='primary']) {
      background: var(--color-primary);
      color: var(--color-primary-contrast);
    }
    :host([tone='secondary']) {
      background: var(--color-surface-muted);
      color: var(--color-text);
      border-color: var(--color-border);
    }
  `;

  @property({ type: String, reflect: true }) tone: BadgeTone = 'secondary';
  @property({ type: String }) label = '';

  render() {
    return html`${this.label || html`<slot></slot>`}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rz-badge': RzBadge;
  }
}
