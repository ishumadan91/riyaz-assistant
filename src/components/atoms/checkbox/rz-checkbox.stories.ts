import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './rz-checkbox.js';

const meta: Meta = {
  title: 'Atoms/Checkbox',
  component: 'rz-checkbox',
  tags: ['autodocs'],
  argTypes: { checked: { control: 'boolean' }, label: { control: 'text' } },
  args: { checked: true, label: 'Kafi' },
  render: ({ checked, label }) =>
    html`<div style="width:260px">
      <rz-checkbox ?checked=${checked} label=${label}></rz-checkbox>
    </div>`,
};
export default meta;
type Story = StoryObj;

export const Checked: Story = { args: { checked: true } };
export const Unchecked: Story = { args: { checked: false, label: 'Bhairavi' } };
export const LongLabel: Story = {
  args: { checked: false, label: 'Reveal the upcoming sequences in the sidebar' },
};
