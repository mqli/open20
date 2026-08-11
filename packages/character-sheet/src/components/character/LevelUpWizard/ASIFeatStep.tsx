// ASIFeatStep.tsx (T-212)
// ASI or feat selection step — only at levels 4/8/12/16/19.
// Three top-level options: Skip, ASI, Feat.
// ASI has two sub-modes: +2 to one ability, or +1 to two abilities.
// Feat shows all available feats (SRD feats have no prerequisites).

import { useMemo } from 'react';
import { Check, Dices, SkipForward } from 'lucide-react';
import { Text, Button, cn } from '@open20/ui';
import { getModifier, getTotalScore, type AbilityName } from 'open20-core';
import { getAllFeats } from '@/core/content-resolver';
import { OptionGrid } from '@/components/character/CharacterCreateWizard/OptionGrid';

import type { Character } from 'open20-core';

// ── Internal wizard types ──

export type WizardASIFeat =
  | { type: 'Skip' }
  | { type: 'asi'; mode: 'plus2'; ability: AbilityName }
  | { type: 'asi'; mode: 'plus1plus1'; ability1: AbilityName; ability2: AbilityName }
  | { type: 'feat'; featId: string };

// ── Constants ──

const ABILITIES: AbilityName[] = [
  'Strength',
  'Dexterity',
  'Constitution',
  'Intelligence',
  'Wisdom',
  'Charisma',
];

type TopOption = 'skip' | 'asi' | 'feat';

// ── Props ──

export interface ASIFeatStepProps {
  character: Character;
  asiOrFeat: WizardASIFeat | null;
  onChange: (value: WizardASIFeat) => void;
  className?: string;
}

// ── Component ──

export function ASIFeatStep({ character, asiOrFeat, onChange, className }: ASIFeatStepProps) {
  const allFeats = getAllFeats();
  const currentTop: TopOption =
    asiOrFeat?.type === 'feat'
      ? 'feat'
      : asiOrFeat?.type === 'asi'
        ? 'asi'
        : asiOrFeat?.type === 'Skip'
          ? 'skip'
          : 'skip';

  // Feat options (all SRD feats; SRD feats have no prerequisites)
  const featOptions = useMemo(
    () => allFeats.map((f) => ({ id: f.id, label: f.name ?? f.id, sublabel: f.category })),
    [allFeats],
  );

  const selectedFeatId = asiOrFeat?.type === 'feat' ? asiOrFeat.featId : '';

  function handleTopChange(opt: TopOption) {
    if (opt === 'skip') {
      onChange({ type: 'Skip' });
    } else if (opt === 'asi') {
      // Default ASI: +2 to first ability
      onChange({ type: 'asi', mode: 'plus2', ability: ABILITIES[0] });
    } else {
      // Default Feat: first feat
      if (allFeats.length > 0) {
        onChange({ type: 'feat', featId: allFeats[0]!.id });
      }
    }
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <Text variant="labelSm" color="secondary">
        Ability Score Improvement
      </Text>

      {/* ── Top-level radio cards: Skip / ASI / Feat ── */}
      <div role="group" aria-label="ASI or Feat choice" className="grid grid-cols-3 gap-2">
        {[
          { id: 'skip' as const, label: 'Skip', icon: SkipForward },
          { id: 'asi' as const, label: 'ASI (Ability)', icon: Dices },
          { id: 'feat' as const, label: 'Feat', icon: Dices },
        ].map((option) => {
          const selected = currentTop === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={option.label}
              onClick={() => handleTopChange(option.id)}
              className={cn(
                'flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-lg border p-2 text-center transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600',
                selected
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-border hover:bg-bg-tertiary',
              )}
            >
              <span className="flex items-center gap-1">
                {selected && <Check className="h-3.5 w-3.5 text-primary-600" aria-hidden="true" />}
                <option.icon className="h-4 w-4 text-text-secondary" aria-hidden="true" />
              </span>
              <Text as="span" variant="labelSm" weight={selected ? 'bold' : undefined}>
                {option.label}
              </Text>
            </button>
          );
        })}
      </div>

      {/* ── ASI sub-options ── */}
      {currentTop === 'asi' && asiOrFeat && (
        <ASIDetail
          character={character}
          selection={asiOrFeat as unknown as WizardASIFeat & { type: 'asi' }}
          onChange={onChange}
        />
      )}

      {/* ── Feat picker ── */}
      {currentTop === 'feat' && (
        <OptionGrid
          legend="Choose a feat"
          options={featOptions}
          value={selectedFeatId}
          onChange={(id) => onChange({ type: 'feat', featId: id })}
        />
      )}
    </div>
  );
}

// ── ASI detail sub-component ──

function ASIDetail({
  character,
  selection,
  onChange,
}: {
  character: Character;
  selection: WizardASIFeat & { type: 'asi' };
  onChange: (v: WizardASIFeat) => void;
}) {
  const scores = character.abilityScores;

  // Extract ability fields from the discriminated union.
  let ability1: AbilityName;
  let ability2: AbilityName | undefined;
  if (selection.mode === 'plus2') {
    ability1 = selection.ability;
    ability2 = undefined;
  } else {
    ability1 = selection.ability1;
    ability2 = selection.ability2;
  }

  const isPlus2 = selection.mode === 'plus2';

  function setMode(mode: 'plus2' | 'plus1plus1') {
    if (mode === 'plus2') {
      onChange({ type: 'asi', mode: 'plus2', ability: ABILITIES[0] });
    } else {
      const prev2 = ability2 ?? ABILITIES[1];
      onChange({
        type: 'asi',
        mode: 'plus1plus1',
        ability1: ability1,
        ability2: prev2 === ability1 ? ABILITIES[2]! : prev2,
      });
    }
  }

  function setAbility1(a: AbilityName) {
    if (isPlus2) {
      onChange({ type: 'asi', mode: 'plus2', ability: a });
    } else {
      const a2 = ability2 !== a ? ability2 : (ABILITIES.find((x) => x !== a) ?? ABILITIES[1]!);
      onChange({ type: 'asi', mode: 'plus1plus1', ability1: a, ability2: a2! });
    }
  }

  function setAbility2(a: AbilityName) {
    onChange({ type: 'asi', mode: 'plus1plus1', ability1: ability1, ability2: a });
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <Button
          variant={isPlus2 ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setMode('plus2')}
          aria-pressed={isPlus2}
        >
          +2 to one
        </Button>
        <Button
          variant={!isPlus2 ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setMode('plus1plus1')}
          aria-pressed={!isPlus2}
        >
          +1 to two
        </Button>
      </div>

      {/* Ability picker(s) */}
      <div className={cn('flex gap-3', isPlus2 ? 'flex-col' : 'flex-col')}>
        <div className="flex flex-col gap-1">
          <Text variant="labelSm" color="secondary">
            {isPlus2 ? 'Choose an ability' : 'First ability'}
          </Text>
          <div className="flex flex-wrap gap-1.5">
            {ABILITIES.map((ability) => {
              const selected = ability === ability1;
              const score = getTotalScore(scores, ability);
              const mod = getModifier(score);
              return (
                <button
                  key={ability}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={`${ability} ${score} (${mod >= 0 ? '+' : ''}${mod})`}
                  onClick={() => setAbility1(ability)}
                  disabled={!isPlus2 && ability === ability2}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md border px-2 py-1 text-sm transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600',
                    'disabled:cursor-not-allowed disabled:opacity-40',
                    selected
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-border hover:bg-bg-tertiary',
                  )}
                >
                  {selected && <Check className="h-3 w-3 text-primary-600" aria-hidden="true" />}
                  <Text as="span" variant="bodySm">
                    {ability.slice(0, 3)}
                  </Text>
                  <Text as="span" variant="labelSm" color="secondary">
                    {score} ({mod >= 0 ? '+' : ''}
                    {mod})
                  </Text>
                </button>
              );
            })}
          </div>
        </div>

        {!isPlus2 && (
          <div className="flex flex-col gap-1">
            <Text variant="labelSm" color="secondary">
              Second ability
            </Text>
            <div className="flex flex-wrap gap-1.5">
              {ABILITIES.map((ability) => {
                const selected = ability === ability2;
                const score = getTotalScore(scores, ability);
                const mod = getModifier(score);
                return (
                  <button
                    key={ability}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={`${ability} ${score} (${mod >= 0 ? '+' : ''}${mod})`}
                    onClick={() => setAbility2(ability)}
                    disabled={ability === ability1}
                    className={cn(
                      'flex items-center gap-1.5 rounded-md border px-2 py-1 text-sm transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600',
                      'disabled:cursor-not-allowed disabled:opacity-40',
                      selected
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-border hover:bg-bg-tertiary',
                    )}
                  >
                    {selected && <Check className="h-3 w-3 text-primary-600" aria-hidden="true" />}
                    <Text as="span" variant="bodySm">
                      {ability.slice(0, 3)}
                    </Text>
                    <Text as="span" variant="labelSm" color="secondary">
                      {score} ({mod >= 0 ? '+' : ''}
                      {mod})
                    </Text>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
