import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './rz-thaat-pool.js';
import { OPTIONAL_THAATS } from '../../../data/thaats.js';

const meta: Meta = {
  title: 'Molecules/Thaat pool',
  component: 'rz-thaat-pool',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj;

export const AllEnabled: Story = {
  render: () => html`
    <div style="width:620px">
      <rz-thaat-pool .enabled=${OPTIONAL_THAATS.map((t) => t.key)}></rz-thaat-pool>
    </div>
  `,
};

export const Some: Story = {
  render: () => html`
    <div style="width:620px">
      <rz-thaat-pool .enabled=${['kafi', 'bhairav', 'todi']}></rz-thaat-pool>
    </div>
  `,
};

/** Untick the last one to see the pool refuse and explain why. */
export const RefusesToEmpty: Story = {
  render: () => html`
    <div style="width:620px">
      <rz-thaat-pool .enabled=${['kafi']}></rz-thaat-pool>
    </div>
  `,
};
