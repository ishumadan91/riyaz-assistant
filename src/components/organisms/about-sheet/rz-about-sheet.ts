import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import '../../atoms/button/rz-button.js';
import '../../atoms/card/rz-card.js';
import { ABOUT_SECTIONS } from '../../../data/about.js';

/**
 * rz-about-sheet — the README-derived help panel.
 *
 * @fires rz-close-panel
 */
@customElement('rz-about-sheet')
export class RzAboutSheet extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: var(--space-3) var(--space-6) 0;
    }
    .body {
      max-height: 52vh;
      overflow-y: auto;
      font-family: var(--font-family-base);
      font-size: var(--font-size-md);
      line-height: var(--line-height-base);
      color: var(--color-text);
    }
    h3 {
      margin: var(--space-6) 0 var(--space-2);
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-heading);
    }
    .body > h3:first-child {
      margin-top: 0;
    }
    p {
      margin: 0 0 var(--space-4);
    }
    a {
      color: var(--color-primary);
    }
    code {
      font-family: var(--font-mono);
      font-size: 0.9em;
      background: var(--color-neutral-100);
      border-radius: var(--radius-sm);
      padding: 0 var(--space-1);
    }
    .table-scroll {
      overflow-x: auto;
      margin-bottom: var(--space-4);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--font-size-md);
    }
    th,
    td {
      text-align: left;
      padding: var(--space-2) var(--space-3);
      border-bottom: 1px solid var(--color-border);
      vertical-align: top;
    }
    th {
      font-weight: var(--font-weight-semibold);
      color: var(--color-heading);
    }
    @media (max-width: 768px) {
      :host {
        padding: var(--space-2) var(--space-4) 0;
      }
    }
  `;

  render() {
    return html`
      <rz-card>
        <h3 slot="title">About</h3>
        <rz-button
          slot="badges"
          variant="link"
          label="Close ✕"
          aria-label="Close about"
          @click=${() =>
            this.dispatchEvent(
              new CustomEvent('rz-close-panel', { bubbles: true, composed: true }),
            )}
        ></rz-button>
        <div class="body">
          ${ABOUT_SECTIONS.map(
            (s) => html`
              <h3>${s.title}</h3>
              <!-- unsafeHTML is safe here and only here: these strings are
                   generated at build time by scripts/build-about.js from this
                   repo's own README.md. Nothing user- or network-supplied
                   reaches this directive. -->
              ${unsafeHTML(s.html)}
            `,
          )}
        </div>
      </rz-card>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rz-about-sheet': RzAboutSheet;
  }
}
