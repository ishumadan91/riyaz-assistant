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

/** Every sequence is visible: done above, the current one, the rest below. */
export const Default: Story = {
  render: () =>
    html`<div style="height:420px;display:flex">
      <rz-sequence-rail .items=${session.items} index="2"></rz-sequence-rail>
    </div>`,
};

/** The unlimited stream, where the list is what has been drawn so far. */
export const Unlimited: Story = {
  render: () =>
    html`<div style="height:420px;display:flex">
      <rz-sequence-rail
        .items=${session.items.slice(0, 4)}
        index="3"
        heading="Practised"
      ></rz-sequence-rail>
    </div>`,
};
