import type { Weapon } from 'open20-core';

// ── Form data type ──────────────────────────────────────────────

export interface WeaponFormData {
  id: string;
  source: string;
  name: string;
  category: 'Simple' | 'Martial';
  damageDice: string;
  damageType: string;
  ability: string;
  bonus: number;
  properties: string[];
  mastery: string[];
  rangeNormal: number | '';
  rangeMaximum: number | '';
  versatileDamage: string;
  weight: number;
  cost: string;
  description: string;
}

// ── Component Props ─────────────────────────────────────────────

export interface WeaponEditorProps {
  value?: Partial<Weapon>;
  defaultValue?: Partial<Weapon>;
  onChange?: (weapon: Partial<Weapon>) => void;
  onSubmit?: (weapon: Weapon, intent?: 'stay' | 'new' | 'close') => void;
  onCancel?: () => void;
  disabled?: boolean;
  className?: string;
  renderActions?: (props: {
    onSave: (intent: 'stay' | 'new' | 'close') => void;
    isDirty: boolean;
    isValid: boolean;
    isSubmitting: boolean;
  }) => React.ReactNode;
}

// ── Constants ───────────────────────────────────────────────────

export const WEAPON_CATEGORIES = ['Simple', 'Martial'] as const;

export const WEAPON_BASE_PROPERTIES = [
  'Ammunition',
  'Finesse',
  'Heavy',
  'Light',
  'Loading',
  'Range',
  'Reach',
  'Special',
  'Thrown',
  'Two-Handed',
  'Versatile',
] as const;

export const WEAPON_MASTERY_PROPERTIES = [
  'Cleave',
  'Graze',
  'Nick',
  'Push',
  'Sap',
  'Slow',
  'Topple',
  'Vex',
] as const;

export const DAMAGE_TYPES = [
  'Acid',
  'Bludgeoning',
  'Cold',
  'Fire',
  'Force',
  'Lightning',
  'Necrotic',
  'Piercing',
  'Poison',
  'Psychic',
  'Radiant',
  'Slashing',
  'Thunder',
] as const;

export const ABILITY_NAMES = [
  'Strength',
  'Dexterity',
  'Constitution',
  'Intelligence',
  'Wisdom',
  'Charisma',
] as const;

// ── Default values ──────────────────────────────────────────────

export const DEFAULT_WEAPON_FORM_DATA: WeaponFormData = {
  id: '',
  source: 'Homebrew',
  name: '',
  category: 'Simple',
  damageDice: '1d6',
  damageType: 'Slashing',
  ability: 'Strength',
  bonus: 0,
  properties: [],
  mastery: [],
  rangeNormal: '',
  rangeMaximum: '',
  versatileDamage: '',
  weight: 0,
  cost: '',
  description: '',
};

// ── Converter functions ─────────────────────────────────────────

export function weaponToFormData(weapon?: Partial<Weapon>): WeaponFormData {
  if (!weapon) return { ...DEFAULT_WEAPON_FORM_DATA };

  const damageEntry = weapon.damage?.entries?.[0] ?? { dice: '1d6', type: 'Slashing' };

  return {
    id: weapon.id ?? '',
    source: weapon.source ?? DEFAULT_WEAPON_FORM_DATA.source,
    name: weapon.name ?? '',
    category: weapon.category ?? DEFAULT_WEAPON_FORM_DATA.category,
    damageDice: damageEntry.dice ?? DEFAULT_WEAPON_FORM_DATA.damageDice,
    damageType: damageEntry.type ?? DEFAULT_WEAPON_FORM_DATA.damageType,
    ability: weapon.damage?.ability ?? DEFAULT_WEAPON_FORM_DATA.ability,
    bonus: weapon.damage?.bonus ?? 0,
    properties: [...(weapon.properties ?? [])],
    mastery: [...(weapon.mastery ?? [])],
    rangeNormal: weapon.range?.normal ?? '',
    rangeMaximum: weapon.range?.maximum ?? '',
    versatileDamage: weapon.versatileDamage ?? '',
    weight: weapon.weight ?? 0,
    cost: weapon.cost ?? '',
    description: ((weapon as Record<string, unknown>).description as string) ?? '',
  };
}

export function formDataToWeapon(formData: WeaponFormData): Weapon {
  const properties = formData.properties as readonly string[];
  const mastery = formData.mastery.length > 0 ? (formData.mastery as readonly string[]) : undefined;

  const range =
    typeof formData.rangeNormal === 'number' && formData.rangeNormal > 0
      ? {
          normal: formData.rangeNormal,
          maximum:
            typeof formData.rangeMaximum === 'number' && formData.rangeMaximum > 0
              ? formData.rangeMaximum
              : undefined,
        }
      : undefined;

  return {
    id: formData.id,
    name: formData.name,
    source: formData.source,
    type: 'weapon' as const,
    category: formData.category,
    damage: {
      entries: [{ dice: formData.damageDice, type: formData.damageType }],
      ability: formData.ability as Weapon['damage']['ability'],
      bonus: formData.bonus,
    },
    properties: properties as unknown as Weapon['properties'],
    mastery: mastery as unknown as Weapon['mastery'],
    range,
    versatileDamage: formData.versatileDamage || undefined,
    weight: formData.weight,
    cost: formData.cost || undefined,
    equipped: false,
  } as Weapon;
}
