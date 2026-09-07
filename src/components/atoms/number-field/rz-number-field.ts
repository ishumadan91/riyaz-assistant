import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * rz-number-field — a bounded numeric input.
 *
 * Clamps to `min`/`max` on commit and writes the clamped value back into the
 * field, so a typed 999 becomes the maximum rather than being silently ignored.
 *
 * @prop  {number} value
 * @fires rz-number-change - CustomEvent<{ value: number }> on commit
 */
@customElement('rz-number-field')
export class RzNumberField extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }
    input {
      width: 100%;
      height: 2.25rem;
      font-family: var(--font-family-base);
      font-size: var(--font-size-md);
      color: var(--color-text);
      background: var(--color-surface);
      border: 1px solid var(--color-neutral-300);
      border-radius: var(--radius-md);
      padding: 0 var(--space-3);
      text-align: center;
    }
    input:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 1px;
      border-color: var(--color-primary);
    }
  `;

  @property({ type: Number }) value = 0;
  @property({ type: Number }) min = 0;
  @property({ type: Number }) max = 100;
  @property({ type: Number }) step = 1;
  @property({ type: String }) label = '';

  private commit(e: Event) {
    const input = e.target as HTMLInputElement;
    const raw = Number(input.value);
    const value = Number.isFinite(raw)
      ? Math.min(this.max, Math.max(this.min, Math.round(raw)))
      : this.value;
    this.value = value;
    input.value = String(value);
    this.dispatchEvent(
      new CustomEvent('rz-number-change', {
        detail: { value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    return html`
      <input
        type="number"
        .value=${String(this.value)}
        min=${this.min}
        max=${this.max}
        step=${this.step}
        aria-label=${this.label}
        @change=${this.commit}
      />
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rz-number-field': RzNumberField;
  }
}
