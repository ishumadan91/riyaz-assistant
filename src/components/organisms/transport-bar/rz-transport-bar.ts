import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../../atoms/badge/rz-badge.js';
import '../../atoms/icon-button/rz-icon-button.js';
import '../../molecules/beat-row/rz-beat-row.js';
import '../../molecules/count-in/rz-count-in.js';
import '../../molecules/tempo-control/rz-tempo-control.js';

/** How the sequence advances when the metronome finishes its cycles. */
export type RepeatMode = 'all' | 'one';

/**
 * rz-transport-bar — an audio-player transport: previous, play/pause, next,
 * then the mode toggles, the beat row and tempo.
 *
 * While counting in, the beat row is replaced by the 3 · 2 · 1 cue: the cycle
 * has not started, so showing beat dots would be a lie.
 *
 * @fires rz-play-toggle
 * @fires rz-prev
 * @fires rz-next
 * @fires rz-repeat-toggle
 * @fires rz-unlimited-toggle
 * @fires rz-tempo-change - from the tempo control it contains
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
    .modes {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      padding-left: var(--space-2);
      margin-left: var(--space-1);
      border-left: 1px solid var(--color-border);
    }
    .status {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      min-height: 2.5rem;
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
  @property({ type: Number }) countIn = 0;
  @property({ type: String }) repeat: RepeatMode = 'all';
  @property({ type: Boolean }) unlimited = false;

  private emit(name: string) {
    this.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true }));
  }

  render() {
    return html`
      <div class="transport">
        <rz-icon-button
          icon="prev"
          label="Previous sequence"
          @click=${() => this.emit('rz-prev')}
        ></rz-icon-button>
        <rz-icon-button
          variant="filled"
          icon=${this.playing ? 'pause' : 'play'}
          label=${this.playing ? 'Pause' : 'Play'}
          @click=${() => this.emit('rz-play-toggle')}
        ></rz-icon-button>
        <rz-icon-button
          icon="next"
          label="Next sequence"
          @click=${() => this.emit('rz-next')}
        ></rz-icon-button>

        <div class="modes">
          <rz-icon-button
            icon=${this.repeat === 'one' ? 'repeat-one' : 'repeat'}
            ?active=${this.repeat === 'one'}
            label=${this.repeat === 'one'
              ? 'Repeating this alankar — click to move on after each one'
              : 'Moving on after each alankar — click to repeat this one'}
            @click=${() => this.emit('rz-repeat-toggle')}
          ></rz-icon-button>
          <rz-icon-button
            icon="infinity"
            ?active=${this.unlimited}
            label=${this.unlimited
              ? 'Unlimited mode on — click for the day’s session'
              : 'Unlimited mode: keep drawing new combinations'}
            @click=${() => this.emit('rz-unlimited-toggle')}
          ></rz-icon-button>
        </div>
      </div>

      <div class="status">
        ${this.countIn > 0
          ? html`<rz-count-in value=${this.countIn}></rz-count-in>`
          : html`
              <rz-beat-row
                beats=${this.beats}
                current=${this.beat}
                midIndex=${this.midIndex}
              ></rz-beat-row>
              ${this.repeat === 'one'
                ? html`<rz-badge tone="secondary" label="Repeating"></rz-badge>`
                : html`<rz-badge
                    tone="secondary"
                    label=${`Cycle ${this.cycle + 1} of ${this.cyclesPerItem}`}
                  ></rz-badge>`}
            `}
        ${nothing}
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
