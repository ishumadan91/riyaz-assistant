import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './rz-about-sheet.js';

const meta: Meta = {
  title: 'Organisms/About sheet',
  component: 'rz-about-sheet',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  render: () => html`<rz-about-sheet></rz-about-sheet>`,
};
export default meta;
type Story = StoryObj;
/** Content is generated from README.md by scripts/build-about.js. */
export const Default: Story = {};
