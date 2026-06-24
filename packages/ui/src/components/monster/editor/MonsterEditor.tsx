import { useState, useCallback, useEffect, useMemo, type FormEvent } from 'react';
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
import { Tabs } from '@/components/base/Tabs/Tabs';
import { MonsterCard } from '@/components/monster/MonsterCard';
import { EditorLayout } from '@/components/base/EditorLayout';
import { useTranslation } from '@/i18n';

export function MonsterEditor({
  value,
  defaultValue,
  onChange,
  onSubmit,
  onCancel,
  showPreview = true,
  disabled = false,
  className,
  renderActions,
  mode: modeProp,
  onModeChange,
}: MonsterEditorProps) {
  const t = useTranslation();

  // ── Mode state (controlled via prop, default to 'advanced') ──
  const [mode, setMode] = useState<'simple' | 'advanced'>(modeProp ?? 'advanced');

  useEffect(() => {
    if (modeProp !== undefined) {
      setMode(modeProp);
    }
  }, [modeProp]);

  const toggleMode = useCallback(() => {
    const next = mode === 'simple' ? 'advanced' : 'simple';
    setMode(next);
    onModeChange?.(next);
  }, [mode, onModeChange]);

  // ── Form State ────────────────────────────────────────
  const initialData = useMemo(() => monsterToFormData(defaultValue || undefined), [defaultValue]);
  const [formData, setFormData] = useState<MonsterFormData>(() =>
    monsterToFormData(value || defaultValue || undefined),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDirty = useMemo(() => {
    const initial = value ? monsterToFormData(value) : initialData;
    return JSON.stringify(formData) !== JSON.stringify(initial);
  }, [formData, value, initialData]);

  useEffect(() => {
    if (value) {
      setFormData(monsterToFormData(value));
    }
  }, [value]);

  // ── Validation ──
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
    if (mode === 'advanced') {
      const allScoresFilled = Object.values(formData.abilityScores).every((s) => s > 0);
      if (!allScoresFilled) {
        newErrors.abilityScores = t('monsterEditor.validation.abilityScoresRequired');
      }
    }
    return newErrors;
  }, [formData, t, mode]);

  const isValid = useMemo(() => {
    const validationErrors = getValidationErrors();
    return Object.keys(validationErrors).length === 0;
  }, [formData, t, getValidationErrors]);

  // ── Handlers ──────────────────────────────────────
  const handleChange = useCallback(
    (updates: Partial<MonsterFormData>) => {
      setFormData((prev) => {
        const next = { ...prev, ...updates };
        if (onChange) {
          onChange(formDataToMonster(next));
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

  const validateForm = useCallback((): boolean => {
    const newErrors = getValidationErrors();
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [getValidationErrors]);

  const handleSave = useCallback(
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

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      handleSave();
    },
    [handleSave],
  );

  // ── Simple mode helpers ─────────────────────────
  const coreAttacks = formData.actions.filter((a) => a.attacks && a.attacks.length > 0);
  const hasAttacks = formData.actions.length > 0;

  // ── Preview ─────────────────────────────────────
  const previewMonster = useMemo(() => formDataToMonster(formData), [formData]);

  // ── Render ──────────────────────────────────────
  const previewNode = showPreview ? (
    <MonsterCard monster={previewMonster} density="compact" />
  ) : undefined;

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
      preview={previewNode}
      previewLabel={showPreview ? t('monsterEditor.livePreview') : undefined}
      cancelLabel={t('common.cancel')}
      saveLabel={value ? t('monsterEditor.updateMonster') : t('monsterEditor.createMonster')}
      savingLabel={t('common.saving')}
      isCreate={!value}
    >
      <Tabs.Root defaultValue="general" className="flex flex-1 flex-col">
        <Tabs.List variant="pills" className="mb-4">
          <Tabs.Trigger variant="pills" value="general">
            General
          </Tabs.Trigger>
          <Tabs.Trigger variant="pills" value="stats" disabled={mode === 'simple'}>
            Stats
          </Tabs.Trigger>
          <Tabs.Trigger variant="pills" value="features" disabled={mode === 'simple'}>
            Features
          </Tabs.Trigger>
        </Tabs.List>

        {/* ── Tab: General ── */}
        <Tabs.Content value="general" className="space-y-6">
          {/* Mode Toggle Bar */}
          <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-muted/40 border border-border">
            <div className="flex items-center gap-2">
              <Text as="span" variant="labelSm">
                {mode === 'simple' ? 'Simple Mode' : 'Advanced Mode'}
              </Text>
              {mode === 'simple' && (
                <span className="text-xs text-muted-foreground">— Quick setup for core stats</span>
              )}
              {mode === 'advanced' && (
                <span className="text-xs text-muted-foreground">— Full stat block editor</span>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleMode}
              disabled={disabled}
            >
              {mode === 'simple' ? 'Switch to Advanced Mode →' : '← Switch to Simple Mode'}
            </Button>
          </div>

          <BasicInfoSection formData={formData} onChange={handleChange} disabled={disabled} />
          <CombatSection formData={formData} onChange={handleChange} disabled={disabled} />

          {/* Simple mode: Core Attacks */}
          {mode === 'simple' && (
            <>
              <Surface padding="md" className="space-y-4">
                <Text as="h3" variant="headingSm" className="flex items-center gap-2">
                  ⚔️ Core Attacks
                </Text>
                {hasAttacks ? (
                  <div className="space-y-3">
                    {coreAttacks.map((action, idx) => (
                      <div key={idx} className="p-3 rounded-md border border-border bg-bg-primary">
                        <Text as="p" variant="body" className="font-medium">
                          {action.name}
                        </Text>
                        {action.attacks?.map((atk, atkIdx) => (
                          <div key={atkIdx} className="mt-1 ml-4 text-sm text-muted-foreground">
                            <span>{atk.name}</span>
                            {atk.damage && <span className="ml-2">— {atk.damage}</span>}
                          </div>
                        ))}
                      </div>
                    ))}
                    {formData.actions.length > coreAttacks.length && (
                      <Text as="p" variant="caption" className="text-muted-foreground italic">
                        +{formData.actions.length - coreAttacks.length} more actions visible in
                        Advanced mode
                      </Text>
                    )}
                  </div>
                ) : (
                  <Text as="p" variant="bodySm" className="text-muted-foreground italic">
                    No attacks defined. Switch to Advanced mode to add actions.
                  </Text>
                )}
              </Surface>

              <Surface variant="info" padding="sm">
                <Text as="p" variant="bodySm" className="text-info-foreground">
                  💡 Tip: Switch to Advanced mode to edit ability scores, defenses, senses,
                  spellcasting, and more detailed monster features. Your data is preserved when
                  switching modes.
                </Text>
              </Surface>
            </>
          )}
        </Tabs.Content>

        {/* ── Tab: Stats (Advanced only) ── */}
        {mode === 'advanced' && (
          <Tabs.Content value="stats" className="space-y-6">
            <AbilityScoresSection formData={formData} onChange={handleChange} disabled={disabled} />
            <DefensesSection formData={formData} onChange={handleChange} disabled={disabled} />
            <SensesSection formData={formData} onChange={handleChange} disabled={disabled} />
          </Tabs.Content>
        )}

        {/* ── Tab: Features (Advanced only) ── */}
        {mode === 'advanced' && (
          <Tabs.Content value="features" className="space-y-6">
            <FeaturesSection formData={formData} onChange={handleChange} disabled={disabled} />
            <SpellcastingSection formData={formData} onChange={handleChange} disabled={disabled} />
            <MetaSection formData={formData} onChange={handleChange} disabled={disabled} />
          </Tabs.Content>
        )}
      </Tabs.Root>
    </EditorLayout>
  );
}

export default MonsterEditor;
