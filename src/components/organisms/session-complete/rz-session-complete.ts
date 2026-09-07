import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../../atoms/button/rz-button.js';

/**
 * rz-session-complete — shown once the tenth sequence finishes.
 *
 * @fires rz-restart
 */
@customElement('rz-session-complete')
export class RzSessionComplete extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: var(--space-8) var(--space-6);
      font-family: var(--font-family-base);
      color: var(--color-text-muted);
    }
    .title {
      margin: 0 0 var(--space-2);
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-heading);
    }
    p {
      margin: 0 0 var(--space-4);
      font-size: var(--font-size-lg);
    }
  `;

  @property({ type: Number }) sequences = 10;

  render() {
    return html`
      <p class="title">Riyāz complete</p>
      <p>${this.sequences} sequences, five alankars, two thaats.</p>
      <rz-button
        variant="primary"
        label="Start another session"
        @click=${() =>
          this.dispatchEvent(new CustomEvent('rz-restart', { bubbles: true, composed: true }))}
      ></rz-button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rz-session-complete': RzSessionComplete;
  }
}
