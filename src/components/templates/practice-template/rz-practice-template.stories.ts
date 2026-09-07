import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './rz-practice-template.js';
import { newSession } from '../../../data/session.js';
import { OPTIONAL_THAATS } from '../../../data/thaats.js';

const session = newSession(OPTIONAL_THAATS.map((t) => t.key));
const enabled = OPTIONAL_THAATS.map((t) => t.key);

const frame = (inner: unknown) =>
  html`<div style="height:640px">${inner}</div>`;

const meta: Meta = {
  title: 'Templates/Practice template',
  component: 'rz-practice-template',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

export const Practising: Story = {
  render: () =>
    frame(html`<rz-practice-template
      .items=${session.items}
      .thaats=${session.thaats}
      index="1"
      .enabled=${enabled}
    ></rz-practice-template>`),
};

export const SettingsOpen: Story = {
  render: () =>
    frame(html`<rz-practice-template
      .items=${session.items}
      .thaats=${session.thaats}
      panel="settings"
      .enabled=${enabled}
    ></rz-practice-template>`),
};

export const AboutOpen: Story = {
  render: () =>
    frame(html`<rz-practice-template
      .items=${session.items}
      .thaats=${session.thaats}
      panel="about"
      .enabled=${enabled}
    ></rz-practice-template>`),
};

export const Finished: Story = {
  render: () =>
    frame(html`<rz-practice-template
      .items=${session.items}
      .thaats=${session.thaats}
      finished
      .enabled=${enabled}
    ></rz-practice-template>`),
};
