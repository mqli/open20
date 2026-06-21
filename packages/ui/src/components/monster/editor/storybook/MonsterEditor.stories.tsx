import type { Meta, StoryObj } from '@storybook/react';
import { useState, useCallback } from 'react';
import { MonsterEditor } from '../MonsterEditor';
import { I18nProvider } from '@/i18n';

const meta: Meta<typeof MonsterEditor> = {
  title: 'Monster/MonsterEditor',
  component: MonsterEditor,
  decorators: [
    (Story) => (
      <I18nProvider>
        <div className="max-w-2xl mx-auto p-4">
          <Story />
        </div>
      </I18nProvider>
    ),
  ],
} satisfies Meta<typeof MonsterEditor>;

export default meta;
type Story = StoryObj<typeof MonsterEditor>;

// ── Create Mode ───────────────────────────────────────────────

export const Create: Story = {
  args: {
    onSubmit: (monster, intent) => {
      console.log('Monster created:', monster, intent);
    },
    onCancel: () => console.log('Cancelled'),
  },
};

// ── Edit Mode ─────────────────────────────────────────────────

export const Edit: Story = {
  args: {
    value: {
      id: 'ancient-red-dragon',
      name: 'Ancient Red Dragon',
      source: 'Monster Manual',
      size: 'Gargantuan',
      type: 'Dragon',
      alignment: 'Chaotic Evil',
      descriptiveTags: ['Chromatic'],
      armorClass: [{ value: 22, type: 'natural armor' }],
      hitPoints: { value: 546, formula: '28d20 + 252' },
      speed: { walk: 40, climb: 40, fly: 80 },
      abilityScores: {
        base: {
          Strength: 30,
          Dexterity: 10,
          Constitution: 29,
          Intelligence: 18,
          Wisdom: 15,
          Charisma: 23,
        },
        racialBonuses: {},
      },
      savingThrows: { Dexterity: 7, Constitution: 16, Wisdom: 9, Charisma: 13 },
      skills: { Perception: 16, Stealth: 7 },
      resistances: ['Fire'],
      challengeRating: { rating: 24, xp: 62000, lairXp: 75000 },
      senses: {
        darkvision: 120,
        blindsight: 60,
        passivePerception: 26,
      },
      languages: ['Common', 'Draconic'],
      traits: [
        {
          name: 'Legendary Resistance (3/Day)',
          description: 'If the dragon fails a saving throw, it can choose to succeed instead.',
        },
      ],
      actions: [
        {
          name: 'Multiattack',
          description:
            'The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws.',
        },
        {
          name: 'Bite',
          description:
            'Melee Weapon Attack: +17 to hit, reach 15 ft., one target. Hit: 21 (2d10 + 10) piercing damage plus 14 (4d6) fire damage.',
        },
      ],
      legendaryActions: [
        {
          name: 'Detect',
          description: 'The dragon makes a Wisdom (Perception) check.',
          cost: 1,
        },
      ],
      environments: ['Mountain', 'Hill'],
    },
    onSubmit: (monster, intent) => {
      console.log('Monster updated:', monster, intent);
    },
    onCancel: () => console.log('Cancelled'),
  },
};

// ── With Preview ──────────────────────────────────────────────

export const WithPreview: Story = {
  args: {
    showPreview: true,
    value: {
      id: 'goblin',
      name: 'Goblin',
      source: 'Monster Manual',
      size: 'Small',
      type: 'Humanoid',
      alignment: 'Neutral Evil',
      armorClass: [{ value: 15, type: 'leather armor', condition: 'with shield' }],
      hitPoints: { value: 7, formula: '2d6' },
      speed: { walk: 30 },
      abilityScores: {
        base: {
          Strength: 8,
          Dexterity: 14,
          Constitution: 10,
          Intelligence: 10,
          Wisdom: 8,
          Charisma: 8,
        },
        racialBonuses: {},
      },
      challengeRating: { rating: '1/4' as const, xp: 50 },
      senses: { darkvision: 60, passivePerception: 9 },
      languages: ['Common', 'Goblin'],
    },
    onSubmit: (monster, intent) => {
      console.log('Monster saved:', monster, intent);
    },
    onCancel: () => console.log('Cancelled'),
  },
};

// ── Disabled ──────────────────────────────────────────────────

export const Disabled: Story = {
  args: {
    disabled: true,
    value: {
      id: 'zombie',
      name: 'Zombie',
      source: 'Monster Manual',
      size: 'Medium',
      type: 'Undead',
      alignment: 'Neutral Evil',
      armorClass: [{ value: 8, type: 'natural armor' }],
      hitPoints: { value: 22, formula: '3d8 + 9' },
      speed: { walk: 20 },
      abilityScores: {
        base: {
          Strength: 13,
          Dexterity: 6,
          Constitution: 16,
          Intelligence: 3,
          Wisdom: 6,
          Charisma: 5,
        },
        racialBonuses: {},
      },
      challengeRating: { rating: '1/4' as const, xp: 50 },
      conditionImmunities: ['Poisoned'],
      senses: { darkvision: 60, passivePerception: 8 },
    },
    onSubmit: (monster, intent) => {
      console.log('Submitted:', monster, intent);
    },
  },
};

// ── Controlled Mode ───────────────────────────────────────────

export const Controlled: Story = {
  render: () => {
    const [monsterData, setMonsterData] = useState({
      id: 'controlled-test',
      name: 'Controlled Monster',
      source: 'Homebrew',
      size: 'Medium' as const,
      type: 'Beast' as const,
      alignment: 'Unaligned',
      armorClass: [{ value: 12, type: 'natural armor' }],
      hitPoints: { value: 15, formula: '2d8 + 6' },
      speed: { walk: 40 },
      abilityScores: {
        base: {
          Strength: 14,
          Dexterity: 15,
          Constitution: 12,
          Intelligence: 2,
          Wisdom: 12,
          Charisma: 5,
        },
        racialBonuses: {},
      },
      challengeRating: { rating: '1/4' as const, xp: 50 },
      senses: { darkvision: 30, passivePerception: 11 },
    });

    const handleChange = useCallback((monster: any) => {
      setMonsterData(monster);
    }, []);

    return (
      <div>
        <MonsterEditor value={monsterData} onChange={handleChange} showPreview />
        <div className="mt-4 p-3 bg-bg-secondary rounded-md">
          <strong>Current Name:</strong> {monsterData.name}
        </div>
      </div>
    );
  },
};
