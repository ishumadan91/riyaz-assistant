import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './rz-choice-group.js';

const ORDERS = [
  { value: 'shuffled', label: 'Shuffled', hint: 'The order they were randomised into.' },
  { value: 'by-thaat', label: 'By thaat', hint: 'All five in Bilawal, then the pair.' },
  { value: 'paired', label: 'Paired', hint: 'Each alankar, then its counterpart.' },
];

const meta: Meta = {
  title: 'Molecules/Choice group',
  component: 'rz-choice-group',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj;

/** The hint belongs to the selected choice and is rendered once, below. */
export const WithHint: Story = {
  render: () =>
    html`<rz-choice-group
      label="Sequence order"
      value="by-thaat"
      .options=${ORDERS}
    ></rz-choice-group>`,
};

/** Inline, with no hints — how the alankar browser picks a thaat. */
export const Inline: Story = {
  render: () =>
    html`<rz-choice-group
      inline
      label="Show in"
      value="kafi"
      .options=${[
        { value: 'bilawal', label: 'Bilawal' },
        { value: 'kafi', label: 'Kafi' },
        { value: 'todi', label: 'Todi' },
      ]}
    ></rz-choice-group>`,
};
