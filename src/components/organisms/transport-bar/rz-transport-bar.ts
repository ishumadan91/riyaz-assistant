import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../../atoms/badge/rz-badge.js';
import '../../atoms/button/rz-button.js';
import '../../molecules/beat-row/rz-beat-row.js';
import '../../molecules/tempo-control/rz-tempo-control.js';

/**
 * rz-transport-bar — play/skip, the beat row, and tempo.
 *
 * @prop  {boolean} playing
 * @fires rz-play-toggle
 * @fires rz-prev
 * @fires rz-next
 * @fires rz-tempo-change - CustomEvent<{ value: number }>, re-dispatched by the
 *        tempo control it contains
 */
@customElement('rz-transport-bar')
export class RzTransportBar extends LitElement {
  static styles = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4) var(--space-6);
      flex-wrap: wrap;
      padding: var(--space-3) var(--space-6);
      background: var(--color-surface);
      border-top: 1px solid var(--color-border);
    }
    .transport {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    .beats {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }
    @media (max-width: 768px) {
      :host {
        justify-content: center;
        gap: var(--space-2) var(--space-4);
        padding: var(--space-2) var(--space-4);
      }
    }
  `;

  @property({ type: Boolean }) playing = false;
  @property({ type: Number }) beats = 8;
  @property({ type: Number }) beat = 0;
  @property({ type: Number }) midIndex = 4;
  @property({ type: Number }) cycle = 0;
  @property({ type: Number }) cyclesPerItem = 2;
  @property({ type: Number }) bpm = 72;

  private emit(name: string) {
    this.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true }));
  }

  render() {
    return html`
      <div class="transport">
        <rz-button
          variant="outline"
          size="sm"
          label="‹ Prev"
          aria-label="Previous sequence"
          @click=${() => this.emit('rz-prev')}
        ></rz-button>
        <rz-button
          variant="primary"
          label=${this.playing ? 'Pause' : 'Play'}
          @click=${() => this.emit('rz-play-toggle')}
        ></rz-button>
        <rz-button
          variant="outline"
          size="sm"
          label="Next ›"
          aria-label="Next sequence"
          @click=${() => this.emit('rz-next')}
        ></rz-button>
      </div>

      <div class="beats">
        <rz-beat-row
          beats=${this.beats}
          current=${this.beat}
          midIndex=${this.midIndex}
        ></rz-beat-row>
        <rz-badge tone="secondary" label=${`Cycle ${this.cycle + 1} of ${this.cyclesPerItem}`}></rz-badge>
      </div>

      <rz-tempo-control .value=${this.bpm}></rz-tempo-control>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rz-transport-bar': RzTransportBar;
  }
}
