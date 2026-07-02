import { useMemo } from 'react';
import { X } from 'lucide-react';
import {
  Button,
  Badge,
  DialogClose,
  DialogContent,
  DialogRoot,
  DialogTitle,
  Input,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectSeparator,
  Text,
} from '@open20/ui';
import { useTranslation } from '@/i18n';
import { AbilityScoresSection } from './AbilityScoresSection';
import { SubclassSelect } from './SubclassSelect';
import { AdditionalClassEntryComponent } from './AdditionalClassEntry';
import { MagicInitiateSection } from './MagicInitiateSection';
import type { AdditionalClassEntry, CharacterFormData, FeatFormEntry } from './types';
import type { AppCharacter } from '@/core/types';
import { getAllClasses, getAllSpecies, getAllBackgrounds } from '@/core/content-resolver';
import { useCustomClassStore } from '@/stores/customClassStore';

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
  const { classes: customEntries } = useCustomClassStore();

  // Merge SRD classes with custom classes
  const CLASSES = useMemo(() => {
    const srdClasses = getAllClasses().map((c) => ({
      id: c.id,
      name: c.name || c.id,
      source: c.source,
    }));
    const customClasses = customEntries.map((e) => ({
      id: e.class.id,
      name: e.class.name,
      source: e.class.source,
    }));
    return [...srdClasses, ...customClasses];
  }, [customEntries]);

  const SPECIES = getAllSpecies().map((s) => ({
    id: s.id,
    name: s.id,
  }));

  const BACKGROUNDS = getAllBackgrounds().map((b) => ({
    id: b.id,
    name: b.name,
  }));

  const t = useTranslation();
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

  // ── Feat handlers ───────────────────────────────────────

  const handleAddFeat = () => {
    setFormData((prev) => {
      const existing = prev.featSelections ?? [];
      return {
        ...prev,
        featSelections: [
          ...existing,
          {
            key: `magic-initiate-${Date.now()}`,
            featId: 'magic-initiate' as const,
            enabled: true,
            classId: 'Wizard',
            cantrips: [],
            level1Spell: '',
          },
        ],
      };
    });
  };

  const handleRemoveFeat = (key: string) => {
    setFormData((prev) => ({
      ...prev,
      featSelections: (prev.featSelections ?? []).filter((f) => f.key !== key),
    }));
  };

  const handleUpdateFeat = (key: string, updates: Partial<FeatFormEntry>) => {
    setFormData((prev) => ({
      ...prev,
      featSelections: (prev.featSelections ?? []).map((f) =>
        f.key === key ? { ...f, ...updates } : f,
      ),
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
              <div data-testid="char-name-input">
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
                  <Text as="label" variant="formLabel" className="mb-1">
                    {t('class')}
                  </Text>
                  <SelectRoot
                    value={formData.charClass}
                    onValueChange={(value) => {
                      setFormData((prev) => ({ ...prev, charClass: value, subclassId: '' }));
                    }}
                  >
                    <SelectTrigger data-testid="char-class-select" />
                    <SelectContent>
                      {CLASSES.filter((c) => c.source !== 'Homebrew').map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                      {CLASSES.some((c) => c.source === 'Homebrew') && (
                        <>
                          <SelectSeparator />
                          {CLASSES.filter((c) => c.source === 'Homebrew').map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              <span className="flex items-center gap-1">
                                {c.name}
                                <Badge variant="secondary" size="xs">
                                  {t('homebrew')}
                                </Badge>
                              </span>
                            </SelectItem>
                          ))}
                        </>
                      )}
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
                    data-testid="char-level-input"
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
                    <SelectTrigger data-testid="char-species-select" />
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
                    <SelectTrigger data-testid="char-background-select" />
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
                    data-testid="add-class-btn"
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

              {/* Feats Section / Magic Initiate */}
              <MagicInitiateSection
                feats={formData.featSelections ?? []}
                onAdd={handleAddFeat}
                onRemove={handleRemoveFeat}
                onUpdate={handleUpdateFeat}
              />
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
              data-testid="char-submit-btn"
            >
              {isSubmitting ? t('saving') : editingCharacter ? t('saveChanges') : t('summonHero')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}
