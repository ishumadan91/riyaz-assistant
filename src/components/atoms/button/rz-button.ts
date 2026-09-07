import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'link';
export type ButtonSize = 'sm' | 'md';

/**
 * rz-button — the design system's button atom.
 *
 *   - `primary`   → Bright Teal fill. Play, and the restart CTA.
 *   - `secondary` → neutral fill. New session.
 *   - `outline`   → teal rule, teal text. Prev / Next / Settings.
 *   - `link`      → borderless muted text. About, and panel Close.
 *
 * Renders light-DOM children as the label (use `label` for plain text).
 *
 * @prop  {ButtonVariant} variant
 * @prop  {ButtonSize} size
 * @fires click - native
 */
@customElement('rz-button')
export class RzButton extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }
    button {
      width: 100%;
      font-family: var(--font-family-base);
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      line-height: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      white-space: nowrap;
      border: 1px solid transparent;
      border-radius: var(--radius-md);
      padding: var(--space-2) var(--space-4);
      cursor: pointer;
      transition:
        background 0.15s ease,
        color 0.15s ease,
        border-color 0.15s ease,
        transform 0.05s ease;
    }
    button:active {
      transform: translateY(1px);
    }
    button:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
    button[disabled] {
      cursor: not-allowed;
      opacity: 0.5;
    }
    :host([size='sm']) button {
      font-size: var(--font-size-sm);
      padding: var(--space-1) var(--space-3);
    }
    :host([variant='primary']) button {
      background: var(--color-primary);
      color: var(--color-primary-contrast);
    }
    :host([variant='primary']) button:hover:not([disabled]) {
      background: var(--color-teal-600);
    }
    :host([variant='secondary']) button {
      background: var(--color-neutral-100);
      color: var(--color-neutral-800);
    }
    :host([variant='secondary']) button:hover:not([disabled]) {
      background: var(--color-neutral-200);
    }
    :host([variant='outline']) button {
      background: transparent;
      color: var(--color-primary);
      border-color: var(--color-primary);
    }
    :host([variant='outline']) button:hover:not([disabled]) {
      background: var(--color-primary);
      color: var(--color-primary-contrast);
    }
    :host([variant='link']) button {
      background: transparent;
      color: var(--color-text-muted);
      font-weight: var(--font-weight-regular);
      padding-inline: var(--space-2);
    }
    :host([variant='link']) button:hover:not([disabled]) {
      color: var(--color-primary);
    }
  `;

  @property({ type: String, reflect: true }) variant: ButtonVariant = 'primary';
  @property({ type: String, reflect: true }) size: ButtonSize = 'md';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: String }) label = '';
  /** Mirrored to the inner control, since the host is not the button. */
  @property({ type: String, attribute: 'aria-label' }) ariaLabelText: string | null = null;
  @property({ type: String }) ariaExpandedState: string | null = null;

  render() {
    return html`
      <button
        type="button"
        ?disabled=${this.disabled}
        aria-label=${this.ariaLabelText ?? ''}
        aria-expanded=${this.ariaExpandedState ?? ''}
      >
        ${this.label || html`<slot></slot>`}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rz-button': RzButton;
  }
}
