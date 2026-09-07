import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../../atoms/swara/rz-swara.js';
import type { NotationGroup } from '../../../data/notation.js';

/**
 * rz-notation-line — one line of notation.
 *
 * Each space-separated group renders as its own `nowrap` run. Without that a
 * line can break between any two swaras (each is an inline-block) and split a
 * phrase mid-group — "GMPD-DPM / G," instead of "GMPD-DPMG,".
 *
 * @prop {NotationGroup[]} groups
 */
@customElement('rz-notation-line')
export class RzNotationLine extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--font-mono);
      font-size: var(--notation-size);
      line-height: 2.2;
      color: var(--color-heading);
    }
    :host([dense]) {
      font-size: var(--notation-size-dense);
      line-height: 1.9;
    }
    .group {
      white-space: nowrap;
    }
    /* The word space between groups — the only place a line may break. */
    .group + .group::before {
      content: ' ';
      white-space: pre;
    }
    .punct {
      color: var(--color-text-muted);
      margin-right: var(--swara-gap);
    }
  `;

  @property({ attribute: false }) groups: NotationGroup[] = [];
  @property({ type: Boolean, reflect: true }) dense = false;

  render() {
    return html`${this.groups.map(
      (group) =>
        html`<span class="group"
          >${group.tokens.map((t) =>
            t.kind === 'swara'
              ? html`<rz-swara
                  letter=${t.letter}
                  ?komal=${t.komal}
                  ?teevra=${t.teevra}
                  saptak=${t.saptak}
                ></rz-swara>`
              : html`<span class="punct">${t.text}</span>`,
          )}</span
        >`,
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rz-notation-line': RzNotationLine;
  }
}
