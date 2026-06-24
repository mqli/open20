import { useCallback, useMemo } from 'react';
import { Input, Text } from '@open20/ui';
import type { Weapon } from 'open20-core';
import type { WeaponEditorProps } from './WeaponEditor.types';
import {
  WEAPON_CATEGORIES,
  WEAPON_BASE_PROPERTIES,
  WEAPON_MASTERY_PROPERTIES,
  DAMAGE_TYPES,
  ABILITY_NAMES,
} from './WeaponEditor.types';
import { Tabs } from '@/components/base/Tabs/Tabs';
import { EditorLayout } from '@/components/base/EditorLayout';
import { EquipmentCard } from '@/components/rules/equipment/EquipmentCard';

export function WeaponEditor({
  value,
  onChange,
  onSubmit,
  onCancel,
  disabled = false,
  className,
  renderActions,
}: WeaponEditorProps) {
  const update = useCallback(
    (partial: Partial<Weapon>) => {
      onChange?.({ ...value, ...partial });
    },
    [value, onChange],
  );

  const toggleProperty = useCallback(
    (prop: string) => {
      const current = [...(value?.properties || [])] as string[];
      if (current.includes(prop))
        update({ properties: current.filter((p) => p !== prop) as Weapon['properties'] });
      else update({ properties: [...current, prop] as Weapon['properties'] });
    },
    [value, update],
  );

  const toggleMastery = useCallback(
    (prop: string) => {
      const current = [...(value?.mastery || [])] as string[];
      if (current.includes(prop))
        update({ mastery: current.filter((p) => p !== prop) as Weapon['mastery'] });
      else update({ mastery: [...current, prop] as Weapon['mastery'] });
    },
    [value, update],
  );

  const updateDamageEntry = useCallback(
    (index: number, partial: Record<string, unknown>) => {
      const entries = value?.damage?.entries
        ? [...value.damage.entries.map((e) => ({ ...e }))]
        : [{ dice: '1d6', type: 'Slashing' }];
      if (entries[index]) Object.assign(entries[index], partial);
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

  const handleSave = (intent?: 'stay' | 'new' | 'close') => {
    if (onSubmit && value?.id) {
      onSubmit(value as Weapon, intent);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave('stay');
  };

  const isDirty = true;
  const isValid = Boolean(value?.id);

  const previewWeapon = useMemo(() => value as Weapon, [value]);

  const SelectField = ({
    label,
    selValue,
    selOnChange,
    options,
  }: {
    label: string;
    selValue: string;
    selOnChange: (v: string) => void;
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
    <EditorLayout
      className={className}
      onSubmit={handleSubmit}
      onSave={handleSave}
      onCancel={onCancel || undefined}
      disabled={disabled}
      isDirty={isDirty}
      isValid={isValid}
      renderActions={renderActions}
      preview={<EquipmentCard equipment={previewWeapon} density="compact" />}
      previewLabel="Preview"
      cancelLabel="Cancel"
      saveLabel="Save"
      isCreate={!value?.id}
    >
      <Tabs.Root defaultValue="general" className="flex flex-1 flex-col">
        <Tabs.List variant="pills" className="mb-4">
          <Tabs.Trigger variant="pills" value="general">
            General
          </Tabs.Trigger>
          <Tabs.Trigger variant="pills" value="stats">
            Stats
          </Tabs.Trigger>
          <Tabs.Trigger variant="pills" value="description">
            Description
          </Tabs.Trigger>
        </Tabs.List>

        {/* Tab: General */}
        <Tabs.Content value="general" className="space-y-6">
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
              selValue={value?.category || 'Simple'}
              selOnChange={(v) => update({ category: v as Weapon['category'] })}
              options={WEAPON_CATEGORIES}
            />
          </div>
        </Tabs.Content>

        {/* Tab: Stats */}
        <Tabs.Content value="stats" className="space-y-6">
          {/* Damage */}
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
              selValue={value?.damage?.entries?.[0]?.type || 'Slashing'}
              selOnChange={(v) => updateDamageEntry(0, { type: v })}
              options={DAMAGE_TYPES}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Ability"
              selValue={value?.damage?.ability || 'Strength'}
              selOnChange={(v) =>
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

          {/* Properties */}
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
                    className={`flex items-center gap-1.5 p-1.5 rounded text-xs cursor-pointer transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${selected ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-bg-secondary'}`}
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
                    className={`flex items-center gap-1.5 p-1.5 rounded text-xs cursor-pointer transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${selected ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-bg-secondary'}`}
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

          {/* Cost & Weight */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Text as="label" variant="bodySm" className="font-medium">
                Cost Quantity
              </Text>
              <Input
                type="number"
                value={value?.cost?.quantity ?? ''}
                onChange={(e) => {
                  const qty = e.target.value === '' ? undefined : Number(e.target.value);
                  update({
                    cost:
                      qty !== undefined
                        ? { quantity: qty, unit: value?.cost?.unit ?? 'gp' }
                        : undefined,
                  });
                }}
                placeholder="e.g., 15"
                disabled={disabled}
              />
            </div>
            <div className="space-y-1.5">
              <Text as="label" variant="bodySm" className="font-medium">
                Cost Unit
              </Text>
              <select
                className="w-full p-2 border rounded-md bg-background text-sm disabled:opacity-50"
                value={value?.cost?.unit ?? 'gp'}
                onChange={(e) =>
                  update({ cost: { quantity: value?.cost?.quantity ?? 0, unit: e.target.value } })
                }
                disabled={disabled}
              >
                <option value="cp">cp</option>
                <option value="sp">sp</option>
                <option value="gp">gp</option>
                <option value="pp">pp</option>
              </select>
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
        </Tabs.Content>

        {/* Tab: Description */}
        <Tabs.Content value="description" className="space-y-6">
          <div className="space-y-1.5">
            <Text as="label" variant="bodySm" className="font-medium">
              Description
            </Text>
            <textarea
              className="w-full p-2 border rounded-md bg-background text-sm min-h-[80px] disabled:opacity-50"
              value={((value as Record<string, unknown>)?.description as string) || ''}
              onChange={(e) => {
                const updated = { ...value, description: e.target.value } as Partial<Weapon>;
                onChange?.(updated);
              }}
              placeholder="Describe the weapon..."
              disabled={disabled}
            />
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </EditorLayout>
  );
}
