import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './rz-session-complete.js';

const meta: Meta = {
  title: 'Organisms/Session complete',
  component: 'rz-session-complete',
  tags: ['autodocs'],
  render: () => html`<rz-session-complete sequences="10"></rz-session-complete>`,
};
export default meta;
type Story = StoryObj;
export const Default: Story = {};
