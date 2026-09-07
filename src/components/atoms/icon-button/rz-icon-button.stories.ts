import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './rz-icon-button.js';

const meta: Meta = {
  title: 'Atoms/Icon button',
  component: 'rz-icon-button',
  tags: ['autodocs'],
  argTypes: {
    icon: { control: 'select', options: ['play', 'pause', 'prev', 'next', 'repeat', 'repeat-one', 'infinity'] },
    variant: { control: 'inline-radio', options: ['plain', 'filled'] },
    active: { control: 'boolean' },
  },
  args: { icon: 'play', variant: 'filled', active: false, label: 'Play' },
  render: ({ icon, variant, active, label }) =>
    html`<rz-icon-button icon=${icon} variant=${variant} ?active=${active} label=${label}></rz-icon-button>`,
};
export default meta;
type Story = StoryObj;

export const Play: Story = {};
export const Plain: Story = { args: { icon: 'next', variant: 'plain', label: 'Next' } };
/** A mode toggle that is on. */
export const Active: Story = { args: { icon: 'repeat-one', variant: 'plain', active: true, label: 'Repeat one' } };

export const TransportCluster: Story = {
  render: () => html`
    <div style="display:flex;align-items:center;gap:8px">
      <rz-icon-button icon="prev" label="Previous"></rz-icon-button>
      <rz-icon-button variant="filled" icon="play" label="Play"></rz-icon-button>
      <rz-icon-button icon="next" label="Next"></rz-icon-button>
      <rz-icon-button icon="repeat-one" active label="Repeat one"></rz-icon-button>
      <rz-icon-button icon="infinity" label="Unlimited"></rz-icon-button>
    </div>
  `,
};
