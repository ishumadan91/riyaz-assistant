import { css } from 'lit';

/**
 * The reset every component's shadow root needs.
 *
 * `global.css` sets `box-sizing: border-box` with a `*` rule, but a document
 * stylesheet does not cross a Shadow DOM boundary — so without this each
 * component's internals fall back to `content-box`, and any `width: 100%`
 * element with padding overflows its parent by exactly the padding. That is
 * what made the whole page scroll sideways below 768px.
 *
 * Include it first: `static styles = [base, css\`…\`]`.
 */
export const base = css`
  :host,
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
`;
