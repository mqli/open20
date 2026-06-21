import type { Meta, StoryObj } from '@storybook/react';
import type { Weapon, Armor, Gear } from 'open20-core';
import { Badge } from '@/components/base/Badge';
import { Button } from '@/components/base/Button';
import { surfaceVariants } from '@/styles/design-tokens';
import { EquipmentCard, type EquipmentCardProps } from '../EquipmentCard';

const surfaceVariantOptions = Object.keys(surfaceVariants) as Array<
  NonNullable<EquipmentCardProps['surfaceVariant']>
>;

const meta: Meta<typeof EquipmentCard> = {
  title: 'Rules/EquipmentCard',
  component: EquipmentCard,
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
    onClick: { action: 'clicked' },
    renderActions: { control: false },
  },
};
export default meta;
type Story = StoryObj<typeof EquipmentCard>;

/* -------------------------------------------------------------------------- */
/*  Sample Weapons (2024 PHB)                                               */
/* -------------------------------------------------------------------------- */

const longsword: Weapon = {
  id: 'longsword',
  name: 'Longsword',
  type: 'weapon',
  source: '2024 PHB',
  weight: 3,
  cost: { quantity: 15, unit: 'gp' },
  equipped: false,
  quantity: 1,
  category: 'Martial',
  damage: {
    entries: [{ dice: '1d8', type: 'Slashing' }],
    ability: 'Strength',
    bonus: 0,
  },
  properties: ['Versatile'],
  versatileDamage: '1d10',
};

const shortsword: Weapon = {
  id: 'shortsword',
  name: 'Shortsword',
  type: 'weapon',
  source: '2024 PHB',
  weight: 2,
  cost: { quantity: 10, unit: 'gp' },
  equipped: true,
  quantity: 1,
  category: 'Martial',
  damage: {
    entries: [{ dice: '1d6', type: 'Piercing' }],
    ability: 'Strength',
    bonus: 0,
  },
  properties: ['Finesse', 'Light'],
};

const longbow: Weapon = {
  id: 'longbow',
  name: 'Longbow',
  type: 'weapon',
  source: '2024 PHB',
  weight: 2,
  cost: { quantity: 50, unit: 'gp' },
  equipped: false,
  quantity: 1,
  category: 'Martial',
  damage: {
    entries: [{ dice: '1d8', type: 'Piercing' }],
    ability: 'Dexterity',
    bonus: 0,
  },
  properties: ['Ammunition', 'Heavy', 'Range', 'Two-Handed'],
  range: { normal: 150, maximum: 600 },
};

const dagger: Weapon = {
  id: 'dagger',
  name: 'Dagger',
  type: 'weapon',
  source: '2024 PHB',
  weight: 1,
  cost: { quantity: 2, unit: 'gp' },
  equipped: false,
  quantity: 3,
  category: 'Simple',
  damage: {
    entries: [{ dice: '1d4', type: 'Piercing' }],
    ability: 'Strength',
    bonus: 0,
  },
  properties: ['Finesse', 'Light', 'Range', 'Thrown'],
  range: { normal: 20, maximum: 60 },
};

const javelin: Weapon = {
  id: 'javelin',
  name: 'Javelin',
  type: 'weapon',
  source: '2024 PHB',
  weight: 2,
  cost: { quantity: 5, unit: 'sp' },
  equipped: false,
  quantity: 5,
  category: 'Simple',
  damage: {
    entries: [{ dice: '1d6', type: 'Piercing' }],
    ability: 'Strength',
    bonus: 0,
  },
  properties: ['Range', 'Thrown'],
  range: { normal: 30, maximum: 120 },
};

const battleaxe: Weapon = {
  id: 'battleaxe',
  name: 'Battleaxe',
  type: 'weapon',
  source: '2024 PHB',
  weight: 4,
  cost: { quantity: 10, unit: 'gp' },
  equipped: false,
  quantity: 1,
  category: 'Martial',
  damage: {
    entries: [{ dice: '1d8', type: 'Slashing' }],
    ability: 'Strength',
    bonus: 0,
  },
  properties: ['Versatile'],
  versatileDamage: '1d10',
  mastery: ['Cleave'],
};

/* -------------------------------------------------------------------------- */
/*  Sample Armor (2024 PHB)                                                 */
/* -------------------------------------------------------------------------- */

const leatherArmor: Armor = {
  id: 'leather-armor',
  name: 'Leather Armor',
  source: '2024 PHB',
  type: 'armor',
  weight: 10,
  cost: { quantity: 10, unit: 'gp' },
  category: 'Light',
  ac: 11,
  dexBonus: true,
  equipped: false,
};

const chainShirt: Armor = {
  id: 'chain-shirt',
  name: 'Chain Shirt',
  source: '2024 PHB',
  type: 'armor',
  weight: 20,
  cost: { quantity: 50, unit: 'gp' },
  category: 'Medium',
  ac: 13,
  dexBonus: true,
  maxDexBonus: 2,
  equipped: false,
};

const plateArmor: Armor = {
  id: 'plate-armor',
  name: 'Plate Armor',
  source: '2024 PHB',
  type: 'armor',
  weight: 65,
  cost: { quantity: 1500, unit: 'gp' },
  category: 'Heavy',
  ac: 18,
  dexBonus: false,
  strengthRequirement: 15,
  stealthDisadvantage: true,
  equipped: false,
};

const shield: Armor = {
  id: 'shield',
  name: 'Shield',
  source: '2024 PHB',
  type: 'armor',
  weight: 6,
  cost: { quantity: 10, unit: 'gp' },
  category: 'Shield',
  ac: 2,
  dexBonus: false,
  equipped: false,
};

/* -------------------------------------------------------------------------- */
/*  Sample Gear                                                               */
/* -------------------------------------------------------------------------- */

const backpack: Gear = {
  id: 'backpack',
  name: 'Backpack',
  type: 'gears',
  weight: 5,
  cost: { quantity: 2, unit: 'gp' },
  equipped: false,
  quantity: 1,
};

const healingPotion: Gear = {
  id: 'healing-potion',
  name: 'Potion of Healing',
  type: 'consumable',
  weight: 0.5,
  cost: { quantity: 50, unit: 'gp' },
  equipped: false,
  quantity: 3,
};

/* -------------------------------------------------------------------------- */
/*  Render helpers                                                           */
/* -------------------------------------------------------------------------- */

const renderEquippedActions: NonNullable<EquipmentCardProps['renderActions']> = () => (
  <>
    <Button size="sm" variant="ghost">
      Unequip
    </Button>
    <Button size="sm" variant="ghost">
      Remove
    </Button>
  </>
);

const renderAvailableActions: NonNullable<EquipmentCardProps['renderActions']> = () => (
  <Button size="sm" variant="primary">
    Equip
  </Button>
);

/* -------------------------------------------------------------------------- */
/*  Stories                                                                  */
/* -------------------------------------------------------------------------- */

export const Default: Story = {
  args: {
    equipment: longsword,
    density: 'default',
  },
};

export const EquippedWeapon: Story = {
  args: {
    equipment: shortsword,
    density: 'default',
    surfaceVariant: 'selected',
    renderActions: renderEquippedActions,
  },
};

export const RangedWeapon: Story = {
  args: {
    equipment: longbow,
    density: 'default',
  },
};

export const SimpleWeapon: Story = {
  args: {
    equipment: dagger,
    density: 'default',
  },
};

export const ThrownWeapon: Story = {
  args: {
    equipment: javelin,
    density: 'default',
  },
};

export const WeaponWithMastery: Story = {
  args: {
    equipment: battleaxe,
    density: 'default',
  },
};

export const LightArmor: Story = {
  args: {
    equipment: leatherArmor,
    density: 'default',
  },
};

export const MediumArmor: Story = {
  args: {
    equipment: chainShirt,
    density: 'default',
  },
};

export const HeavyArmor: Story = {
  args: {
    equipment: plateArmor,
    density: 'default',
  },
};

export const ShieldEquipped: Story = {
  args: {
    equipment: shield,
    density: 'default',
    surfaceVariant: 'selected',
    renderActions: renderEquippedActions,
  },
};

export const GearItem: Story = {
  args: {
    equipment: backpack,
    density: 'default',
  },
};

export const ConsumableItem: Story = {
  args: {
    equipment: healingPotion,
    density: 'default',
    renderActions: renderAvailableActions,
  },
};

export const Compact: Story = {
  args: {
    equipment: longsword,
    density: 'compact',
  },
};

export const AllWeapons: Story = {
  args: {
    equipment: longsword,
    density: 'compact',
  },
  render: (args) => {
    const weapons: Weapon[] = [longsword, shortsword, longbow, dagger, javelin, battleaxe];
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {weapons.map((weapon) => (
          <EquipmentCard key={weapon.id} {...args} equipment={weapon} />
        ))}
      </div>
    );
  },
};

export const AllArmor: Story = {
  args: {
    equipment: leatherArmor,
    density: 'compact',
  },
  render: (args) => {
    const armors: Armor[] = [leatherArmor, chainShirt, plateArmor, shield];
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {armors.map((armor) => (
          <EquipmentCard key={armor.id} {...args} equipment={armor} />
        ))}
      </div>
    );
  },
};

export const SurfaceVariantsPreview: Story = {
  args: {
    equipment: longsword,
    density: 'compact',
  },
  render: (args) => (
    <div className="grid gap-3 md:grid-cols-2">
      {surfaceVariantOptions.map((variant) => (
        <EquipmentCard
          key={variant}
          {...args}
          equipment={{ ...args.equipment, id: `${args.equipment.id}-${variant}` }}
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
