import type { Meta, StoryObj } from '@storybook/react';
import type { Monster, AbilityName } from 'open20-core';
import { Button } from '@/components/base/Button';
import { MonsterCard, type MonsterCardProps } from '../MonsterCard';

const meta: Meta<typeof MonsterCard> = {
  title: 'Monster/MonsterCard',
  component: MonsterCard,
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
      options: ['default', 'tint', 'selected', 'warning', 'info'],
    },
    glow: {
      control: 'boolean',
    },
    onClick: { action: 'clicked' },
    renderActions: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof MonsterCard>;

/** Helper to create AbilityScores */
function createAbilityScores(
  str: number,
  dex: number,
  con: number,
  int: number,
  wis: number,
  cha: number,
) {
  return {
    base: {
      Strength: str,
      Dexterity: dex,
      Constitution: con,
      Intelligence: int,
      Wisdom: wis,
      Charisma: cha,
    } as Record<AbilityName, number>,
    racialBonuses: {},
    featBonuses: {},
    temporaryBonuses: {},
  };
}

/** A sample Goblin - simple monster */
const goblin: Monster = {
  id: 'goblin',
  name: 'Goblin',
  source: 'SRD 5.2',
  size: 'Small',
  type: 'Humanoid',
  alignment: 'neutral evil',
  armorClass: [{ value: 15, type: 'leather armor, shield' }],
  hitPoints: { value: 7, formula: '2d6' },
  speed: { walk: 30 },
  initiative: { modifier: 2, score: 14 },
  abilityScores: createAbilityScores(8, 14, 10, 10, 8, 8),
  skills: { Stealth: 6 },
  senses: { darkvision: 60, passivePerception: 9 },
  languages: ['Common', 'Goblin'],
  challengeRating: { rating: '1/4', xp: 50 },
  traits: [
    {
      name: 'Nimble Escape',
      description:
        'The goblin can take the Disengage or Hide action as a bonus action on each of its turns.',
    },
  ],
  actions: [
    {
      name: 'Scimitar',
      description:
        'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage.',
    },
    {
      name: 'Shortbow',
      description:
        'Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 5 (1d6 + 2) piercing damage.',
    },
  ],
};

/** A sample Young Red Dragon - complex monster with many features */
const youngRedDragon: Monster = {
  id: 'young-red-dragon',
  name: 'Young Red Dragon',
  source: 'SRD 5.2',
  size: 'Large',
  type: 'Dragon',
  alignment: 'chaotic evil',
  descriptiveTags: ['Chromatic'],
  armorClass: [{ value: 18, type: 'natural armor' }],
  hitPoints: { value: 178, formula: '17d10 + 85' },
  speed: { walk: 40, burrow: 20, fly: 80, hover: true },
  abilityScores: createAbilityScores(23, 10, 21, 14, 11, 19),
  savingThrows: { Dexterity: 4, Wisdom: 4 },
  skills: { Perception: 9, Stealth: 4 },
  damageDefenses: { resistances: [], immunities: ['Fire'], vulnerabilities: [] },
  senses: { blindsight: 30, darkvision: 120, passivePerception: 19 },
  languages: ['Common', 'Draconic'],
  challengeRating: { rating: 10, xp: 5900 },
  traits: [
    {
      name: 'Legendary Resistance (3/Day)',
      description: 'If the dragon fails a saving throw, it can choose to succeed instead.',
    },
  ],
  actions: [
    {
      name: 'Multiattack',
      description: 'The dragon makes three attacks: one with its bite and two with its claws.',
    },
    {
      name: 'Bite',
      description:
        'Melee Weapon Attack: +11 to hit, reach 10 ft., one target. Hit: 17 (2d10 + 6) piercing damage plus 7 (2d6) fire damage.',
    },
    {
      name: 'Claw',
      description:
        'Melee Weapon Attack: +11 to hit, reach 5 ft., one target. Hit: 13 (2d6 + 6) slashing damage.',
    },
    {
      name: 'Fire Breath (Recharge 5–6)',
      description:
        'The dragon exhales fire in a 30-foot cone. Each creature in that area must make a DC 18 Dexterity saving throw, taking 56 (16d6) fire damage on a failed save, or half as much damage on a successful one.',
      limitedUsage: { type: 'recharge', rechargeRange: [5, 6] as const },
    },
  ],
  legendaryActions: [
    {
      name: 'Detect',
      description: 'The dragon makes a Wisdom (Perception) check.',
      cost: 1,
    },
    {
      name: 'Tail Attack',
      description: 'The dragon makes a tail attack.',
      cost: 1,
    },
    {
      name: 'Wing Attack (Costs 2 Actions)',
      description:
        'The dragon beats its wings. Each creature within 10 feet of the dragon must succeed on a DC 19 Dexterity saving throw or take 13 (2d6 + 6) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed.',
      cost: 2,
    },
  ],
};

/** A monster with spellcasting */
const lich: Monster = {
  id: 'lich',
  name: 'Lich',
  source: 'SRD 5.2',
  size: 'Medium',
  type: 'Undead',
  alignment: 'any evil alignment',
  armorClass: [{ value: 17, type: 'natural armor' }],
  hitPoints: { value: 135, formula: '18d8 + 54' },
  speed: { walk: 30 },
  abilityScores: createAbilityScores(11, 16, 16, 20, 14, 16),
  savingThrows: { Constitution: 10, Intelligence: 12, Wisdom: 9 },
  skills: { Arcana: 18, History: 18, Perception: 9 },
  damageDefenses: {
    resistances: ['Cold', 'Lightning', 'Necrotic'],
    immunities: ['Poison'],
    vulnerabilities: [],
  },
  conditionImmunities: ['Charmed', 'Exhaustion', 'Frightened', 'Paralyzed', 'Poisoned'],
  senses: { truesight: 120, passivePerception: 19 },
  languages: ['Common', 'Draconic', 'Elvish', 'Abyssal'],
  challengeRating: { rating: 21, xp: 33000 },
  traits: [
    {
      name: 'Legendary Resistance (3/Day)',
      description: 'If the lich fails a saving throw, it can choose to succeed instead.',
    },
  ],
  spellcasting: [
    {
      ability: 'Intelligence',
      saveDC: 20,
      attackBonus: 12,
      atWill: ['Detect Magic', 'Magic Missile', 'Shield'],
      daily: [
        { spell: 'Power Word Stun', times: 1 },
        { spell: 'Power Word Kill', times: 1 },
      ],
    },
  ],
  actions: [
    {
      name: 'Paralyzing Touch',
      description:
        'Melee Spell Attack: +12 to hit, reach 5 ft., one creature. Hit: 10 (3d6) cold damage. The target must succeed on a DC 18 Constitution saving throw or be paralyzed for 1 minute.',
    },
    {
      name: 'Frightening Gaze',
      description:
        'The lich targets one creature within 10 feet of it that it can see. The target must succeed on a DC 18 Wisdom saving throw or become frightened for 1 minute.',
    },
  ],
  legendaryActions: [
    {
      name: 'Cast a Cantrip',
      description: 'The lich casts a cantrip.',
      cost: 1,
    },
    {
      name: 'Paralyzing Touch',
      description: 'The lich uses its Paralyzing Touch.',
      cost: 1,
    },
    {
      name: 'Disrupt Life (Costs 3 Actions)',
      description:
        'Each non-undead creature within 20 feet of the lich must make a DC 18 Constitution saving throw, taking 21 (6d6) necrotic damage on a failed save, or half as much damage on a successful one.',
      cost: 3,
    },
  ],
};

const renderActions: NonNullable<MonsterCardProps['renderActions']> = () => (
  <>
    <Button size="sm" variant="secondary">
      Add to Encounter
    </Button>
    <Button size="sm" variant="ghost">
      View Details
    </Button>
  </>
);

/** Demo CTA: a small "Roll" button for actions */
const renderRollCTA: NonNullable<MonsterCardProps['renderActionCTA']> = (action) => (
  <Button
    size="sm"
    variant="ghost"
    onClick={(e) => {
      e.stopPropagation();
      alert(`Rolling for ${action.name}…`);
    }}
  >
    Roll
  </Button>
);

/** Demo CTA: a small "Cast" button for spells */
const renderCastCTA: NonNullable<MonsterCardProps['renderSpellCTA']> = (ctx) => (
  <Button
    size="sm"
    variant="ghost"
    onClick={(e) => {
      e.stopPropagation();
      alert(`Casting ${ctx.spellName}…`);
    }}
  >
    Cast
  </Button>
);

export const Default: Story = {
  args: {
    monster: goblin,
  },
};

export const Compact: Story = {
  args: {
    monster: goblin,
    density: 'compact',
  },
};

export const Complex: Story = {
  args: {
    monster: youngRedDragon,
  },
};

export const WithSpellcasting: Story = {
  args: {
    monster: lich,
  },
};

export const WithActions: Story = {
  args: {
    monster: goblin,
    renderActions,
  },
};

export const Clickable: Story = {
  args: {
    monster: goblin,
    onClick: () => undefined,
    glow: true,
    surfaceVariant: 'tint',
  },
};

export const DensityPreview: Story = {
  args: {
    monster: goblin,
  },
  render: (args: MonsterCardProps) => (
    <div className="grid gap-3 md:grid-cols-2">
      <MonsterCard {...args} density="compact" />
      <MonsterCard {...args} density="default" />
    </div>
  ),
};

export const WithActionCTA: Story = {
  args: {
    monster: youngRedDragon,
    renderActionCTA: renderRollCTA,
    renderLegendaryActionCTA: renderRollCTA,
  },
};

export const WithSpellCTA: Story = {
  args: {
    monster: lich,
    renderSpellCTA: renderCastCTA,
  },
};
