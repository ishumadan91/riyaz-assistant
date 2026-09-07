import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '../../atoms/checkbox/rz-checkbox.js';
import { OPTIONAL_THAATS } from '../../../data/thaats.js';

/**
 * rz-thaat-pool — the nine optional thaats as a grid of tick boxes.
 *
 * The never-empty rule is enforced here rather than in the page: unticking the
 * last one is refused and an inline error appears. A session with nothing to
 * pair Bilawal against cannot be dealt, so the invariant belongs next to the
 * control that could break it.
 *
 * Bilawal is deliberately absent — it is compulsory, not a choice.
 *
 * @prop  {string[]} enabled - keys of the ticked thaats
 * @fires rz-thaat-pool-change - CustomEvent<{ enabled: string[] }>
 */
@customElement('rz-thaat-pool')
export class RzThaatPool extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: var(--space-2);
    }
    .error {
      margin: var(--space-2) 0 0;
      font-family: var(--font-family-base);
      font-size: var(--font-size-sm);
      color: var(--color-error);
    }
    @media (max-width: 768px) {
      .grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  `;

  @property({ attribute: false }) enabled: string[] = [];

  @state() private showError = false;

  private toggle(key: string, checked: boolean) {
    const next = this.enabled.filter((k) => k !== key);
    if (checked) next.push(key);

    if (!next.length) {
      // Refuse. rz-checkbox is controlled, so the tick it just cleared has
      // already snapped back; all that is left is to say why.
      this.showError = true;
      return;
    }
    this.showError = false;
    this.dispatchEvent(
      new CustomEvent('rz-thaat-pool-change', {
        detail: { enabled: next },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    return html`
      <div class="grid">
        ${OPTIONAL_THAATS.map(
          (t) => html`
            <rz-checkbox
              label=${t.name}
              ?checked=${this.enabled.includes(t.key)}
              @rz-checkbox-change=${(e: CustomEvent<{ checked: boolean }>) => {
                e.stopPropagation();
                this.toggle(t.key, e.detail.checked);
              }}
            ></rz-checkbox>
          `,
        )}
      </div>
      ${this.showError
        ? html`<p class="error">Keep at least one thaat ticked.</p>`
        : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rz-thaat-pool': RzThaatPool;
  }
}
