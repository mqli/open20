// types/monster.ts
// Monster-related types for D&D 5e monster support

import type { BaseAttack } from './attack';
import type { AbilityName, AbilityScores } from './ability';
import type { DamageType, DamageDefenses } from './damage';

// Monster size categories
export type MonsterSize = 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';

// Monster type categories (D&D 5e SRD)
export type MonsterType =
  | 'Aberration'
  | 'Beast'
  | 'Celestial'
  | 'Construct'
  | 'Dragon'
  | 'Elemental'
  | 'Fey'
  | 'Fiend'
  | 'Giant'
  | 'Humanoid'
  | 'Monstrosity'
  | 'Ooze'
  | 'Plant'
  | 'Undead';

// Challenge Rating (can be fractional)
export type ChallengeRating = number | '1/8' | '1/4' | '1/2';

// R28.7 - Initiative information
export interface InitiativeInfo {
  readonly modifier: number;
  readonly score?: number; // e.g., 14 for "+4 (14)"
}

// R28.7 - Senses information
export interface SensesInfo {
  readonly darkvision?: number; // range in feet
  readonly blindsight?: number;
  readonly tremorsense?: number;
  readonly truesight?: number;
  readonly passivePerception: number;
}

// R28.7 - Challenge Rating with lair XP
export interface ChallengeRatingInfo {
  readonly rating: ChallengeRating;
  readonly xp: number;
  readonly lairXp?: number; // XP when in lair
}

// R28.8 - Attack Notation
export interface AttackNotation {
  readonly hit?: string;
  readonly miss?: string;
  readonly hitOrMiss?: string;
}

// R28.9 - Saving Throw Effect
export interface SavingThrowEffect {
  readonly saveType: AbilityName;
  readonly dc: number;
  readonly description: string;
  readonly onSaveSuccess?: string;
  readonly onSaveFailure: string;
  readonly halfDamageOnSuccess?: boolean;
}

// R28.11 - Spellcasting Details
export interface SpellcastingDetails {
  readonly ignoresComponents?: ('V' | 'S' | 'M')[];
  readonly castingTime?: string;
  readonly restrictions?: string[];
}

// Monster attack (extends BaseAttack with reach/range)
export interface MonsterAttack extends BaseAttack {
  readonly reach?: number;
  readonly range?: { normal: number; long?: number };
  // damageEntries is now inherited from BaseAttack

  // R28.10 - Damage Notation
  readonly damageNotation?: {
    readonly fixedValue?: number;
    readonly dieExpression?: string;
  };
}

// R28.11 - Monster Spellcasting
export interface MonsterSpellcasting {
  readonly ability: AbilityName;
  readonly saveDC: number;
  readonly attackBonus?: number;
  readonly ignoresComponents?: readonly ('V' | 'S' | 'M')[];
  readonly atWill?: readonly string[]; // Spells that can be cast at will
  readonly daily?: ReadonlyArray<{ spell: string; times: number }>; // Spells with limited usage
}

// ── HP & AC ──────────────────────────────────────────────────

export interface HPInfo {
  readonly value: number;
  readonly formula?: string; // e.g., "2d6+2"
}

export interface ArmorClassEntry {
  readonly value: number;
  readonly type: string; // e.g., "natural armor", "hide armor"
  readonly condition?: string; // e.g., "while not incapacitated"
}

// ── Speed ─────────────────────────────────────────────────────

export interface SpeedInfo {
  readonly walk?: number;
  readonly burrow?: number;
  readonly climb?: number;
  readonly fly?: number;
  readonly swim?: number;
  readonly hover?: boolean;
}

// ── Monster Features (Traits, Actions, Reactions) ────────────

export interface MonsterFeature {
  readonly name: string;
  readonly description: string;
}

export interface MonsterAction {
  readonly name: string;
  readonly description?: string;
  readonly attacks?: readonly MonsterAttack[];
  readonly legendary?: boolean;

  // R28.8 - Attack Notation
  readonly attackNotation?: AttackNotation;

  // R28.9 - Saving Throw Effect
  readonly savingThrowEffect?: SavingThrowEffect;

  // R28.12 - Limited Usage
  readonly limitedUsage?: {
    readonly type: 'x_per_day' | 'recharge' | 'recharge_after_rest';
    readonly uses?: number; // for x_per_day
    readonly rechargeRange?: readonly [number, number]; // for recharge
    readonly rechargeOn?: 'short_rest' | 'long_rest'; // for recharge_after_rest
  };
}

export interface MonsterReaction {
  readonly name: string;
  readonly description: string;
}

export interface MonsterLegendaryAction {
  readonly name: string;
  readonly description: string;
  readonly cost?: number; // Default 1, some cost 2 or 3
}

// ── Core Monster interface (used in ContentPack.monsters) ──

/** A monster entry in a content pack. */
export interface Monster {
  readonly id: string;
  readonly name: string;
  readonly source: string;
  readonly size: MonsterSize;
  readonly type: MonsterType;
  readonly alignment: string;
  readonly descriptiveTags?: readonly string[]; // R28.7 - e.g., "(Chromatic)"
  readonly armorClass: readonly ArmorClassEntry[];
  readonly hitPoints: HPInfo;
  readonly speed: SpeedInfo;
  readonly initiative?: InitiativeInfo; // R28.7
  readonly abilityScores: AbilityScores;
  readonly savingThrows?: Readonly<Record<string, number>>; // R28.7 - Override save bonuses
  readonly skills?: Readonly<Record<string, number>>; // R28.7 - Skill bonuses
  readonly challengeRating: ChallengeRatingInfo; // Updated for lair XP
  readonly resistances?: readonly DamageType[]; // R28.7 - Separate from damageDefenses
  readonly vulnerabilities?: readonly DamageType[]; // R28.7 - Separate from damageDefenses
  readonly senses?: SensesInfo; // R28.7 - Senses and Passive Perception
  readonly languages?: readonly string[]; // R28.7 - Spoken languages
  readonly gear?: readonly string[]; // R28.7 - Equipment
  readonly spellcasting?: readonly MonsterSpellcasting[]; // R28.11 - Spellcasting details
  readonly traits?: readonly MonsterFeature[];
  readonly actions?: readonly MonsterAction[];
  readonly bonusActions?: readonly MonsterAction[]; // R28.7 - Separate from actions
  readonly reactions?: readonly MonsterReaction[];
  readonly legendaryActions?: readonly MonsterLegendaryAction[];
  readonly environments?: readonly string[];
  // Damage defenses (optional, not all monsters have them)
  readonly damageDefenses?: DamageDefenses;
  // Condition immunities (common in monsters)
  readonly conditionImmunities?: readonly string[];
  // Current HP for combat (not part of stat block, used during combat)
  readonly currentHP?: number;
  readonly temporaryHP?: number;
}

// ── Monster filter for searchMonsters() ──

/** Filter object for searching monsters in a content pack. */
export interface MonsterFilter {
  readonly name?: string;
  readonly size?: readonly MonsterSize[];
  readonly type?: readonly MonsterType[];
  readonly minCR?: ChallengeRating;
  readonly maxCR?: ChallengeRating;
  readonly environment?: readonly string[];
  readonly source?: readonly string[];
  readonly damageResistances?: readonly DamageType[];
  readonly damageImmunities?: readonly DamageType[];
  readonly damageVulnerabilities?: readonly DamageType[];
  readonly conditionImmunities?: readonly string[];
}
