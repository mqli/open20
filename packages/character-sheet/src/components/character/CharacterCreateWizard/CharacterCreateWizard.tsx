// CharacterCreateWizard.tsx (T-120, FR-144) — §7.4
// Three-step character creation: basics → classes → ability scores.
// The component only collects a draft; the store owns deps resolution, the core
// call, the id and persistence.

import { useMemo, useState } from 'react';
import { Button, Dialog, Surface, Text, cn } from '@open20/ui';
import {
  defaultScoresFor,
  validateAbilityScores,
  type AbilityScoreMethod,
  type Scores,
  type AbilityName,
} from 'open20-core';
import { useCharacterStore, type CreateCharacterInput } from '@/stores/characterStore';
import { getBackgroundById, initContent } from '@/core/content-resolver';
import { BasicsStep } from './BasicsStep';
import { ClassesStep, MAX_TOTAL_LEVEL, type ClassEntry } from './ClassesStep';
import { AbilityScoresStep } from './AbilityScoresStep';

const STEP_TITLES = ['Basics', 'Class', 'Ability Scores'] as const;
type StepIndex = 0 | 1 | 2;

interface WizardDraft {
  name: string;
  speciesId: string;
  speciesSubtypeId?: string;
  backgroundId: string;
  classes: ClassEntry[];
  method: AbilityScoreMethod;
  scores: Scores;
}

function initialDraft(): WizardDraft {
  return {
    name: '',
    speciesId: '',
    backgroundId: '',
    classes: [{ classId: '', level: 1 }],
    method: 'point-buy',
    scores: defaultScoresFor('point-buy'),
  };
}

export interface CharacterCreateWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CharacterCreateWizard({ open, onOpenChange }: CharacterCreateWizardProps) {
  const createCharacter = useCharacterStore((s) => s.createCharacter);
  const [step, setStep] = useState<StepIndex>(0);
  const [draft, setDraft] = useState<WizardDraft>(initialDraft);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // The wizard can be the first thing rendered (empty state), so the content
  // pack may not be initialised yet. Idempotent.
  initContent();

  // Reset the draft each time the dialog opens. Done during render rather than
  // in an effect — React's recommended way to adjust state on a prop change,
  // and it avoids a cascading re-render.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setStep(0);
      setDraft(initialDraft());
      setSubmitError(null);
    }
  }

  const patch = (partial: Partial<WizardDraft>): void =>
    setDraft((prev) => ({ ...prev, ...partial }));

  const stepValid = useMemo(() => {
    if (step === 0) {
      return draft.name.trim() !== '' && draft.speciesId !== '' && draft.backgroundId !== '';
    }
    if (step === 1) {
      const ids = draft.classes.map((entry) => entry.classId);
      const total = draft.classes.reduce((sum, entry) => sum + entry.level, 0);
      return (
        draft.classes.length >= 1 &&
        ids.every((id) => id !== '') &&
        new Set(ids).size === ids.length &&
        draft.classes.every((entry) => entry.level >= 1 && entry.level <= MAX_TOTAL_LEVEL) &&
        total <= MAX_TOTAL_LEVEL
      );
    }
    return validateAbilityScores(draft.method, draft.scores).valid;
  }, [step, draft]);

  const handleFinish = (): void => {
    const [primary, ...additional] = draft.classes;
    // 2024 backgrounds grant an Origin Feat, but core's createCharacter only
    // adds feats listed in `featIds` — it never reads `background.originFeatId`.
    const originFeatId = getBackgroundById(draft.backgroundId)?.originFeatId;
    const input: CreateCharacterInput = {
      name: draft.name.trim(),
      speciesId: draft.speciesId,
      speciesSubtypeId: draft.speciesSubtypeId,
      backgroundId: draft.backgroundId,
      classId: primary.classId,
      classLevel: primary.level,
      subclassId: primary.subclassId,
      abilityScores: draft.scores as Record<AbilityName, number>,
      ...(originFeatId ? { featIds: [originFeatId] } : {}),
      ...(additional.length > 0
        ? {
            additionalClasses: additional.map((entry) => ({
              classId: entry.classId,
              level: entry.level,
              subclassId: entry.subclassId,
            })),
          }
        : {}),
    };

    const id = createCharacter(input);
    if (id) {
      onOpenChange(false);
      return;
    }
    // Keep the dialog open so the draft survives and the user can go back.
    setSubmitError(useCharacterStore.getState().error ?? 'Could not create character.');
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content size="lg">
        <Dialog.Header>
          <Dialog.Title>Create Character</Dialog.Title>
          <Dialog.Description>
            Step {step + 1} of {STEP_TITLES.length}: {STEP_TITLES[step]}
          </Dialog.Description>
        </Dialog.Header>

        {/* Progress bar — the step text above is the non-colour cue (NFR-01). */}
        <div className="mb-4 flex gap-1" aria-hidden="true">
          {STEP_TITLES.map((title, i) => (
            <div
              key={title}
              className={cn('h-1 flex-1 rounded-full', i <= step ? 'bg-primary-600' : 'bg-border')}
            />
          ))}
        </div>

        <div className="mb-4">
          {step === 0 && (
            <BasicsStep
              name={draft.name}
              speciesId={draft.speciesId}
              speciesSubtypeId={draft.speciesSubtypeId}
              backgroundId={draft.backgroundId}
              onChange={patch}
            />
          )}
          {step === 1 && (
            <ClassesStep classes={draft.classes} onChange={(classes) => patch({ classes })} />
          )}
          {step === 2 && (
            <AbilityScoresStep method={draft.method} scores={draft.scores} onChange={patch} />
          )}
        </div>

        {submitError && (
          <Surface variant="warning" padding="sm" className="mb-4" role="alert">
            <Text variant="bodySm">{submitError}</Text>
          </Surface>
        )}

        <div className="flex justify-end gap-2">
          {step === 0 ? (
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => setStep((s) => (s - 1) as StepIndex)}>
              Back
            </Button>
          )}
          {step < 2 ? (
            <Button
              variant="primary"
              disabled={!stepValid}
              onClick={() => setStep((s) => (s + 1) as StepIndex)}
            >
              Next
            </Button>
          ) : (
            <Button variant="primary" disabled={!stepValid} onClick={handleFinish}>
              Create Character
            </Button>
          )}
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
