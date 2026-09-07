import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './rz-rail-item.js';

const meta: Meta = {
  title: 'Molecules/Rail item',
  component: 'rz-rail-item',
  tags: ['autodocs'],
  args: { index: 2, label: '23 · Todi', active: false, done: false, masked: false },
  render: ({ index, label, active, done, masked }) =>
    html`<div style="width:220px">
      <rz-rail-item
        index=${index}
        label=${label}
        ?active=${active}
        ?done=${done}
        ?masked=${masked}
      ></rz-rail-item>
    </div>`,
};
export default meta;
type Story = StoryObj;

export const Active: Story = { args: { active: true } };
export const Done: Story = { args: { done: true, index: 1, label: '38 · Bilawal' } };
/** Upcoming sequences stay a surprise. */
export const Masked: Story = { args: { masked: true, index: 5 } };

export const Rail: Story = {
  render: () => html`
    <div style="width:220px;display:flex;flex-direction:column;gap:2px">
      <rz-rail-item index="1" label="38 · Bilawal" done></rz-rail-item>
      <rz-rail-item index="2" label="23 · Todi" active></rz-rail-item>
      <rz-rail-item index="3" masked></rz-rail-item>
      <rz-rail-item index="4" masked></rz-rail-item>
    </div>
  `,
};
