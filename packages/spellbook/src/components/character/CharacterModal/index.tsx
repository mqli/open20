import { useCharacterStore } from '@/stores/characterStore';
import { characterService } from '@/core/character-service';
import type { CharacterCreationParams, AppCharacter } from '@/core/types';
import { resolveDeps, buildDepsForCreate } from '@/core/content-resolver';
import { addFeat } from 'open20-core';
import type { FeatSpellSelection } from 'open20-core';
import { CharacterModalForm } from './CharacterModalForm';
import { useCharacterForm } from './useCharacterForm';
import type { AdditionalClassEntry } from './types';

export function CharacterModal({
  open,
  onOpenChange,
  characterId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  characterId?: string;
}) {
  const { createCharacter, updateCharacter, characters } = useCharacterStore();
  const editingCharacter = characters.find((c) => c.id === characterId);

  const { formData, setFormData, isSubmitting, setIsSubmitting } = useCharacterForm({
    editingCharacter,
    open,
  });

  const validateForm = (): boolean => {
    if (!formData.name.trim()) return false;

    // Check total level doesn't exceed 20
    const totalLevel =
      formData.level + formData.additionalClasses.reduce((sum, ac) => sum + ac.level, 0);
    if (totalLevel > 20) return false;

    // Check ability scores are valid
    for (const score of Object.values(formData.abilities)) {
      if (score < 1 || score > 30) return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const params: CharacterCreationParams = {
        name: formData.name,
        speciesId: formData.species,
        backgroundId: formData.background,
        classId: formData.charClass,
        classLevel: formData.level,
        subclassId: formData.subclassId || undefined,
        abilityScores: formData.abilities,
        additionalClasses:
          formData.additionalClasses.length > 0
            ? formData.additionalClasses.map((ac: AdditionalClassEntry) => ({
                classId: ac.classId,
                level: ac.level,
                subclassId: ac.subclassId,
              }))
            : undefined,
      };

      const mi = formData.magicInitiate;

      if (editingCharacter) {
        const rebuilt = characterService.createCharacter(params);
        let updated: AppCharacter = {
          ...rebuilt,
          id: editingCharacter.id,
          spells: editingCharacter.spells,
        } as AppCharacter;
        if (mi) {
          const spellSelection: FeatSpellSelection = {
            classId: mi.classId,
            spells: { cantrips: mi.cantrips, level1Spell: [mi.level1Spell] },
          };
          const deps = resolveDeps(updated);
          updated = addFeat(updated, 'magic-initiate', deps, { spellSelection }) as AppCharacter;
        }
        updateCharacter(updated);
      } else if (mi) {
        const raw = characterService.createCharacter(params);
        const spellSelection: FeatSpellSelection = {
          classId: mi.classId,
          spells: { cantrips: mi.cantrips, level1Spell: [mi.level1Spell] },
        };
        const deps = buildDepsForCreate(params);
        const withFeat = addFeat(raw, 'magic-initiate', deps, { spellSelection }) as AppCharacter;

        const { characters, setActiveCharacter, saveCharacters } = useCharacterStore.getState();
        useCharacterStore.setState({
          characters: [...characters, withFeat],
        });
        setActiveCharacter(withFeat);
        saveCharacters();
      } else {
        createCharacter(params);
      }

      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  return (
    <CharacterModalForm
      open={open}
      onOpenChange={onOpenChange}
      editingCharacter={editingCharacter}
      formData={formData}
      setFormData={setFormData}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
