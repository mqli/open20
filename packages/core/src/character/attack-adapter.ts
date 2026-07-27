// character/attack-adapter.ts
// CharacterAttack → Weapon adapter for roll functions
//
// Maps the stored CharacterAttack (in combatStats.attacks) to a Weapon object
// sufficient for rollCharacterAttack() / rollCharacterWeaponDamage().
// This is a best-effort mapping with documented lossy assumptions.

import type { Character } from '@/types/character';
import type { CharacterAttack } from '@/types/character';
import type { Weapon, WeaponDamageEntry, WeaponProperty } from '@/types/equipment';
import type { DamageType } from '@/types/damage';
import type { WeaponMasteryProperty } from '@/types/equipment';
import type { RandomProvider } from '@/dice/core';
import type { AttackRollResult, DamageRollResult } from '@/dice/mechanics';

import { defaultRandom } from '@/dice/core';
import { rollCharacterAttack, rollCharacterWeaponDamage } from '@/rolls/character';

// ––– Damage string parser ––––––––––––––––––––––––––––––––––––

/** Matches a damage string like "1d8+3 slashing", "2d6 fire", "1d8+3". */
const DAMAGE_STRING_RE = /^(?<dice>\d+d\d+)(?:\s*\+\s*(?<bonus>\d+))?\s*(?<type>[a-zA-Z]+)?$/;

/** Parse a damage string (e.g. "1d8+3 slashing") into a WeaponDamageEntry. */
function parseDamageString(raw: string): WeaponDamageEntry {
  const trimmed = raw.trim();
  const match = trimmed.match(DAMAGE_STRING_RE);
  if (!match?.groups?.dice) {
    throw new Error(`Cannot parse damage string: "${raw}"`);
  }
  const { dice, type } = match.groups;
  return {
    dice: dice!,
    type: guessDamageType(type),
  };
}

/** Map free-text to a known DamageType, falling back to 'Bludgeoning'. */
function guessDamageType(raw: string | undefined): DamageType {
  if (!raw) return 'Bludgeoning';
  const lower = raw.toLowerCase().trim();
  // Map common casing variants
  const map: Record<string, DamageType> = {
    acid: 'Acid',
    bludgeoning: 'Bludgeoning',
    cold: 'Cold',
    fire: 'Fire',
    force: 'Force',
    lightning: 'Lightning',
    necrotic: 'Necrotic',
    piercing: 'Piercing',
    poison: 'Poison',
    psychic: 'Psychic',
    radiant: 'Radiant',
    slashing: 'Slashing',
    thunder: 'Thunder',
  };
  return map[lower] ?? 'Bludgeoning';
}

// ––– Core adapter –––––––––––––––––––––––––––––––––––––––––––

/**
 * Convert a stored CharacterAttack to a minimal Weapon object.
 *
 * **Assumptions (documented, lossy):**
 * - `category` defaults to `'Simple'` (cannot be determined from CharacterAttack).
 * - `damage.ability` uses `attack.abilityUsed` if present; falls back to `'Strength'`.
 * - `damage.bonus` defaults to `0` (the roll fn adds ability + PB on its own).
 * - `properties` includes `'Finesse'` when `attack.abilityUsed === 'Dexterity'`
 *   (best-effort property inference).
 * - `weight` defaults to `0`, `equipped` defaults to `true`.
 * - `mastery` is forwarded from the attack's `mastery` field.
 * - `id` is derived from the attack `name` (slugified).
 *
 * @throws If neither `damageEntries` nor `damage` string is present.
 */
export function characterAttackToWeapon(attack: CharacterAttack): Weapon {
  const entries = buildDamageEntries(attack);
  const ability: import('../types/ability').AbilityName = attack.abilityUsed ?? 'Strength';

  const properties: WeaponProperty[] = [];
  if (ability === 'Dexterity') {
    properties.push('Finesse' as WeaponProperty);
  }

  return {
    id: attack.name.toLowerCase().replace(/\s+/g, '-'),
    name: attack.name,
    type: 'weapon' as const,
    category: 'Simple',
    damage: {
      entries,
      ability,
      bonus: 0,
    },
    properties: properties as readonly WeaponProperty[],
    mastery: (attack.mastery as readonly WeaponMasteryProperty[]) ?? [],
    weight: 0,
    equipped: true,
  };
}

/** Build WeaponDamageEntry[] from CharacterAttack.damageEntries or .damage string. */
function buildDamageEntries(attack: CharacterAttack): readonly WeaponDamageEntry[] {
  // Prefer structured damage entries
  if (attack.damageEntries && attack.damageEntries.length > 0) {
    return attack.damageEntries.map((e) => ({
      dice: e.dice,
      type: e.type,
    }));
  }

  // Fall back to damage string parsing
  if (attack.damage) {
    return [parseDamageString(attack.damage)];
  }

  throw new Error(
    `CharacterAttack "${attack.name}" has no damageEntries or damage string. ` +
      'Cannot build Weapon for rolling.',
  );
}

// ––– Convenience roll functions –––––––––––––––––––––––––––

export interface StoredAttackRollParams {
  character: Character;
  attack: CharacterAttack;
  rollModifier?: 'advantage' | 'disadvantage' | 'none';
  targetAC?: number;
  rng?: RandomProvider;
}

/**
 * Roll an attack using a stored CharacterAttack.
 * Converts to Weapon internally, then delegates to rollCharacterAttack.
 */
export function rollStoredAttack(params: StoredAttackRollParams): AttackRollResult {
  const { character, attack, rollModifier, targetAC, rng = defaultRandom } = params;
  const weapon = characterAttackToWeapon(attack);
  return rollCharacterAttack({ character, weapon, rollModifier, targetAC, rng });
}

export interface StoredAttackDamageParams {
  character: Character;
  attack: CharacterAttack;
  isCritical?: boolean;
  rng?: RandomProvider;
}

/**
 * Roll damage using a stored CharacterAttack.
 * Converts to Weapon internally, then delegates to rollCharacterWeaponDamage.
 */
export function rollStoredAttackDamage(params: StoredAttackDamageParams): DamageRollResult {
  const { character, attack, isCritical, rng = defaultRandom } = params;
  const weapon = characterAttackToWeapon(attack);
  return rollCharacterWeaponDamage({ character, weapon, isCritical, rng });
}
