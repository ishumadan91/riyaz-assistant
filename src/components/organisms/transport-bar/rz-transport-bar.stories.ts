import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './rz-transport-bar.js';

const meta: Meta = {
  title: 'Organisms/Transport bar',
  component: 'rz-transport-bar',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { playing: false, beats: 8, beat: 0, midIndex: 4, cycle: 0, cyclesPerItem: 2, bpm: 72 },
  render: (a) => html`<rz-transport-bar
    ?playing=${a.playing}
    beats=${a.beats}
    beat=${a.beat}
    midIndex=${a.midIndex}
    cycle=${a.cycle}
    cyclesPerItem=${a.cyclesPerItem}
    bpm=${a.bpm}
  ></rz-transport-bar>`,
};
export default meta;
type Story = StoryObj;

export const Stopped: Story = {};
export const PlayingOnSam: Story = { args: { playing: true, beat: 0 } };
export const SecondCycle: Story = { args: { playing: true, beat: 4, cycle: 1 } };
