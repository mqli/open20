import { useState, useMemo } from 'react';
import type { AppCharacter } from '@/core/types';
import { DEFAULT_ABILITIES, generateAdditionalClassId } from './constants';
import type { CharacterFormData } from './types';

interface UseCharacterFormProps {
  editingCharacter?: AppCharacter;
  open: boolean;
}

interface UseCharacterFormReturn {
  formData: CharacterFormData;
  setFormData: React.Dispatch<React.SetStateAction<CharacterFormData>>;
  isSubmitting: boolean;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
}

function computeFormData(
  editingCharacter: AppCharacter | undefined,
  open: boolean,
): CharacterFormData {
  if (!open) {
    // Return default values when closed (won't be used, but keeps types happy)
    return {
      name: '',
      charClass: 'Wizard',
      level: 1,
      species: 'Human',
      background: 'sage',
      abilities: { ...DEFAULT_ABILITIES },
      subclassId: '',
      additionalClasses: [],
    };
  }

  if (editingCharacter) {
    return {
      name: editingCharacter.name,
      charClass: editingCharacter.classes[0]?.classId || 'Wizard',
      level: editingCharacter.classes[0]?.level || 1,
      subclassId: editingCharacter.classes[0]?.subclassId ?? '',
      species: editingCharacter.species,
      background: editingCharacter.background,
      abilities: {
        Strength: editingCharacter.abilityScores.base.Strength || 10,
        Dexterity: editingCharacter.abilityScores.base.Dexterity || 10,
        Constitution: editingCharacter.abilityScores.base.Constitution || 10,
        Intelligence: editingCharacter.abilityScores.base.Intelligence || 10,
        Wisdom: editingCharacter.abilityScores.base.Wisdom || 10,
        Charisma: editingCharacter.abilityScores.base.Charisma || 10,
      },
      additionalClasses: editingCharacter.classes.slice(1).map((c) => ({
        id: generateAdditionalClassId(),
        classId: c.classId,
        level: c.level,
        subclassId: c.subclassId ?? undefined,
      })),
    };
  }

  // Default values for new character
  return {
    name: '',
    charClass: 'Wizard',
    level: 1,
    species: 'Human',
    background: 'sage',
    abilities: { ...DEFAULT_ABILITIES },
    subclassId: '',
    additionalClasses: [],
  };
}

export function useCharacterForm({
  editingCharacter,
  open,
}: UseCharacterFormProps): UseCharacterFormReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute form data based on editingCharacter and open state
  // Stable reference - only changes when editingCharacter or open changes
  const formData = useMemo<CharacterFormData>(
    () => computeFormData(editingCharacter, open),
    [editingCharacter, open],
  );

  // Allow manual updates to form data (for user input)
  const [manualFormData, setManualFormData] = useState<CharacterFormData | null>(null);

  // Reset manual overrides when editingCharacter or open changes
  // Use a key that changes when dependencies change
  const dependencyKey = `${editingCharacter?.id || 'new'}-${open}`;

  // Use useState initializer to avoid unnecessary resets
  const [resetKey, setResetKey] = useState(dependencyKey);

  // Check if dependencies changed and reset if needed
  if (resetKey !== dependencyKey) {
    setManualFormData(null);
    setResetKey(dependencyKey);
  }

  // Use manual form data if available (user is editing), otherwise use computed data
  const finalFormData = manualFormData || formData;

  // Custom setFormData that stores manual overrides
  const setFormData: React.Dispatch<React.SetStateAction<CharacterFormData>> = (update) => {
    setManualFormData((prev) => {
      const base = prev || formData;
      const updated = typeof update === 'function' ? update(base) : update;
      return updated;
    });
  };

  return {
    formData: finalFormData,
    setFormData,
    isSubmitting,
    setIsSubmitting,
  };
}
