import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './rz-notation-line.js';
import { parseNotation } from '../../../data/notation.js';
import { thaatByKey, transpose } from '../../../data/thaats.js';

const line = (src: string, thaatKey = 'bilawal') =>
  parseNotation(transpose(src, thaatByKey(thaatKey)));

const meta: Meta = {
  title: 'Molecules/Notation line',
  component: 'rz-notation-line',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj;

export const Bilawal: Story = {
  render: () => html`<rz-notation-line .groups=${line('S R G m P D N S.')}></rz-notation-line>`,
};

/** Komal and teevra together — the case that proves case carries the accidental. */
export const Todi: Story = {
  render: () =>
    html`<rz-notation-line
      .groups=${line('SR SRGm, RG RGmP, Gm GmPD, mP mPDN, PD PDNS.', 'todi')}
    ></rz-notation-line>`,
};

export const BothSaptaks: Story = {
  render: () =>
    html`<rz-notation-line .groups=${line('S .N .D .P S, S.R.G.m.')}></rz-notation-line>`,
};

/**
 * The dot-binding cases, side by side.
 *
 * A dot with nothing behind it, or nothing ahead of it, is unambiguous. Between
 * two swaras it is not, and unbracketed it binds backwards — so the third line
 * is three *taar* swaras and only the fourth, bracketed, is the descent below
 * sa that alankars 38 and 43 are actually written in.
 */
export const DotBinding: Story = {
  render: () => html`
    ${[
      ['.P.D.N', 'a dot with nothing behind it — all mandra'],
      ['PDNS.', 'a dot at the end — only the last S is taar'],
      ['S.N.D.P', 'unbracketed, mid-run — binds backwards, so all taar'],
      ['S(.N)(.D)(.P)', 'bracketed — sa, then three mandra swaras'],
      ['(S.)NDP', 'bracketed the other way — the taar S spelled out'],
    ].map(
      ([src, note]) => html`
        <div style="display:flex;align-items:baseline;gap:var(--space-4);margin-bottom:var(--space-2)">
          <code style="min-width:14ch;font:13px var(--font-mono);color:var(--color-text-muted)"
            >${src}</code
          >
          <rz-notation-line .groups=${line(src)}></rz-notation-line>
          <span style="font:13px var(--font-family-base);color:var(--color-text-muted)"
            >${note}</span
          >
        </div>
      `,
    )}
  `,
};

export const Dense: Story = {
  render: () =>
    html`<rz-notation-line dense .groups=${line('SRGmPDNS.NDPmGRS')}></rz-notation-line>`,
};

/** Narrow: groups stay whole, breaking only at the spaces. */
export const WrapsOnlyAtSpaces: Story = {
  render: () => html`
    <div style="width:260px;outline:1px dashed var(--color-border)">
      <rz-notation-line
        .groups=${line('SRGm-mGRS, RGmP-PmGR, GmPD-DPmG, mPDN-NDPm')}
      ></rz-notation-line>
    </div>
  `,
};
