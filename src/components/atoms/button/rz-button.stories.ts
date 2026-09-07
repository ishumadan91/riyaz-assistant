import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './rz-button.js';

const meta: Meta = {
  title: 'Atoms/Button',
  component: 'rz-button',
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'outline', 'link'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: { variant: 'primary', size: 'md', disabled: false, label: 'Play' },
  render: ({ variant, size, disabled, label }) =>
    html`<rz-button variant=${variant} size=${size} ?disabled=${disabled} label=${label}></rz-button>`,
};
export default meta;
type Story = StoryObj;

export const Primary: Story = { args: { variant: 'primary', label: 'Play' } };
export const Secondary: Story = { args: { variant: 'secondary', size: 'sm', label: 'New session' } };
export const Outline: Story = { args: { variant: 'outline', size: 'sm', label: 'Next ›' } };
export const Link: Story = { args: { variant: 'link', label: 'Close ✕' } };

export const TransportRow: Story = {
  render: () => html`
    <div style="display:flex;gap:8px;align-items:center">
      <rz-button variant="outline" size="sm" label="‹ Prev"></rz-button>
      <rz-button variant="primary" label="Play"></rz-button>
      <rz-button variant="outline" size="sm" label="Next ›"></rz-button>
    </div>
  `,
};
