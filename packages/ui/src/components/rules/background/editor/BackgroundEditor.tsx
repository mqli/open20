import { useCallback, useMemo } from 'react';
import { Input, Text } from '@open20/ui';
import type { Background, Gear } from 'open20-core';
import type { BackgroundEditorProps } from './BackgroundEditor.types';
import { COMMON_SKILLS } from './BackgroundEditor.types';
import { Tabs } from '@/components/base/Tabs/Tabs';
import { EditorLayout } from '@/components/base/EditorLayout';
import { BackgroundCard } from '@/components/rules/background/BackgroundCard';

export function BackgroundEditor({
  value,
  onChange,
  onSubmit,
  onCancel,
  disabled = false,
  className,
  renderActions,
}: BackgroundEditorProps) {
  const update = useCallback(
    (partial: Partial<Background>) => {
      onChange?.({ ...value, ...partial });
    },
    [value, onChange],
  );

  const toggleSkill = useCallback(
    (skill: string) => {
      const current = [...(value?.skillProficiencies || [])];
      if (current.includes(skill)) {
        update({ skillProficiencies: current.filter((s) => s !== skill) });
      } else {
        update({ skillProficiencies: [...current, skill] });
      }
    },
    [value, update],
  );

  const handleSave = (intent?: 'stay' | 'new' | 'close') => {
    if (onSubmit && value?.id) {
      onSubmit(value as Background, intent);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave('stay');
  };

  const isDirty = true;
  const isValid = Boolean(value?.id);

  const previewBackground = useMemo(() => value as Background, [value]);

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
      preview={<BackgroundCard background={previewBackground} density="compact" />}
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
          <Tabs.Trigger variant="pills" value="features">
            Features
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
                placeholder="e.g., acolyte"
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
                placeholder="e.g., Acolyte"
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
                Starting Gold (gp)
              </Text>
              <Input
                type="number"
                value={value?.startingGold ?? 0}
                onChange={(e) => update({ startingGold: Number(e.target.value) })}
                disabled={disabled}
              />
            </div>
          </div>

          {/* Proficiencies */}
          <div className="space-y-2">
            <Text as="label" variant="bodySm" className="font-medium">
              Skill Proficiencies
            </Text>
            <div className="grid grid-cols-3 gap-1.5">
              {COMMON_SKILLS.map((skill) => {
                const selected = (value?.skillProficiencies || []).includes(skill);
                return (
                  <label
                    key={skill}
                    className={`flex items-center gap-1.5 p-1.5 rounded text-xs cursor-pointer transition-colors ${
                      disabled ? 'opacity-50 cursor-not-allowed' : ''
                    } ${selected ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-bg-secondary'}`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleSkill(skill)}
                      className="rounded"
                      disabled={disabled}
                    />
                    {skill}
                  </label>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Text as="label" variant="bodySm" className="font-medium">
                Tool Proficiencies (comma-separated)
              </Text>
              <Input
                value={(value?.toolProficiencies || []).join(', ')}
                onChange={(e) =>
                  update({
                    toolProficiencies: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="e.g., Thieves' Tools"
                disabled={disabled}
              />
            </div>
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
                placeholder="e.g., Common, Elvish"
                disabled={disabled}
              />
            </div>
          </div>

          {/* Equipment */}
          <div className="space-y-1.5">
            <Text as="label" variant="bodySm" className="font-medium">
              Equipment (one per line, format: name | quantity)
            </Text>
            <textarea
              className="w-full p-2 border rounded-md bg-background text-sm min-h-[100px] font-mono disabled:opacity-50"
              value={((value?.startingEquipment || []) as readonly Gear[])
                .map((g) => `${g.name}${g.quantity ? ` | ${g.quantity}` : ''}`)
                .join('\n')}
              onChange={(e) => {
                const gear: Gear[] = e.target.value
                  .split('\n')
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .map((line) => {
                    const [name, qtyStr] = line.split('|').map((s) => s.trim());
                    return {
                      id: name.toLowerCase().replace(/\s+/g, '-'),
                      name,
                      quantity: qtyStr ? Number(qtyStr) : 1,
                    } as Gear;
                  });
                update({ startingEquipment: gear });
              }}
              placeholder="Holy Symbol | 1\nPrayer Book | 1"
              disabled={disabled}
            />
          </div>
        </Tabs.Content>

        {/* Tab: Features */}
        <Tabs.Content value="features" className="space-y-6">
          <div className="space-y-1.5">
            <Text as="label" variant="bodySm" className="font-medium">
              Origin Feat ID
            </Text>
            <Input
              value={value?.originFeatId || ''}
              onChange={(e) => update({ originFeatId: e.target.value })}
              placeholder="e.g., magic-initiate"
              disabled={disabled}
            />
          </div>
        </Tabs.Content>

        {/* Tab: Description */}
        <Tabs.Content value="description" className="space-y-6">
          <Text as="p" variant="bodySm" className="text-muted-foreground">
            Personality traits, ideals, bonds, and flaws can be added as notes.
          </Text>
          <div className="space-y-1.5">
            <Text as="label" variant="bodySm" className="font-medium">
              Personality Notes
            </Text>
            <textarea
              className="w-full p-2 border rounded-md bg-background text-sm min-h-[80px] disabled:opacity-50"
              value={value?.description || ''}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Additional personality notes..."
              disabled={disabled}
            />
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </EditorLayout>
  );
}
