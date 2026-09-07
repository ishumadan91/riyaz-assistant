import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ICONS, type IconName } from './icon-registry.js';

/**
 * rz-icon — one glyph from the registry, sized in `em` so it scales with the
 * surrounding text and inherits `currentColor`.
 */
@customElement('rz-icon')
export class RzIcon extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      width: 1em;
      height: 1em;
      line-height: 0;
    }
    svg {
      width: 100%;
      height: 100%;
      display: block;
    }
  `;

  @property({ type: String }) name: IconName = 'play';

  render() {
    return html`<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[this.name]}</svg>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rz-icon': RzIcon;
  }
}
