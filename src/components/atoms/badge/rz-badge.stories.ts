import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './rz-badge.js';

const meta: Meta = {
  title: 'Atoms/Badge',
  component: 'rz-badge',
  tags: ['autodocs'],
  argTypes: { tone: { control: 'inline-radio', options: ['primary', 'secondary'] } },
  args: { tone: 'primary', label: 'Bilawal' },
  render: ({ tone, label }) => html`<rz-badge tone=${tone} label=${label}></rz-badge>`,
};
export default meta;
type Story = StoryObj;

export const Primary: Story = { args: { tone: 'primary', label: 'Bilawal' } };
export const Secondary: Story = { args: { tone: 'secondary', label: 'Todi' } };

/** How a session's two thaats appear in the header. */
export const SessionPair: Story = {
  render: () => html`
    <div style="display:flex;gap:8px">
      <rz-badge tone="primary" label="Bilawal"></rz-badge>
      <rz-badge tone="secondary" label="Todi"></rz-badge>
    </div>
  `,
};
