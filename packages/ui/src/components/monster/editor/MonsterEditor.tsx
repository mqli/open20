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
    // Only validate ability scores in advanced mode (simple mode may skip them)
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

  // ── Simple mode: Core Attacks section ─────────────
  const coreAttacks = formData.actions.filter((a) => a.attacks && a.attacks.length > 0);
  const hasAttacks = formData.actions.length > 0;

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

        {/* ── Mode Toggle Bar ───────────────────────── */}
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

        {/* Basic Info (always shown) */}
        <BasicInfoSection formData={formData} onChange={handleChange} disabled={disabled} />

        {/* Combat Stats (always shown) */}
        <CombatSection formData={formData} onChange={handleChange} disabled={disabled} />

        {mode === 'simple' ? (
          <>
            {/* ── Simple Mode: Core Attacks only ───── */}
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

            {/* Simple mode note */}
            <Surface variant="info" padding="sm">
              <Text as="p" variant="bodySm" className="text-info-foreground">
                💡 Tip: Switch to Advanced mode to edit ability scores, defenses, senses,
                spellcasting, and more detailed monster features. Your data is preserved when
                switching modes.
              </Text>
            </Surface>
          </>
        ) : (
          <>
            {/* ── Advanced Mode: All sections ────────── */}
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
          </>
        )}

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
