import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './rz-alankar-browser.js';

const meta: Meta = {
  title: 'Organisms/Alankar browser',
  component: 'rz-alankar-browser',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

/** All 53 in Bilawal — the form they are stored in. */
export const Bilawal: Story = {
  render: () => html`<rz-alankar-browser thaatKey="bilawal"></rz-alankar-browser>`,
};

/** Every line is transposed on render; nothing is stored per thaat. */
export const Todi: Story = {
  render: () => html`<rz-alankar-browser thaatKey="todi"></rz-alankar-browser>`,
};
