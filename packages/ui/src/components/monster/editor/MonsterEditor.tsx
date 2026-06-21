import { useState, useCallback, useEffect, useMemo } from 'react';
import type { MonsterEditorProps, MonsterFormData } from './MonsterEditor.types';
import { monsterToFormData, formDataToMonster } from './MonsterEditor.types';
import { BasicInfoSection } from './sections/BasicInfoSection';
import { CombatSection } from './sections/CombatSection';
import { AbilityScoresSection } from './sections/AbilityScoresSection';
import { DefensesSection } from './sections/DefensesSection';
import { SensesSection } from './sections/SensesSection';
import { FeaturesSection } from './sections/FeaturesSection';
import { SpellcastingSection } from './sections/SpellcastingSection';
import { MetaSection } from './sections/MetaSection';
import { Button } from '@/components/base/Button/Button';
import { Surface } from '@/components/base/Surface/Surface';
import { Text } from '@/components/base/Text/Text';
import { MonsterCard } from '@/components/monster/MonsterCard';
import { useTranslation } from '@/i18n';

export function MonsterEditor({
  value,
  defaultValue,
  onChange,
  onSubmit,
  onCancel,
  showPreview = false,
  disabled = false,
  className,
  renderActions,
}: MonsterEditorProps) {
  const t = useTranslation();

  // ── State ────────────────────────────────────────
  const initialData = useMemo(() => monsterToFormData(defaultValue || undefined), [defaultValue]);
  const [formData, setFormData] = useState<MonsterFormData>(() =>
    monsterToFormData(value || defaultValue || undefined),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track if form is dirty (compared to initial data)
  const isDirty = useMemo(() => {
    const initial = value ? monsterToFormData(value) : initialData;
    return JSON.stringify(formData) !== JSON.stringify(initial);
  }, [formData, value, initialData]);

  // Sync with external value (controlled mode)
  useEffect(() => {
    if (value) {
      setFormData(monsterToFormData(value));
    }
  }, [value]);

  // ── Validation (pure function, doesn't set state) ──
  const getValidationErrors = useCallback((): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    if (!formData.id.trim()) newErrors.id = t('validation.idRequired');
    if (!formData.name.trim()) newErrors.name = t('validation.nameRequired');
    if (formData.armorClass.length === 0) {
      newErrors.armorClass = t('monsterEditor.validation.acRequired');
    }
    if (formData.hitPoints.value <= 0) {
      newErrors.hitPoints = t('monsterEditor.validation.hpRequired');
    }
    const allScoresFilled = Object.values(formData.abilityScores).every((s) => s > 0);
    if (!allScoresFilled) {
      newErrors.abilityScores = t('monsterEditor.validation.abilityScoresRequired');
    }
    return newErrors;
  }, [formData, t]);

  const isValid = useMemo(() => {
    const validationErrors = getValidationErrors();
    return Object.keys(validationErrors).length === 0;
  }, [formData, t, getValidationErrors]);

  // ── Handlers ──────────────────────────────────────
  const handleChange = useCallback(
    (updates: Partial<MonsterFormData>) => {
      setFormData((prev) => {
        const next = { ...prev, ...updates };
        // Notify parent
        if (onChange) {
          onChange(formDataToMonster(next));
        }
        return next;
      });
      // Clear errors for changed fields
      setErrors((prev) => {
        const next = { ...prev };
        Object.keys(updates).forEach((key) => delete next[key]);
        return next;
      });
    },
    [onChange],
  );

  const validateForm = useCallback((): boolean => {
    const newErrors = getValidationErrors();
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [getValidationErrors]);

  const handleSubmit = useCallback(
    (intent?: 'stay' | 'new' | 'close') => {
      if (!validateForm()) return;
      setIsSubmitting(true);
      try {
        const monster = formDataToMonster(formData);
        onSubmit?.(monster, intent);
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateForm, formData, onSubmit],
  );

  const handleCancel = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  // ── Render ───────────────────────────────────────
  return (
    <div className={className}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="space-y-6"
      >
        {/* Preview (optional) */}
        {showPreview && (
          <div className="sticky top-0 z-10 bg-bg-primary py-4 border-b border-border">
            <Text as="h3" variant="labelSm" className="mb-2">
              {t('monsterEditor.livePreview')}
            </Text>
            <MonsterCard monster={formDataToMonster(formData)} density="compact" />
          </div>
        )}

        {/* Basic Info */}
        <BasicInfoSection formData={formData} onChange={handleChange} disabled={disabled} />

        {/* Combat Stats */}
        <CombatSection formData={formData} onChange={handleChange} disabled={disabled} />

        {/* Ability Scores */}
        <AbilityScoresSection formData={formData} onChange={handleChange} disabled={disabled} />

        {/* Defenses */}
        <DefensesSection formData={formData} onChange={handleChange} disabled={disabled} />

        {/* Senses & Languages */}
        <SensesSection formData={formData} onChange={handleChange} disabled={disabled} />

        {/* Features & Actions */}
        <FeaturesSection formData={formData} onChange={handleChange} disabled={disabled} />

        {/* Spellcasting */}
        <SpellcastingSection formData={formData} onChange={handleChange} disabled={disabled} />

        {/* Meta */}
        <MetaSection formData={formData} onChange={handleChange} disabled={disabled} />

        {/* Form Errors */}
        {Object.keys(errors).length > 0 && (
          <Surface variant="warning" padding="sm" className="space-y-1">
            <Text as="p" variant="bodySm" className="text-danger">
              {t('validation.fixErrors')}
            </Text>
            {Object.entries(errors).map(([field, msg]) => (
              <Text key={field} as="p" variant="bodySm" className="text-danger ml-2">
                • {msg}
              </Text>
            ))}
          </Surface>
        )}

        {/* Action Buttons */}
        {renderActions ? (
          renderActions({ onSave: handleSubmit, isDirty, isValid, isSubmitting })
        ) : (
          <div className="flex justify-end gap-4 pt-4 border-t border-border">
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={handleCancel}
                disabled={isSubmitting || disabled}
              >
                {t('common.cancel')}
              </Button>
            )}
            <Button type="submit" variant="primary" size="lg" disabled={isSubmitting || disabled}>
              {isSubmitting
                ? t('common.saving')
                : value
                  ? t('monsterEditor.updateMonster')
                  : t('monsterEditor.createMonster')}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}

export default MonsterEditor;
