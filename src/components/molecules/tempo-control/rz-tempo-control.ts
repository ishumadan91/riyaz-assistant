import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { base } from '../../../styles/base.js';
import '../../atoms/button/rz-button.js';
import '../../atoms/field-label/rz-field-label.js';
import '../../atoms/number-field/rz-number-field.js';
import { BPM_MAX, BPM_MIN } from '../../../data/preferences.js';

/**
 * rz-tempo-control — the − / value / + cluster.
 *
 * Steppers rather than a slider: during riyaz you want to nudge the tempo a
 * couple of beats, not aim at a track.
 *
 * @prop  {number} value - bpm
 * @fires rz-tempo-change - CustomEvent<{ value: number }>
 */
@customElement('rz-tempo-control')
export class RzTempoControl extends LitElement {
  static styles = [
    base,
    css`
    :host {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    rz-number-field {
      width: 5rem;
    }
    /* The steppers say what this is; the label is the first thing to go. */
    @media (max-width: 560px) {
      :host {
        gap: var(--space-1);
      }
      rz-field-label {
        display: none;
      }
      rz-number-field {
        width: 3.75rem;
      }
    }
  `,
  ];

  @property({ type: Number }) value = 72;
  @property({ type: Number }) step = 2;

  private emit(value: number) {
    const clamped = Math.min(BPM_MAX, Math.max(BPM_MIN, value));
    if (clamped === this.value) return;
    this.value = clamped;
    this.dispatchEvent(
      new CustomEvent('rz-tempo-change', {
        detail: { value: clamped },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    return html`
      <rz-field-label>Tempo</rz-field-label>
      <rz-button
        variant="outline"
        size="sm"
        label="−"
        aria-label="Slower"
        @click=${() => this.emit(this.value - this.step)}
      ></rz-button>
      <rz-number-field
        .value=${this.value}
        min=${BPM_MIN}
        max=${BPM_MAX}
        label="Tempo in beats per minute"
        @rz-number-change=${(e: CustomEvent<{ value: number }>) => this.emit(e.detail.value)}
      ></rz-number-field>
      <rz-button
        variant="outline"
        size="sm"
        label="+"
        aria-label="Faster"
        @click=${() => this.emit(this.value + this.step)}
      ></rz-button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rz-tempo-control': RzTempoControl;
  }
}
