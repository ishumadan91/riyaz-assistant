import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './rz-tempo-control.js';

const meta: Meta = {
  title: 'Molecules/Tempo control',
  component: 'rz-tempo-control',
  tags: ['autodocs'],
  args: { value: 72 },
  render: ({ value }) => html`<rz-tempo-control .value=${value}></rz-tempo-control>`,
};
export default meta;
type Story = StoryObj;
export const Default: Story = {};
export const Fast: Story = { args: { value: 160 } };
