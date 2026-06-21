import { useState, useCallback } from 'react';
import { Input, Text, Button } from '@open20/ui';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import type { Species, AbilityName } from 'open20-core';
import type { SpeciesEditorProps, MutableSpeciesTrait } from './SpeciesEditor.types';
import { ABILITY_LABELS } from './SpeciesEditor.types';

type AccordionSection = 'basic' | 'ability' | 'traits' | 'languages';

export function SpeciesEditor({
  value,
  onChange,
  onSubmit,
  onCancel,
  disabled = false,
  className,
  renderActions,
}: SpeciesEditorProps) {
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
    (partial: Partial<Species>) => {
      onChange?.({ ...value, ...partial });
    },
    [value, onChange],
  );

  const updateTrait = useCallback(
    (index: number, trait: Partial<MutableSpeciesTrait>) => {
      const traits: MutableSpeciesTrait[] = [
        ...((value?.baseTraits || []) as MutableSpeciesTrait[]),
      ];
      traits[index] = { ...traits[index], ...trait };
      update({ baseTraits: traits as unknown as readonly import('open20-core').SpeciesTrait[] });
    },
    [value, update],
  );

  const addTrait = useCallback(() => {
    const traits: MutableSpeciesTrait[] = [
      ...((value?.baseTraits || []) as MutableSpeciesTrait[]),
      { name: '' },
    ];
    update({ baseTraits: traits as unknown as readonly import('open20-core').SpeciesTrait[] });
  }, [value, update]);

  const removeTrait = useCallback(
    (index: number) => {
      const traits = ((value?.baseTraits || []) as MutableSpeciesTrait[]).filter(
        (_, i) => i !== index,
      );
      update({ baseTraits: traits as unknown as readonly import('open20-core').SpeciesTrait[] });
    },
    [value, update],
  );

  const updateAbility = useCallback(
    (ability: AbilityName, bonus: number) => {
      const abilityBonuses: Partial<Record<AbilityName, number>> = {
        ...(value?.abilityBonuses || {}),
      };
      if (bonus === 0) {
        delete abilityBonuses[ability];
      } else {
        abilityBonuses[ability] = bonus;
      }
      update({ abilityBonuses });
    },
    [value, update],
  );

  const handleSave = (intent: 'stay' | 'new' | 'close') => {
    if (onSubmit && value?.id) {
      onSubmit(value as Species, intent);
    }
  };

  const isDirty = true; // Simplified — consumer tracks this
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
                    placeholder="e.g., dwarf"
                    disabled={disabled}
                  />
                </div>
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
              </div>
              <div className="space-y-1.5">
                <Text as="label" variant="bodySm" className="font-medium">
                  Description
                </Text>
                <textarea
                  className="w-full p-2 border rounded-md bg-background text-sm min-h-[80px] disabled:opacity-50"
                  value={value?.description || ''}
                  onChange={(e) => update({ description: e.target.value })}
                  placeholder="Describe the species..."
                  disabled={disabled}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Text as="label" variant="bodySm" className="font-medium">
                    Size
                  </Text>
                  <select
                    className="w-full p-2 border rounded-md bg-background text-sm disabled:opacity-50"
                    value={value?.size || 'Medium'}
                    onChange={(e) => update({ size: e.target.value as Species['size'] })}
                    disabled={disabled}
                  >
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Text as="label" variant="bodySm" className="font-medium">
                    Speed (ft)
                  </Text>
                  <Input
                    type="number"
                    value={value?.speed ?? 30}
                    onChange={(e) => update({ speed: Number(e.target.value) })}
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-1.5">
                  <Text as="label" variant="bodySm" className="font-medium">
                    Darkvision (ft)
                  </Text>
                  <Input
                    type="number"
                    value={value?.darkvision ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      update({ darkvision: v ? Number(v) : undefined });
                    }}
                    placeholder="Optional"
                    disabled={disabled}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ability Scores */}
        <div>
          <AccordionHeader section="ability" title="Ability Score Bonuses" />
          {openSections.has('ability') && (
            <div className="px-4 pb-4">
              <div className="grid grid-cols-6 gap-2">
                {ABILITY_LABELS.map(({ label, key }) => (
                  <div key={key} className="space-y-1.5 text-center">
                    <Text as="label" variant="bodySm" className="font-medium">
                      {label}
                    </Text>
                    <Input
                      type="number"
                      value={(value?.abilityBonuses || {})[key] ?? 0}
                      onChange={(e) => updateAbility(key, Number(e.target.value))}
                      className="text-center"
                      disabled={disabled}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Traits */}
        <div>
          <AccordionHeader section="traits" title="Traits" />
          {openSections.has('traits') && (
            <div className="px-4 pb-4 space-y-3">
              {((value?.baseTraits || []) as MutableSpeciesTrait[]).map((trait, index) => (
                <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <Input
                      value={trait.name}
                      onChange={(e) => updateTrait(index, { name: e.target.value })}
                      placeholder="Trait name"
                      disabled={disabled}
                    />
                    <textarea
                      className="w-full p-2 border rounded-md bg-background text-sm min-h-[60px] disabled:opacity-50"
                      value={trait.description || ''}
                      onChange={(e) => updateTrait(index, { description: e.target.value })}
                      placeholder="Trait description"
                      disabled={disabled}
                    />
                  </div>
                  {!disabled && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTrait(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              {!disabled && (
                <Button type="button" variant="outline" size="sm" onClick={addTrait}>
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Trait
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Languages + Subrace */}
        <div>
          <AccordionHeader section="languages" title="Languages & Subrace Options" />
          {openSections.has('languages') && (
            <div className="px-4 pb-4 space-y-3">
              <div className="space-y-1.5">
                <Text as="label" variant="bodySm" className="font-medium">
                  Languages (comma-separated)
                </Text>
                <Input
                  value={(value?.languages || []).join(', ')}
                  onChange={(e) =>
                    update({
                      languages: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="Common, Dwarvish"
                  disabled={disabled}
                />
              </div>
              {((value?.subtypes || []) as readonly { name: string }[]).map((subtype, index) => (
                <div key={index} className="p-3 border rounded-lg space-y-2">
                  <Text as="p" variant="bodySm" className="font-medium">
                    Subtype: {subtype.name || `#${index + 1}`}
                  </Text>
                </div>
              ))}
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
