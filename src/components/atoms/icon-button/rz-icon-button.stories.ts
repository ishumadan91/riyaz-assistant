import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './rz-icon-button.js';

const meta: Meta = {
  title: 'Atoms/Icon button',
  component: 'rz-icon-button',
  tags: ['autodocs'],
  argTypes: {
    icon: { control: 'select', options: ['play', 'pause', 'prev', 'next', 'infinity'] },
    variant: { control: 'inline-radio', options: ['plain', 'outline', 'filled'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    active: { control: 'boolean' },
  },
  args: { icon: 'next', variant: 'filled', size: 'lg', active: false, label: 'Next alankar' },
  render: ({ icon, variant, size, active, label }) =>
    html`<rz-icon-button
      icon=${icon}
      variant=${variant}
      size=${size}
      ?active=${active}
      label=${label}
    ></rz-icon-button>`,
};
export default meta;
type Story = StoryObj;

/** Next: the one control pressed between alankars, and the only filled one. */
export const Next: Story = {};
export const Play: Story = { args: { icon: 'play', variant: 'outline', size: 'md', label: 'Start the metronome' } };
export const Small: Story = { args: { icon: 'prev', variant: 'plain', size: 'sm', label: 'Previous alankar' } };
/** A mode toggle that is on. */
export const Active: Story = { args: { icon: 'infinity', variant: 'plain', size: 'sm', active: true, label: 'Unlimited' } };

/** The transport's hierarchy: navigation on the left, the metronome on the right. */
export const TransportCluster: Story = {
  render: () => html`
    <div style="display:flex;align-items:center;gap:24px">
      <div style="display:flex;align-items:center;gap:8px">
        <rz-icon-button size="sm" icon="prev" label="Previous alankar"></rz-icon-button>
        <rz-icon-button size="lg" variant="filled" icon="next" label="Next alankar"></rz-icon-button>
        <rz-icon-button size="sm" icon="infinity" label="Unlimited"></rz-icon-button>
      </div>
      <rz-icon-button variant="outline" icon="play" label="Start the metronome"></rz-icon-button>
    </div>
  `,
};
