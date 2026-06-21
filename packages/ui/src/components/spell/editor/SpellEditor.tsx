import { useState, useCallback, useEffect, useMemo } from 'react';
import type { SpellEditorProps, SpellFormData } from './SpellEditor.types';
import { spellToFormData, formDataToSpell } from './SpellEditor.types';
import { BasicInfoSection } from './sections/BasicInfoSection';
import { CastingInfoSection } from './sections/CastingInfoSection';
import { DescriptionSection } from './sections/DescriptionSection';
import { DamageHealSection } from './sections/DamageHealSection';
import { CantripUpgradeSection } from './sections/CantripUpgradeSection';
import { Tabs } from '@/components/base/Tabs/Tabs';
import { Button } from '@/components/base/Button/Button';
import { Surface } from '@/components/base/Surface/Surface';
import { Text } from '@/components/base/Text/Text';
import { SpellCard } from '@/components/spell/SpellCard';
import { useTranslation } from '@/i18n';

export function SpellEditor({
  value,
  defaultValue,
  onChange,
  onSubmit,
  onCancel,
  disabled = false,
  className,
  renderActions,
}: SpellEditorProps) {
  const t = useTranslation();

  // ── State ────────────────────────────────────────
  const initialData = useMemo(() => spellToFormData(defaultValue || undefined), [defaultValue]);
  const [formData, setFormData] = useState<SpellFormData>(() =>
    spellToFormData(value || defaultValue || undefined),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track if form is dirty (compared to initial data)
  const isDirty = useMemo(() => {
    const initial = value ? spellToFormData(value) : initialData;
    return JSON.stringify(formData) !== JSON.stringify(initial);
  }, [formData, value, initialData]);

  // Sync with external value (controlled mode)
  useEffect(() => {
    if (value) {
      setFormData(spellToFormData(value));
    }
  }, [value]);

  // ── Validation (pure function, doesn't set state) ──
  const getValidationErrors = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    if (!formData.id.trim()) newErrors.id = t('validation.idRequired');
    if (!formData.name.trim()) newErrors.name = t('validation.nameRequired');
    if (!formData.range.trim()) newErrors.range = t('validation.rangeRequired');
    if (!formData.duration.trim()) newErrors.duration = t('validation.durationRequired');
    if (formData.components.length === 0) newErrors.components = t('validation.componentsRequired');
    if (formData.description.length === 0 || !formData.description[0]?.trim()) {
      newErrors.description = t('validation.descriptionRequired');
    }
    return newErrors;
  };

  const isValid = useMemo(() => {
    const validationErrors = getValidationErrors();
    return Object.keys(validationErrors).length === 0;
  }, [formData, t]);

  // ── Handlers ──────────────────────────────────────
  const handleChange = useCallback(
    (updates: Partial<SpellFormData>) => {
      setFormData((prev) => {
        const next = { ...prev, ...updates };
        // Notify parent
        if (onChange) {
          onChange(formDataToSpell(next));
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

  const validateForm = (): boolean => {
    const newErrors = getValidationErrors();
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (intent?: 'stay' | 'new' | 'close') => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const spell = formDataToSpell(formData);
      onSubmit?.(spell, intent);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
  };

  // ── Render ───────────────────────────────────────
  return (
    <div className={`lg:grid lg:grid-cols-[3fr_2fr] lg:gap-6 ${className ?? ''}`}>
      {/* ── Left Column: Editor ── */}
      <div className="flex min-h-0 flex-col">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex flex-1 flex-col"
        >
          {/* Tabs Navigation */}
          <Tabs.Root defaultValue="general" className="flex flex-1 flex-col">
            <Tabs.List variant="pills" className="mb-4">
              <Tabs.Trigger variant="pills" value="general">
                {t('spellEditor.tabGeneral')}
              </Tabs.Trigger>
              <Tabs.Trigger variant="pills" value="description">
                {t('spellEditor.tabDescription')}
              </Tabs.Trigger>
              <Tabs.Trigger variant="pills" value="effects">
                {t('spellEditor.tabEffects')}
              </Tabs.Trigger>
            </Tabs.List>

            {/* Tab: General */}
            <Tabs.Content value="general" className="space-y-6">
              <BasicInfoSection formData={formData} onChange={handleChange} disabled={disabled} />
              <CastingInfoSection formData={formData} onChange={handleChange} disabled={disabled} />
            </Tabs.Content>

            {/* Tab: Description */}
            <Tabs.Content value="description" className="space-y-6">
              <DescriptionSection formData={formData} onChange={handleChange} disabled={disabled} />
            </Tabs.Content>

            {/* Tab: Effects */}
            <Tabs.Content value="effects" className="space-y-6">
              <DamageHealSection formData={formData} onChange={handleChange} disabled={disabled} />
              {formData.level === 0 && (
                <CantripUpgradeSection
                  formData={formData}
                  onChange={handleChange}
                  disabled={disabled}
                />
              )}
            </Tabs.Content>
          </Tabs.Root>

          {/* Form Errors */}
          {Object.keys(errors).length > 0 && (
            <Surface variant="warning" padding="sm" className="mb-4 space-y-1">
              <Text as="p" variant="bodySm" className="text-danger">
                {t('validation.fixErrors')}
              </Text>
              {Object.entries(errors).map(([field, msg]) => (
                <Text key={field} as="p" variant="bodySm" className="ml-2 text-danger">
                  • {msg}
                </Text>
              ))}
            </Surface>
          )}

          {/* Action Buttons (sticky at bottom) */}
          <div className="sticky bottom-0 mt-auto border-t border-border bg-bg-primary pt-4">
            {renderActions ? (
              renderActions({ onSave: handleSubmit, isDirty, isValid, isSubmitting })
            ) : (
              <div className="flex justify-end gap-4">
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
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting || disabled}
                >
                  {isSubmitting
                    ? t('common.saving')
                    : value
                      ? t('spellEditor.updateSpell')
                      : t('spellEditor.createSpell')}
                </Button>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* ── Right Column: Preview ── */}
      <div className="lg:sticky lg:top-4 lg:self-start">
        <Text as="h3" variant="labelSm" className="mb-3">
          {t('spellEditor.livePreview')}
        </Text>
        <SpellCard spell={formDataToSpell(formData)} />
      </div>
    </div>
  );
}

export default SpellEditor;
