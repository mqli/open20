import { X } from 'lucide-react';
import {
  Button,
  DialogClose,
  DialogContent,
  DialogRoot,
  DialogTitle,
  Input,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  Text,
} from '@open20/ui';
import { useSpellbookTranslation } from '@/i18n';
import { AbilityScoresSection } from './AbilityScoresSection';
import { SubclassSelect } from './SubclassSelect';
import { AdditionalClassEntryComponent } from './AdditionalClassEntry';
import { CLASSES, SPECIES, BACKGROUNDS } from './constants';
import type { AdditionalClassEntry, CharacterFormData } from './types';
import type { AppCharacter } from '@/core/types';

interface CharacterModalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCharacter?: AppCharacter;
  formData: CharacterFormData;
  setFormData: React.Dispatch<React.SetStateAction<CharacterFormData>>;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function CharacterModalForm({
  open,
  onOpenChange,
  editingCharacter,
  formData,
  setFormData,
  isSubmitting,
  onSubmit,
  onCancel,
}: CharacterModalFormProps) {
  const t = useSpellbookTranslation();
  const handleAbilityChange = (abilityName: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      abilities: { ...prev.abilities, [abilityName]: parseInt(value) || 0 },
    }));
  };

  const handleAddAdditionalClass = () => {
    setFormData((prev) => ({
      ...prev,
      additionalClasses: [
        ...prev.additionalClasses,
        {
          id: `additional-class-${Date.now()}`,
          classId: 'Fighter',
          level: 1,
          subclassId: undefined,
        },
      ],
    }));
  };

  const handleUpdateAdditionalClass = (id: string, updates: Partial<AdditionalClassEntry>) => {
    setFormData((prev) => ({
      ...prev,
      additionalClasses: prev.additionalClasses.map((ac) =>
        ac.id === id ? { ...ac, ...updates } : ac,
      ),
    }));
  };

  const handleRemoveAdditionalClass = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      additionalClasses: prev.additionalClasses.filter((ac) => ac.id !== id),
    }));
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(newOpen);
    }
  };

  return (
    <DialogRoot open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="lg" className="max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center mb-8">
          <DialogTitle className="text-2xl font-black text-text-primary uppercase tracking-tight">
            {editingCharacter ? t('editCharacter') : t('createCharacter')}
          </DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="sm" className="p-2 rounded-full" disabled={isSubmitting}>
              <X className="w-6 h-6" />
            </Button>
          </DialogClose>
        </div>

        <form onSubmit={onSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <Text as="label" variant="formLabel">
                  {t('characterName')}
                </Text>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder={t('characterNamePlaceholder')}
                  required
                  className="text-lg font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text as="label" variant="formLabel">
                    {t('class')}
                  </Text>
                  <SelectRoot
                    value={formData.charClass}
                    onValueChange={(value) => {
                      setFormData((prev) => ({ ...prev, charClass: value, subclassId: '' }));
                    }}
                  >
                    <SelectTrigger />
                    <SelectContent>
                      {CLASSES.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                </div>
                <div>
                  <Text as="label" variant="formLabel">
                    {t('level')}
                  </Text>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={formData.level}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, level: parseInt(e.target.value) || 1 }))
                    }
                  />
                </div>
              </div>

              <SubclassSelect
                classId={formData.charClass}
                value={formData.subclassId}
                onChange={(value) => setFormData((prev) => ({ ...prev, subclassId: value }))}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text as="label" variant="formLabel">
                    {t('species')}
                  </Text>
                  <SelectRoot
                    value={formData.species}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, species: value }))}
                  >
                    <SelectTrigger />
                    <SelectContent>
                      {SPECIES.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                </div>
                <div>
                  <Text as="label" variant="formLabel">
                    {t('background')}
                  </Text>
                  <SelectRoot
                    value={formData.background}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, background: value }))
                    }
                  >
                    <SelectTrigger />
                    <SelectContent>
                      {BACKGROUNDS.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                </div>
              </div>

              {/* Multiclass Section */}
              <div className="pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Text as="label" variant="labelSm" weight="black" className="tracking-[0.2em]">
                    {t('multiclass')}
                  </Text>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAddAdditionalClass}
                    className="h-7 text-[9px]"
                  >
                    {t('addClass')}
                  </Button>
                </div>

                {formData.additionalClasses.map((ac) => (
                  <AdditionalClassEntryComponent
                    key={ac.id}
                    entry={ac}
                    onUpdate={handleUpdateAdditionalClass}
                    onRemove={handleRemoveAdditionalClass}
                  />
                ))}
              </div>
            </div>

            <AbilityScoresSection abilities={formData.abilities} onChange={handleAbilityChange} />
          </div>

          <div className="pt-6 border-t border-border flex justify-end gap-4">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              disabled={isSubmitting}
              onClick={onCancel}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={!formData.name || isSubmitting}
            >
              {isSubmitting ? t('saving') : editingCharacter ? t('saveChanges') : t('summonHero')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}
