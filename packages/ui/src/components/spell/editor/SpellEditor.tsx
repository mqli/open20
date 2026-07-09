import { useState, useCallback, useEffect, useMemo, type FormEvent } from 'react';
import type { SpellEditorProps, SpellFormData } from './SpellEditor.types';
import { spellToFormData, formDataToSpell } from './SpellEditor.types';
import { BasicInfoSection } from './sections/BasicInfoSection';
import { CastingInfoSection } from './sections/CastingInfoSection';
import { DescriptionSection } from './sections/DescriptionSection';
import { DamageHealSection } from './sections/DamageHealSection';
import { CantripUpgradeSection } from './sections/CantripUpgradeSection';
import { Tabs } from '@/components/base/Tabs/Tabs';
import { SpellCard } from '@/components/spell/SpellCard';
import { EditorLayout } from '@/components/base/EditorLayout';
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
        if (onChange) {
          onChange(formDataToSpell(next));
        }
        return next;
      });
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

  const handleSave = useCallback(
    (intent?: 'stay' | 'new' | 'close') => {
      if (!validateForm()) return;
      setIsSubmitting(true);
      try {
        const spell = formDataToSpell(formData);
        onSubmit?.(spell, intent);
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateForm, formData, onSubmit],
  );

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      handleSave();
    },
    [handleSave],
  );

  // ── Preview data ──────────────────────────────────
  const previewSpell = useMemo(() => formDataToSpell(formData), [formData]);

  // ── Render ───────────────────────────────────────
  return (
    <EditorLayout
      className={className}
      onSubmit={handleSubmit}
      onSave={handleSave}
      onCancel={onCancel || undefined}
      disabled={disabled}
      isSubmitting={isSubmitting}
      isDirty={isDirty}
      isValid={isValid}
      errors={errors}
      renderActions={renderActions}
      preview={<SpellCard spell={previewSpell} />}
      previewLabel={t('spellEditor.livePreview')}
      cancelLabel={t('common.cancel')}
      saveLabel={value ? t('spellEditor.updateSpell') : t('spellEditor.createSpell')}
      savingLabel={t('common.saving')}
    >
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
    </EditorLayout>
  );
}

export default SpellEditor;
