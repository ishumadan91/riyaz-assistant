import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './rz-sequence-rail.js';
import { newSession } from '../../../data/session.js';
import { OPTIONAL_THAATS } from '../../../data/thaats.js';

const session = newSession(OPTIONAL_THAATS.map((t) => t.key));

const meta: Meta = {
  title: 'Organisms/Sequence rail',
  component: 'rz-sequence-rail',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

/** Upcoming rows are masked — that is what keeps the order a surprise. */
export const Masked: Story = {
  render: () =>
    html`<div style="height:420px;display:flex">
      <rz-sequence-rail .items=${session.items} index="2"></rz-sequence-rail>
    </div>`,
};

export const Revealed: Story = {
  render: () =>
    html`<div style="height:420px;display:flex">
      <rz-sequence-rail .items=${session.items} index="2" reveal></rz-sequence-rail>
    </div>`,
};
