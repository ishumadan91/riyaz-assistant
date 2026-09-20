import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { base } from '../../../styles/base.js';
import '../../atoms/button/rz-button.js';
import '../../atoms/card/rz-card.js';
import '../../atoms/checkbox/rz-checkbox.js';
import '../../molecules/thaat-pool/rz-thaat-pool.js';

/**
 * rz-settings-panel — reveal, and the thaat pool.
 *
 * Beats per cycle is deliberately absent: the cycle is fixed at eight. So is
 * cycles per alankar — it loops until you press Next.
 *
 * @fires rz-reveal-change - CustomEvent<{ checked: boolean }>
 * @fires rz-thaat-pool-change - from the pool it contains
 * @fires rz-close-panel
 */
@customElement('rz-settings-panel')
export class RzSettingsPanel extends LitElement {
  static styles = [
    base,
    css`
    :host {
      display: block;
      padding: var(--space-3) var(--space-6) 0;
    }
    .hint {
      margin: var(--space-2) 0 0;
      font-family: var(--font-family-base);
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }
    .legend {
      margin: 0 0 var(--space-1);
      font-family: var(--font-family-base);
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-heading);
    }
    .group {
      margin-bottom: var(--space-4);
    }
    @media (max-width: 768px) {
      :host {
        padding: var(--space-2) var(--space-4) 0;
      }
    }
  `,
  ];

  @property({ type: Boolean }) reveal = false;
  @property({ attribute: false }) enabled: string[] = [];

  render() {
    return html`
      <rz-card>
        <h3 slot="title">Practice settings</h3>
        <rz-button
          slot="badges"
          variant="link"
          label="Close ✕"
          aria-label="Close settings"
          @click=${() =>
            this.dispatchEvent(
              new CustomEvent('rz-close-panel', { bubbles: true, composed: true }),
            )}
        ></rz-button>

        <div class="group">
          <rz-checkbox
            label="Reveal the upcoming sequences in the sidebar"
            ?checked=${this.reveal}
            @rz-checkbox-change=${(e: CustomEvent<{ checked: boolean }>) => {
              e.stopPropagation();
              this.dispatchEvent(
                new CustomEvent('rz-reveal-change', {
                  detail: e.detail,
                  bubbles: true,
                  composed: true,
                }),
              );
            }}
          ></rz-checkbox>
        </div>

        <div>
          <p class="legend">Thaats in the pool</p>
          <p class="hint" style="margin-top:0;margin-bottom:var(--space-3)">
            Bilawal is always included. Each session pairs it with one of the thaats you
            leave ticked.
          </p>
          <rz-thaat-pool .enabled=${this.enabled}></rz-thaat-pool>
        </div>

        <p class="hint">
          Keyboard: space to play, ← → to skip, N for a new session, R to reveal, Esc to
          close this.
        </p>
      </rz-card>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rz-settings-panel': RzSettingsPanel;
  }
}
