import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './rz-practice-page.js';
import type { RiyazStorage } from '../../../data/preferences.js';

/** In-memory storage so a story never writes to the browser's localStorage. */
const memory = (seed: Record<string, unknown> = {}): RiyazStorage => {
  const store = new Map<string, unknown>(Object.entries(seed));
  return { get: (k) => store.get(k) ?? null, set: (k, v) => void store.set(k, v) };
};

const meta: Meta = {
  title: 'Pages/Practice page',
  component: 'rz-practice-page',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

export const Standalone: Story = {
  render: () =>
    html`<div style="height:680px">
      <rz-practice-page .storage=${memory()}></rz-practice-page>
    </div>`,
};

/** What an embedding host gets: injected preferences, no document key binding. */
export const Embedded: Story = {
  render: () =>
    html`<div style="height:680px">
      <rz-practice-page
        .storage=${memory({
          riyaz: { bpm: 108, order: 'paired', enabled: ['bhairav', 'marwa'] },
        })}
      ></rz-practice-page>
    </div>`,
};
