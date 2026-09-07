import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { base } from '../../../styles/base.js';
import '../../atoms/field-label/rz-field-label.js';
import '../notation-line/rz-notation-line.js';
import type { NotationGroup } from '../../../data/notation.js';

/**
 * rz-alankar-part — a labelled block of an alankar (Aroha, Avaroha, Ending)
 * and its lines.
 *
 * @prop {NotationGroup[][]} lines - one entry per line, already parsed
 * @prop {boolean} centred - the meru pyramid, whose shape is the point
 * @prop {boolean} dense - long alankars tighten so they stay on one screen
 */
@customElement('rz-alankar-part')
export class RzAlankarPart extends LitElement {
  static styles = [
    base,
    css`
    :host {
      display: block;
    }
    rz-field-label {
      margin-bottom: var(--space-1);
    }
    .lines {
      overflow-x: auto;
    }
    /* Centre the pyramid in a column near the text, not across the whole card:
       centring in the full width strands it far from the heading. */
    :host([centred]) .lines {
      max-width: 30ch;
    }
    :host([centred]) rz-notation-line {
      text-align: center;
    }
  `,
  ];

  @property({ type: String }) label = '';
  @property({ attribute: false }) lines: NotationGroup[][] = [];
  @property({ type: Boolean, reflect: true }) centred = false;
  @property({ type: Boolean, reflect: true }) dense = false;

  render() {
    return html`
      ${this.label ? html`<rz-field-label>${this.label}</rz-field-label>` : nothing}
      <div class="lines">
        ${this.lines.map(
          (groups) => html`<rz-notation-line .groups=${groups} ?dense=${this.dense}></rz-notation-line>`,
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rz-alankar-part': RzAlankarPart;
  }
}
