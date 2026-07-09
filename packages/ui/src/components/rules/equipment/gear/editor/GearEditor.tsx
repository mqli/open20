import { useCallback, useMemo } from 'react';
import { Input, Text } from '@open20/ui';
import type { Gear } from 'open20-core';
import type { GearEditorProps } from './GearEditor.types';
import { GEAR_TYPES } from './GearEditor.types';
import { Tabs } from '@/components/base/Tabs/Tabs';
import { EditorLayout } from '@/components/base/EditorLayout';
import { EquipmentCard } from '@/components/rules/equipment/EquipmentCard';

export function GearEditor({
  value,
  onChange,
  onSubmit,
  onCancel,
  disabled = false,
  className,
  renderActions,
}: GearEditorProps) {
  const update = useCallback(
    (partial: Partial<Gear>) => {
      onChange?.({ ...value, ...partial });
    },
    [value, onChange],
  );

  const handleSave = (intent?: 'stay' | 'new' | 'close') => {
    if (onSubmit && value?.id) {
      onSubmit(value as Gear, intent);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave('stay');
  };

  const isDirty = true;
  const isValid = Boolean(value?.id);

  const previewGear = useMemo(() => value as Gear, [value]);

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
      preview={<EquipmentCard equipment={previewGear} density="compact" />}
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
        </Tabs.Content>

        {/* Tab: Stats */}
        <Tabs.Content value="stats" className="space-y-6">
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Text as="label" variant="bodySm" className="font-medium">
                Cost Qty
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
                placeholder="e.g., 2"
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
            <div className="space-y-1.5">
              <Text as="label" variant="bodySm" className="font-medium">
                Quantity
              </Text>
              <Input
                type="number"
                value={value?.quantity ?? ''}
                onChange={(e) =>
                  update({ quantity: e.target.value === '' ? undefined : Number(e.target.value) })
                }
                placeholder="1"
                disabled={disabled}
              />
            </div>
          </div>
          <label
            className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-bg-secondary'}`}
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
                const updated = { ...value, description: e.target.value } as Partial<Gear>;
                onChange?.(updated);
              }}
              placeholder="Describe the gear item..."
              disabled={disabled}
            />
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </EditorLayout>
  );
}
