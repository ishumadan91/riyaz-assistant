import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { base } from '../../../styles/base.js';
import '../../atoms/button/rz-button.js';
import '../../atoms/card/rz-card.js';
import '../../atoms/field-label/rz-field-label.js';
import '../../molecules/alankar-part/rz-alankar-part.js';
import '../../molecules/choice-group/rz-choice-group.js';
import '../../molecules/notation-line/rz-notation-line.js';
import { parseNotation } from '../../../data/notation.js';
import { ALANKARS, ALANKAR_GROUPS } from '../../../data/alankars.js';
import { THAATS, thaatByKey, thaatScale, transpose } from '../../../data/thaats.js';

/** The book's own grouping, built once: neither the list nor the groups it
    falls into change at runtime, only the thaat they are rendered in. */
const GROUPED = ALANKAR_GROUPS.map((group) => ({
  group,
  items: ALANKARS.filter((a) => a.group === group),
})).filter((g) => g.items.length);

const THAAT_CHOICES = THAATS.map((t) => ({ value: t.key, label: t.name }));

/**
 * rz-alankar-browser — every alankar at once, in one thaat, as a modal.
 *
 * A reference view, not a way to navigate: there is no "practise this one"
 * control, because an alankar in the list is usually not in today's deal at
 * all, and the rail beside it already jumps to the ones that are.
 *
 * The thaat is a property rather than local state — the page owns it, the same
 * way it owns every other piece of state — so opening the list can default to
 * the thaat currently being practised.
 *
 * @prop  {string} thaatKey - which thaat the whole list is transposed into
 * @fires rz-browse-thaat-change - CustomEvent<{ key: string }>
 * @fires rz-close-panel
 */
@customElement('rz-alankar-browser')
export class RzAlankarBrowser extends LitElement {
  static styles = [
    base,
    css`
    /* The overlay claims the viewport only while it is rendered, and the page
       only renders it while the panel is open — so the embedded host keeps its
       own layout the rest of the time. */
    :host {
      position: fixed;
      inset: 0;
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-6);
      font-family: var(--font-family-base);
    }
    .scrim {
      position: absolute;
      inset: 0;
      background: color-mix(in oklab, var(--color-heading) 45%, transparent);
    }
    /* The height cap is a chain, and every link has to be a flex one: a
       percentage max-height only resolves against a parent with a definite
       height, and the overlay is the only box here that has one. So the
       dialog caps against the overlay, and the card shrinks inside the
       dialog rather than carrying a percentage of its own. */
    .dialog {
      position: relative;
      display: flex;
      flex-direction: column;
      width: min(var(--stage-max-width), 100%);
      max-height: 100%;
      outline: none;
    }
    rz-card {
      display: flex;
      flex-direction: column;
      min-height: 0;
      box-shadow: var(--shadow-pop);
    }
    rz-choice-group {
      margin-bottom: var(--space-3);
    }
    .scale {
      display: flex;
      align-items: baseline;
      gap: var(--space-3);
      flex-wrap: wrap;
      margin-bottom: var(--space-4);
      padding: var(--space-2) var(--space-4);
      background: var(--color-surface-muted);
      border-radius: var(--radius-md);
    }
    .scale rz-notation-line {
      font-size: var(--font-size-lg);
      line-height: 1.9;
    }
    /* The card's own padding stops at the scroller, so the list scrolls under
       the title row rather than the whole card growing past the viewport. */
    .body {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
    }
    .group {
      margin: 0 0 var(--space-5);
    }
    .group-name {
      position: sticky;
      top: 0;
      z-index: 1;
      margin: 0 0 var(--space-3);
      padding: var(--space-2) 0;
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-heading);
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
    }
    .entry {
      display: grid;
      grid-template-columns: 3.5rem 1fr;
      gap: var(--space-2) var(--space-3);
      padding: var(--space-3) 0;
      border-bottom: 1px solid var(--color-border);
    }
    .entry:last-child {
      border-bottom: 0;
    }
    .n {
      font-family: var(--font-mono);
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--color-primary);
    }
    .note {
      grid-column: 2;
      margin: 0 0 var(--space-1);
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }
    .parts {
      grid-column: 2;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
      gap: var(--space-2) var(--space-6);
      align-items: start;
    }
    @media (max-width: 768px) {
      :host {
        padding: var(--space-3);
      }
      .entry {
        grid-template-columns: 2.5rem 1fr;
      }
    }
    /* On a phone the two-column split has nothing to gain: the number goes
       above the notation so a line gets the full width before it scrolls. */
    @media (max-width: 560px) {
      :host {
        padding: 0;
        align-items: stretch;
      }
      .dialog {
        width: 100%;
      }
      rz-card {
        flex: 1 1 auto;
        border-radius: 0;
        border-width: 0;
      }
      .entry {
        grid-template-columns: 1fr;
      }
      .note,
      .parts {
        grid-column: 1;
      }
    }
  `,
  ];

  @property({ type: String }) thaatKey = 'bilawal';

  private close() {
    this.dispatchEvent(new CustomEvent('rz-close-panel', { bubbles: true, composed: true }));
  }

  private pick(key: string) {
    this.dispatchEvent(
      new CustomEvent('rz-browse-thaat-change', {
        detail: { key },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Focus the dialog so Escape reaches the page even when the keys are bound
      to the host rather than to the document. */
  firstUpdated() {
    this.renderRoot.querySelector<HTMLElement>('.dialog')?.focus();
  }

  render() {
    const thaat = thaatByKey(this.thaatKey);
    return html`
      <div class="scrim" @click=${() => this.close()}></div>
      <div
        class="dialog"
        role="dialog"
        aria-modal="true"
        aria-label="All alankars"
        tabindex="-1"
      >
        <rz-card>
          <h3 slot="title">All ${ALANKARS.length} alankars</h3>
          <rz-button
            slot="badges"
            variant="link"
            label="Close ✕"
            aria-label="Close the alankar list"
            @click=${() => this.close()}
          ></rz-button>

          <rz-choice-group
            inline
            label="Show in"
            value=${thaat.key}
            .options=${THAAT_CHOICES}
            @rz-choice-change=${(e: CustomEvent<{ value: string }>) => {
              e.stopPropagation();
              this.pick(e.detail.value);
            }}
          ></rz-choice-group>

          <div class="scale">
            <rz-field-label>Thaat scale</rz-field-label>
            <rz-notation-line .groups=${parseNotation(thaatScale(thaat))}></rz-notation-line>
          </div>

          <div class="body">
            ${GROUPED.map(
              ({ group, items }) => html`
                <section class="group">
                  <h4 class="group-name">${group}</h4>
                  ${items.map(
                    (a) => html`
                      <article class="entry">
                        <span class="n">${a.n}</span>
                        ${a.note ? html`<p class="note">${a.note}</p>` : nothing}
                        <div class="parts">
                          ${a.parts.map(
                            (p) => html`<rz-alankar-part
                              label=${p.label}
                              ?centred=${p.align === 'center'}
                              dense
                              .lines=${p.lines.map((l) => parseNotation(transpose(l, thaat)))}
                            ></rz-alankar-part>`,
                          )}
                        </div>
                      </article>
                    `,
                  )}
                </section>
              `,
            )}
          </div>
        </rz-card>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rz-alankar-browser': RzAlankarBrowser;
  }
}
