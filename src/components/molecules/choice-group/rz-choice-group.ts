import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { base } from '../../../styles/base.js';
import '../../atoms/field-label/rz-field-label.js';

export interface Choice {
  value: string;
  label: string;
  /** Shown beneath the row while this choice is the selected one. */
  hint?: string;
}

/**
 * rz-choice-group — pick exactly one, as a row of pills.
 *
 * Controlled, like `rz-checkbox`: it never sets its own `value`, it reports
 * the intent and lets the owner decide. The hint belongs to the *selected*
 * choice and is rendered once beneath the row rather than under every pill —
 * options whose labels need a sentence of explanation would otherwise turn a
 * one-line control into a paragraph each.
 *
 * @prop  {Choice[]} options
 * @prop  {string} value
 * @fires rz-choice-change - CustomEvent<{ value: string }>
 */
@customElement('rz-choice-group')
export class RzChoiceGroup extends LitElement {
  static styles = [
    base,
    css`
    :host {
      display: block;
      font-family: var(--font-family-base);
    }
    .row {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-wrap: wrap;
    }
    :host(:not([inline])) rz-field-label {
      margin-bottom: var(--space-2);
    }
    button {
      font-family: inherit;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      line-height: 1;
      padding: var(--space-2) var(--space-3);
      color: var(--color-text);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-pill);
      cursor: pointer;
      transition:
        background 0.15s ease,
        color 0.15s ease,
        border-color 0.15s ease;
    }
    button:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
    }
    button[aria-checked='true'] {
      background: var(--color-primary);
      border-color: var(--color-primary);
      color: var(--color-primary-contrast);
    }
    button:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
    .hint {
      margin: var(--space-2) 0 0;
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }
  `,
  ];

  @property({ attribute: false }) options: Choice[] = [];
  @property({ type: String }) value = '';
  @property({ type: String }) label = '';
  /** Put the label beside the pills instead of above them. */
  @property({ type: Boolean, reflect: true }) inline = false;

  private pick(value: string) {
    if (value === this.value) return;
    this.dispatchEvent(
      new CustomEvent('rz-choice-change', {
        detail: { value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    const hint = this.options.find((o) => o.value === this.value)?.hint;
    const label = this.label
      ? html`<rz-field-label>${this.label}</rz-field-label>`
      : nothing;
    const pills = html`
      <div class="row" role="radiogroup" aria-label=${this.label || 'Options'}>
        ${this.inline ? label : nothing}
        ${this.options.map(
          (o) => html`<button
            type="button"
            role="radio"
            aria-checked=${o.value === this.value ? 'true' : 'false'}
            @click=${() => this.pick(o.value)}
          >
            ${o.label}
          </button>`,
        )}
      </div>
    `;
    return html`
      ${this.inline ? nothing : label}${pills}
      ${hint ? html`<p class="hint">${hint}</p>` : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rz-choice-group': RzChoiceGroup;
  }
}
