import { useState, useCallback } from 'react';
import { Input, Text, Button } from '@open20/ui';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Weapon } from 'open20-core';
import type { WeaponEditorProps } from './WeaponEditor.types';
import {
  WEAPON_CATEGORIES,
  WEAPON_BASE_PROPERTIES,
  WEAPON_MASTERY_PROPERTIES,
  DAMAGE_TYPES,
  ABILITY_NAMES,
} from './WeaponEditor.types';

type AccordionSection = 'basic' | 'damage' | 'properties' | 'cost' | 'description';

export function WeaponEditor({
  value,
  onChange,
  onSubmit,
  onCancel,
  disabled = false,
  className,
  renderActions,
}: WeaponEditorProps) {
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
    (partial: Partial<Weapon>) => {
      onChange?.({ ...value, ...partial });
    },
    [value, onChange],
  );

  const toggleProperty = useCallback(
    (prop: string) => {
      const current = [...(value?.properties || [])] as string[];
      if (current.includes(prop)) {
        update({ properties: current.filter((p) => p !== prop) as Weapon['properties'] });
      } else {
        update({ properties: [...current, prop] as Weapon['properties'] });
      }
    },
    [value, update],
  );

  const toggleMastery = useCallback(
    (prop: string) => {
      const current = [...(value?.mastery || [])] as string[];
      if (current.includes(prop)) {
        update({ mastery: current.filter((p) => p !== prop) as Weapon['mastery'] });
      } else {
        update({ mastery: [...current, prop] as Weapon['mastery'] });
      }
    },
    [value, update],
  );

  const updateDamageEntry = useCallback(
    (index: number, partial: Record<string, unknown>) => {
      const entries = value?.damage?.entries
        ? [...value.damage.entries.map((e) => ({ ...e }))]
        : [{ dice: '1d6', type: 'Slashing' }];
      if (entries[index]) {
        Object.assign(entries[index], partial);
      }
      update({
        damage: {
          entries: entries as Weapon['damage']['entries'],
          ability: value?.damage?.ability ?? 'Strength',
          bonus: value?.damage?.bonus ?? 0,
        },
      });
    },
    [value, update],
  );

  const handleSave = (intent: 'stay' | 'new' | 'close') => {
    if (onSubmit && value?.id) {
      onSubmit(value as Weapon, intent);
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

  const SelectField = ({
    label,
    value: selValue,
    onChange: selOnChange,
    options,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: readonly string[];
  }) => (
    <div className="space-y-1.5">
      <Text as="label" variant="bodySm" className="font-medium">
        {label}
      </Text>
      <select
        className="w-full p-2 border rounded-md bg-background text-sm disabled:opacity-50"
        value={selValue}
        onChange={(e) => selOnChange(e.target.value)}
        disabled={disabled}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
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
                    placeholder="e.g., longsword"
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
                    placeholder="e.g., Longsword"
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
                <SelectField
                  label="Category"
                  value={value?.category || 'Simple'}
                  onChange={(v) => update({ category: v as Weapon['category'] })}
                  options={WEAPON_CATEGORIES}
                />
              </div>
            </div>
          )}
        </div>

        {/* Damage */}
        <div>
          <AccordionHeader section="damage" title="Damage" />
          {openSections.has('damage') && (
            <div className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Text as="label" variant="bodySm" className="font-medium">
                    Damage Dice
                  </Text>
                  <Input
                    value={value?.damage?.entries?.[0]?.dice || '1d6'}
                    onChange={(e) => updateDamageEntry(0, { dice: e.target.value })}
                    placeholder="e.g., 1d8"
                    disabled={disabled}
                  />
                </div>
                <SelectField
                  label="Damage Type"
                  value={value?.damage?.entries?.[0]?.type || 'Slashing'}
                  onChange={(v) => updateDamageEntry(0, { type: v })}
                  options={DAMAGE_TYPES}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <SelectField
                  label="Ability"
                  value={value?.damage?.ability || 'Strength'}
                  onChange={(v) =>
                    update({
                      damage: {
                        entries: value?.damage?.entries ?? [{ dice: '1d6', type: 'Slashing' }],
                        ability: v as Weapon['damage']['ability'],
                        bonus: value?.damage?.bonus ?? 0,
                      },
                    })
                  }
                  options={ABILITY_NAMES}
                />
                <div className="space-y-1.5">
                  <Text as="label" variant="bodySm" className="font-medium">
                    Bonus
                  </Text>
                  <Input
                    type="number"
                    value={value?.damage?.bonus ?? 0}
                    onChange={(e) =>
                      update({
                        damage: {
                          entries: value?.damage?.entries ?? [{ dice: '1d6', type: 'Slashing' }],
                          ability: value?.damage?.ability ?? 'Strength',
                          bonus: Number(e.target.value),
                        },
                      })
                    }
                    disabled={disabled}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Properties */}
        <div>
          <AccordionHeader section="properties" title="Properties" />
          {openSections.has('properties') && (
            <div className="px-4 pb-4 space-y-4">
              <div className="space-y-2">
                <Text as="label" variant="bodySm" className="font-medium">
                  Weapon Properties
                </Text>
                <div className="grid grid-cols-3 gap-1.5">
                  {WEAPON_BASE_PROPERTIES.map((prop) => {
                    const selected = (value?.properties || []).includes(prop);
                    return (
                      <label
                        key={prop}
                        className={`flex items-center gap-1.5 p-1.5 rounded text-xs cursor-pointer transition-colors ${
                          disabled ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                          selected
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'hover:bg-bg-secondary'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleProperty(prop)}
                          className="rounded"
                          disabled={disabled}
                        />
                        {prop}
                      </label>
                    );
                  })}
                </div>
              </div>
              {value?.properties?.includes('Range') && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Text as="label" variant="bodySm" className="font-medium">
                      Normal Range (ft)
                    </Text>
                    <Input
                      type="number"
                      value={value?.range?.normal ?? ''}
                      onChange={(e) =>
                        update({
                          range: {
                            normal: Number(e.target.value) || 0,
                            maximum: value?.range?.maximum,
                          },
                        })
                      }
                      disabled={disabled}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Text as="label" variant="bodySm" className="font-medium">
                      Max Range (ft)
                    </Text>
                    <Input
                      type="number"
                      value={value?.range?.maximum ?? ''}
                      onChange={(e) =>
                        update({
                          range: {
                            normal: value?.range?.normal ?? 0,
                            maximum: Number(e.target.value) || undefined,
                          },
                        })
                      }
                      disabled={disabled}
                    />
                  </div>
                </div>
              )}
              {value?.properties?.includes('Versatile') && (
                <div className="space-y-1.5">
                  <Text as="label" variant="bodySm" className="font-medium">
                    Versatile Damage
                  </Text>
                  <Input
                    value={value?.versatileDamage || ''}
                    onChange={(e) => update({ versatileDamage: e.target.value || undefined })}
                    placeholder="e.g., 1d10"
                    disabled={disabled}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Text as="label" variant="bodySm" className="font-medium">
                  Weapon Mastery (2024)
                </Text>
                <div className="grid grid-cols-4 gap-1.5">
                  {WEAPON_MASTERY_PROPERTIES.map((prop) => {
                    const selected = (value?.mastery || []).includes(prop);
                    return (
                      <label
                        key={prop}
                        className={`flex items-center gap-1.5 p-1.5 rounded text-xs cursor-pointer transition-colors ${
                          disabled ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                          selected
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'hover:bg-bg-secondary'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleMastery(prop)}
                          className="rounded"
                          disabled={disabled}
                        />
                        {prop}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cost & Weight */}
        <div>
          <AccordionHeader section="cost" title="Cost & Weight" />
          {openSections.has('cost') && (
            <div className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Text as="label" variant="bodySm" className="font-medium">
                    Cost
                  </Text>
                  <Input
                    value={value?.cost || ''}
                    onChange={(e) => update({ cost: e.target.value })}
                    placeholder="e.g., 15 gp"
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
              </div>
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
                    // Store description in value object
                    const updated = { ...value, description: e.target.value } as Partial<Weapon>;
                    onChange?.(updated);
                  }}
                  placeholder="Describe the weapon..."
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
