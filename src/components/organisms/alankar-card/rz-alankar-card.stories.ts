import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './rz-alankar-card.js';
import { ALANKARS } from '../../../data/alankars.js';
import { thaatByKey } from '../../../data/thaats.js';

const byNumber = (n: number) => ALANKARS.find((a) => a.n === n)!;

const meta: Meta = {
  title: 'Organisms/Alankar card',
  component: 'rz-alankar-card',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj;

export const Bilawal: Story = {
  render: () => html`<rz-alankar-card
    .alankar=${byNumber(23)}
    .thaat=${thaatByKey('bilawal')}
    position="1"
    total="10"
  ></rz-alankar-card>`,
};

export const Todi: Story = {
  render: () => html`<rz-alankar-card
    .alankar=${byNumber(23)}
    .thaat=${thaatByKey('todi')}
    position="2"
    total="10"
  ></rz-alankar-card>`,
};

/** The meru pyramid: many lines, so the card renders dense and centred. */
export const Meru: Story = {
  render: () => html`<rz-alankar-card
    .alankar=${byNumber(53)}
    .thaat=${thaatByKey('bhairavi')}
    position="3"
    total="10"
  ></rz-alankar-card>`,
};
