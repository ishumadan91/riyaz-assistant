import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { base } from '../../../styles/base.js';
import '../../atoms/badge/rz-badge.js';
import '../../atoms/card/rz-card.js';
import '../../atoms/field-label/rz-field-label.js';
import '../../molecules/alankar-part/rz-alankar-part.js';
import '../../molecules/notation-line/rz-notation-line.js';
import { parseNotation } from '../../../data/notation.js';
import { DEFAULT_THAAT, thaatScale, transpose, type Thaat } from '../../../data/thaats.js';
import type { Alankar } from '../../../data/alankars.js';

/** Past this many lines a card tightens so it stays on one screen. */
const DENSE_LINE_COUNT = 6;

/**
 * rz-alankar-card — the sequence being practised: which alankar, in which
 * thaat, that thaat's scale, and the notation itself.
 *
 * @prop {Alankar} alankar
 * @prop {Thaat} thaat
 * @prop {number} position - 1-based
 * @prop {number} total
 */
@customElement('rz-alankar-card')
export class RzAlankarCard extends LitElement {
  static styles = [
    base,
    css`
    :host {
      display: block;
    }
    .position {
      margin: 0 0 var(--space-2);
      font-family: var(--font-family-base);
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }
    h2 {
      margin: 0;
    }
    .group {
      margin: 0 0 var(--space-4);
      font-family: var(--font-family-base);
      font-size: var(--font-size-lg);
      color: var(--color-text-muted);
    }
    .scale {
      display: flex;
      align-items: baseline;
      gap: var(--space-3);
      flex-wrap: wrap;
      margin-bottom: var(--space-5);
      padding: var(--space-2) var(--space-4);
      background: var(--color-surface-muted);
      border-radius: var(--radius-md);
    }
    .scale rz-notation-line {
      font-size: var(--font-size-lg);
      line-height: 1.9;
    }
    .parts {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }
  `,
  ];

  @property({ attribute: false }) alankar!: Alankar;
  @property({ attribute: false }) thaat!: Thaat;
  @property({ type: Number }) position = 1;
  @property({ type: Number }) total = 10;
  /** An unlimited stream has no end, so no "of N" is shown. */
  @property({ type: Boolean }) unlimited = false;

  render() {
    if (!this.alankar || !this.thaat) return nothing;
    const a = this.alankar;
    const t = this.thaat;
    const lineCount = a.parts.reduce((n, p) => n + p.lines.length, 0);
    const dense = lineCount > DENSE_LINE_COUNT;

    return html`
      <p class="position">
        ${this.unlimited
          ? `Unlimited · sequence ${this.position}`
          : `Sequence ${this.position} of ${this.total}`}
      </p>
      <rz-card>
        <h2 slot="title">Alankar ${a.n}</h2>
        <rz-badge
          slot="badges"
          tone=${t.key === DEFAULT_THAAT.key ? 'primary' : 'secondary'}
          label=${t.name}
        ></rz-badge>

        <p class="group">${a.group}${a.note ? ` · ${a.note}` : ''}</p>

        <div class="scale">
          <rz-field-label>Thaat scale</rz-field-label>
          <rz-notation-line .groups=${parseNotation(thaatScale(t))}></rz-notation-line>
        </div>

        <div class="parts">
          ${a.parts.map(
            (p) => html`
              <rz-alankar-part
                label=${p.label}
                ?centred=${p.align === 'center'}
                ?dense=${dense}
                .lines=${p.lines.map((l) => parseNotation(transpose(l, t)))}
              ></rz-alankar-part>
            `,
          )}
        </div>
      </rz-card>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rz-alankar-card': RzAlankarCard;
  }
}
