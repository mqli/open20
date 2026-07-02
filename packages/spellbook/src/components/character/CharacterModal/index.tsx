import { useCharacterStore } from '@/stores/characterStore';
import { characterService } from '@/core/character-service';
import type { CharacterCreationParams, AppCharacter } from '@/core/types';
import { getContentPack } from '@/core/content-resolver';
import type { CharacterFeatEntry, FeatSpellSelection, FeatSpellsEntry } from 'open20-core';
import { CharacterModalForm } from './CharacterModalForm';
import { useCharacterForm } from './useCharacterForm';
import type { AdditionalClassEntry, FeatFormEntry } from './types';

/**
 * Apply inline feat selections to a character object.
 * Does NOT call recomputeDerivedStats (no feat def in deps),
 * instead manually builds featSpells data.
 */
function applyFeatSelections(char: AppCharacter, featSelections: FeatFormEntry[]): AppCharacter {
  if (!featSelections || featSelections.length === 0) return char;

  const pack = getContentPack();
  const featEntries: CharacterFeatEntry[] = [];
  const newFeatSpells: Record<string, FeatSpellsEntry> = {};

  for (const fs of featSelections) {
    if (!fs.enabled) continue;
    if (!fs.cantrips.length || !fs.level1Spell) continue;

    // Look up spellcasting ability from class data
    const classData = pack.classes?.find((c) => c.id === fs.classId);
    const spellcastingAbility = classData?.spellcasting?.ability ?? 'Intelligence';

    const spellSelection: FeatSpellSelection = {
      classId: fs.classId,
      spells: {
        cantrips: fs.cantrips,
        level1Spell: [fs.level1Spell],
      },
    };

    const featEntry: CharacterFeatEntry = {
      featId: 'magic-initiate',
      spellChoices: spellSelection,
    };
    featEntries.push(featEntry);

    // Build FeatSpellsEntry (mirrors what computeFeatSpells would produce)
    newFeatSpells[fs.key] = {
      classId: fs.classId,
      spellcastingAbility,
      cantrips: fs.cantrips,
      preparedSpells: [...fs.cantrips, fs.level1Spell],
      oncePerLongRest: { [fs.level1Spell]: true },
      usedOncePerLongRest: char.spells.featSpells?.[fs.key]?.usedOncePerLongRest,
    };
  }

  return {
    ...char,
    feats: [...char.feats, ...featEntries],
    spells: {
      ...char.spells,
      featSpells: Object.keys(newFeatSpells).length > 0 ? newFeatSpells : undefined,
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

      const featSelections = formData.featSelections?.filter((f) => f.enabled) ?? [];

      if (editingCharacter) {
        const rebuilt = characterService.createCharacter(params);
        // Preserve existing spell data (known cantrips, known spells, etc.)
        // but replace feats with form's feat selections.
        let updated: AppCharacter = {
          ...rebuilt,
          id: editingCharacter.id,
          spells: editingCharacter.spells,
        } as AppCharacter;
        updated = applyFeatSelections(updated, featSelections);
        updateCharacter(updated);
      } else if (featSelections.length > 0) {
        // Create character with inline feat data (bypass store.createCharacter
        // to inject feat data before storing)
        const raw = characterService.createCharacter(params);
        const withFeats = applyFeatSelections(raw, featSelections);

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
