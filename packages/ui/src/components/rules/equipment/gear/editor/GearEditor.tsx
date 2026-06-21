import { useState, useCallback } from 'react';
import { Input, Text, Button } from '@open20/ui';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Gear } from 'open20-core';
import type { GearEditorProps } from './GearEditor.types';
import { GEAR_TYPES } from './GearEditor.types';

type AccordionSection = 'basic' | 'category' | 'description';

export function GearEditor({
  value,
  onChange,
  onSubmit,
  onCancel,
  disabled = false,
  className,
  renderActions,
}: GearEditorProps) {
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
    (partial: Partial<Gear>) => {
      onChange?.({ ...value, ...partial });
    },
    [value, onChange],
  );

  const handleSave = (intent: 'stay' | 'new' | 'close') => {
    if (onSubmit && value?.id) {
      onSubmit(value as Gear, intent);
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
                    placeholder="e.g., backpack"
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
                    placeholder="e.g., Backpack"
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
                    Type
                  </Text>
                  <select
                    className="w-full p-2 border rounded-md bg-background text-sm disabled:opacity-50"
                    value={value?.type || 'gears'}
                    onChange={(e) => update({ type: e.target.value as Gear['type'] })}
                    disabled={disabled}
                  >
                    {GEAR_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t === 'gears' ? 'Gear' : 'Consumable'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Category & Cost */}
        <div>
          <AccordionHeader section="category" title="Cost & Weight" />
          {openSections.has('category') && (
            <div className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Text as="label" variant="bodySm" className="font-medium">
                    Cost
                  </Text>
                  <Input
                    value={value?.cost || ''}
                    onChange={(e) => update({ cost: e.target.value })}
                    placeholder="e.g., 2 gp"
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-1.5">
                  <Text as="label" variant="bodySm" className="font-medium">
                    Weight (lbs)
                  </Text>
                  <Input
                    type="number"
                    value={value?.weight ?? 0}
                    onChange={(e) => update({ weight: Number(e.target.value) })}
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-1.5">
                  <Text as="label" variant="bodySm" className="font-medium">
                    Quantity
                  </Text>
                  <Input
                    type="number"
                    value={value?.quantity ?? ''}
                    onChange={(e) =>
                      update({
                        quantity: e.target.value === '' ? undefined : Number(e.target.value),
                      })
                    }
                    placeholder="1"
                    disabled={disabled}
                  />
                </div>
              </div>
              <label
                className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                  disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-bg-secondary'
                }`}
              >
                <input
                  type="checkbox"
                  checked={value?.equipped ?? false}
                  onChange={(e) => update({ equipped: e.target.checked })}
                  className="rounded"
                  disabled={disabled}
                />
                <Text as="span" variant="bodySm">
                  Equipped
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
                  className="w-full p-2 border rounded-md bg-background text-sm min-h-[80px] disabled:opacity-50"
                  value={((value as Record<string, unknown>)?.description as string) || ''}
                  onChange={(e) => {
                    const updated = { ...value, description: e.target.value } as Partial<Gear>;
                    onChange?.(updated);
                  }}
                  placeholder="Describe the gear item..."
                  disabled={disabled}
                />
              </div>
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
