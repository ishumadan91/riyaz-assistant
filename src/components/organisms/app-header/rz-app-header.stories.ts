import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './rz-app-header.js';
import { thaatByKey } from '../../../data/thaats.js';

const meta: Meta = {
  title: 'Organisms/App header',
  component: 'rz-app-header',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  render: () =>
    html`<rz-app-header
      .thaats=${[thaatByKey('bilawal'), thaatByKey('todi')]}
    ></rz-app-header>`,
};
export default meta;
type Story = StoryObj;
export const Default: Story = {};
