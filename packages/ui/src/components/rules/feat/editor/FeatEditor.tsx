import { useState, useCallback } from 'react';
import { Input, Text, Button } from '@open20/ui';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Feat, FeatCategory, FeatGrant } from 'open20-core';
import type { FeatEditorProps } from './FeatEditor.types';
import { FEAT_CATEGORIES } from './FeatEditor.types';

type AccordionSection = 'basic' | 'description' | 'benefits';

export function FeatEditor({
  value,
  onChange,
  onSubmit,
  onCancel,
  disabled = false,
  className,
  renderActions,
}: FeatEditorProps) {
  const [openSections, setOpenSections] = useState<Set<AccordionSection>>(new Set(['basic']));

  const toggleSection = (section: AccordionSection) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const update = useCallback(
    (partial: Partial<Feat>) => {
      onChange?.({ ...value, ...partial });
    },
    [value, onChange],
  );

  const updatePrerequisite = useCallback(
    (partial: Record<string, unknown>) => {
      const prerequisites: Record<string, unknown> = {
        ...(value?.prerequisites || {}),
        ...partial,
      };
      // Clean up empty values
      if (prerequisites.level === undefined || prerequisites.level === 0)
        delete prerequisites.level;
      if (!prerequisites.classId) delete prerequisites.classId;
      if (!prerequisites.species) delete prerequisites.species;
      update({
        prerequisites:
          Object.keys(prerequisites).length > 0
            ? (prerequisites as Feat['prerequisites'])
            : undefined,
      });
    },
    [value, update],
  );

  const handleSave = (intent: 'stay' | 'new' | 'close') => {
    if (onSubmit && value?.id) {
      onSubmit(value as Feat, intent);
    }
  };

  const isDirty = true;
  const isValid = Boolean(value?.id);

  const AccordionHeader = ({ section, title }: { section: AccordionSection; title: string }) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      disabled={disabled}
      className="flex items-center gap-2 w-full text-left py-3 px-4 rounded-lg hover:bg-bg-secondary transition-colors disabled:opacity-50"
    >
      {openSections.has(section) ? (
        <ChevronDown className="w-4 h-4" />
      ) : (
        <ChevronRight className="w-4 h-4" />
      )}
      <Text as="h3" variant="body" className="font-semibold">
        {title}
      </Text>
    </button>
  );

  return (
    <div className={className}>
      <div className="space-y-1 border rounded-lg divide-y">
        {/* Basic Info */}
        <div>
          <AccordionHeader section="basic" title="Basic Info" />
          {openSections.has('basic') && (
            <div className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Text as="label" variant="bodySm" className="font-medium">
                    ID
                  </Text>
                  <Input
                    value={value?.id || ''}
                    onChange={(e) => update({ id: e.target.value })}
                    placeholder="e.g., alert"
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-1.5">
                  <Text as="label" variant="bodySm" className="font-medium">
                    Name
                  </Text>
                  <Input
                    value={value?.name || ''}
                    onChange={(e) => update({ name: e.target.value })}
                    placeholder="e.g., Alert"
                    disabled={disabled}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Text as="label" variant="bodySm" className="font-medium">
                    Source
                  </Text>
                  <Input
                    value={value?.source || ''}
                    onChange={(e) => update({ source: e.target.value })}
                    placeholder="e.g., SRD 5.2"
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-1.5">
                  <Text as="label" variant="bodySm" className="font-medium">
                    Category
                  </Text>
                  <select
                    className="w-full p-2 border rounded-md bg-background text-sm disabled:opacity-50"
                    value={value?.category || 'General'}
                    onChange={(e) => update({ category: e.target.value as FeatCategory })}
                    disabled={disabled}
                  >
                    {FEAT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Prerequisites */}
              <div className="space-y-2 p-3 border rounded-lg bg-bg-secondary/30">
                <Text as="p" variant="bodySm" className="font-medium">
                  Prerequisites (optional)
                </Text>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Text as="label" variant="bodySm" className="text-xs">
                      Min Level
                    </Text>
                    <Input
                      type="number"
                      value={value?.prerequisites?.level ?? ''}
                      onChange={(e) =>
                        updatePrerequisite({ level: Number(e.target.value) || undefined })
                      }
                      placeholder="e.g., 4"
                      disabled={disabled}
                    />
                  </div>
                  <div className="space-y-1">
                    <Text as="label" variant="bodySm" className="text-xs">
                      Class ID
                    </Text>
                    <Input
                      value={value?.prerequisites?.classId || ''}
                      onChange={(e) => updatePrerequisite({ classId: e.target.value || undefined })}
                      placeholder="e.g., fighter"
                      disabled={disabled}
                    />
                  </div>
                  <div className="space-y-1">
                    <Text as="label" variant="bodySm" className="text-xs">
                      Species
                    </Text>
                    <Input
                      value={value?.prerequisites?.species || ''}
                      onChange={(e) => updatePrerequisite({ species: e.target.value || undefined })}
                      placeholder="e.g., human"
                      disabled={disabled}
                    />
                  </div>
                </div>
              </div>

              {/* Repeatable */}
              <label
                className={`flex items-center gap-2 ${
                  disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <input
                  type="checkbox"
                  checked={value?.repeatable || false}
                  onChange={(e) => update({ repeatable: e.target.checked })}
                  className="rounded"
                  disabled={disabled}
                />
                <Text as="span" variant="bodySm">
                  Repeatable
                </Text>
              </label>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <AccordionHeader section="description" title="Description" />
          {openSections.has('description') && (
            <div className="px-4 pb-4 space-y-3">
              <div className="space-y-1.5">
                <Text as="label" variant="bodySm" className="font-medium">
                  Description
                </Text>
                <textarea
                  className="w-full p-2 border rounded-md bg-background text-sm min-h-[120px] disabled:opacity-50"
                  value={value?.description || ''}
                  onChange={(e) => update({ description: e.target.value })}
                  placeholder="Describe the feat's effects..."
                  disabled={disabled}
                />
              </div>
            </div>
          )}
        </div>

        {/* Benefits */}
        <div>
          <AccordionHeader section="benefits" title="Benefits (Grants)" />
          {openSections.has('benefits') && (
            <div className="px-4 pb-4 space-y-3">
              <Text as="p" variant="bodySm" className="text-muted-foreground">
                Feat grants define mechanical benefits. Currently displayed as read-only. Use JSON
                import/export to manage complex grant structures.
              </Text>
              {((value?.grants || []) as readonly FeatGrant[]).length > 0 && (
                <div className="space-y-2">
                  {((value?.grants || []) as readonly FeatGrant[]).map((grant, index) => (
                    <div key={index} className="p-2 border rounded bg-bg-secondary/50 text-sm">
                      <span className="font-medium">{grant.type}</span>
                      <pre className="mt-1 text-xs text-muted-foreground">
                        {JSON.stringify(grant, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
              {(!value?.grants || (value.grants as readonly FeatGrant[]).length === 0) && (
                <Text as="p" variant="bodySm" className="text-muted-foreground italic">
                  No grants defined.
                </Text>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      {renderActions ? (
        <div className="mt-6">
          {renderActions({
            onSave: handleSave,
            isDirty,
            isValid,
            isSubmitting: false,
          })}
        </div>
      ) : (
        <div className="flex items-center justify-end gap-2 mt-6">
          {onCancel && (
            <Button type="button" variant="ghost" size="lg" onClick={onCancel} disabled={disabled}>
              Cancel
            </Button>
          )}
          {onSubmit && (
            <>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => handleSave('stay')}
                disabled={!isValid || disabled}
              >
                Save
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => handleSave('new')}
                disabled={!isValid || disabled}
              >
                Save & New
              </Button>
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={() => handleSave('close')}
                disabled={!isValid || disabled}
              >
                Save & Close
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
