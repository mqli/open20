// CharacterEditDialog.tsx (T-121, FR-145)
// Single scrollable edit form for character identity fields.
// Reads the active character from the store, lets the user modify name,
// species, lineage, background, classes and ability scores, then calls
// store.updateCharacter() which recomputes derived stats and persists.

import { useMemo, useState } from 'react';
import { Button, Dialog, Input, Surface, Text } from '@open20/ui';
import type { AbilityName, DieType, CharacterClass } from 'open20-core';
import { useCharacterStore } from '@/stores/characterStore';
import { initContent } from '@/core/content-resolver';
import {
  getAllBackgrounds,
  getAllClasses,
  getAllSpecies,
  getAllSubclassesForClass,
  getSpeciesById,
} from '@/core/content-resolver';
import {
  canDecrementPointBuy,
  canIncrementPointBuy,
  canSwapStandardArray,
  defaultScoresFor,
  pointsRemaining,
  swapStandardArray,
  validateAbilityScores,
  type AbilityScoreMethod,
  type Scores,
} from '@/lib/point-buy';
import {
  OptionGrid,
  type GridOption,
} from '@/components/character/CharacterCreateWizard/OptionGrid';
import type { AppCharacter } from '@/types';
import type { ClassEntry } from '@/components/character/CharacterCreateWizard/ClassesStep';

const MAX_TOTAL_LEVEL = 20;
const ABILITY_NAMES: AbilityName[] = [
  'Strength',
  'Dexterity',
  'Constitution',
  'Intelligence',
  'Wisdom',
  'Charisma',
];

const NONE = '__none__';

// ── helpers ────────────────────────────────────────────────────────────────

function abilityBonusSummary(bonuses: Partial<Record<string, number>>): string | undefined {
  const entries = Object.entries(bonuses).filter(([, v]) => typeof v === 'number' && v !== 0);
  if (entries.length === 0) return undefined;
  return entries.map(([ability, v]) => `${ability.slice(0, 3).toUpperCase()} +${v}`).join(' ');
}

// ── draft ──────────────────────────────────────────────────────────────────

interface EditDraft {
  name: string;
  species: string;
  speciesSubtype: string | null;
  background: string;
  classes: ClassEntry[];
  method: AbilityScoreMethod;
  scores: Scores;
}

function draftFromCharacter(char: AppCharacter): EditDraft {
  return {
    name: char.name,
    species: char.species,
    speciesSubtype: char.speciesSubtype,
    background: char.background,
    classes: char.classes.map((c) => ({
      classId: c.classId,
      level: c.level,
      subclassId: c.subclassId ?? undefined,
    })),
    method: 'manual',
    scores: { ...char.abilityScores.base },
  };
}

// ── props ──────────────────────────────────────────────────────────────────

export interface CharacterEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ── component ──────────────────────────────────────────────────────────────

export function CharacterEditDialog({ open, onOpenChange }: CharacterEditDialogProps) {
  const activeChar = useCharacterStore((s) => s.character);
  const storeUpdateCharacter = useCharacterStore((s) => s.updateCharacter);

  initContent();

  // Pre-compute per-class state from the character (hit dice usage + subclass level).
  const classStateMap = useMemo(() => {
    const map = new Map<string, { die: DieType; used: number; subclassLevel: number | null }>();
    if (activeChar) {
      for (const c of activeChar.classes) {
        map.set(c.classId, {
          die: c.hitDice.die,
          used: c.hitDice.used,
          subclassLevel: c.subclassLevel,
        });
      }
    }
    return map;
  }, [activeChar]);

  // Draft state — reset when dialog opens.
  const [draft, setDraft] = useState<EditDraft | null>(null);

  const [wasOpen, setWasOpen] = useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open && activeChar) {
      setDraft(draftFromCharacter(activeChar));
    } else if (!open) {
      setDraft(null);
    }
  }

  // On the VERY FIRST render after opening, `draft` is still null because
  // setDraft hasn't taken effect yet. Compute a fallback draft synchronously
  // so the component never renders a null dialog.
  const effectiveDraft = draft ?? (open && activeChar ? draftFromCharacter(activeChar) : null);

  // ── options computed from content (must be before any early return — hooks) ──

  const speciesOptions = useMemo<GridOption[]>(
    () =>
      getAllSpecies().map((species) => ({
        id: species.id,
        label: species.id,
        sublabel: abilityBonusSummary(species.abilityBonuses),
      })),
    [],
  );

  const subtypeOptions = useMemo<GridOption[]>(() => {
    const speciesId = effectiveDraft?.species ?? '';
    const subtypes = speciesId ? (getSpeciesById(speciesId)?.subtypes ?? []) : [];
    if (subtypes.length === 0) return [];
    return [
      { id: NONE, label: 'None' },
      ...subtypes.map((subtype) => ({ id: subtype.id, label: subtype.name })),
    ];
  }, [effectiveDraft?.species]);

  const backgroundOptions = useMemo<GridOption[]>(
    () =>
      getAllBackgrounds().map((bg) => ({
        id: bg.id,
        label: bg.name ?? bg.id,
        sublabel: bg.skillProficiencies.join(', '),
      })),
    [],
  );

  const classOptions = useMemo<GridOption[]>(
    () =>
      getAllClasses().map((cls) => ({
        id: cls.id,
        label: cls.name,
        sublabel: cls.hitDie ? `d${cls.hitDie}` : undefined,
      })),
    [],
  );

  const subclassOptionsList = useMemo(
    () =>
      effectiveDraft?.classes.map((entry): GridOption[] => {
        if (!entry.classId) return [];
        return getAllSubclassesForClass(entry.classId)
          .filter((sub) => sub.grantedAtLevel <= entry.level)
          .map((sub) => ({
            id: sub.id,
            label: sub.id.replace(/\*+$/, ''),
          }));
      }) ?? [],
    [effectiveDraft?.classes],
  );

  // ── early return — no hooks after this point ─────────────────────────

  if (!open || !activeChar || !effectiveDraft) return null;

  const patch = (partial: Partial<EditDraft>): void => {
    const next = draft ? { ...draft, ...partial } : { ...effectiveDraft, ...partial };
    setDraft(next);
  };

  const totalLevel = effectiveDraft.classes.reduce((sum, c) => sum + c.level, 0);

  const canAddClass =
    effectiveDraft.classes.length < getAllClasses().length && totalLevel < MAX_TOTAL_LEVEL;

  // ── ability score helpers ─────────────────────────────────────────────

  const method = effectiveDraft.method;
  const scores = effectiveDraft.scores;
  const scoreValidation = validateAbilityScores(method, scores);

  const abilityScoreLabel = (ability: AbilityName): string => {
    const bonus = Math.floor((scores[ability] - 10) / 2);
    return `${scores[ability]} (${bonus >= 0 ? '+' : ''}${bonus})`;
  };

  // ── save handler ───────────────────────────────────────────────────────

  const handleSave = (): void => {
    if (!activeChar) return;
    const classes = effectiveDraft.classes.map((entry) => {
      const existing = classStateMap.get(entry.classId);
      return {
        classId: entry.classId,
        level: entry.level,
        subclassId: entry.subclassId ?? null,
        subclassLevel: existing?.subclassLevel ?? (entry.subclassId ? entry.level : null),
        hitDice: existing
          ? { die: existing.die, used: Math.min(existing.used, entry.level) }
          : { die: 'd8' as DieType, used: 0 },
      } satisfies CharacterClass;
    });
    storeUpdateCharacter({
      name: effectiveDraft.name.trim(),
      species: effectiveDraft.species,
      speciesSubtype: effectiveDraft.speciesSubtype,
      background: effectiveDraft.background,
      classes,
      abilityScores: { base: effectiveDraft.scores },
    });
    onOpenChange(false);
  };

  const saveDisabled =
    effectiveDraft.name.trim() === '' ||
    effectiveDraft.species === '' ||
    effectiveDraft.background === '' ||
    effectiveDraft.classes.some((c) => c.classId === '') ||
    !scoreValidation.valid;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content size="lg" className="max-h-[85vh] overflow-y-auto">
        <Dialog.Header>
          <Dialog.Title>Edit Character</Dialog.Title>
          <Dialog.Description>
            Modify character identity fields. Changes trigger stat recomputation.
          </Dialog.Description>
        </Dialog.Header>

        <div className="flex flex-col gap-6">
          {/* Name */}
          <div className="flex flex-col gap-2">
            <label htmlFor="edit-character-name">
              <Text as="span" variant="labelSm" color="secondary">
                Character name
              </Text>
            </label>
            <Input
              id="edit-character-name"
              value={effectiveDraft.name}
              onChange={(e) => patch({ name: e.target.value })}
            />
          </div>

          {/* Species */}
          <OptionGrid
            legend="Species"
            options={speciesOptions}
            value={effectiveDraft.species}
            onChange={(id) => patch({ species: id, speciesSubtype: null })}
          />

          {/* Lineage */}
          {subtypeOptions.length > 0 && (
            <OptionGrid
              legend="Lineage (optional)"
              options={subtypeOptions}
              value={effectiveDraft.speciesSubtype ?? NONE}
              onChange={(id) => patch({ speciesSubtype: id === NONE ? null : id })}
            />
          )}

          {/* Background */}
          <OptionGrid
            legend="Background"
            options={backgroundOptions}
            value={effectiveDraft.background}
            onChange={(id) => patch({ background: id })}
          />

          {/* Classes */}
          <div className="flex flex-col gap-3">
            <Text variant="labelSm" color="secondary">
              Classes
            </Text>
            {effectiveDraft.classes.map((entry, index) => {
              const takenElsewhere = new Set(
                effectiveDraft.classes.filter((_, i) => i !== index).map((other) => other.classId),
              );
              const subclassOptions = subclassOptionsList[index] ?? [];

              return (
                <Surface key={index} padding="sm" className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Text variant="bodySm" weight="bold">
                      {index === 0 ? 'Primary class' : `Class ${index + 1}`}
                    </Text>
                    {effectiveDraft.classes.length > 1 && index > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Remove ${entry.classId || 'class'}`}
                        onClick={() =>
                          patch({ classes: effectiveDraft.classes.filter((_, i) => i !== index) })
                        }
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <OptionGrid
                    legend="Class"
                    options={classOptions.map((o) => ({
                      ...o,
                      disabled: takenElsewhere.has(o.id),
                    }))}
                    value={entry.classId}
                    onChange={(classId) => {
                      const next = [...effectiveDraft.classes];
                      next[index] = { ...next[index], classId, subclassId: undefined };
                      patch({ classes: next });
                    }}
                  />

                  {/* Level stepper */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={entry.level <= 1}
                      aria-label={`Decrease ${entry.classId || 'class'} level`}
                      onClick={() => {
                        const next = [...effectiveDraft.classes];
                        next[index] = { ...next[index], level: entry.level - 1 };
                        patch({ classes: next });
                      }}
                    >
                      -
                    </Button>
                    <Text variant="bodySm">Level {entry.level}</Text>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={entry.level >= MAX_TOTAL_LEVEL || totalLevel >= MAX_TOTAL_LEVEL}
                      aria-label={`Increase ${entry.classId || 'class'} level`}
                      onClick={() => {
                        const next = [...effectiveDraft.classes];
                        next[index] = { ...next[index], level: entry.level + 1 };
                        patch({ classes: next });
                      }}
                    >
                      +
                    </Button>
                  </div>

                  {/* Subclass */}
                  {entry.classId && subclassOptions.length > 0 && (
                    <OptionGrid
                      legend="Subclass"
                      options={subclassOptions}
                      value={entry.subclassId}
                      onChange={(subclassId) => {
                        const next = [...effectiveDraft.classes];
                        next[index] = { ...next[index], subclassId };
                        patch({ classes: next });
                      }}
                    />
                  )}
                  {entry.classId && subclassOptions.length === 0 && (
                    <Text variant="labelSm" color="secondary">
                      Subclass unlocks at level 3
                    </Text>
                  )}
                </Surface>
              );
            })}

            {canAddClass && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  patch({
                    classes: [...effectiveDraft.classes, { classId: '', level: 1 }],
                  })
                }
              >
                Add Class (multiclass)
              </Button>
            )}
            <Text variant="labelSm" color="secondary">
              Total level: {totalLevel} / {MAX_TOTAL_LEVEL}
            </Text>
          </div>

          {/* Ability Scores */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Text variant="labelSm" color="secondary">
                Ability Scores
              </Text>
              <div
                className="flex gap-1 rounded bg-bg-tertiary p-0.5"
                role="group"
                aria-label="Score method"
              >
                {(['point-buy', 'standard-array', 'manual'] as AbilityScoreMethod[]).map((m) => (
                  <Button
                    key={m}
                    variant={method === m ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() =>
                      patch({
                        method: m,
                        scores: m === method ? scores : defaultScoresFor(m),
                      })
                    }
                  >
                    {m === 'point-buy'
                      ? 'Point Buy'
                      : m === 'standard-array'
                        ? 'Standard'
                        : 'Manual'}
                  </Button>
                ))}
              </div>
            </div>

            {method === 'point-buy' && (
              <Text variant="labelSm" color="secondary">
                Budget: {pointsRemaining(scores)} / 27 points remaining
              </Text>
            )}

            {ABILITY_NAMES.map((ability) => (
              <div key={ability} className="flex items-center gap-3">
                <Text variant="bodySm" weight="bold" className="w-24 shrink-0">
                  {ability.slice(0, 3).toUpperCase()}
                </Text>

                {method === 'standard-array' ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!canSwapStandardArray(scores, ability, -1)}
                      aria-label={`Decrease ${ability}`}
                      onClick={() => patch({ scores: swapStandardArray(scores, ability, -1) })}
                    >
                      -
                    </Button>
                    <Text variant="bodySm" className="w-8 text-center">
                      {scores[ability]}
                    </Text>
                    <Text variant="labelSm" color="secondary">
                      {abilityScoreLabel(ability)}
                    </Text>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!canSwapStandardArray(scores, ability, 1)}
                      aria-label={`Increase ${ability}`}
                      onClick={() => patch({ scores: swapStandardArray(scores, ability, 1) })}
                    >
                      +
                    </Button>
                  </>
                ) : method === 'manual' ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={scores[ability] <= 1}
                      aria-label={`Decrease ${ability} score`}
                      onClick={() =>
                        patch({ scores: { ...scores, [ability]: scores[ability] - 1 } })
                      }
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      aria-label={`${ability} score`}
                      value={scores[ability]}
                      className="w-16 text-center"
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        if (!isNaN(v)) {
                          patch({ scores: { ...scores, [ability]: v } });
                        }
                      }}
                    />
                    <Text variant="labelSm" color="secondary">
                      {abilityScoreLabel(ability)}
                    </Text>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={scores[ability] >= 20}
                      aria-label={`Increase ${ability} score`}
                      onClick={() =>
                        patch({ scores: { ...scores, [ability]: scores[ability] + 1 } })
                      }
                    >
                      +
                    </Button>
                  </>
                ) : (
                  // point-buy mode
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!canDecrementPointBuy(scores, ability)}
                      aria-label={`Decrease ${ability}`}
                      onClick={() =>
                        patch({ scores: { ...scores, [ability]: scores[ability] - 1 } })
                      }
                    >
                      -
                    </Button>
                    <Text variant="bodySm" className="w-8 text-center">
                      {scores[ability]}
                    </Text>
                    <Text variant="labelSm" color="secondary">
                      {abilityScoreLabel(ability)}
                    </Text>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!canIncrementPointBuy(scores, ability)}
                      aria-label={`Increase ${ability}`}
                      onClick={() =>
                        patch({ scores: { ...scores, [ability]: scores[ability] + 1 } })
                      }
                    >
                      +
                    </Button>
                  </>
                )}
              </div>
            ))}

            {scoreValidation.errors.length > 0 && (
              <Surface variant="warning" padding="sm" role="alert">
                {scoreValidation.errors.map((err, i) => (
                  <Text key={i} variant="bodySm">
                    {err}
                  </Text>
                ))}
              </Surface>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="primary" disabled={saveDisabled} onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
