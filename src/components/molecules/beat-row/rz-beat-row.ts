import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * rz-beat-row — the cycle as a row of dots.
 *
 * Two beats are marked and they differ from each other, matching the two
 * metronome strokes: sam takes `accent`, the half-way beat `primary`, and both
 * sit a size up from the plain matras. A thin rule between the halves makes
 * the 4 + 4 division legible at a glance.
 *
 * @prop {number} beats - beats in the cycle
 * @prop {number} current - index of the beat sounding now
 * @prop {number} midIndex - the half-way beat, or -1 for none
 */
@customElement('rz-beat-row')
export class RzBeatRow extends LitElement {
  static styles = css`
    :host {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    .dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: var(--color-border);
      transition:
        background 0.1s ease,
        box-shadow 0.1s ease;
    }
    .dot.done {
      background: var(--color-primary);
    }
    .dot.current {
      background: var(--color-primary);
      box-shadow: 0 0 0 4px color-mix(in oklab, var(--color-primary) 25%, transparent);
    }
    .dot.marked {
      width: 13px;
      height: 13px;
    }
    .dot.sam.done,
    .dot.sam.current {
      background: var(--color-accent);
    }
    .dot.sam.current {
      box-shadow: 0 0 0 4px color-mix(in oklab, var(--color-accent) 25%, transparent);
    }
    .divider {
      width: 1px;
      height: 13px;
      background: var(--color-border);
    }
  `;

  @property({ type: Number }) beats = 8;
  @property({ type: Number }) current = 0;
  @property({ type: Number }) midIndex = 4;

  render() {
    const dots = [];
    for (let i = 0; i < this.beats; i++) {
      if (i === this.midIndex) dots.push(html`<span class="divider" aria-hidden="true"></span>`);
      const classes = [
        'dot',
        i === 0 ? 'sam' : '',
        i === 0 || i === this.midIndex ? 'marked' : '',
        i < this.current ? 'done' : '',
        i === this.current ? 'current' : '',
      ]
        .filter(Boolean)
        .join(' ');
      dots.push(html`<span class=${classes}></span>`);
    }
    return html`${dots}${nothing}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rz-beat-row': RzBeatRow;
  }
}
