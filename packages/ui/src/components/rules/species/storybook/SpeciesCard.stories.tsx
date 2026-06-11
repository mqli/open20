import type { Meta, StoryObj } from '@storybook/react';
import { SpeciesCard } from '..';

const meta: Meta<typeof SpeciesCard> = {
  title: 'Rules/SpeciesCard',
  component: SpeciesCard,
  tags: ['autodocs'],
  argTypes: {
    density: {
      control: 'select',
      options: ['default', 'compact'],
    },
    surfaceVariant: {
      control: 'select',
      options: ['default', 'tint', 'warning', 'info', 'selected'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof SpeciesCard>;

const sampleDwarf: import('open20-core').Species = {
  id: 'Dwarf',
  source: '2024 PHB',
  description: 'Dwarves are sturdy and resilient, with a strong connection to stone and earth.',
  size: 'Medium',
  speed: 25,
  languages: ['Common', 'Dwarvish'],
  abilityBonuses: { Constitution: 2 },
  baseTraits: [
    {
      name: 'Darkvision',
      description: 'You can see in dim light within 60 feet as if it were bright light.',
    },
    {
      name: 'Dwarven Resilience',
      description: 'You have advantage on saving throws against poison.',
    },
  ],
  subtypes: [
    {
      id: 'Hill Dwarf',
      name: 'Hill Dwarf',
      description: 'Hill dwarves are tough and resilient.',
      traits: [
        {
          name: 'Dwarven Toughness',
          description:
            'Your hit point maximum increases by 1, and it increases by 1 every time you gain a level.',
        },
      ],
    },
    {
      id: 'Mountain Dwarf',
      name: 'Mountain Dwarf',
      description: 'Mountain dwarves are strong and hardy.',
      traits: [
        {
          name: 'Dwarven Armor Training',
          description: 'You have proficiency with light and medium armor.',
        },
      ],
    },
  ],
  darkvision: 60,
};

export const Default: Story = {
  args: {
    species: sampleDwarf,
    showDescription: true,
    showTraits: true,
  },
};

export const Compact: Story = {
  args: {
    ...Default.args,
    density: 'compact',
    showDescription: false,
    showTraits: false,
  },
};

export const SmallSpecies: Story = {
  args: {
    species: {
      ...sampleDwarf,
      id: 'Halfling',
      size: 'Small',
      speed: 25,
      abilityBonuses: { Dexterity: 2 },
      baseTraits: [
        {
          name: 'Lucky',
          description:
            'When you roll a 1 on the d20 for a saving throw or attack roll, you can reroll the die and must use the new roll.',
        },
      ],
      subtypes: undefined,
      darkvision: undefined,
    },
    showDescription: true,
    showTraits: true,
  },
};
