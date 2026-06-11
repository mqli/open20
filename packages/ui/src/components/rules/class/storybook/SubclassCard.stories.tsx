import type { Meta, StoryObj } from '@storybook/react';
import type { Subclass, Feature, FeatureGeneric } from 'open20-core';
import { Badge } from '@/components/base/Badge';
import { Button } from '@/components/base/Button';
import { surfaceVariants } from '@/styles/design-tokens';
import { SubclassCard, type SubclassCardProps } from '../SubclassCard';

const surfaceVariantOptions = Object.keys(surfaceVariants) as Array<
  NonNullable<SubclassCardProps['surfaceVariant']>
>;

const meta: Meta<typeof SubclassCard> = {
  title: 'rules/SubclassCard',
  component: SubclassCard,
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
type Story = StoryObj<typeof SubclassCard>;

/* -------------------------------------------------------------------------- */
/*  Sample Subclasses                                                         */
/* -------------------------------------------------------------------------- */

const evasionFeature: Feature = {
  name: 'Evasion',
  description:
    'When you are subjected to an effect that allows you to make a Dexterity saving throw to take only half damage, you instead take no damage if you succeed on the saving throw.',
  level: 7,
} as FeatureGeneric;

const superiorityFeature: Feature = {
  name: 'Superiority',
  description: 'You have learned to perform special combat maneuvers.',
  level: 3,
} as FeatureGeneric;

const battleMasterSubclass: Subclass = {
  id: 'battle-master',
  parentClass: 'fighter',
  grantedAtLevel: 3,
  featuresByLevel: [
    {
      level: 3,
      features: [superiorityFeature],
    },
    {
      level: 7,
      features: [evasionFeature],
    },
  ],
  source: '2024 PHB',
};

const lifeDomainFeature: Feature = {
  name: 'Domain Spells',
  description: 'You always have certain spells prepared.',
  level: 1,
} as FeatureGeneric;

const lifeDomainSubclass: Subclass = {
  id: 'life-domain',
  parentClass: 'cleric',
  grantedAtLevel: 1,
  featuresByLevel: [
    {
      level: 1,
      features: [lifeDomainFeature],
    },
  ],
  alwaysPreparedSpells: [
    { level: 1, spells: ['Guidance', 'Spare the Dying', 'Bless', 'Cure Wounds'] },
    { level: 3, spells: ['Lesser Restoration', 'Spiritual Weapon'] },
  ],
  source: '2024 PHB',
};

const evocationFeature: Feature = {
  name: 'Evocation Savant',
  description: 'You have advantage on saving throws against evocation spells.',
  level: 2,
} as FeatureGeneric;

const evocationSubclass: Subclass = {
  id: 'evocation',
  parentClass: 'wizard',
  grantedAtLevel: 2,
  featuresByLevel: [
    {
      level: 2,
      features: [evocationFeature],
    },
  ],
  source: '2024 PHB',
};

/* -------------------------------------------------------------------------- */
/*  Render helpers                                                           */
/* -------------------------------------------------------------------------- */

const renderChosenActions: NonNullable<SubclassCardProps['renderActions']> = () => (
  <>
    <Button size="sm" variant="ghost">
      Remove
    </Button>
  </>
);

const renderAvailableActions: NonNullable<SubclassCardProps['renderActions']> = () => (
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
    subclass: battleMasterSubclass,
    density: 'default',
  },
};

export const WithAlwaysPreparedSpells: Story = {
  args: {
    subclass: lifeDomainSubclass,
    density: 'default',
  },
};

export const WizardSubclass: Story = {
  args: {
    subclass: evocationSubclass,
    density: 'default',
  },
};

export const Compact: Story = {
  args: {
    subclass: battleMasterSubclass,
    density: 'compact',
  },
};

export const DescriptionCollapsed: Story = {
  args: {
    subclass: lifeDomainSubclass,
    density: 'default',
    showDescription: false,
  },
};

export const ClickableWithGlow: Story = {
  args: {
    subclass: battleMasterSubclass,
    density: 'default',
    onClick: () => undefined,
    glow: true,
    surfaceVariant: 'tint',
    renderActions: renderAvailableActions,
  },
};

export const ChosenSubclass: Story = {
  args: {
    subclass: lifeDomainSubclass,
    density: 'default',
    surfaceVariant: 'selected',
    glow: true,
    renderActions: renderChosenActions,
  },
};

export const AllSubclasses: Story = {
  args: {
    subclass: battleMasterSubclass,
    density: 'compact',
    showDescription: false,
  },
  render: (args) => {
    const subclasses: Subclass[] = [battleMasterSubclass, lifeDomainSubclass, evocationSubclass];
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {subclasses.map((subclass) => (
          <SubclassCard key={subclass.id} {...args} subclass={subclass} />
        ))}
      </div>
    );
  },
};

export const SurfaceVariantsPreview: Story = {
  args: {
    subclass: battleMasterSubclass,
    density: 'compact',
    showDescription: false,
  },
  render: (args) => (
    <div className="grid gap-3 md:grid-cols-2">
      {surfaceVariantOptions.map((variant) => (
        <SubclassCard
          key={variant}
          {...args}
          subclass={{ ...args.subclass, id: `${args.subclass.id}-${variant}` }}
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
