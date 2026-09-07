import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './rz-swara.js';

const meta: Meta = {
  title: 'Atoms/Swara',
  component: 'rz-swara',
  tags: ['autodocs'],
  argTypes: {
    letter: { control: 'text' },
    komal: { control: 'boolean' },
    teevra: { control: 'boolean' },
    saptak: { control: 'inline-radio', options: ['mandra', 'madhya', 'taar'] },
  },
  args: { letter: 'G', komal: false, teevra: false, saptak: 'madhya' },
  render: ({ letter, komal, teevra, saptak }) => html`
    <div style="font-family:var(--font-mono);font-size:32px">
      <rz-swara letter=${letter} ?komal=${komal} ?teevra=${teevra} saptak=${saptak}></rz-swara>
    </div>
  `,
};
export default meta;
type Story = StoryObj;

export const Shuddha: Story = { args: { letter: 'G' } };
export const Komal: Story = { args: { letter: 'G', komal: true } };
export const Teevra: Story = { args: { letter: 'M', teevra: true } };
export const Taar: Story = { args: { letter: 'S', saptak: 'taar' } };
export const Mandra: Story = { args: { letter: 'N', saptak: 'mandra' } };

/** The stacking case combining marks cannot do: a rule *and* a dot below. */
export const KomalMandra: Story = { args: { letter: 'N', komal: true, saptak: 'mandra' } };

export const EveryMark: Story = {
  render: () => html`
    <div style="font-family:var(--font-mono);font-size:32px;display:flex;gap:20px">
      <rz-swara letter="S"></rz-swara>
      <rz-swara letter="R" komal></rz-swara>
      <rz-swara letter="G" komal></rz-swara>
      <rz-swara letter="M" teevra></rz-swara>
      <rz-swara letter="P"></rz-swara>
      <rz-swara letter="D" komal></rz-swara>
      <rz-swara letter="N" saptak="mandra"></rz-swara>
      <rz-swara letter="S" saptak="taar"></rz-swara>
    </div>
  `,
};
