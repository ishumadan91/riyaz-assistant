import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './rz-alankar-part.js';
import { parseNotation } from '../../../data/notation.js';

const lines = (...src: string[]) => src.map((s) => parseNotation(s));

const meta: Meta = {
  title: 'Molecules/Alankar part',
  component: 'rz-alankar-part',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj;

export const Aroha: Story = {
  render: () =>
    html`<rz-alankar-part
      label="Aroha"
      .lines=${lines('SR SRGm, RG RGmP, Gm GmPD, mP mPDN, PD PDNS.')}
    ></rz-alankar-part>`,
};

/** The meru pyramid — centred, because its shape is the point. */
export const Pyramid: Story = {
  render: () =>
    html`<rz-alankar-part
      label="Aroha"
      centred
      dense
      .lines=${lines(
        'S',
        'SRS',
        'SRGRS',
        'SRGmGRS',
        'SRGmPmGRS',
        'SRGmPDPmGRS',
        'SRGmPDNDPmGRS',
        'SRGmPDNS.NDPmGRS',
        'SRGmPDNS.',
      )}
    ></rz-alankar-part>`,
};
