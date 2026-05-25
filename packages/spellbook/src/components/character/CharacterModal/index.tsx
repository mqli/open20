import { useCharacterStore } from '@/stores/character-store';
import { characterService } from '@/core/character-service';
import type { CharacterCreationParams } from '@/core/types';
import { CharacterModalForm } from './CharacterModalForm';
import { useCharacterForm } from './useCharacterForm';
import type { AdditionalClassEntry } from './types';

export function CharacterModal({ 
  open, 
  onOpenChange, 
  characterId 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  characterId?: string;
}) {
  const { createCharacter, updateCharacter, characters } = useCharacterStore();
  const editingCharacter = characters.find(c => c.id === characterId);

  const {
    formData,
    setFormData,
    isSubmitting,
    setIsSubmitting
  } = useCharacterForm({ 
    editingCharacter, 
    open 
  });

  const validateForm = (): boolean => {
    if (!formData.name.trim()) return false;
    
    // Check total level doesn't exceed 20
    const totalLevel = formData.level + formData.additionalClasses.reduce((sum, ac) => sum + ac.level, 0);
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
        additionalClasses: formData.additionalClasses.length > 0 
          ? formData.additionalClasses.map((ac: AdditionalClassEntry) => ({
              classId: ac.classId,
              level: ac.level,
              subclassId: ac.subclassId
            })) 
          : undefined,
      };

      if (editingCharacter) {
        const rebuilt = characterService.createCharacter(params);
        updateCharacter({ ...rebuilt, id: editingCharacter.id });
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
