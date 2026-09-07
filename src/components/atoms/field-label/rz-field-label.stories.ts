import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './rz-field-label.js';

const meta: Meta = {
  title: 'Atoms/Field label',
  component: 'rz-field-label',
  tags: ['autodocs'],
  render: () => html`<rz-field-label>Aroha</rz-field-label>`,
};
export default meta;
type Story = StoryObj;
export const Default: Story = {};
