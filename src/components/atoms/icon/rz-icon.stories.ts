import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './rz-icon.js';
import { ICONS, type IconName } from './icon-registry.js';

const meta: Meta = {
  title: 'Atoms/Icon',
  component: 'rz-icon',
  tags: ['autodocs'],
  argTypes: { name: { control: 'select', options: Object.keys(ICONS) } },
  args: { name: 'play' },
  render: ({ name }) =>
    html`<div style="font-size:32px;color:var(--color-heading)">
      <rz-icon name=${name}></rz-icon>
    </div>`,
};
export default meta;
type Story = StoryObj;

export const Play: Story = {};
export const All: Story = {
  render: () => html`
    <div style="display:flex;gap:24px;font-size:28px;color:var(--color-heading)">
      ${(Object.keys(ICONS) as IconName[]).map(
        (n) => html`<span style="display:flex;flex-direction:column;align-items:center;gap:6px">
          <rz-icon name=${n}></rz-icon>
          <span style="font-size:11px;font-family:var(--font-mono);color:var(--color-text-muted)">${n}</span>
        </span>`,
      )}
    </div>
  `,
};
