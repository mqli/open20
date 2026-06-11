import type { Meta, StoryObj } from '@storybook/react';
import type { Class, Spellcasting, Feature, FeatureGeneric } from 'open20-core';
import { Badge } from '@/components/base/Badge';
import { Button } from '@/components/base/Button';
import { surfaceVariants } from '@/styles/design-tokens';
import { ClassCard, type ClassCardProps } from '../ClassCard';

const surfaceVariantOptions = Object.keys(surfaceVariants) as Array<
  NonNullable<ClassCardProps['surfaceVariant']>
>;

const meta: Meta<typeof ClassCard> = {
  title: 'rules/ClassCard',
  component: ClassCard,
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
    onClick: { action: 'clicked' },
    renderActions: { control: false },
  },
};
export default meta;
type Story = StoryObj<typeof ClassCard>;

/* -------------------------------------------------------------------------- */
/*  Sample Classes                                                            */
/* -------------------------------------------------------------------------- */

const wizardSpellcasting: Spellcasting = {
  ability: 'Intelligence',
  knownSource: 'spellbook',
  preparationTiming: 'long_rest',
  changesPerPreparation: 'all',
};

const fighterFeatures: Feature[] = [
  {
    name: 'Fighting Style',
    description: 'You adopt a particular style of fighting as your specialty.',
    level: 1,
  } as FeatureGeneric,
  {
    name: 'Second Wind',
    description:
      'You have a limited well of stamina that you can draw on to protect yourself from harm.',
    level: 1,
  } as FeatureGeneric,
];

const wizardFeatures: Feature[] = [
  {
    name: 'Arcane Recovery',
    description:
      'You have learned to regain some of your magical energy by studying your spellbook.',
    level: 1,
  } as FeatureGeneric,
  {
    name: 'Spellcasting',
    description:
      'As a student of arcane magic, you have a spellbook containing spells you have learned.',
    level: 1,
  } as FeatureGeneric,
];

const fighterClass: Class = {
  id: 'fighter',
  name: 'Fighter',
  source: '2024 PHB',
  hitDie: 'd10',
  savingThrowProficiencies: ['Strength', 'Constitution'],
  armorTraining: ['Light', 'Medium', 'Heavy', 'Shields'],
  weaponProficiencies: ['Simple', 'Martial'],
  weaponMastery: true,
  featuresByLevel: [
    {
      level: 1,
      features: fighterFeatures,
    },
    {
      level: 2,
      features: [
        {
          name: 'Action Surge',
          description: 'You can push yourself beyond your normal limits for a moment.',
          level: 2,
        } as FeatureGeneric,
      ],
    },
  ],
  spellcasting: null,
};

const wizardClass: Class = {
  id: 'wizard',
  name: 'Wizard',
  source: '2024 PHB',
  hitDie: 'd6',
  savingThrowProficiencies: ['Intelligence', 'Wisdom'],
  armorTraining: [],
  weaponProficiencies: ['Dagger', 'Dart', 'Sling', 'Quarterstaff', 'Light Crossbow'],
  weaponMastery: false,
  featuresByLevel: [
    {
      level: 1,
      preparedSpells: 2,
      cantripsKnown: 3,
      features: wizardFeatures,
    },
    {
      level: 2,
      preparedSpells: 3,
      cantripsKnown: 3,
      features: [
        {
          name: 'Channel Divinity',
          description: 'You can channel divine energy to fuel magical effects.',
          level: 2,
        } as FeatureGeneric,
      ],
    },
  ],
  spellcasting: wizardSpellcasting,
  spellSlotsByLevel: {
    1: [2, 0, 0, 0, 0, 0, 0, 0, 0],
    2: [3, 0, 0, 0, 0, 0, 0, 0, 0],
    3: [4, 2, 0, 0, 0, 0, 0, 0, 0],
  },
};

const clericSpellcasting: Spellcasting = {
  ability: 'Wisdom',
  knownSource: 'class_list',
  preparationTiming: 'long_rest',
  changesPerPreparation: 'all',
};

const clericClass: Class = {
  id: 'cleric',
  name: 'Cleric',
  source: '2024 PHB',
  hitDie: 'd8',
  savingThrowProficiencies: ['Wisdom', 'Charisma'],
  armorTraining: ['Light', 'Medium', 'Shields'],
  weaponProficiencies: ['Simple'],
  weaponMastery: true,
  featuresByLevel: [
    {
      level: 1,
      preparedSpells: 2,
      cantripsKnown: 3,
      features: [
        {
          name: 'Spellcasting',
          description: 'As a conduit for divine power, you can cast cleric spells.',
          level: 1,
        } as FeatureGeneric,
        {
          name: 'Blessing of the Trickster',
          description: 'You can bestow a blessing on a creature you touch.',
          level: 1,
        } as FeatureGeneric,
      ],
    },
  ],
  spellcasting: clericSpellcasting,
  spellSlotsByLevel: {
    1: [2, 0, 0, 0, 0, 0, 0, 0, 0],
    2: [3, 0, 0, 0, 0, 0, 0, 0, 0],
  },
};

/* -------------------------------------------------------------------------- */
/*  Render helpers                                                           */
/* -------------------------------------------------------------------------- */

const renderChosenActions: NonNullable<ClassCardProps['renderActions']> = () => (
  <>
    <Button size="sm" variant="ghost">
      Remove
    </Button>
  </>
);

const renderAvailableActions: NonNullable<ClassCardProps['renderActions']> = () => (
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
    classData: fighterClass,
    density: 'default',
  },
};

export const WizardWithSpellcasting: Story = {
  args: {
    classData: wizardClass,
    density: 'default',
  },
};

export const ClericWithSpells: Story = {
  args: {
    classData: clericClass,
    density: 'default',
  },
};

export const Compact: Story = {
  args: {
    classData: fighterClass,
    density: 'compact',
  },
};

export const DescriptionCollapsed: Story = {
  args: {
    classData: wizardClass,
    density: 'default',
    showDescription: false,
  },
};

export const ClickableWithGlow: Story = {
  args: {
    classData: fighterClass,
    density: 'default',
    onClick: () => undefined,
    glow: true,
    surfaceVariant: 'tint',
    renderActions: renderAvailableActions,
  },
};

export const ChosenClass: Story = {
  args: {
    classData: wizardClass,
    density: 'default',
    surfaceVariant: 'selected',
    glow: true,
    renderActions: renderChosenActions,
  },
};

export const AllHitDieTypes: Story = {
  args: {
    classData: fighterClass,
    density: 'compact',
    showDescription: false,
  },
  render: (args) => {
    const classes: Class[] = [
      { ...fighterClass, id: 'fighter-d10', name: 'Fighter', hitDie: 'd10' },
      { ...wizardClass, id: 'wizard-d6', name: 'Wizard', hitDie: 'd6' },
      { ...clericClass, id: 'cleric-d8', name: 'Cleric', hitDie: 'd8' },
    ];
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {classes.map((classData) => (
          <ClassCard key={classData.id} {...args} classData={classData} />
        ))}
      </div>
    );
  },
};

export const SurfaceVariantsPreview: Story = {
  args: {
    classData: fighterClass,
    density: 'compact',
    showDescription: false,
  },
  render: (args) => (
    <div className="grid gap-3 md:grid-cols-2">
      {surfaceVariantOptions.map((variant) => (
        <ClassCard
          key={variant}
          {...args}
          classData={{ ...args.classData, id: `${args.classData.id}-${variant}` }}
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
