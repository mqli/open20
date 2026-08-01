// WeaponAttackCard.tsx (T-109)
// Single weapon attack card: weapon icon, name, attack bonus Badge,
// damage dice+type text, ability tag, RollModifierRow for adv/normal/disadv.
//
// Computes display attack bonus the same way core does:
//   abilityMod + PB + weaponBonus - exhaustionPenalty
// Falls back gracefully when optional fields (attackBonus, damageType,
// abilityUsed) are missing.

import { Swords } from 'lucide-react';
import type { CharacterAttack } from 'open20-core';
import { getModifier, getTotalScore, getExhaustionD20Penalty } from 'open20-core';
import type { Character } from 'open20-core';
import { Text, Badge, cn } from '@open20/ui';

import { RollModifierRow } from '@/components/character/RollModifierRow';
import type { RollModifierType } from '@/core/roll-adapter';

export interface WeaponAttackCardProps {
  /** The stored attack from combatStats.attacks */
  attack: CharacterAttack;
  /** Character snapshot for computing display bonuses */
  character: Character;
  /** Called with adv/normal/disadv when the user rolls */
  onRoll: (rollModifier: RollModifierType) => void;
  className?: string;
}

function fmtBonus(n: number): string {
  return n >= 0 ? `+${n}` : `−${Math.abs(n)}`;
}

/** Build a human-readable damage summary, e.g. "1d8+3 Slashing" */
function damageSummary(attack: CharacterAttack): string {
  // Prefer structured damage entries
  if (attack.damageEntries && attack.damageEntries.length > 0) {
    return attack.damageEntries
      .map((e) => {
        let s = e.dice;
        if (attack.attackBonus) s += fmtBonus(attack.attackBonus);
        if (e.type) s += ` ${e.type}`;
        return s;
      })
      .join(', ');
  }

  // Fall back to damage string
  if (attack.damage) {
    return attack.damage;
  }

  // No damage (e.g. Grapple)
  return '—';
}

/** Compute display attack bonus matching core's calculation. */
function computeAttackBonus(attack: CharacterAttack, character: Character): number {
  if (attack.attackBonus !== undefined && attack.attackBonus !== null) {
    return attack.attackBonus;
  }
  const ability = attack.abilityUsed ?? 'Strength';
  const abilityMod = getModifier(getTotalScore(character.abilityScores, ability));
  const pb = character.combatStats.proficiencyBonus;
  const exhaustionPenalty = getExhaustionD20Penalty(character.conditions);
  return abilityMod + pb - exhaustionPenalty;
}

/** Get the ability abbreviation for the tag (e.g. "STR"). */
function abilityTag(attack: CharacterAttack): string {
  return (attack.abilityUsed ?? 'Strength').substring(0, 3).toUpperCase();
}

/** Does this attack deal damage? (used to decide if damage row should show) */
function hasDamage(attack: CharacterAttack): boolean {
  return !!((attack.damageEntries && attack.damageEntries.length > 0) || attack.damage);
}

export function WeaponAttackCard({ attack, character, onRoll, className }: WeaponAttackCardProps) {
  const bonus = computeAttackBonus(attack, character);
  const damageText = damageSummary(attack);
  const showDamage = hasDamage(attack);

  return (
    <div className={cn('flex items-center justify-between gap-3 py-1.5', className)}>
      {/* Left: weapon icon + name + badges */}
      <div className="flex items-center gap-2 min-w-0">
        <Swords className="h-4 w-4 shrink-0 text-text-secondary" aria-hidden="true" />

        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
          <Text variant="body" className="truncate">
            {attack.name}
          </Text>

          {/* Attack bonus badge */}
          <Badge variant="primary" size="sm" className="tabular-nums shrink-0">
            {fmtBonus(bonus)}
          </Badge>

          {/* Ability tag (NFR-01: non-color text cue) */}
          <Text variant="labelSm" color="secondary" className="shrink-0">
            {abilityTag(attack)}
          </Text>

          {/* Damage text — shown when there is damage */}
          {showDamage && (
            <Text variant="labelSm" color="tertiary" className="truncate">
              {damageText}
            </Text>
          )}
        </div>
      </div>

      {/* Right: RollModifierRow for adv/normal/disadv */}
      <RollModifierRow ariaLabel={`attack with ${attack.name}`} onRoll={onRoll}>
        <Text
          variant="body"
          weight="bold"
          className={cn(
            'tabular-nums cursor-pointer hover:opacity-80 transition-opacity',
            bonus < 0 ? 'text-danger' : undefined,
          )}
        >
          {fmtBonus(bonus)}
        </Text>
      </RollModifierRow>
    </div>
  );
}
