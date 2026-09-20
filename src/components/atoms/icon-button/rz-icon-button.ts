import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { base } from '../../../styles/base.js';
import '../icon/rz-icon.js';
import type { IconName } from '../icon/icon-registry.js';

export type IconButtonVariant = 'plain' | 'outline' | 'filled';
export type IconButtonSize = 'sm' | 'md' | 'lg';

/**
 * rz-icon-button — a round icon control, the transport's building block.
 *
 *   - `plain`   → borderless; prev and the mode toggles.
 *   - `outline` → ringed and in `--color-primary`; play, which has to be
 *                 findable beside the tempo steppers without competing with
 *                 Next.
 *   - `filled`  → primary disc; Next, the one control pressed between alankars.
 *
 * Size and fill are separate: the transport's hierarchy is `lg` + `filled` for
 * Next against `sm` for everything else. `sm` also drops to `--color-muted`,
 * because at this size a control is secondary by definition — a small button
 * in heading ink still reads as a peer of the big one.
 *
 * `active` marks a mode toggle that is on, in `--color-primary`.
 *
 * @prop  {IconName} icon
 * @fires click - native
 */
@customElement('rz-icon-button')
export class RzIconButton extends LitElement {
  static styles = [
    base,
    css`
    :host {
      display: inline-block;
    }
    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.25rem;
      height: 2.25rem;
      padding: 0;
      font-size: 1.125rem;
      color: var(--color-heading);
      background: transparent;
      border: 0;
      border-radius: var(--radius-pill);
      cursor: pointer;
      transition:
        background 0.15s ease,
        color 0.15s ease,
        border-color 0.15s ease,
        transform 0.05s ease;
    }
    button:hover:not([disabled]) {
      background: var(--color-neutral-100);
    }
    button:active:not([disabled]) {
      transform: scale(0.94);
    }
    button:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
    button[disabled] {
      opacity: 0.4;
      cursor: not-allowed;
    }
    :host([size='sm']) button {
      width: 1.875rem;
      height: 1.875rem;
      font-size: 0.9375rem;
      color: var(--color-muted);
    }
    :host([size='sm']) button:hover:not([disabled]) {
      color: var(--color-heading);
    }
    :host([size='lg']) button {
      width: 3.25rem;
      height: 3.25rem;
      font-size: 1.4375rem;
    }
    :host([variant='outline']) button {
      color: var(--color-primary);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
    }
    :host([variant='outline']) button:hover:not([disabled]) {
      background: var(--color-teal-100);
      border-color: var(--color-primary);
    }
    :host([variant='filled']) button {
      color: var(--color-primary-contrast);
      background: var(--color-primary);
      box-shadow: var(--shadow-sm);
    }
    :host([variant='filled']) button:hover:not([disabled]) {
      background: var(--color-teal-600);
    }
    :host([active]) button {
      color: var(--color-primary);
      background: var(--color-teal-100);
    }
  `,
  ];

  @property({ type: String }) icon: IconName = 'play';
  @property({ type: String, reflect: true }) variant: IconButtonVariant = 'plain';
  @property({ type: String, reflect: true }) size: IconButtonSize = 'md';
  @property({ type: Boolean, reflect: true }) active = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: String }) label = '';

  render() {
    return html`
      <button
        type="button"
        ?disabled=${this.disabled}
        aria-label=${this.label}
        aria-pressed=${this.active ? 'true' : 'false'}
        title=${this.label}
      >
        <rz-icon name=${this.icon}></rz-icon>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rz-icon-button': RzIconButton;
  }
}
