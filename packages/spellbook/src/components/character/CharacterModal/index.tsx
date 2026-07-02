import { useCharacterStore } from '@/stores/characterStore';
import { characterService } from '@/core/character-service';
import type { CharacterCreationParams, AppCharacter } from '@/core/types';
import { getContentPack } from '@/core/content-resolver';
import type { CharacterFeatEntry, FeatSpellSelection } from 'open20-core';
import { CharacterModalForm } from './CharacterModalForm';
import { useCharacterForm } from './useCharacterForm';
import type { AdditionalClassEntry } from './types';

/**
 * Apply a single Magic Initiate feat selection to a character object.
 * Does NOT call recomputeDerivedStats (no feat def in deps),
 * instead manually builds the feat entry and featSpells data.
 */
function applyMagicInitiate(
  char: AppCharacter,
  mi: { classId: string; cantrips: string[]; level1Spell: string },
): AppCharacter {
  const pack = getContentPack();
  const classData = pack.classes?.find((c) => c.id === mi.classId);
  const spellcastingAbility = classData?.spellcasting?.ability ?? 'Intelligence';

  const spellSelection: FeatSpellSelection = {
    classId: mi.classId,
    spells: { cantrips: mi.cantrips, level1Spell: [mi.level1Spell] },
  };

  const featEntry: CharacterFeatEntry = {
    featId: 'magic-initiate',
    spellChoices: spellSelection,
  };

  return {
    ...char,
    feats: [...char.feats, featEntry],
    spells: {
      ...char.spells,
      featSpells: {
        ...(char.spells.featSpells ?? {}),
        'magic-initiate': {
          classId: mi.classId,
          spellcastingAbility,
          cantrips: mi.cantrips,
          preparedSpells: [...mi.cantrips, mi.level1Spell],
          oncePerLongRest: { [mi.level1Spell]: true },
          usedOncePerLongRest: char.spells.featSpells?.['magic-initiate']?.usedOncePerLongRest,
        },
      },
    },
  };
}

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
        // Preserve existing spell data (known cantrips, known spells, etc.)
        let updated: AppCharacter = {
          ...rebuilt,
          id: editingCharacter.id,
          spells: editingCharacter.spells,
        } as AppCharacter;
        if (mi) {
          updated = applyMagicInitiate(updated, mi);
        }
        updateCharacter(updated);
      } else if (mi) {
        // Create character with inline Magic Initiate data
        const raw = characterService.createCharacter(params);
        const withFeats = applyMagicInitiate(raw, mi);

        // Add to store directly
        const { characters, setActiveCharacter, saveCharacters } = useCharacterStore.getState();
        useCharacterStore.setState({
          characters: [...characters, withFeats],
        });
        setActiveCharacter(withFeats);
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
