// AbilityScoresGrid.tsx (T-103 / T-218)
// 6 combined ability cards showing score (with breakdown tooltip), modifier
// (ability check roll), and saving throw bonus (with proficiency indicator).
// Merges previous AbilityScoresGrid + SavingThrowsGrid into one grid.

import { Circle, CircleDot } from 'lucide-react';
import {
  getModifier,
  getTotalScore,
  getSavingThrowBonus,
  type AbilityScores,
  type AbilityName,
  type Character,
} from 'open20-core';
import { Surface, Text, Tooltip, cn } from '@open20/ui';

import { getClass } from '@/core/content-resolver';
import type { RollModifierType } from '@/core/roll-adapter';

const ORDER: readonly { ability: AbilityName; short: string }[] = [
  { ability: 'Strength', short: 'STR' },
  { ability: 'Dexterity', short: 'DEX' },
  { ability: 'Constitution', short: 'CON' },
  { ability: 'Intelligence', short: 'INT' },
  { ability: 'Wisdom', short: 'WIS' },
  { ability: 'Charisma', short: 'CHA' },
];

// ─── Source helpers (tooltip) ──────────���────────────────────

const SOURCE_KEYS = [
  { key: 'base' as const, label: 'Base' },
  { key: 'racialBonuses' as const, label: 'Racial' },
  { key: 'backgroundBonuses' as const, label: 'Background' },
  { key: 'featBonuses' as const, label: 'Feat' },
  { key: 'featGrants' as const, label: 'Feat' },
  { key: 'temporaryBonuses' as const, label: 'Temp' },
];

function getSources(
  scores: AbilityScores,
  ability: AbilityName,
): { label: string; value: number }[] {
  const result: { label: string; value: number }[] = [];
  for (const { key, label } of SOURCE_KEYS) {
    const bonusMap = scores[key];
    const value = (bonusMap as Record<string, number | undefined>)?.[ability] ?? 0;
    if (value !== 0) result.push({ label, value });
  }
  return result;
}

function fmtSource(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}

/** Union of saving-throw proficiencies across all classes. */
function getProficientAbilities(character: Character): readonly AbilityName[] {
  const all: AbilityName[] = [];
  for (const cc of character.classes) {
    const cls = getClass(cc.classId);
    if (cls) all.push(...cls.savingThrowProficiencies);
  }
  return all;
}

function fmt(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

// ─── AbilityCard ────────────────────────────────────────────

export interface AbilityCardProps {
  short: string;
  ability: AbilityName;
  score: number;
  modifier: number;
  saveBonus: number;
  isSaveProficient: boolean;
  onRollCheck: (ability: AbilityName, rollModifier: RollModifierType) => void;
  onRollSave: (ability: AbilityName, rollModifier: RollModifierType) => void;
  /** Source breakdown for hover tooltip */
  sources?: { label: string; value: number }[];
}

function AbilityCard({
  short,
  ability,
  score,
  modifier,
  saveBonus,
  isSaveProficient,
  onRollCheck,
  onRollSave,
  sources,
}: AbilityCardProps) {
  const ProficiencyIcon = isSaveProficient ? CircleDot : Circle;
  const hasSources = sources && sources.length > 0;

  const body = (
    <Surface
      variant="default"
      padding="sm"
      className={cn(
        'flex min-h-[72px] min-w-[76px] flex-col items-center gap-0.5',
        isSaveProficient && 'ring-2 ring-primary-600',
      )}
    >
      {/* Label */}
      <Text variant="labelSm" color="secondary">
        {short}
      </Text>

      {/* Score */}
      <Text variant="heading" weight="bold" className="tabular-nums leading-none">
        {score}
      </Text>

      {/* Row: modifier + save */}
      <div className="flex items-center gap-1.5">
        {/* Ability check (modifier badge) */}
        <button
          type="button"
          className="rounded-full px-1.5 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-[10px] font-medium tabular-nums hover:opacity-80 transition-opacity cursor-pointer"
          onClick={() => onRollCheck(ability, 'none')}
          aria-label={`Roll ${ability} check`}
        >
          {fmt(modifier)}
        </button>

        {/* Divider */}
        <span className="h-4 w-px bg-border" aria-hidden />

        {/* Saving throw */}
        <button
          type="button"
          className="flex items-center gap-1 rounded-full px-1.5 py-0.5 bg-bg-tertiary text-text-secondary text-[10px] font-medium tabular-nums hover:opacity-80 transition-opacity cursor-pointer"
          onClick={() => onRollSave(ability, 'none')}
          aria-label={`Roll ${ability} saving throw`}
        >
          <ProficiencyIcon
            className={cn('h-3 w-3', isSaveProficient ? 'text-primary-600' : 'text-text-tertiary')}
            aria-hidden
          />
          {fmt(saveBonus)}
        </button>
      </div>
    </Surface>
  );

  if (!hasSources) return body;

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{body}</Tooltip.Trigger>
      <Tooltip.Content side="top" className="flex flex-col gap-0.5 min-w-[120px]">
        <div className="flex flex-col gap-0.5">
          {sources!.map((source) => (
            <div key={source.label} className="flex items-center justify-between gap-3 text-xs">
              <span className="text-text-secondary">{source.label}</span>
              <span className="font-medium tabular-nums">{fmtSource(source.value)}</span>
            </div>
          ))}
          <div className="mt-0.5 flex items-center justify-between gap-3 border-t border-border pt-0.5 text-xs font-semibold">
            <span className="text-text-secondary">Total</span>
            <span className="tabular-nums">{score}</span>
          </div>
        </div>
      </Tooltip.Content>
    </Tooltip.Root>
  );
}

// ─── AbilityScoresGrid ──────────────────────────────────────

export interface AbilityScoresGridProps {
  character: Character;
  onRollCheck: (ability: AbilityName, rollModifier: RollModifierType) => void;
  onRollSave: (ability: AbilityName, rollModifier: RollModifierType) => void;
  className?: string;
}

export function AbilityScoresGrid({
  character,
  onRollCheck,
  onRollSave,
  className,
}: AbilityScoresGridProps) {
  const proficientAbilities = getProficientAbilities(character);
  const { abilityScores, combatStats } = character;

  return (
    <div className={cn('grid grid-cols-3 gap-2 md:grid-cols-6', className)}>
      {ORDER.map(({ ability, short }) => {
        const total = getTotalScore(abilityScores, ability);
        const saveBonus = getSavingThrowBonus(
          abilityScores,
          ability,
          proficientAbilities,
          combatStats.proficiencyBonus,
        );
        return (
          <AbilityCard
            key={ability}
            short={short}
            ability={ability}
            score={total}
            modifier={getModifier(total)}
            saveBonus={saveBonus}
            isSaveProficient={proficientAbilities.includes(ability)}
            onRollCheck={onRollCheck}
            onRollSave={onRollSave}
            sources={getSources(abilityScores, ability)}
          />
        );
      })}
    </div>
  );
}
