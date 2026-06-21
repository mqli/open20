import type { Meta, StoryObj } from '@storybook/react';
import { BackgroundEditor } from '../BackgroundEditor';
import type { Background } from 'open20-core';

const meta: Meta<typeof BackgroundEditor> = {
  title: 'Rules/Background/Editor',
  component: BackgroundEditor,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BackgroundEditor>;

const defaultBackground: Partial<Background> = {
  id: 'acolyte',
  name: 'Acolyte',
  source: 'SRD 5.2',
  description: 'You have spent your life in service to a temple.',
  skillProficiencies: ['Insight', 'Religion'],
  toolProficiencies: ["Calligrapher's Supplies"],
  languages: ['Celestial'],
  originFeatId: 'magic-initiate',
  startingEquipment: [
    {
      id: 'holy-symbol',
      name: 'Holy Symbol',
      type: 'gears' as const,
      weight: 1,
      equipped: false,
      quantity: 1,
    },
    {
      id: 'prayer-book',
      name: 'Prayer Book',
      type: 'gears' as const,
      weight: 2,
      equipped: false,
      quantity: 1,
    },
  ],
  startingGold: 15,
};

export const Default: Story = {
  args: {
    value: defaultBackground,
    onChange: (bg) => console.log('Background changed:', bg),
  },
};

export const Empty: Story = {
  args: {
    onChange: (bg) => console.log('Background changed:', bg),
  },
};

export const Disabled: Story = {
  args: {
    value: defaultBackground,
    disabled: true,
  },
};

export const WithActions: Story = {
  args: {
    value: defaultBackground,
    onSubmit: (bg) => alert(`Saved: ${bg.name}`),
    onCancel: () => console.log('Cancelled'),
  },
};
