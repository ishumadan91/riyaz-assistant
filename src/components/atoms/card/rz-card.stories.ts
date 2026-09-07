import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './rz-card.js';
import '../badge/rz-badge.js';

const meta: Meta = {
  title: 'Atoms/Card',
  component: 'rz-card',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj;

export const WithTitleAndBadge: Story = {
  render: () => html`
    <rz-card style="width:520px">
      <h2 slot="title">Alankar 23</h2>
      <rz-badge slot="badges" tone="primary" label="Bilawal"></rz-badge>
      <p style="margin:0;color:var(--color-text-muted)">Prefix &amp; overlapping patterns</p>
    </rz-card>
  `,
};

export const Bare: Story = {
  render: () => html`
    <rz-card no-header style="width:520px">
      <p style="margin:0">A panel with no title row.</p>
    </rz-card>
  `,
};
