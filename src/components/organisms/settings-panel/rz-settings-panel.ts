import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { base } from '../../../styles/base.js';
import '../../atoms/button/rz-button.js';
import '../../atoms/card/rz-card.js';
import '../../molecules/choice-group/rz-choice-group.js';
import '../../molecules/thaat-pool/rz-thaat-pool.js';
import { DEFAULT_ORDER, type SessionOrder } from '../../../data/session.js';

/** The three layouts, with the sentence each one needs to make sense. */
const ORDER_CHOICES: { value: SessionOrder; label: string; hint: string }[] = [
  {
    value: 'shuffled',
    label: 'Shuffled',
    hint: 'The order they were randomised into.',
  },
  {
    value: 'by-thaat',
    label: 'By thaat',
    hint: 'All five in Bilawal first, then the same five in the paired thaat.',
  },
  {
    value: 'paired',
    label: 'Paired',
    hint: 'Each alankar in Bilawal, then straight into its counterpart in the paired thaat.',
  },
];

/**
 * rz-settings-panel — the sequence order, and the thaat pool.
 *
 * Beats per cycle is deliberately absent: the cycle is fixed at eight. So is
 * cycles per alankar — it loops until you press Next.
 *
 * Unlike the thaat pool, order applies at once: it is a permutation of the
 * ten sequences already dealt, not new material, so there is nothing to wait
 * for. A setting that only took effect on some later deal read as broken,
 * because picking it changed nothing on screen.
 *
 * @prop  {SessionOrder} order
 * @fires rz-order-change - CustomEvent<{ order: SessionOrder }>
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

  @property({ type: String }) order: SessionOrder = DEFAULT_ORDER;
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
          <p class="legend">Sequence order</p>
          <p class="hint" style="margin-top:0;margin-bottom:var(--space-3)">
            How the ten sequences are laid out. Applies straight away, keeping you on
            the one you are practising. Bilawal is sequence 1 whichever you pick.
          </p>
          <rz-choice-group
            value=${this.order}
            .options=${ORDER_CHOICES}
            @rz-choice-change=${(e: CustomEvent<{ value: string }>) => {
              e.stopPropagation();
              this.dispatchEvent(
                new CustomEvent('rz-order-change', {
                  detail: { order: e.detail.value as SessionOrder },
                  bubbles: true,
                  composed: true,
                }),
              );
            }}
          ></rz-choice-group>
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
          Keyboard: space to play, ← → to skip, N for a new session, A for every
          alankar, Esc to close this.
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
