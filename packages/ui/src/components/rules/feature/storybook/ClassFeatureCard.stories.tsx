import type { Meta, StoryObj } from '@storybook/react';
import { ResetType } from 'open20-core';
import type { Feature } from 'open20-core';
import { Button } from '@/components/Button';
import { ClassFeatureCard, type ClassFeatureCardProps } from '../ClassFeatureCard';

const meta: Meta<typeof ClassFeatureCard> = {
  title: 'rules/ClassFeatureCard',
  component: ClassFeatureCard,
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
    showDescription: {
      control: 'boolean',
    },
    onClick: { action: 'clicked' },
    renderActions: { control: false },
  },
};
export default meta;
type Story = StoryObj<typeof ClassFeatureCard>;

/* -------------------------------------------------------------------------- */
/*  Sample Features (2024 PHB)                                               */
/* -------------------------------------------------------------------------- */

// Generic feature - Barbarian Rage
const rageFeature: Feature = {
  name: 'Rage',
  description:
    'You can unleash a primal surge of ferocity. As a Bonus Action, you can enter a Rage for 1 minute. While raging, you gain the following benefits:\n• Advantage on Strength checks and Strength saving throws\n• Bonus damage equal to your Rage Damage bonus on melee weapon attack rolls\n• Resistance to Bludgeoning, Piercing, and Slashing damage',
  level: 1,
  featureType: 'generic',
  resourceId: 'rage',
  resourceMax: 2,
  resourceResetOn: ResetType.LongRest,
};

// Generic feature - no resource
const unarmoredDefenseFeature: Feature = {
  name: 'Unarmored Defense',
  description:
    "While you aren't wearing armor or a shield, your base AC equals 10 + your Dexterity modifier + your Constitution modifier.",
  level: 1,
  featureType: 'generic',
};

// AC Formula feature - Monk
const monkUnarmoredDefense: Feature = {
  name: 'Unarmored Defense',
  description:
    'Beginning at 1st level, while you are wearing no armor and not wielding a shield, your AC equals 10 + your Dexterity modifier + your Wisdom modifier.',
  level: 1,
  featureType: 'acFormula',
  acFormula: {
    baseAC: 10,
    addModifiers: ['Dexterity', 'Wisdom'],
    requires: ['noArmor', 'noShield'],
  },
};

// Feature with resource scaling by level - Sorcery Points
const sorceryPointsFeature: Feature = {
  name: 'Sorcery Points',
  description:
    'You have 2 Sorcery Points, which are represented by a Sorcery Points resource. You can spend 1 Sorcery Point to gain a Sorcery Point die (d6).',
  level: 2,
  featureType: 'generic',
  resourceId: 'sorcery-points',
  resourceMax: 2,
  resourceMaxByLevel: {
    2: 2,
    3: 3,
    4: 3,
    5: 4,
    6: 4,
    7: 5,
    8: 5,
    9: 6,
    10: 6,
    11: 7,
    12: 7,
    13: 8,
    14: 8,
    15: 9,
    16: 9,
    17: 10,
    18: 10,
    19: 11,
    20: 11,
  },
  resourceResetOn: ResetType.LongRest,
};

// Fighting Style feature
const fightingStyleFeature: Feature = {
  name: 'Fighting Style',
  description:
    'You adopt a particular style of fighting as your specialty. Choose one of the following options:\n• Archery: You gain a +2 bonus to attack rolls you make with ranged weapons.\n• Defense: While you are wearing armor, you gain a +1 bonus to AC.',
  level: 1,
  featureType: 'generic',
};

/* -------------------------------------------------------------------------- */
/*  Render helpers                                                           */
/* -------------------------------------------------------------------------- */

const renderChosenActions: NonNullable<ClassFeatureCardProps['renderActions']> = () => (
  <>
    <Button size="sm" variant="ghost">
      Remove
    </Button>
  </>
);

const renderAvailableActions: NonNullable<ClassFeatureCardProps['renderActions']> = () => (
  <>
    <Button size="sm" variant="primary">
      Choose
    </Button>
  </>
);

/* -------------------------------------------------------------------------- */
/*  Stories                                                                  */
/* -------------------------------------------------------------------------- */

export const Default: Story = {
  args: {
    feature: rageFeature,
    density: 'default',
  },
};

export const Compact: Story = {
  args: {
    feature: rageFeature,
    density: 'compact',
  },
};

export const WithACFormula: Story = {
  args: {
    feature: monkUnarmoredDefense,
    density: 'default',
  },
};

export const WithResource: Story = {
  args: {
    feature: rageFeature,
    density: 'default',
  },
};

export const WithScalingResource: Story = {
  args: {
    feature: sorceryPointsFeature,
    density: 'default',
  },
};

export const NoResource: Story = {
  args: {
    feature: unarmoredDefenseFeature,
    density: 'default',
  },
};

export const DescriptionCollapsed: Story = {
  args: {
    feature: rageFeature,
    density: 'default',
    showDescription: false,
  },
};

export const ClickableWithGlow: Story = {
  args: {
    feature: fightingStyleFeature,
    density: 'default',
    onClick: () => undefined,
    glow: true,
    surfaceVariant: 'tint',
    renderActions: renderAvailableActions,
  },
};

export const ChosenFeature: Story = {
  args: {
    feature: rageFeature,
    density: 'default',
    surfaceVariant: 'selected',
    glow: true,
    renderActions: renderChosenActions,
  },
};

export const MultipleFeatures: Story = {
  args: {
    feature: rageFeature,
    density: 'compact',
    showDescription: false,
  },
  render: (args) => {
    const features: Feature[] = [
      rageFeature,
      unarmoredDefenseFeature,
      monkUnarmoredDefense,
      sorceryPointsFeature,
      fightingStyleFeature,
    ];
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {features.map((feat) => (
          <ClassFeatureCard key={feat.name} {...args} feature={feat} />
        ))}
      </div>
    );
  },
};
