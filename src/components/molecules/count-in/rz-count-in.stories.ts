import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './rz-count-in.js';

const meta: Meta = {
  title: 'Molecules/Count-in',
  component: 'rz-count-in',
  tags: ['autodocs'],
  argTypes: { value: { control: { type: 'number', min: 0, max: 3 } } },
  args: { value: 3 },
  render: ({ value }) => html`<rz-count-in value=${value}></rz-count-in>`,
};
export default meta;
type Story = StoryObj;

export const Three: Story = { args: { value: 3 } };
export const One: Story = { args: { value: 1 } };
/** Zero renders nothing — the cycle has started. */
export const Hidden: Story = { args: { value: 0 } };
