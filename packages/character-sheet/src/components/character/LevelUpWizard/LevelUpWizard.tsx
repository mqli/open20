// LevelUpWizard.tsx (T-211, T-212)
// Multi-step level-up wizard: class → features → subclass → ASI/feat → HP.
// Steps 2 (Subclass) and 3 (ASI/Feat) are conditional — skipped when not applicable.
// Collects complete LevelUpOptions and calls store.levelUp on finish.

import { useEffect, useMemo, useState } from 'react';
import { Button, Dialog, cn } from '@open20/ui';
import { getModifier, getTotalScore, type AbilityName, type Character } from 'open20-core';
import { useCharacterStore } from '@/stores/characterStore';
import { getClassById, initContent, getAllSubclassesForClass } from '@/core/content-resolver';
import { ClassStep } from './ClassStep';
import { FeaturesStep } from './FeaturesStep';
import { SubclassStep } from './SubclassStep';
import { ASIFeatStep, type WizardASIFeat } from './ASIFeatStep';
import { HPStep } from './HPStep';

// ── Helpers ──

/**
 * Convert internal wizard selection to core LevelUpOptions.asiOrFeat.
 * Skip selections become undefined; ASI and feat selections are mapped
 * to the core format.
 */
function wizardToCoreASIFeat(
  selection: WizardASIFeat | null,
):
  | { type: 'asi' | 'feat'; asi?: Partial<Record<AbilityName, number>>; featId?: string }
  | undefined {
  if (!selection || selection.type === 'Skip') return undefined;
  if (selection.type === 'asi') {
    if (selection.mode === 'plus2') {
      return { type: 'asi', asi: { [selection.ability]: 2 } };
    }
    return {
      type: 'asi',
      asi: { [selection.ability1]: 1, [selection.ability2]: 1 },
    };
  }
  return { type: 'feat', featId: selection.featId };
}

// ── Step definitions ──

interface StepInfo {
  id: string;
  title: string;
}

const ALL_STEP_TITLES = {
  class: 'Class',
  features: 'Features',
  subclass: 'Subclass',
  asiFeat: 'ASI/Feat',
  hp: 'Hit Points',
} as const;

// ── Condition helpers ──

/** ASI levels in D&D 5e 2024. */
const ASI_LEVELS = new Set([4, 8, 12, 16, 19]);

function shouldShowSubclass(classId: string, newLevel: number, character: Character): boolean {
  // Already has a subclass — don't re-present the picker.
  const existing = character.classes.find((c) => c.classId === classId);
  if (existing?.subclassId) return false;
  const subclasses = getAllSubclassesForClass(classId);
  if (subclasses.length === 0) return false;
  return newLevel >= Math.min(...subclasses.map((s) => s.grantedAtLevel));
}

function shouldShowASI(newLevel: number): boolean {
  return ASI_LEVELS.has(newLevel);
}

// ── Wizard state ──

interface WizardDraft {
  classId: string;
  subclassId: string | null;
  asiOrFeat: WizardASIFeat | null;
  hpChoice: 'fixed' | 'roll';
}

interface DraftMeta {
  isNewClass: boolean;
}

function initialDraft(): WizardDraft {
  return { classId: '', subclassId: null, asiOrFeat: null, hpChoice: 'fixed' };
}

// ── Component ──

export interface LevelUpWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LevelUpWizard({ open, onOpenChange }: LevelUpWizardProps) {
  const character = useCharacterStore((s) => s.character);
  const levelUp = useCharacterStore((s) => s.levelUp);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<WizardDraft>(initialDraft);
  const [meta, setMeta] = useState<DraftMeta>({ isNewClass: false });

  useEffect(() => {
    initContent();
  }, []);

  // Reset the draft each time the dialog opens.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setStep(0);
      setDraft(initialDraft());
      setMeta({ isNewClass: false });
    }
  }

  // ── Derived data ──

  /** The level this character will be at after level-up. */
  const newLevel = useMemo(() => {
    if (!draft.classId || !character) return 1;
    const existing = character.classes.find((c) => c.classId === draft.classId);
    return existing ? existing.level + 1 : 1;
  }, [draft.classId, character]);

  /** Compute which steps are applicable (conditional steps are skipped). */
  const steps = useMemo((): StepInfo[] => {
    const s: StepInfo[] = [];
    s.push({ id: 'class', title: ALL_STEP_TITLES.class });
    if (draft.classId) {
      s.push({ id: 'features', title: ALL_STEP_TITLES.features });
      if (shouldShowSubclass(draft.classId, newLevel, character as Character)) {
        s.push({ id: 'subclass', title: ALL_STEP_TITLES.subclass });
      }
      if (shouldShowASI(newLevel)) {
        s.push({ id: 'asiFeat', title: ALL_STEP_TITLES.asiFeat });
      }
      s.push({ id: 'hp', title: ALL_STEP_TITLES.hp });
    }
    return s;
  }, [draft.classId, newLevel, character]);

  const totalSteps = steps.length;
  const currentStep = steps[step];
  const isLastStep = step === totalSteps - 1;

  // ── Step validity ──

  const stepValid = useMemo(() => {
    if (!currentStep) return false;
    switch (currentStep.id) {
      case 'class':
        return draft.classId !== '';
      case 'features':
        return true; // informational only
      case 'subclass':
        return true; // subclassId can be null (None)
      case 'asiFeat':
        return true; // can be Skip
      case 'hp':
        return true; // defaults to 'fixed'
      default:
        return false;
    }
  }, [currentStep, draft.classId]);

  const selectedClass = useMemo(
    () => (draft.classId ? getClassById(draft.classId) : undefined),
    [draft.classId],
  );

  const conMod = useMemo(() => {
    if (!character) return 0;
    return getModifier(getTotalScore(character.abilityScores, 'Constitution'));
  }, [character]);

  // ── State helpers ──

  function patch(partial: Partial<WizardDraft>) {
    setDraft((prev) => ({ ...prev, ...partial }));
  }

  function handleClassChange(classId: string, isNewClass: boolean) {
    patch({ classId, subclassId: null, asiOrFeat: null });
    setMeta({ isNewClass });
  }

  function handleFinish() {
    if (!character) return;
    levelUp({
      classId: draft.classId,
      subclassId: draft.subclassId ?? undefined,
      hpChoice: draft.hpChoice,
      asiOrFeat: wizardToCoreASIFeat(draft.asiOrFeat),
      isNewClass: meta.isNewClass || undefined,
    });
    onOpenChange(false);
  }

  // Bail out if no character.
  if (!character) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content size="lg">
        <Dialog.Header>
          <Dialog.Title>Level Up</Dialog.Title>
          <Dialog.Description>
            Step {step + 1} of {totalSteps}: {currentStep?.title}
          </Dialog.Description>
        </Dialog.Header>

        {/* Progress bar */}
        <div className="mb-4 flex gap-1" aria-hidden="true">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className={cn('h-1 flex-1 rounded-full', i <= step ? 'bg-primary-600' : 'bg-border')}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="mb-4">
          {currentStep?.id === 'class' && (
            <ClassStep character={character} classId={draft.classId} onChange={handleClassChange} />
          )}
          {currentStep?.id === 'features' && (
            <FeaturesStep classId={draft.classId} newLevel={newLevel} />
          )}
          {currentStep?.id === 'subclass' && (
            <SubclassStep
              classId={draft.classId}
              newLevel={newLevel}
              subclassId={draft.subclassId}
              onChange={(subclassId) => patch({ subclassId })}
            />
          )}
          {currentStep?.id === 'asiFeat' && (
            <ASIFeatStep
              character={character}
              asiOrFeat={draft.asiOrFeat}
              onChange={(asiOrFeat) => patch({ asiOrFeat })}
            />
          )}
          {currentStep?.id === 'hp' && selectedClass && (
            <HPStep
              classDisplayName={selectedClass.name}
              dieType={selectedClass.hitDie}
              conMod={conMod}
              hpChoice={draft.hpChoice}
              onChange={(hpChoice) => patch({ hpChoice })}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-end gap-2">
          {step === 0 ? (
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          {isLastStep ? (
            <Button variant="primary" disabled={!stepValid} onClick={handleFinish}>
              Level Up
            </Button>
          ) : (
            <Button variant="primary" disabled={!stepValid} onClick={() => setStep((s) => s + 1)}>
              Next
            </Button>
          )}
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
