import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * rz-checkbox — a bordered, tickable row. Used for the reveal toggle and for
 * every thaat in the pool.
 *
 * @prop  {boolean} checked
 * @fires rz-checkbox-change - CustomEvent<{ checked: boolean }>
 */
@customElement('rz-checkbox')
export class RzCheckbox extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    label {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      min-height: 0;
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      font-family: var(--font-family-base);
      font-size: var(--font-size-md);
      color: var(--color-text);
      cursor: pointer;
      transition:
        background 0.15s ease,
        border-color 0.15s ease;
    }
    label:hover {
      background: var(--color-surface-muted);
    }
    :host([checked]) label {
      border-color: var(--color-primary);
      background: var(--color-teal-100);
    }
    input {
      width: 1.125rem;
      height: 1.125rem;
      flex-shrink: 0;
      accent-color: var(--color-primary);
      cursor: pointer;
      margin: 0;
    }
    input:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
  `;

  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: String }) label = '';

  /**
   * Controlled: the box never sets its own `checked`. It reports the intent and
   * snaps the native input back to the current property, so an owner that
   * refuses the change (the thaat pool declining to empty itself) leaves the
   * tick visibly intact. Self-mutating here would clear the box while the
   * owner's state said otherwise, and Lit's dirty-check — seeing an unchanged
   * bound value — would never put it back.
   */
  private toggle(e: Event) {
    const input = e.target as HTMLInputElement;
    const checked = input.checked;
    input.checked = this.checked;
    this.dispatchEvent(
      new CustomEvent('rz-checkbox-change', {
        detail: { checked },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    return html`
      <label>
        <input type="checkbox" .checked=${this.checked} @change=${this.toggle} />
        <span>${this.label || html`<slot></slot>`}</span>
      </label>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rz-checkbox': RzCheckbox;
  }
}
