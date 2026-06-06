import type { Meta, StoryObj } from '@storybook/react';
import type { Spell } from 'open20-core';
import { Badge } from '@/components/base/Badge';
import { Button } from '@/components/base/Button';
import { surfaceVariants } from '@/styles/design-tokens';
import { SpellCard, type SpellCardProps } from '../SpellCard';

const surfaceVariantOptions = Object.keys(surfaceVariants) as Array<
  NonNullable<SpellCardProps['surfaceVariant']>
>;

const meta: Meta<typeof SpellCard> = {
  title: 'Spell/SpellCard',
  component: SpellCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
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
    renderBadges: { control: false },
    renderDescription: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof SpellCard>;

/** A sample Lvl 3 evocation spell */
const fireballSpell: Spell = {
  id: 'fireball',
  name: 'Fireball',
  level: 3 as const,
  school: 'Evocation' as const,
  castingTime: 'Action' as const,
  range: '150 feet',
  components: ['V', 'S', 'M'] as const,
  duration: 'Instantaneous',
  concentration: false,
  ritual: false,
  description: [
    'A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame.',
    'Each creature in a 20-foot-radius sphere centered on that point must make a Dexterity saving throw. A target takes 8d6 fire damage on a failed save, or half as much damage on a successful one.',
    "The fire spreads around corners. It ignites flammable objects in the area that aren't being worn or carried.",
  ],
  damage: {
    entries: [{ dice: '8d6', type: 'Fire' }],
    perSlot: [{ dice: '1d6', type: 'Fire' }],
  },
  save: 'Dexterity',
  source: 'SRD 5.2',
  usingAHigherLevelSpellSlot: [
    'When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6 for each slot level above 3rd.',
  ],
};

/** A cantrip */
const eldritchBlastSpell: Spell = {
  id: 'eldritch-blast',
  name: 'Eldritch Blast',
  level: 0 as const,
  school: 'Evocation' as const,
  castingTime: 'Action' as const,
  range: '120 feet',
  components: ['V', 'S'] as const,
  duration: 'Instantaneous',
  concentration: false,
  ritual: false,
  description: [
    'A beam of crackling energy streaks toward a creature within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 force damage.',
  ],
  damage: {
    entries: [{ dice: '1d10', type: 'Force' }],
  },
  attack: true,
  source: 'SRD 5.2',
  cantripUpgrade: [
    { atCharacterLevel: 5, damage: [{ dice: '2 beams', type: 'Force' }] },
    { atCharacterLevel: 11, damage: [{ dice: '3 beams', type: 'Force' }] },
    { atCharacterLevel: 17, damage: [{ dice: '4 beams', type: 'Force' }] },
  ],
  cantripUpgradeText: 'The spell creates more than one beam when you reach higher levels.',
};

/** A ritual & concentration spell */
const detectMagicSpell: Spell = {
  id: 'detect-magic',
  name: 'Detect Magic',
  level: 1 as const,
  school: 'Divination' as const,
  castingTime: 'Action' as const,
  range: 'Self',
  components: ['V', 'S'] as const,
  duration: 'Up to 10 minutes',
  concentration: true,
  ritual: true,
  description: [
    'For the duration, you sense the presence of magic within 30 feet of you. If you sense magic in this way, you can use your action to see a faint aura around any visible creature or object in the area that bears magic, and you learn its school of magic, if any.',
    'The spell can penetrate most barriers, but it is blocked by 1 foot of stone, 1 inch of common metal, a thin sheet of lead, or 3 feet of wood or dirt.',
  ],
  source: 'SRD 5.2',
};

/** A healing spell */
const cureWoundsSpell: Spell = {
  id: 'cure-wounds',
  name: 'Cure Wounds',
  level: 1 as const,
  school: 'Evocation' as const,
  castingTime: 'Action' as const,
  range: 'Touch',
  components: ['V', 'S'] as const,
  duration: 'Instantaneous',
  concentration: false,
  ritual: false,
  description: [
    'A creature you touch regains a number of hit points equal to 1d8 + your spellcasting ability modifier. This spell has no effect on undead or constructs.',
  ],
  heal: {
    dice: '1d8 + mod',
  },
  source: 'SRD 5.2',
  usingAHigherLevelSpellSlot: [
    'When you cast this spell using a spell slot of 2nd level or higher, the healing increases by 1d8 for each slot level above 1st.',
  ],
};

const renderPreparedBadges: NonNullable<SpellCardProps['renderBadges']> = () => (
  <>
    <Badge variant="success" size="sm">
      Prepared
    </Badge>
    <Badge variant="info" size="sm">
      Known
    </Badge>
  </>
);

const renderKnownActions: NonNullable<SpellCardProps['renderActions']> = () => (
  <>
    <Button size="sm" variant="secondary">
      Cast
    </Button>
    <Button size="sm" variant="ghost">
      Details
    </Button>
  </>
);

const renderHighlightedDescription: NonNullable<SpellCardProps['renderDescription']> = (
  paragraph: string,
) => {
  if (paragraph.includes('saving throw')) {
    return <strong>{paragraph}</strong>;
  }
  return paragraph;
};

export const Default: Story = {
  args: {
    spell: fireballSpell,
  },
};

export const Compact: Story = {
  args: {
    spell: fireballSpell,
  },
};

export const Cantrip: Story = {
  args: {
    spell: eldritchBlastSpell,
  },
};

export const ConcentrationRitual: Story = {
  args: {
    spell: detectMagicSpell,
  },
};

export const Healing: Story = {
  args: {
    spell: cureWoundsSpell,
  },
};

export const DescriptionCollapsed: Story = {
  args: {
    spell: fireballSpell,
    showDescription: false,
  },
};

export const ClickableWithSlots: Story = {
  args: {
    spell: fireballSpell,
    onClick: () => undefined,
    glow: true,
    surfaceVariant: 'tint',
    renderBadges: renderPreparedBadges,
    renderActions: renderKnownActions,
  },
};

export const CustomDescription: Story = {
  args: {
    spell: fireballSpell,
    renderDescription: renderHighlightedDescription,
  },
};

export const SurfaceVariantsPreview: Story = {
  args: {
    spell: fireballSpell,
    showDescription: false,
  },
  render: (args) => (
    <div className="grid gap-3 md:grid-cols-2">
      {surfaceVariantOptions.map((variant) => (
        <SpellCard
          key={variant}
          {...args}
          spell={{ ...args.spell, id: `${args.spell.id}-${variant}` }}
          surfaceVariant={variant}
          renderBadges={() => (
            <Badge variant="secondary" size="sm">
              {variant}
            </Badge>
          )}
        />
      ))}
    </div>
  ),
};
