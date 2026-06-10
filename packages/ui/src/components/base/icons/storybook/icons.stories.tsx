import type { Meta, StoryObj } from '@storybook/react';
import type { ComponentType } from 'react';
import type { IconSize } from '../../icons';
import { iconSizeClasses } from '../../icons';
import {
  PrepareSpellIcon,
  KnownSpellIcon,
  RitualIcon,
  SpellSlotIcon,
  MagicIcon,
  AttackIcon,
  HealIcon,
  DefenseIcon,
  RangeIcon,
  DamageIcon,
  VerbalIcon,
  SomaticIcon,
  MaterialIcon,
  ConcentrationIcon,
  getDamageTypeIcon,
} from '../../icons';

const meta = {
  title: 'Components/Icons',
  component: MagicIcon,
  args: {
    size: 'md' as IconSize,
  },
  argTypes: {
    size: {
      control: 'select',
      options: Object.keys(iconSizeClasses),
    },
  },
} satisfies Meta<typeof MagicIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Playground ───────────────────────────────────────────────────

export const Playground: Story = {
  args: {
    size: 'xl',
    className: 'text-primary',
  },
};

// ── Icon Sizes ───────────────────────────────────────────────────

export const IconSizes: Story = {
  render: (args) => (
    <SizeGrid
      items={[
        { Icon: PrepareSpellIcon, label: 'PrepareSpellIcon' },
        { Icon: MagicIcon, label: 'MagicIcon' },
        { Icon: AttackIcon, label: 'AttackIcon' },
      ]}
      {...args}
    />
  ),
};

// ── Spell Domain ─────────────────────────────────────────────────

export const SpellDomain: Story = {
  render: (args) => (
    <IconGrid
      items={[
        { Icon: PrepareSpellIcon, label: 'PrepareSpellIcon' },
        { Icon: KnownSpellIcon, label: 'KnownSpellIcon' },
        { Icon: ConcentrationIcon, label: 'ConcentrationIcon' },
        { Icon: RitualIcon, label: 'RitualIcon' },
        { Icon: SpellSlotIcon, label: 'SpellSlotIcon' },
        { Icon: MagicIcon, label: 'MagicIcon' },
      ]}
      {...args}
    />
  ),
};

// ── Combat Domain ────────────────────────────────────────────────

export const CombatDomain: Story = {
  render: (args) => (
    <IconGrid
      items={[
        { Icon: AttackIcon, label: 'AttackIcon' },
        { Icon: HealIcon, label: 'HealIcon' },
        { Icon: DefenseIcon, label: 'DefenseIcon' },
        { Icon: RangeIcon, label: 'RangeIcon' },
        { Icon: DamageIcon, label: 'DamageIcon' },
      ]}
      {...args}
    />
  ),
};

// ── Damage Type Icons ─────────────────────────────────────────

const damageTypes = [
  'Fire',
  'Cold',
  'Lightning',
  'Thunder',
  'Acid',
  'Poison',
  'Psychic',
  'Force',
  'Necrotic',
  'Radiant',
  'Bludgeoning',
  'Piercing',
  'Slashing',
] as const;

export const DamageTypeIcons: Story = {
  render: (args) => {
    const items = damageTypes.map((type) => {
      const Icon = getDamageTypeIcon(type) as unknown as IconComponent;
      return { Icon, label: type };
    });
    return <IconGrid items={items} {...args} />;
  },
};

// ── Spell Components ─────────────────────────────────────────────

export const SpellComponents: Story = {
  render: (args) => (
    <IconGrid
      items={[
        { Icon: VerbalIcon, label: 'VerbalIcon' },
        { Icon: SomaticIcon, label: 'SomaticIcon' },
        { Icon: MaterialIcon, label: 'MaterialIcon' },
      ]}
      {...args}
    />
  ),
};

// ── Concentration ────────────────────────────────────────────────

export const Concentration: Story = {
  render: (args) => (
    <IconGrid items={[{ Icon: ConcentrationIcon, label: 'ConcentrationIcon' }]} {...args} />
  ),
};

// ── All Icons ────────────────────────────────────────────────────

export const AllIcons: Story = {
  render: (args) => {
    const damageTypeItems = damageTypes.map((type) => {
      const Icon = getDamageTypeIcon(type) as unknown as IconComponent;
      return { Icon, label: `Damage: ${type}` };
    });

    return (
      <IconGrid
        items={[
          { Icon: PrepareSpellIcon, label: 'PrepareSpellIcon' },
          { Icon: KnownSpellIcon, label: 'KnownSpellIcon' },
          { Icon: ConcentrationIcon, label: 'ConcentrationIcon' },
          { Icon: RitualIcon, label: 'RitualIcon' },
          { Icon: SpellSlotIcon, label: 'SpellSlotIcon' },
          { Icon: MagicIcon, label: 'MagicIcon' },
          { Icon: AttackIcon, label: 'AttackIcon' },
          { Icon: HealIcon, label: 'HealIcon' },
          { Icon: DefenseIcon, label: 'DefenseIcon' },
          { Icon: RangeIcon, label: 'RangeIcon' },
          { Icon: DamageIcon, label: 'DamageIcon' },
          { Icon: VerbalIcon, label: 'VerbalIcon' },
          { Icon: SomaticIcon, label: 'SomaticIcon' },
          { Icon: MaterialIcon, label: 'MaterialIcon' },
          ...damageTypeItems,
        ]}
        {...args}
      />
    );
  },
};

// ── Helpers ──────────────────────────────────────────────────────

type IconComponent = ComponentType<{ size?: IconSize; className?: string }>;

function IconGrid({
  items,
  size,
}: {
  items: { Icon: IconComponent; label: string }[];
  size?: IconSize;
}) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-6 p-4">
      {items.map(({ Icon, label }) => (
        <div
          key={label}
          className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border"
        >
          <Icon size={size} />
          <span className="text-xs text-text-tertiary font-mono">{label}</span>
        </div>
      ))}
    </div>
  );
}

function SizeGrid({ items }: { items: { Icon: IconComponent; label: string }[] }) {
  const sizes = Object.keys(iconSizeClasses) as IconSize[];

  return (
    <table className="border-collapse text-[13px]">
      <thead>
        <tr>
          <th className="px-3.5 py-2 border-b border-border text-center font-semibold">Icon</th>
          {sizes.map((s) => (
            <th key={s} className="px-3.5 py-2 border-b border-border text-center font-semibold">
              {s}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map(({ Icon, label }) => (
          <tr key={label}>
            <td className="px-3.5 py-2 border-b border-border text-center align-middle">{label}</td>
            {sizes.map((s) => (
              <td key={s} className="px-3.5 py-2 border-b border-border text-center align-middle">
                <Icon size={s} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
