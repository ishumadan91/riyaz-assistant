import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { base } from '../../../styles/base.js';
import '../../atoms/icon-button/rz-icon-button.js';
import '../../molecules/beat-row/rz-beat-row.js';
import '../../molecules/tempo-control/rz-tempo-control.js';

/**
 * rz-transport-bar — two groups with the beat row between them.
 *
 * Left is **which alankar**: previous, next, and the unlimited toggle. Next is
 * the only control pressed between alankars, so it is the only filled one;
 * previous is `sm` beside it.
 *
 * Right is **the metronome**: play sits with tempo, behind the same rule,
 * because starting the clock has nothing to do with moving on. Nothing
 * advances on its own — the current alankar loops until Next is pressed — so
 * there is no cycle readout to show in the middle.
 *
 * @fires rz-play-toggle
 * @fires rz-prev
 * @fires rz-next
 * @fires rz-unlimited-toggle
 * @fires rz-tempo-change - from the tempo control it contains
 */
@customElement('rz-transport-bar')
export class RzTransportBar extends LitElement {
  static styles = [
    base,
    css`
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
    .nav {
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
    /* Play and tempo are one object: the clock. */
    .metro {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }
    .metro .rule {
      width: 1px;
      height: 1.375rem;
      background: var(--color-border);
    }
    @media (max-width: 768px) {
      :host {
        justify-content: center;
        gap: var(--space-2) var(--space-4);
        padding: var(--space-2) var(--space-4);
      }
    }
    /* Phone: the two groups and the dots share one row. The rule between play
       and tempo is the first thing to go — the gap alone reads as a seam. */
    @media (max-width: 560px) {
      :host {
        gap: var(--space-2);
        padding: var(--space-2) var(--space-3);
      }
      .status {
        min-height: 0;
        gap: var(--space-2);
      }
      .nav,
      .metro {
        gap: var(--space-2);
      }
      .modes {
        padding-left: var(--space-1);
        margin-left: 0;
      }
      .metro .rule {
        display: none;
      }
    }
  `,
  ];

  @property({ type: Boolean }) playing = false;
  @property({ type: Number }) beats = 8;
  @property({ type: Number }) beat = 0;
  @property({ type: Number }) midIndex = 4;
  @property({ type: Number }) bpm = 72;
  @property({ type: Boolean }) unlimited = false;

  private emit(name: string) {
    this.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true }));
  }

  render() {
    return html`
      <div class="nav">
        <rz-icon-button
          size="sm"
          icon="prev"
          label="Previous alankar"
          @click=${() => this.emit('rz-prev')}
        ></rz-icon-button>
        <rz-icon-button
          size="lg"
          variant="filled"
          icon="next"
          label="Next alankar"
          @click=${() => this.emit('rz-next')}
        ></rz-icon-button>

        <div class="modes">
          <rz-icon-button
            size="sm"
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
        <rz-beat-row
          beats=${this.beats}
          current=${this.beat}
          midIndex=${this.midIndex}
        ></rz-beat-row>
      </div>

      <div class="metro">
        <rz-icon-button
          variant="outline"
          icon=${this.playing ? 'pause' : 'play'}
          label=${this.playing ? 'Pause the metronome' : 'Start the metronome'}
          @click=${() => this.emit('rz-play-toggle')}
        ></rz-icon-button>
        <span class="rule" aria-hidden="true"></span>
        <rz-tempo-control .value=${this.bpm}></rz-tempo-control>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rz-transport-bar': RzTransportBar;
  }
}
