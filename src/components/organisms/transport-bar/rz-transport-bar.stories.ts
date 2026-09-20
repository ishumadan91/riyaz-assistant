import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './rz-transport-bar.js';

const meta: Meta = {
  title: 'Organisms/Transport bar',
  component: 'rz-transport-bar',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { playing: false, beats: 8, beat: 0, midIndex: 4, bpm: 72, unlimited: false },
  render: (a) => html`<rz-transport-bar
    ?playing=${a.playing}
    beats=${a.beats}
    beat=${a.beat}
    midIndex=${a.midIndex}
    bpm=${a.bpm}
    ?unlimited=${a.unlimited}
  ></rz-transport-bar>`,
};
export default meta;
type Story = StoryObj;

export const Stopped: Story = {};
export const PlayingOnSam: Story = { args: { playing: true, beat: 0 } };
/** The half-way beat — a different stroke, and the divider's right-hand side. */
export const OnTheMidBeat: Story = { args: { playing: true, beat: 4 } };
export const Unlimited: Story = { args: { playing: true, unlimited: true, beat: 2 } };
