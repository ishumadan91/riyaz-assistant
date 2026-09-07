import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Design/Colors',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

const swatch = (token: string, note: string) => html`
  <div style="display:flex;align-items:center;gap:12px">
    <span
      style="width:44px;height:44px;border-radius:8px;flex:0 0 auto;
             border:1px solid var(--color-border);background:var(${token})"
    ></span>
    <span>
      <code style="font-family:var(--font-mono);font-size:13px">${token}</code>
      <div style="font-size:12px;color:var(--color-text-muted)">${note}</div>
    </span>
  </div>
`;

const grid = (rows: ReturnType<typeof swatch>[]) => html`
  <div
    style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));
           gap:16px;padding:24px;font-family:var(--font-family-base)"
  >
    ${rows}
  </div>
`;

/** These names are LWCG's; a host supplies them and every component inherits. */
export const Semantic: Story = {
  render: () =>
    grid([
      swatch('--color-primary', 'teal — actions, komal & teevra rules, the divider beat'),
      swatch('--color-accent', 'coral — sam, and only sam'),
      swatch('--color-heading', 'navy — headings and swara glyphs'),
      swatch('--color-text', 'body text'),
      swatch('--color-text-muted', 'secondary text, punctuation in notation'),
      swatch('--color-bg', 'sand — the app ground'),
      swatch('--color-surface', 'cards, header, transport'),
      swatch('--color-surface-muted', 'the thaat-scale strip'),
      swatch('--color-border', 'rules, unlit beat dots'),
    ]),
};

export const Brand: Story = {
  render: () =>
    grid([
      swatch('--color-teal', 'Bright Teal'),
      swatch('--color-coral', 'Warm Coral'),
      swatch('--color-sand', 'Light Sand'),
      swatch('--color-navy', 'Navy Blue'),
      swatch('--color-slate', 'Dark Slate'),
    ]),
};

export const Feedback: Story = {
  render: () =>
    grid([
      swatch('--color-error', 'the thaat pool refusing to empty'),
      swatch('--color-success', ''),
      swatch('--color-warning', ''),
    ]),
};
