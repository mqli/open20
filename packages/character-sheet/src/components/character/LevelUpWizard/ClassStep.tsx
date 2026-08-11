// ClassStep.tsx (T-211)
// Step 1 of the level-up wizard: choose which class to advance or add a new class.
// Uses OptionGrid (same picker primitive as CharacterCreateWizard) to list all
// SRD classes. Existing character classes are listed first with their current
// level and hit die; non-chosen classes appear as "New class".

import { useMemo } from 'react';
import type { Character } from 'open20-core';
import { getAllClasses } from '@/core/content-resolver';
import { OptionGrid } from '@/components/character/CharacterCreateWizard/OptionGrid';
import type { GridOption } from '@/components/character/CharacterCreateWizard/OptionGrid';

export interface ClassStepProps {
  /** Current character snapshot (to read existing class levels). */
  character: Character;
  /** Currently selected classId, or '' for none. */
  classId: string;
  /** Called when the user selects a class. */
  onChange: (classId: string, isNewClass: boolean) => void;
  className?: string;
}

export function ClassStep({ character, classId, onChange, className }: ClassStepProps) {
  const allClasses = getAllClasses();

  // Index existing classes for fast lookup.
  const classMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of character.classes) {
      map.set(c.classId, c.level);
    }
    return map;
  }, [character.classes]);

  const options: GridOption[] = useMemo(() => {
    const existing: GridOption[] = [];
    const available: GridOption[] = [];

    for (const klass of allClasses) {
      const level = classMap.get(klass.id);
      if (level !== undefined) {
        const atCap = level >= 20;
        existing.push({
          id: klass.id,
          label: klass.name,
          sublabel: atCap
            ? `Level ${level} (max) · ${klass.hitDie}`
            : `Level ${level} · ${klass.hitDie}`,
          disabled: atCap,
        });
      } else {
        available.push({
          id: klass.id,
          label: klass.name,
          sublabel: `New class · ${klass.hitDie}`,
        });
      }
    }

    return [...existing, ...available];
  }, [allClasses, classMap]);

  function handleChange(id: string) {
    const isNew = !classMap.has(id);
    onChange(id, isNew);
  }

  return (
    <OptionGrid
      legend="Choose a class to advance"
      options={options}
      value={classId}
      onChange={handleChange}
      className={className}
    />
  );
}
