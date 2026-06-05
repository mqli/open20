import type { Meta, StoryObj } from '@storybook/react';
import type { Feat } from 'open20-core';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { surfaceVariants } from '@/styles/design-tokens';
import { FeatCard, type FeatCardProps } from '../FeatCard';

const surfaceVariantOptions = Object.keys(surfaceVariants) as Array<
  NonNullable<FeatCardProps['surfaceVariant']>
>;

const meta: Meta<typeof FeatCard> = {
  title: 'Feat/FeatCard',
  component: FeatCard,
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
    glow: {
      control: 'boolean',
    },
    showDescription: {
      control: 'boolean',
    },
    showPrerequisites: {
      control: 'boolean',
    },
    onClick: { action: 'clicked' },
    renderActions: { control: false },
  },
};
export default meta;
type Story = StoryObj<typeof FeatCard>;

/* -------------------------------------------------------------------------- */
/*  Sample Feats (2024 PHB)                                                 */
/* -------------------------------------------------------------------------- */

const alertFeat: Feat = {
  id: 'alert',
  source: '2024 PHB',
  name: 'Alert',
  description:
    "You gain the following benefits.\n• Initiative Bonus. You gain a +5 bonus to Initiative.\n• Surprise Avoidance. You can't be surprised except when incapacitated.\n• Initiative Proficiency. You gain Proficiency in Initiative. If you already have it, you gain Proficiency in another skill of your choice.",
  category: 'Origin',
};

const grapplerFeat: Feat = {
  id: 'grappler',
  source: '2024 PHB',
  name: 'Grappler',
  description:
    'You gain the following benefits.\n• Ability Score Increase. Increase your Strength or Dexterity score by 1, to a maximum of 20.\n• Punch and Grab. When you hit a creature with an Unarmed Strike, you can deal Damage equal to your Proficiency Bonus, and you can grapple the target if it is no more than one size larger than you.\n• Attack Advantage. You have Advantage on attack rolls against a creature you are grappling.',
  category: 'General',
  prerequisites: { ability: { Strength: 13 } },
};

const archeryFeat: Feat = {
  id: 'archery',
  source: '2014 PHB',
  name: 'Archery',
  description: 'You gain a +2 bonus to attack rolls you make with Ranged weapons.',
  category: 'Fighting Style',
  grants: [{ type: 'attackBonus', bonus: { ranged: 2 } }],
};

const epicBoonOfFateFeat: Feat = {
  id: 'epic-boon-of-fate',
  source: '2024 PHB',
  name: 'Epic Boon of Fate',
  description:
    'You gain the following benefits.\n• Boon of Fate. When another creature you can see within 60 feet of yourself makes a D20 Test, you can take a Reaction to roll 1d10 and add the number rolled to the total for that roll.',
  category: 'Epic Boon',
  prerequisites: { level: 19 },
  repeatable: false,
};

const skilledFeat: Feat = {
  id: 'skilled',
  source: '2014 PHB',
  name: 'Skilled',
  description: 'You gain Proficiency in any combination of three Skills or Tools of your choice.',
  category: 'General',
  grants: [
    {
      type: 'skillProficiencyChoice',
      choice: {
        options: [],
        count: 3,
      },
    },
  ],
};

const asiFeat: Feat = {
  id: 'ability-score-improvement',
  source: '2024 PHB',
  name: 'Ability Score Improvement',
  description:
    "You gain the following benefits.\n• Ability Score Increase. Increase one Ability Score of your choice by 2, or increase two Ability Scores of your choice by 1. These increases can't take an Ability Score above 20.",
  category: 'General',
  grants: [
    {
      type: 'abilityBonusChoice',
      choice: {
        options: ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'],
        valuePerChoice: 2,
        count: 1,
      },
    },
  ],
};

const magicInitiateFeat: Feat = {
  id: 'magic-initiate',
  source: '2024 PHB',
  name: 'Magic Initiate',
  description:
    'You gain the following benefits.\n• Cantrips. You learn two cantrips of your choice from the Cleric, Druid, or Wizard spell list.\n• Level 1 Spell. Learn one Level 1 spell of your choice from the same list. You can cast this spell without a spell slot, and you must finish a Long Rest to cast it again.',
  category: 'General',
  prerequisites: { ability: { Intelligence: 13 } },
  grants: [
    {
      type: 'spellChoices',
      choices: [
        {
          id: 'cantrips',
          classOptions: ['cleric', 'druid', 'wizard'],
          spellLevel: 0,
          count: 2,
        },
        {
          id: 'level1Spell',
          classOptions: ['cleric', 'druid', 'wizard'],
          spellLevel: 1,
          count: 1,
          oncePerLongRest: true,
        },
      ],
    },
  ],
};

const savageAttackerFeat: Feat = {
  id: 'savage-attacker',
  source: '2014 PHB',
  name: 'Savage Attacker',
  description:
    "Once per turn when you roll Damage for a Melee weapon attack, you can reroll the weapon's Damage die and use either total.",
  category: 'General',
  grants: [{ type: 'specialAbilities', abilities: ['Savage Attacker'] }],
};

/* -------------------------------------------------------------------------- */
/*  Render helpers                                                           */
/* -------------------------------------------------------------------------- */

const renderChosenActions: NonNullable<FeatCardProps['renderActions']> = () => (
  <>
    <Button size="sm" variant="ghost">
      Remove
    </Button>
  </>
);

const renderAvailableActions: NonNullable<FeatCardProps['renderActions']> = () => (
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
    feat: alertFeat,
    density: 'default',
  },
};

export const Compact: Story = {
  args: {
    feat: alertFeat,
    density: 'compact',
  },
};

export const WithPrerequisites: Story = {
  args: {
    feat: grapplerFeat,
    density: 'default',
  },
};

export const FightingStyle: Story = {
  args: {
    feat: archeryFeat,
    density: 'default',
  },
};

export const EpicBoon: Story = {
  args: {
    feat: epicBoonOfFateFeat,
    density: 'default',
  },
};

export const WithChoices: Story = {
  args: {
    feat: skilledFeat,
    density: 'default',
  },
};

export const AbilityScoreImprovement: Story = {
  args: {
    feat: asiFeat,
    density: 'default',
  },
};

export const WithSpells: Story = {
  args: {
    feat: magicInitiateFeat,
    density: 'default',
  },
};

export const SpecialAbility: Story = {
  args: {
    feat: savageAttackerFeat,
    density: 'default',
  },
};

export const DescriptionCollapsed: Story = {
  args: {
    feat: alertFeat,
    density: 'default',
    showDescription: false,
  },
};

export const ClickableWithGlow: Story = {
  args: {
    feat: alertFeat,
    density: 'default',
    onClick: () => undefined,
    glow: true,
    surfaceVariant: 'tint',
    renderActions: renderAvailableActions,
  },
};

export const ChosenFeat: Story = {
  args: {
    feat: archeryFeat,
    density: 'default',
    surfaceVariant: 'selected',
    glow: true,
    renderActions: renderChosenActions,
  },
};

export const AllCategories: Story = {
  args: {
    feat: alertFeat,
    density: 'compact',
    showDescription: false,
  },
  render: (args) => {
    const feats: Feat[] = [alertFeat, grapplerFeat, archeryFeat, epicBoonOfFateFeat];
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {feats.map((feat) => (
          <FeatCard key={feat.id} {...args} feat={feat} />
        ))}
      </div>
    );
  },
};

export const SurfaceVariantsPreview: Story = {
  args: {
    feat: alertFeat,
    density: 'compact',
    showDescription: false,
    showPrerequisites: true,
  },
  render: (args) => (
    <div className="grid gap-3 md:grid-cols-2">
      {surfaceVariantOptions.map((variant) => (
        <FeatCard
          key={variant}
          {...args}
          feat={{ ...args.feat, id: `${args.feat.id}-${variant}` }}
          surfaceVariant={variant}
          renderActions={() => (
            <Badge variant="secondary" size="sm">
              {variant}
            </Badge>
          )}
        />
      ))}
    </div>
  ),
};
