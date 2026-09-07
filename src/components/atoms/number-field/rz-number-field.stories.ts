import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './rz-number-field.js';

const meta: Meta = {
  title: 'Atoms/Number field',
  component: 'rz-number-field',
  tags: ['autodocs'],
  args: { value: 72, min: 30, max: 180, step: 1, label: 'Tempo' },
  render: ({ value, min, max, step, label }) =>
    html`<rz-number-field
      style="width:6rem"
      .value=${value}
      min=${min}
      max=${max}
      step=${step}
      label=${label}
    ></rz-number-field>`,
};
export default meta;
type Story = StoryObj;

export const Tempo: Story = {};
export const Cycles: Story = { args: { value: 2, min: 1, max: 8, label: 'Cycles per alankar' } };
