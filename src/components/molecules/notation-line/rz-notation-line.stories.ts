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
