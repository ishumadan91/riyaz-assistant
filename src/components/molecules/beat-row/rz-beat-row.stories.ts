import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './rz-beat-row.js';

const meta: Meta = {
  title: 'Molecules/Beat row',
  component: 'rz-beat-row',
  tags: ['autodocs'],
  argTypes: {
    beats: { control: { type: 'number', min: 2, max: 16 } },
    current: { control: { type: 'number', min: 0, max: 15 } },
    midIndex: { control: { type: 'number', min: -1, max: 8 } },
  },
  args: { beats: 8, current: 0, midIndex: 4 },
  render: ({ beats, current, midIndex }) =>
    html`<rz-beat-row beats=${beats} current=${current} midIndex=${midIndex}></rz-beat-row>`,
};
export default meta;
type Story = StoryObj;

export const OnSam: Story = { args: { current: 0 } };
export const OnTheDivider: Story = { args: { current: 4 } };
export const MidCycle: Story = { args: { current: 6 } };
/** An odd cycle has no half-way beat, so no divider is drawn. */
export const NoDivider: Story = { args: { beats: 7, current: 2, midIndex: -1 } };
