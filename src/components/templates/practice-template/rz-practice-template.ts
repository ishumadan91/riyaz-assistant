import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { base } from '../../../styles/base.js';
import '../../organisms/about-sheet/rz-about-sheet.js';
import '../../organisms/alankar-browser/rz-alankar-browser.js';
import '../../organisms/alankar-card/rz-alankar-card.js';
import '../../organisms/app-header/rz-app-header.js';
import '../../organisms/sequence-rail/rz-sequence-rail.js';
import '../../organisms/session-complete/rz-session-complete.js';
import '../../organisms/settings-panel/rz-settings-panel.js';
import '../../organisms/transport-bar/rz-transport-bar.js';
import { DEFAULT_ORDER, type SessionItem, type SessionOrder } from '../../../data/session.js';
import type { Thaat } from '../../../data/thaats.js';

/**
 * Which drop-down or overlay is open. One value, not three booleans that can
 * disagree — and Escape closes whichever it is.
 */
export type Panel = 'settings' | 'about' | 'browse' | null;

/**
 * rz-practice-template — the practice screen's layout: header, an optional
 * drop-down panel beneath it, the rail beside the stage, and the transport bar.
 *
 * Presentation only. It forwards data down and lets events bubble past it; the
 * page owns every piece of state.
 *
 * It fills its host (`height: 100%`) rather than claiming the viewport, so it
 * can sit inside a host page's layout. The `100dvh` frame lives in global.css,
 * which only the standalone build loads.
 */
@customElement('rz-practice-template')
export class RzPracticeTemplate extends LitElement {
  static styles = [
    base,
    css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
      background: var(--color-bg);
      font-family: var(--font-family-base);
    }
    .main {
      display: flex;
      flex: 1 1 auto;
      min-height: 0;
    }
    .stage {
      flex: 1 1 auto;
      min-width: 0;
      overflow-y: auto;
      padding: var(--space-6);
    }
    .stage > * {
      max-width: var(--stage-max-width);
    }
    @media (max-width: 768px) {
      .main {
        flex-direction: column;
      }
      .stage {
        padding: var(--space-4);
      }
    }
    @media (max-width: 560px) {
      .stage {
        padding: var(--space-3);
      }
    }
  `,
  ];

  @property({ attribute: false }) items: SessionItem[] = [];
  @property({ attribute: false }) thaats: Thaat[] = [];
  @property({ type: Number }) index = 0;
  @property({ type: Boolean }) finished = false;
  @property({ type: String }) panel: Panel = null;

  @property({ type: Boolean }) playing = false;
  @property({ type: Number }) beats = 8;
  @property({ type: Number }) beat = 0;
  @property({ type: Number }) midIndex = 4;
  @property({ type: Number }) bpm = 72;
  @property({ type: Boolean }) unlimited = false;
  @property({ attribute: false }) enabled: string[] = [];
  @property({ type: String }) order: SessionOrder = DEFAULT_ORDER;
  /** The thaat the alankar list is shown in, while it is open. */
  @property({ type: String }) browseThaat = 'bilawal';

  render() {
    const current = this.items[this.index];
    return html`
      <rz-app-header
        .thaats=${this.thaats}
        ?settingsOpen=${this.panel === 'settings'}
        ?aboutOpen=${this.panel === 'about'}
      ></rz-app-header>

      ${this.panel === 'settings'
        ? html`<rz-settings-panel
            order=${this.order}
            .enabled=${this.enabled}
          ></rz-settings-panel>`
        : nothing}
      ${this.panel === 'about' ? html`<rz-about-sheet></rz-about-sheet>` : nothing}
      <!-- The browser is an overlay, not a drop-down, and is only in the tree
           while it is open: it claims the viewport, which an embedded host's
           layout would otherwise have to live with. -->
      ${this.panel === 'browse'
        ? html`<rz-alankar-browser thaatKey=${this.browseThaat}></rz-alankar-browser>`
        : nothing}

      <div class="main">
        <rz-sequence-rail
          .items=${this.items}
          index=${this.index}
          heading=${this.unlimited ? 'Practised' : 'Sequence'}
        ></rz-sequence-rail>

        <div class="stage">
          ${this.finished
            ? html`<rz-session-complete sequences=${this.items.length}></rz-session-complete>`
            : current
              ? html`<rz-alankar-card
                  .alankar=${current.alankar}
                  .thaat=${current.thaat}
                  position=${this.index + 1}
                  total=${this.items.length}
                  ?unlimited=${this.unlimited}
                ></rz-alankar-card>`
              : nothing}
        </div>
      </div>

      <rz-transport-bar
        ?playing=${this.playing}
        beats=${this.beats}
        beat=${this.beat}
        midIndex=${this.midIndex}
        bpm=${this.bpm}
        ?unlimited=${this.unlimited}
      ></rz-transport-bar>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rz-practice-template': RzPracticeTemplate;
  }
}
