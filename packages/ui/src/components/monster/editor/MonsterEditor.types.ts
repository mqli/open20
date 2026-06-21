import type { Monster } from 'open20-core';
import type {
  MonsterSize,
  MonsterType,
  ChallengeRating,
  AbilityName,
  DamageType,
  MonsterSpellcasting,
} from 'open20-core/types';
import { ALL_DAMAGE_TYPES } from 'open20-core/types';

export { ABILITY_NAMES } from 'open20-core/types';

// ── Mutable subtypes ─────────────────────────────────────────────

export interface MutableMonsterFeature {
  name: string;
  description: string;
}

export interface MutableMonsterAttack {
  name: string;
  attackBonus?: number;
  damage?: string;
  damageType?: DamageType;
  damageEntries?: {
    dice: string;
    type: DamageType;
    bonus?: number;
    includeSpellcastingModifier?: boolean;
  }[];
  reach?: number;
  range?: { normal: number; long?: number };
}

export interface MutableMonsterAction {
  name: string;
  description?: string;
  attacks?: MutableMonsterAttack[];
  legendary?: boolean;
  attackNotation?: { hit?: string; miss?: string; hitOrMiss?: string };
  savingThrowEffect?: {
    saveType: AbilityName;
    dc: number;
    description: string;
    onSaveSuccess?: string;
    onSaveFailure: string;
    halfDamageOnSuccess?: boolean;
  };
  limitedUsage?: {
    type: 'x_per_day' | 'recharge' | 'recharge_after_rest';
    uses?: number;
    rechargeRange?: [number, number];
    rechargeOn?: 'short_rest' | 'long_rest';
  };
}

export interface MutableMonsterReaction {
  name: string;
  description: string;
}

export interface MutableMonsterLegendaryAction {
  name: string;
  description: string;
  cost?: number;
}

export interface MutableMonsterSpellcasting {
  ability: AbilityName;
  saveDC: number;
  attackBonus?: number;
  ignoresComponents?: ('V' | 'S' | 'M')[];
  atWill?: string[];
  daily?: { spell: string; times: number }[];
}

// ── Form data type ──────────────────────────────────────────────

export interface MonsterFormData {
  id: string;
  name: string;
  source: string;
  size: MonsterSize;
  type: MonsterType;
  alignment: string;
  descriptiveTags: string[];
  armorClass: { value: number; type: string; condition?: string }[];
  hitPoints: { value: number; formula?: string };
  speed: {
    walk?: number;
    burrow?: number;
    climb?: number;
    fly?: number;
    swim?: number;
    hover?: boolean;
  };
  initiative?: { modifier: number; score?: number };
  abilityScores: Record<AbilityName, number>;
  savingThrows: Record<string, number>;
  skills: Record<string, number>;
  resistances: DamageType[];
  vulnerabilities: DamageType[];
  damageImmunities: DamageType[];
  conditionImmunities: string[];
  senses: {
    darkvision?: number;
    blindsight?: number;
    tremorsense?: number;
    truesight?: number;
    passivePerception: number;
  };
  languages: string[];
  challengeRating: { rating: ChallengeRating; xp: number; lairXp?: number };
  traits: MutableMonsterFeature[];
  actions: MutableMonsterAction[];
  bonusActions: MutableMonsterAction[];
  reactions: MutableMonsterReaction[];
  legendaryActions: MutableMonsterLegendaryAction[];
  spellcasting: MutableMonsterSpellcasting[];
  gears: string[];
  environments: string[];
}

// ── Component Props ─────────────────────────────────────────────

export interface MonsterEditorProps {
  /** Controlled mode: current monster data */
  value?: Partial<Monster>;
  /** Uncontrolled mode: default monster data */
  defaultValue?: Partial<Monster>;
  /** Form value change callback */
  onChange?: (monster: Partial<Monster>) => void;
  /** Form submit callback (optional intent: 'stay' | 'new' | 'close') */
  onSubmit?: (monster: Monster, intent?: 'stay' | 'new' | 'close') => void;
  /** Cancel button callback */
  onCancel?: () => void;
  /** Show live preview of MonsterCard */
  showPreview?: boolean;
  /** Disable all inputs */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
  /** Custom action buttons (replaces default save/cancel) */
  renderActions?: (props: {
    onSave: (intent: 'stay' | 'new' | 'close') => void;
    isDirty: boolean;
    isValid: boolean;
    isSubmitting: boolean;
  }) => React.ReactNode;
  /** Editor mode: 'simple' shows essential fields, 'advanced' shows all sections. Default 'advanced'. */
  mode?: 'simple' | 'advanced';
  /** Called when user toggles between simple and advanced mode */
  onModeChange?: (mode: 'simple' | 'advanced') => void;
}

// ── Constants ───────────────────────────────────────────────────

export const MONSTER_SIZES: MonsterSize[] = [
  'Tiny',
  'Small',
  'Medium',
  'Large',
  'Huge',
  'Gargantuan',
];

export const MONSTER_TYPES: MonsterType[] = [
  'Aberration',
  'Beast',
  'Celestial',
  'Construct',
  'Dragon',
  'Elemental',
  'Fey',
  'Fiend',
  'Giant',
  'Humanoid',
  'Monstrosity',
  'Ooze',
  'Plant',
  'Undead',
];

export const CHALLENGE_RATINGS: ChallengeRating[] = [
  '1/8' as ChallengeRating,
  '1/4' as ChallengeRating,
  '1/2' as ChallengeRating,
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
];

export const CHALLENGE_RATINGS_WITH_XP: { rating: ChallengeRating; xp: number }[] = [
  { rating: 0, xp: 0 },
  { rating: '1/8', xp: 25 },
  { rating: '1/4', xp: 50 },
  { rating: '1/2', xp: 100 },
  { rating: 1, xp: 200 },
  { rating: 2, xp: 450 },
  { rating: 3, xp: 700 },
  { rating: 4, xp: 1100 },
  { rating: 5, xp: 1800 },
  { rating: 6, xp: 2300 },
  { rating: 7, xp: 2900 },
  { rating: 8, xp: 3900 },
  { rating: 9, xp: 5000 },
  { rating: 10, xp: 5900 },
  { rating: 11, xp: 7200 },
  { rating: 12, xp: 8400 },
  { rating: 13, xp: 10000 },
  { rating: 14, xp: 11500 },
  { rating: 15, xp: 13000 },
  { rating: 16, xp: 15000 },
  { rating: 17, xp: 18000 },
  { rating: 18, xp: 20000 },
  { rating: 19, xp: 22000 },
  { rating: 20, xp: 25000 },
  { rating: 21, xp: 33000 },
  { rating: 22, xp: 41000 },
  { rating: 23, xp: 50000 },
  { rating: 24, xp: 62000 },
  { rating: 25, xp: 75000 },
  { rating: 26, xp: 90000 },
  { rating: 27, xp: 105000 },
  { rating: 28, xp: 120000 },
  { rating: 29, xp: 135000 },
  { rating: 30, xp: 155000 },
];

export const ALL_DAMAGE_TYPES_LIST: readonly DamageType[] = ALL_DAMAGE_TYPES;

// ── Default values ──────────────────────────────────────────────

export const DEFAULT_MONSTER_FORM_DATA: MonsterFormData = {
  id: '',
  name: '',
  source: 'Homebrew',
  size: 'Medium',
  type: 'Humanoid',
  alignment: 'Unaligned',
  descriptiveTags: [],
  armorClass: [{ value: 10, type: 'natural armor' }],
  hitPoints: { value: 1, formula: '' },
  speed: { walk: 30 },
  abilityScores: {
    Strength: 10,
    Dexterity: 10,
    Constitution: 10,
    Intelligence: 10,
    Wisdom: 10,
    Charisma: 10,
  },
  savingThrows: {},
  skills: {},
  resistances: [],
  vulnerabilities: [],
  damageImmunities: [],
  conditionImmunities: [],
  senses: { passivePerception: 10 },
  languages: [],
  challengeRating: { rating: 1, xp: 200 },
  traits: [],
  actions: [],
  bonusActions: [],
  reactions: [],
  legendaryActions: [],
  spellcasting: [],
  gears: [],
  environments: [],
};

// ── Helper functions ────────────────────────────────────────────

/** Convert a Partial<Monster> (readonly) to MonsterFormData (mutable) */
export function monsterToFormData(monster?: Partial<Monster>): MonsterFormData {
  if (!monster) return { ...DEFAULT_MONSTER_FORM_DATA };

  const base =
    (monster.abilityScores as { base?: Record<AbilityName, number> } | undefined)?.base ??
    ({} as Record<AbilityName, number>);

  return {
    id: monster.id ?? DEFAULT_MONSTER_FORM_DATA.id,
    name: monster.name ?? DEFAULT_MONSTER_FORM_DATA.name,
    source: monster.source ?? DEFAULT_MONSTER_FORM_DATA.source,
    size: monster.size ?? DEFAULT_MONSTER_FORM_DATA.size,
    type: monster.type ?? DEFAULT_MONSTER_FORM_DATA.type,
    alignment: monster.alignment ?? DEFAULT_MONSTER_FORM_DATA.alignment,
    descriptiveTags: [...(monster.descriptiveTags ?? [])],
    armorClass: (monster.armorClass as MonsterFormData['armorClass']) ?? [
      ...DEFAULT_MONSTER_FORM_DATA.armorClass,
    ],
    hitPoints: { ...(monster.hitPoints ?? DEFAULT_MONSTER_FORM_DATA.hitPoints) },
    speed: { ...(monster.speed ?? DEFAULT_MONSTER_FORM_DATA.speed) },
    initiative: monster.initiative ? { ...monster.initiative } : undefined,
    abilityScores: {
      Strength: base.Strength ?? 10,
      Dexterity: base.Dexterity ?? 10,
      Constitution: base.Constitution ?? 10,
      Intelligence: base.Intelligence ?? 10,
      Wisdom: base.Wisdom ?? 10,
      Charisma: base.Charisma ?? 10,
    },
    savingThrows: { ...(monster.savingThrows ?? {}) },
    skills: { ...(monster.skills ?? {}) },
    resistances: [...(monster.resistances ?? [])],
    vulnerabilities: [...(monster.vulnerabilities ?? [])],
    damageImmunities: [...(monster.damageDefenses?.immunities ?? [])],
    conditionImmunities: [...(monster.conditionImmunities ?? [])],
    senses: { ...(monster.senses ?? DEFAULT_MONSTER_FORM_DATA.senses) },
    languages: [...(monster.languages ?? [])],
    challengeRating: { ...(monster.challengeRating ?? DEFAULT_MONSTER_FORM_DATA.challengeRating) },
    traits: (monster.traits as MutableMonsterFeature[]) ?? [],
    actions: (monster.actions as MutableMonsterAction[]) ?? [],
    bonusActions: (monster.bonusActions as MutableMonsterAction[]) ?? [],
    reactions: (monster.reactions as MutableMonsterReaction[]) ?? [],
    legendaryActions: (monster.legendaryActions as MutableMonsterLegendaryAction[]) ?? [],
    spellcasting: (monster.spellcasting as MutableMonsterSpellcasting[]) ?? [],
    gears: [...(monster.gears ?? [])],
    environments: [...(monster.environments ?? [])],
  };
}

/** Convert MonsterFormData (mutable) back to Monster (readonly) */
export function formDataToMonster(formData: MonsterFormData): Monster {
  return {
    id: formData.id,
    name: formData.name,
    source: formData.source,
    size: formData.size,
    type: formData.type,
    alignment: formData.alignment,
    descriptiveTags: formData.descriptiveTags as readonly string[] | undefined,
    armorClass: formData.armorClass as readonly Monster['armorClass'][0][],
    hitPoints: { ...formData.hitPoints },
    speed: { ...formData.speed },
    initiative: formData.initiative ? { ...formData.initiative } : undefined,
    abilityScores: {
      base: formData.abilityScores as Record<AbilityName, number>,
      racialBonuses: {},
    },
    savingThrows:
      Object.keys(formData.savingThrows).length > 0
        ? (formData.savingThrows as Record<string, number>)
        : undefined,
    skills:
      Object.keys(formData.skills).length > 0
        ? (formData.skills as Record<string, number>)
        : undefined,
    resistances:
      formData.resistances.length > 0 ? (formData.resistances as readonly DamageType[]) : undefined,
    vulnerabilities:
      formData.vulnerabilities.length > 0
        ? (formData.vulnerabilities as readonly DamageType[])
        : undefined,
    damageDefenses:
      formData.damageImmunities.length > 0
        ? {
            resistances: formData.resistances as readonly DamageType[],
            immunities: formData.damageImmunities as readonly DamageType[],
            vulnerabilities: formData.vulnerabilities as readonly DamageType[],
          }
        : undefined,
    conditionImmunities:
      formData.conditionImmunities.length > 0
        ? (formData.conditionImmunities as readonly string[])
        : undefined,
    senses: {
      ...(formData.senses.darkvision !== undefined
        ? { darkvision: formData.senses.darkvision }
        : {}),
      ...(formData.senses.blindsight !== undefined
        ? { blindsight: formData.senses.blindsight }
        : {}),
      ...(formData.senses.tremorsense !== undefined
        ? { tremorsense: formData.senses.tremorsense }
        : {}),
      ...(formData.senses.truesight !== undefined ? { truesight: formData.senses.truesight } : {}),
      passivePerception: formData.senses.passivePerception,
    },
    languages:
      formData.languages.length > 0 ? (formData.languages as readonly string[]) : undefined,
    challengeRating: { ...formData.challengeRating },
    traits: formData.traits.length > 0 ? (formData.traits as any) : undefined,
    actions: formData.actions.length > 0 ? (formData.actions as any) : undefined,
    bonusActions: formData.bonusActions.length > 0 ? (formData.bonusActions as any) : undefined,
    reactions: formData.reactions.length > 0 ? (formData.reactions as any) : undefined,
    legendaryActions:
      formData.legendaryActions.length > 0 ? (formData.legendaryActions as any) : undefined,
    spellcasting:
      formData.spellcasting.length > 0
        ? (formData.spellcasting as readonly MonsterSpellcasting[])
        : undefined,
    gears: formData.gears.length > 0 ? (formData.gears as readonly string[]) : undefined,
    environments:
      formData.environments.length > 0 ? (formData.environments as readonly string[]) : undefined,
  } as Monster;
}
