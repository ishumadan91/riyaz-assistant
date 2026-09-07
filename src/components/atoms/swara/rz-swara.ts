import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { base } from '../../../styles/base.js';
import type { Saptak } from '../../../data/notation.js';

/**
 * rz-swara — one swara glyph with its Bhatkhande marks.
 *
 * Komal is a rule under the letter, teevra a rule over it, taar a dot above and
 * mandra a dot below.
 *
 * The marks are drawn in CSS, never with combining characters. A combining low
 * line under "N" lands wherever the font decides, and a komal swara in the
 * mandra saptak needs a line *and* a dot below the same letter, which combining
 * marks collide on.
 *
 * Tracking comes from `margin`, not `letter-spacing`, so the box is exactly the
 * glyph and the komal rule hugs the letter instead of overshooting it — with
 * letter-spacing the rules under adjacent komal swaras ran together into one
 * long line.
 *
 * @prop {string} letter - already uppercased; the accidental is in the flags
 * @prop {boolean} komal
 * @prop {boolean} teevra
 * @prop {Saptak} saptak
 */
@customElement('rz-swara')
export class RzSwara extends LitElement {
  static styles = [
    base,
    css`
    :host {
      display: inline-block;
      position: relative;
      line-height: 1;
      padding-bottom: 0.07em;
      margin-right: var(--swara-gap);
      color: var(--color-heading);
    }
    :host([komal]) {
      border-bottom: 1.5px solid var(--color-primary);
      color: var(--color-primary);
    }
    :host([teevra]) {
      border-top: 1.5px solid var(--color-primary);
      padding-top: 0.07em;
      color: var(--color-primary);
    }
    .dot {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      width: 0.15em;
      height: 0.15em;
      min-width: 2px;
      min-height: 2px;
      border-radius: 50%;
      background: currentColor;
    }
    .taar {
      top: -0.3em;
    }
    /* Clears the komal rule, which sits on the letter's bottom edge. */
    .mandra {
      bottom: -0.34em;
    }
  `,
  ];

  @property({ type: String }) letter = '';
  @property({ type: Boolean, reflect: true }) komal = false;
  @property({ type: Boolean, reflect: true }) teevra = false;
  @property({ type: String, reflect: true }) saptak: Saptak = 'madhya';

  render() {
    return html`
      ${this.saptak === 'taar' ? html`<span class="dot taar"></span>` : nothing}${this.letter}
      ${this.saptak === 'mandra' ? html`<span class="dot mandra"></span>` : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rz-swara': RzSwara;
  }
}
