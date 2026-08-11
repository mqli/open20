// LevelUpWizard.tsx (T-211)
// 2-step level-up wizard: class selection → HP choice.
// Collects partial LevelUpOptions and calls store.levelUp on finish.
// Designed to be extended in T-212/T-213 with intermediate steps (subclass,
// ASI/feat, spells) inserted before the HP step.

import { useMemo, useState } from 'react';
import { Button, Dialog, cn } from '@open20/ui';
import { getModifier, getTotalScore } from 'open20-core';
import { useCharacterStore } from '@/stores/characterStore';
import { getClassById, initContent } from '@/core/content-resolver';
import { ClassStep } from './ClassStep';
import { HPStep } from './HPStep';

const STEP_TITLES = ['Class', 'Hit Points'] as const;
type StepIndex = 0 | 1;

interface WizardDraft {
  classId: string;
  hpChoice: 'fixed' | 'roll';
}

/** Track whether the selected class is new for multiclassing. */
interface DraftMeta {
  isNewClass: boolean;
}

function initialDraft(): WizardDraft {
  return { classId: '', hpChoice: 'fixed' };
}

export interface LevelUpWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LevelUpWizard({ open, onOpenChange }: LevelUpWizardProps) {
  const character = useCharacterStore((s) => s.character);
  const levelUp = useCharacterStore((s) => s.levelUp);
  const [step, setStep] = useState<StepIndex>(0);
  const [draft, setDraft] = useState<WizardDraft>(initialDraft);
  const [meta, setMeta] = useState<DraftMeta>({ isNewClass: false });

  // Content pack may not be initialised yet. Idempotent.
  initContent();

  // Reset the draft each time the dialog opens (same pattern as CharacterCreateWizard).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setStep(0);
      setDraft(initialDraft());
      setMeta({ isNewClass: false });
    }
  }

  const stepValid = useMemo(() => {
    if (step === 0) return draft.classId !== '';
    // Step 1 is always valid (hpChoice defaults to 'fixed').
    return true;
  }, [step, draft.classId]);

  function patch(partial: Partial<WizardDraft>) {
    setDraft((prev) => ({ ...prev, ...partial }));
  }

  function handleClassChange(classId: string, isNewClass: boolean) {
    patch({ classId });
    setMeta({ isNewClass });
  }

  function handleFinish() {
    if (!character) return;
    levelUp({
      classId: draft.classId,
      hpChoice: draft.hpChoice,
      isNewClass: meta.isNewClass || undefined,
    });
    onOpenChange(false);
  }

  // Derived data for the HP step.
  const selectedClass = useMemo(
    () => (draft.classId ? getClassById(draft.classId) : undefined),
    [draft.classId],
  );

  const conMod = useMemo(() => {
    if (!character) return 0;
    return getModifier(getTotalScore(character.abilityScores, 'Constitution'));
  }, [character]);

  // Bail out if no character (shouldn't happen since the trigger is disabled).
  if (!character) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content size="lg">
        <Dialog.Header>
          <Dialog.Title>Level Up</Dialog.Title>
          <Dialog.Description>
            Step {step + 1} of {STEP_TITLES.length}: {STEP_TITLES[step]}
          </Dialog.Description>
        </Dialog.Header>

        {/* Progress bar — step text above is the non-colour cue (NFR-01). */}
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
            <ClassStep character={character} classId={draft.classId} onChange={handleClassChange} />
          )}
          {step === 1 && selectedClass && (
            <HPStep
              classDisplayName={selectedClass.name}
              dieType={selectedClass.hitDie}
              conMod={conMod}
              hpChoice={draft.hpChoice}
              onChange={(hpChoice) => patch({ hpChoice })}
            />
          )}
        </div>

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
          {step < 1 ? (
            <Button
              variant="primary"
              disabled={!stepValid}
              onClick={() => setStep((s) => (s + 1) as StepIndex)}
            >
              Next
            </Button>
          ) : (
            <Button variant="primary" disabled={!stepValid} onClick={handleFinish}>
              Level Up
            </Button>
          )}
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
