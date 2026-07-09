import { useCallback, useMemo } from 'react';
import { Input, Text } from '@open20/ui';
import type { Armor } from 'open20-core';
import type { ArmorEditorProps } from './ArmorEditor.types';
import { ARMOR_CATEGORIES } from './ArmorEditor.types';
import { Tabs } from '@/components/base/Tabs/Tabs';
import { EditorLayout } from '@/components/base/EditorLayout';
import { EquipmentCard } from '@/components/rules/equipment/EquipmentCard';

export function ArmorEditor({
  value,
  onChange,
  onSubmit,
  onCancel,
  disabled = false,
  className,
  renderActions,
}: ArmorEditorProps) {
  const update = useCallback(
    (partial: Partial<Armor>) => {
      onChange?.({ ...value, ...partial });
    },
    [value, onChange],
  );

  const handleSave = (intent?: 'stay' | 'new' | 'close') => {
    if (onSubmit && value?.id) {
      onSubmit(value as Armor, intent);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave('stay');
  };

  const isDirty = true;
  const isValid = Boolean(value?.id);

  const previewArmor = useMemo(() => value as Armor, [value]);

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
      preview={<EquipmentCard equipment={previewArmor} density="compact" />}
      previewLabel="Preview"
      cancelLabel="Cancel"
      saveLabel="Save"
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
                placeholder="e.g., chain-mail"
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
                placeholder="e.g., Chain Mail"
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
                value={value?.category || 'Light'}
                onChange={(e) => update({ category: e.target.value as Armor['category'] })}
                disabled={disabled}
              >
                {ARMOR_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Tabs.Content>

        {/* Tab: Stats */}
        <Tabs.Content value="stats" className="space-y-6">
          {/* Armor Class */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Text as="label" variant="bodySm" className="font-medium">
                Base AC
              </Text>
              <Input
                type="number"
                value={value?.ac ?? 11}
                onChange={(e) => update({ ac: Number(e.target.value) })}
                disabled={disabled}
              />
            </div>
            <div className="space-y-1.5">
              <Text as="label" variant="bodySm" className="font-medium">
                Max Dex Bonus
              </Text>
              <Input
                type="number"
                value={value?.maxDexBonus ?? ''}
                onChange={(e) =>
                  update({ maxDexBonus: e.target.value === '' ? null : Number(e.target.value) })
                }
                placeholder="No limit"
                disabled={disabled}
              />
            </div>
          </div>
          <label
            className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-bg-secondary'}`}
          >
            <input
              type="checkbox"
              checked={value?.dexBonus ?? true}
              onChange={(e) => update({ dexBonus: e.target.checked })}
              className="rounded"
              disabled={disabled}
            />
            <Text as="span" variant="bodySm">
              Add Dexterity Bonus to AC
            </Text>
          </label>

          {/* Requirements */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Text as="label" variant="bodySm" className="font-medium">
                Strength Requirement
              </Text>
              <Input
                type="number"
                value={value?.strengthRequirement ?? ''}
                onChange={(e) =>
                  update({
                    strengthRequirement: e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
                placeholder="None"
                disabled={disabled}
              />
            </div>
          </div>
          <label
            className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-bg-secondary'}`}
          >
            <input
              type="checkbox"
              checked={value?.stealthDisadvantage ?? false}
              onChange={(e) => update({ stealthDisadvantage: e.target.checked || undefined })}
              className="rounded"
              disabled={disabled}
            />
            <Text as="span" variant="bodySm">
              Stealth Disadvantage
            </Text>
          </label>

          {/* Cost & Weight */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Text as="label" variant="bodySm" className="font-medium">
                Cost Quantity
              </Text>
              <Input
                type="number"
                value={value?.cost?.quantity ?? ''}
                onChange={(e) =>
                  update({
                    cost: { quantity: Number(e.target.value), unit: value?.cost?.unit ?? 'gp' },
                  })
                }
                placeholder="0"
                disabled={disabled}
              />
            </div>
            <div className="space-y-1.5">
              <Text as="label" variant="bodySm" className="font-medium">
                Cost Unit
              </Text>
              <Input
                value={value?.cost?.unit ?? 'gp'}
                onChange={(e) =>
                  update({ cost: { quantity: value?.cost?.quantity ?? 0, unit: e.target.value } })
                }
                placeholder="gp"
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
                const updated = { ...value, description: e.target.value } as Partial<Armor>;
                onChange?.(updated);
              }}
              placeholder="Describe the armor..."
              disabled={disabled}
            />
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </EditorLayout>
  );
}
