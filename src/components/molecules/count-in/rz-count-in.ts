import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { base } from '../../../styles/base.js';

/**
 * rz-count-in — the 3 · 2 · 1 breather shown while a new sequence is counted in.
 *
 * The number re-keys on every change so the pulse animation restarts, which is
 * what makes the countdown feel like a countdown rather than a static digit.
 *
 * @prop {number} value - beats remaining; 0 hides it
 */
@customElement('rz-count-in')
export class RzCountIn extends LitElement {
  static styles = [
    base,
    css`
    :host {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      font-family: var(--font-family-base);
      color: var(--color-text-muted);
    }
    .digit {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: var(--radius-pill);
      background: var(--color-accent);
      color: var(--color-accent-contrast);
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      font-variant-numeric: tabular-nums;
      animation: pulse 0.4s ease-out;
    }
    .label {
      font-size: var(--font-size-lg);
    }
    @keyframes pulse {
      from {
        transform: scale(0.7);
        opacity: 0.4;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .digit {
        animation: none;
      }
    }
  `,
  ];

  @property({ type: Number }) value = 0;

  render() {
    if (this.value <= 0) return null;
    return html`
      <span class="digit" key=${this.value}>${this.value}</span>
      <span class="label">Get ready…</span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rz-count-in': RzCountIn;
  }
}
