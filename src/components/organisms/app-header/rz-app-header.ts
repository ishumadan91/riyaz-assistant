import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../../atoms/badge/rz-badge.js';
import '../../atoms/button/rz-button.js';
import type { Thaat } from '../../../data/thaats.js';

/**
 * rz-app-header — title, the session's two thaat chips, and the three actions.
 *
 * @prop  {Thaat[]} thaats - [Bilawal, the paired thaat]
 * @fires rz-toggle-about
 * @fires rz-toggle-settings
 * @fires rz-new-session
 */
@customElement('rz-app-header')
export class RzAppHeader extends LitElement {
  static styles = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
      flex-wrap: wrap;
      padding: var(--space-3) var(--space-6);
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      font-family: var(--font-family-base);
    }
    h1 {
      margin: 0;
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      line-height: 1.2;
      color: var(--color-heading);
    }
    .sub {
      margin: 0;
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }
    .actions {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      flex-wrap: wrap;
    }
    .chips {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    @media (max-width: 768px) {
      :host {
        padding: var(--space-2) var(--space-4);
      }
      .sub {
        display: none;
      }
    }
  `;

  @property({ attribute: false }) thaats: Thaat[] = [];
  @property({ type: Boolean }) settingsOpen = false;
  @property({ type: Boolean }) aboutOpen = false;

  private emit(name: string) {
    this.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true }));
  }

  render() {
    return html`
      <div>
        <h1>Riyāz</h1>
        <p class="sub">Alankar practice</p>
      </div>
      <div class="actions">
        <div class="chips">
          ${this.thaats.map(
            (t, i) =>
              html`<rz-badge tone=${i === 0 ? 'primary' : 'secondary'} label=${t.name}></rz-badge>`,
          )}
        </div>
        <rz-button
          variant="link"
          size="sm"
          label="About"
          .ariaExpandedState=${String(this.aboutOpen)}
          @click=${() => this.emit('rz-toggle-about')}
        ></rz-button>
        <rz-button
          variant="outline"
          size="sm"
          label="Settings"
          .ariaExpandedState=${String(this.settingsOpen)}
          @click=${() => this.emit('rz-toggle-settings')}
        ></rz-button>
        <rz-button
          variant="secondary"
          size="sm"
          label="New session"
          @click=${() => this.emit('rz-new-session')}
        ></rz-button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rz-app-header': RzAppHeader;
  }
}
