import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { base } from '../../../styles/base.js';
import '../../atoms/button/rz-button.js';
import '../../atoms/field-label/rz-field-label.js';
import '../../molecules/rail-item/rz-rail-item.js';
import type { SessionItem } from '../../../data/session.js';

/**
 * rz-sequence-rail — the ten dealt sequences, all of them visible.
 *
 * @prop  {SessionItem[]} items
 * @prop  {number} index - the sequence being practised
 * @fires rz-goto - CustomEvent<{ index: number }>
 * @fires rz-toggle-browse
 */
@customElement('rz-sequence-rail')
export class RzSequenceRail extends LitElement {
  static styles = [
    base,
    css`
    :host {
      display: block;
      width: var(--rail-width);
      flex-shrink: 0;
      padding: var(--space-4);
      overflow-y: auto;
      background: var(--color-surface);
      border-right: 1px solid var(--color-border);
    }
    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2);
      margin-bottom: var(--space-2);
    }
    .list {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    @media (max-width: 768px) {
      :host {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        width: 100%;
        padding: var(--space-2) var(--space-4);
        overflow-x: auto;
        overflow-y: hidden;
        border-right: 0;
        border-bottom: 1px solid var(--color-border);
      }
      /* The strip is one row on a phone and the chrome budget has nothing to
         spare, so the head loses its label and rides along at the start of the
         row — pinned there, so Browse stays reachable however far the
         sequences have scrolled. */
      .head {
        position: sticky;
        left: 0;
        z-index: 1;
        flex: 0 0 auto;
        margin-bottom: 0;
        background: var(--color-surface);
      }
      .head rz-field-label {
        display: none;
      }
      .list {
        flex: 1 1 auto;
        flex-direction: row;
        gap: var(--space-1);
      }
      .list rz-rail-item {
        flex: 0 0 auto;
        white-space: nowrap;
      }
    }
  `,
  ];

  @property({ attribute: false }) items: SessionItem[] = [];
  @property({ type: Number }) index = 0;
  /** "Sequence" for a dealt session; "Practised" for the unlimited stream,
      where nothing is upcoming because nothing has been drawn yet. */
  @property({ type: String }) heading = 'Sequence';

  render() {
    return html`
      <div class="head">
        <rz-field-label>${this.heading}</rz-field-label>
        <rz-button
          variant="link"
          size="sm"
          label="Browse all"
          aria-label="Browse every alankar"
          @click=${() =>
            this.dispatchEvent(
              new CustomEvent('rz-toggle-browse', { bubbles: true, composed: true }),
            )}
        ></rz-button>
      </div>
      <nav class="list" aria-label="Session sequence">
        ${this.items.map((it, i) => {
          return html`<rz-rail-item
            index=${i + 1}
            label=${`${it.alankar.n} · ${it.thaat.name}`}
            ?active=${i === this.index}
            ?done=${i < this.index}
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
