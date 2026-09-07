import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../../atoms/field-label/rz-field-label.js';
import '../../molecules/rail-item/rz-rail-item.js';
import type { SessionItem } from '../../../data/session.js';

/**
 * rz-sequence-rail — the ten dealt sequences.
 *
 * Upcoming rows are masked unless `reveal` is set, which is what keeps the
 * order a surprise.
 *
 * @prop  {SessionItem[]} items
 * @prop  {number} index - the sequence being practised
 * @prop  {boolean} reveal
 * @fires rz-goto - CustomEvent<{ index: number }>
 */
@customElement('rz-sequence-rail')
export class RzSequenceRail extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: var(--rail-width);
      flex-shrink: 0;
      padding: var(--space-4);
      overflow-y: auto;
      background: var(--color-surface);
      border-right: 1px solid var(--color-border);
    }
    rz-field-label {
      margin-bottom: var(--space-2);
    }
    .list {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    @media (max-width: 768px) {
      :host {
        width: 100%;
        padding: var(--space-2) var(--space-4);
        overflow-x: auto;
        overflow-y: hidden;
        border-right: 0;
        border-bottom: 1px solid var(--color-border);
      }
      rz-field-label {
        display: none;
      }
      .list {
        flex-direction: row;
        gap: var(--space-1);
      }
      .list rz-rail-item {
        flex: 0 0 auto;
        white-space: nowrap;
      }
    }
  `;

  @property({ attribute: false }) items: SessionItem[] = [];
  @property({ type: Number }) index = 0;
  @property({ type: Boolean }) reveal = false;

  render() {
    return html`
      <rz-field-label>Sequence</rz-field-label>
      <nav class="list" aria-label="Session sequence">
        ${this.items.map((it, i) => {
          const masked = !this.reveal && i > this.index;
          return html`<rz-rail-item
            index=${i + 1}
            label=${`${it.alankar.n} · ${it.thaat.name}`}
            ?active=${i === this.index}
            ?done=${i < this.index}
            ?masked=${masked}
            @click=${() =>
              this.dispatchEvent(
                new CustomEvent('rz-goto', {
                  detail: { index: i },
                  bubbles: true,
                  composed: true,
                }),
              )}
          ></rz-rail-item>`;
        })}
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rz-sequence-rail': RzSequenceRail;
  }
}
