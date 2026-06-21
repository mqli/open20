import type { Meta, StoryObj } from '@storybook/react';
import { SpeciesEditor } from '../SpeciesEditor';
import type { Species } from 'open20-core';

const meta: Meta<typeof SpeciesEditor> = {
  title: 'Rules/Species/Editor',
  component: SpeciesEditor,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SpeciesEditor>;

const defaultSpecies: Partial<Species> = {
  id: 'dwarf',
  source: 'SRD 5.2',
  description: 'Dwarves are stout, sturdy folk who live beneath the mountains.',
  size: 'Medium',
  speed: 30,
  languages: ['Common', 'Dwarvish'],
  abilityBonuses: { Constitution: 2 },
  darkvision: 60,
  baseTraits: [
    {
      name: 'Dwarven Resilience',
      description: 'You have advantage on saving throws against poison.',
    },
  ],
};

export const Default: Story = {
  args: {
    value: defaultSpecies,
    onChange: (s) => console.log('Species changed:', s),
  },
};

export const Empty: Story = {
  args: {
    onChange: (s) => console.log('Species changed:', s),
  },
};

export const Disabled: Story = {
  args: {
    value: defaultSpecies,
    disabled: true,
  },
};

export const WithActions: Story = {
  args: {
    value: defaultSpecies,
    onSubmit: (s) => alert(`Saved: ${s.id}`),
    onCancel: () => console.log('Cancelled'),
  },
};
