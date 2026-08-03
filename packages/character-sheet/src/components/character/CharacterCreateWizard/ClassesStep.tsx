// ClassesStep.tsx (T-120, step 2) — §7.4
// Primary class + level + subclass, with multiclass add/remove.

import { useMemo } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { Button, Surface, Text } from '@open20/ui';
import { getAllClasses, getAllSubclassesForClass } from '@/core/content-resolver';
import { OptionGrid, type GridOption } from './OptionGrid';

export const MAX_TOTAL_LEVEL = 20;
const NONE = '__none__';

export interface ClassEntry {
  classId: string;
  level: number;
  subclassId?: string;
}

export interface ClassesStepProps {
  classes: ClassEntry[];
  onChange: (classes: ClassEntry[]) => void;
}

/** SRD subclass ids carry stray markdown (e.g. "College of Lore**") — label only. */
function subclassLabel(id: string): string {
  return id.replace(/\*+$/, '');
}

export function ClassesStep({ classes, onChange }: ClassesStepProps) {
  const allClasses = useMemo(() => getAllClasses(), []);
  const totalLevel = classes.reduce((sum, entry) => sum + entry.level, 0);
  const atLevelCap = totalLevel >= MAX_TOTAL_LEVEL;

  const patchEntry = (index: number, patch: Partial<ClassEntry>): void => {
    onChange(classes.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  };

  return (
    <div className="flex flex-col gap-5">
      {classes.map((entry, index) => {
        const takenElsewhere = new Set(
          classes.filter((_, i) => i !== index).map((other) => other.classId),
        );
        const classOptions: GridOption[] = allClasses.map((klass) => ({
          id: klass.id,
          label: klass.name,
          sublabel: klass.hitDie,
          disabled: takenElsewhere.has(klass.id),
        }));

        const allSubclasses = entry.classId ? getAllSubclassesForClass(entry.classId) : [];
        const unlocked = allSubclasses.filter((sub) => entry.level >= sub.grantedAtLevel);
        const unlocksAt =
          allSubclasses.length > 0
            ? Math.min(...allSubclasses.map((sub) => sub.grantedAtLevel))
            : null;
        const className = allClasses.find((k) => k.id === entry.classId)?.name;

        const setLevel = (level: number): void => {
          const clamped = Math.max(1, Math.min(level, MAX_TOTAL_LEVEL));
          // Dropping below the unlock level invalidates the chosen subclass.
          const stillUnlocked = allSubclasses.some(
            (sub) => sub.id === entry.subclassId && clamped >= sub.grantedAtLevel,
          );
          patchEntry(index, {
            level: clamped,
            subclassId: stillUnlocked ? entry.subclassId : undefined,
          });
        };

        return (
          <Surface key={index} variant="default" padding="md" className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Text variant="labelSm" color="secondary">
                {index === 0 ? 'Primary class' : `Additional class ${index}`}
              </Text>
              {index > 0 && (
                <Button
                  variant="ghost"
                  className="h-11 w-11 p-0"
                  aria-label={`Remove ${className ?? 'additional class'}`}
                  onClick={() => onChange(classes.filter((_, i) => i !== index))}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <OptionGrid
              legend="Class"
              options={classOptions}
              value={entry.classId}
              onChange={(id) => patchEntry(index, { classId: id, subclassId: undefined })}
            />

            <div className="flex items-center gap-3">
              <Text variant="labelSm" color="secondary">
                Level
              </Text>
              <Button
                variant="ghost"
                className="h-11 w-11 p-0"
                aria-label={`Decrease ${className ?? 'class'} level`}
                disabled={entry.level <= 1}
                onClick={() => setLevel(entry.level - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Text variant="body" weight="bold" className="w-8 text-center tabular-nums">
                {entry.level}
              </Text>
              <Button
                variant="ghost"
                className="h-11 w-11 p-0"
                aria-label={`Increase ${className ?? 'class'} level`}
                disabled={atLevelCap}
                onClick={() => setLevel(entry.level + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {unlocked.length > 0 ? (
              <OptionGrid
                legend="Subclass"
                options={[
                  { id: NONE, label: 'None' },
                  ...unlocked.map((sub) => ({ id: sub.id, label: subclassLabel(sub.id) })),
                ]}
                value={entry.subclassId ?? NONE}
                onChange={(id) => patchEntry(index, { subclassId: id === NONE ? undefined : id })}
              />
            ) : (
              unlocksAt !== null && (
                <Text variant="labelSm" color="secondary">
                  Subclass unlocks at level {unlocksAt}
                </Text>
              )
            )}
          </Surface>
        );
      })}

      <div className="flex items-center justify-between gap-2">
        <Text variant="labelSm" color="secondary" className="tabular-nums">
          Total level: {totalLevel} / {MAX_TOTAL_LEVEL}
        </Text>
        <Button
          variant="outline"
          onClick={() => onChange([...classes, { classId: '', level: 1 }])}
          disabled={atLevelCap || classes.length >= allClasses.length}
        >
          <Plus className="h-4 w-4" />
          Add Class (multiclass)
        </Button>
      </div>
    </div>
  );
}
