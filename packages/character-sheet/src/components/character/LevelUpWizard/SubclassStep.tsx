// SubclassStep.tsx (T-212)
// Subclass picker step — only shown when the new level reaches the class's
// subclass unlock level. Uses OptionGrid with "None" as a valid skip option.

import { useMemo } from 'react';
import { Text, cn } from '@open20/ui';
import { getAllSubclassesForClass } from '@/core/content-resolver';
import { OptionGrid } from '@/components/character/CharacterCreateWizard/OptionGrid';

const NONE = '__none__';

/** SRD subclass ids may carry stray markdown (e.g. "College of Lore**") — strip for label. */
function subclassLabel(id: string): string {
  return id.replace(/\*+$/, '');
}

export interface SubclassStepProps {
  /** Selected class for subclass lookup. */
  classId: string;
  /** The new level after level-up (current + 1). */
  newLevel: number;
  /** Current subclass selection, or null for none. */
  subclassId: string | null;
  /** Called when the user selects a subclass or "None". */
  onChange: (subclassId: string | null) => void;
  className?: string;
}

export function SubclassStep({
  classId,
  newLevel,
  subclassId,
  onChange,
  className,
}: SubclassStepProps) {
  const allSubclasses = getAllSubclassesForClass(classId);

  const unlocked = useMemo(
    () => allSubclasses.filter((sub) => newLevel >= sub.grantedAtLevel),
    [allSubclasses, newLevel],
  );

  const unlocksAt = useMemo(() => {
    if (allSubclasses.length === 0) return null;
    return Math.min(...allSubclasses.map((sub) => sub.grantedAtLevel));
  }, [allSubclasses]);

  // Show placeholder when no subclasses are unlocked yet.
  if (unlocked.length === 0) {
    return (
      <div className={cn('flex flex-col gap-3', className)}>
        <Text variant="labelSm" color="secondary">
          Subclass
        </Text>
        {unlocksAt !== null ? (
          <Text variant="bodySm" color="secondary">
            Subclass unlocks at level {unlocksAt}
          </Text>
        ) : (
          <Text variant="bodySm" color="secondary">
            No subclasses available for this class.
          </Text>
        )}
      </div>
    );
  }

  return (
    <OptionGrid
      legend="Subclass"
      options={[
        { id: NONE, label: 'None' },
        ...unlocked.map((sub) => ({ id: sub.id, label: subclassLabel(sub.id) })),
      ]}
      value={subclassId ?? NONE}
      onChange={(id) => onChange(id === NONE ? null : id)}
      className={className}
    />
  );
}
