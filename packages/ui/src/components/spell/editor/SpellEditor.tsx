import { useState, useCallback, useEffect } from 'react';
import type { SpellEditorProps, SpellFormData } from './SpellEditor.types';
import { spellToFormData, formDataToSpell } from './SpellEditor.types';
import { BasicInfoSection } from './sections/BasicInfoSection';
import { CastingInfoSection } from './sections/CastingInfoSection';
import { DescriptionSection } from './sections/DescriptionSection';
import { DamageHealSection } from './sections/DamageHealSection';
import { CantripUpgradeSection } from './sections/CantripUpgradeSection';
import { Button } from '@/components/Button/Button';
import { Surface } from '@/components/Surface/Surface';
import { Text } from '@/components/Text/Text';
import { SpellCard } from '@/components/spell/SpellCard';

export function SpellEditor({
  value,
  defaultValue,
  onChange,
  onSubmit,
  onCancel,
  showPreview = false,
  disabled = false,
  className,
}: SpellEditorProps) {
  // ── State ────────────────────────────────────────
  const [formData, setFormData] = useState<SpellFormData>(() =>
    spellToFormData(value || defaultValue || undefined),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync with external value (controlled mode)
  useEffect(() => {
    if (value) {
      setFormData(spellToFormData(value));
    }
  }, [value]);

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
    const newErrors: Record<string, string> = {};
    if (!formData.id.trim()) newErrors.id = 'ID is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.range.trim()) newErrors.range = 'Range is required';
    if (!formData.duration.trim()) newErrors.duration = 'Duration is required';
    if (formData.components.length === 0)
      newErrors.components = 'At least one component is required';
    if (formData.description.length === 0 || !formData.description[0]?.trim()) {
      newErrors.description = 'Description is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const spell = formDataToSpell(formData);
      onSubmit?.(spell);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
  };

  // ── Render ───────────────────────────────────────
  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Preview (optional) */}
        {showPreview && (
          <div className="sticky top-0 z-10 bg-bg-primary py-4 border-b border-border">
            <Text as="h3" variant="labelSm" className="mb-2">
              Live Preview
            </Text>
            <SpellCard spell={formDataToSpell(formData)} density="compact" />
          </div>
        )}

        {/* Basic Info */}
        <BasicInfoSection formData={formData} onChange={handleChange} disabled={disabled} />

        {/* Casting Info */}
        <CastingInfoSection formData={formData} onChange={handleChange} disabled={disabled} />

        {/* Description */}
        <DescriptionSection formData={formData} onChange={handleChange} disabled={disabled} />

        {/* Damage & Healing */}
        <DamageHealSection formData={formData} onChange={handleChange} disabled={disabled} />

        {/* Cantrip Upgrade (only for level 0) */}
        {formData.level === 0 && (
          <CantripUpgradeSection formData={formData} onChange={handleChange} disabled={disabled} />
        )}

        {/* Form Errors */}
        {Object.keys(errors).length > 0 && (
          <Surface variant="warning" padding="sm" className="space-y-1">
            <Text as="p" variant="bodySm" className="text-danger">
              Please fix the following errors:
            </Text>
            {Object.entries(errors).map(([field, msg]) => (
              <Text key={field} as="p" variant="bodySm" className="text-danger ml-2">
                • {msg}
              </Text>
            ))}
          </Surface>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4 border-t border-border">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={handleCancel}
              disabled={isSubmitting || disabled}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" variant="primary" size="lg" disabled={isSubmitting || disabled}>
            {isSubmitting ? 'Saving...' : value ? 'Update Spell' : 'Create Spell'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default SpellEditor;
