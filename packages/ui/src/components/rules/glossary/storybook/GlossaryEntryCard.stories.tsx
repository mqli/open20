import type { Meta, StoryObj } from '@storybook/react';
import type { GlossaryEntry } from 'open20-core';
import { GlossaryEntryCard, type GlossaryEntryCardProps } from '../GlossaryEntryCard';

const surfaceVariantOptions = ['default', 'tint', 'selected', 'warning', 'info'] as const;

const blindedEntry: GlossaryEntry = {
  id: 'blinded',
  source: 'SRD 5.2',
  name: 'Blinded',
  tag: 'Condition',
  condition: 'Blinded',
  content: ['While you have the Blinded condition, you experience the following effects.'],
  subsections: [
    {
      title: "Can't See.",
      content: ["You can't see and automatically fail any ability check that requires sight."],
    },
    {
      title: 'Attacks Affected.',
      content: [
        'Attack rolls against you have Advantage, and your attack rolls have Disadvantage.',
      ],
    },
  ],
  seeAlso: [{ type: 'entry', id: 'advantage' }],
};

const actionEntry: GlossaryEntry = {
  id: 'action',
  source: 'SRD 5.2',
  name: 'Action',
  content: [
    'On your turn, you can take one action. Choose which action to take from those below or from the special actions provided by your features.',
  ],
  relatedEntryIds: [
    'attack',
    'dash',
    'dodge',
    'help',
    'hide',
    'influence',
    'magic',
    'ready',
    'search',
    'study',
    'utilize',
  ],
  seeAlso: [{ type: 'document', document: 'Playing the Game', sections: ['Actions'] }],
};

const armorClassEntry: GlossaryEntry = {
  id: 'armor-class',
  source: 'SRD 5.2',
  name: 'Armor Class',
  aliases: ['AC'],
  content: [
    'An Armor Class (AC) is the target number for an attack roll. AC represents how difficult it is to hit a target.',
    'Your base AC calculation is 10 plus your Dexterity modifier.',
  ],
  seeAlso: [{ type: 'entry', id: 'attack-roll' }],
};

const breakingObjectsEntry: GlossaryEntry = {
  id: 'breaking-objects',
  source: 'SRD 5.2',
  name: 'Breaking Objects',
  content: ['Objects can be harmed by attacks and by some spells, using the rules below.'],
  subsections: [
    {
      title: 'Armor Class.',
      content: ['The Object Armor Class table suggests ACs for various substances.'],
    },
  ],
  tables: [
    {
      title: 'Object Armor Class',
      headers: ['AC', 'Substance'],
      rows: [
        ['11', 'Cloth, paper, rope'],
        ['15', 'Wood'],
        ['19', 'Iron, steel'],
      ],
    },
  ],
};

const meta: Meta<typeof GlossaryEntryCard> = {
  title: 'rules/GlossaryEntryCard',
  component: GlossaryEntryCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    density: {
      control: 'select',
      options: ['default', 'compact'],
    },
    surfaceVariant: {
      control: 'select',
      options: surfaceVariantOptions,
    },
    glow: { control: 'boolean' },
    showContent: { control: 'boolean' },
    onClick: { action: 'clicked' },
    onTermClick: { action: 'term-clicked' },
    renderActions: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof GlossaryEntryCard>;

export const ConditionEntry: Story = {
  args: {
    entry: blindedEntry,
    onTermClick: (entryId) => console.log('term', entryId),
  },
};

export const IndexEntry: Story = {
  args: {
    entry: actionEntry,
    resolveTermLabel: (entryId) =>
      ({
        attack: 'Attack',
        dash: 'Dash',
        dodge: 'Dodge',
      })[entryId] ?? entryId,
    onTermClick: (entryId) => console.log('term', entryId),
  },
};

export const WithAliases: Story = {
  args: {
    entry: armorClassEntry,
  },
};

export const WithTable: Story = {
  args: {
    entry: breakingObjectsEntry,
  },
};

export const Compact: Story = {
  args: {
    entry: blindedEntry,
    density: 'compact',
    showContent: false,
  },
};

export const Selected: Story = {
  args: {
    entry: actionEntry,
    surfaceVariant: 'selected' satisfies NonNullable<GlossaryEntryCardProps['surfaceVariant']>,
    glow: true,
  },
};
