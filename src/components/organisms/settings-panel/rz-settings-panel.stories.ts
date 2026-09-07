import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './rz-settings-panel.js';
import { OPTIONAL_THAATS } from '../../../data/thaats.js';

const meta: Meta = {
  title: 'Organisms/Settings panel',
  component: 'rz-settings-panel',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

export const AllThaats: Story = {
  render: () => html`<rz-settings-panel
    cyclesPerItem="2"
    .enabled=${OPTIONAL_THAATS.map((t) => t.key)}
  ></rz-settings-panel>`,
};

export const Narrowed: Story = {
  render: () => html`<rz-settings-panel
    cyclesPerItem="4"
    reveal
    .enabled=${['kafi', 'bhairav']}
  ></rz-settings-panel>`,
};
