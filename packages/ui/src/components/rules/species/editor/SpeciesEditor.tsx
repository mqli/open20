import { useCallback, useMemo } from 'react';
import { Input, Text, Button } from '@open20/ui';
import { Plus, Trash2 } from 'lucide-react';
import type { Species, AbilityName } from 'open20-core';
import type { SpeciesEditorProps, MutableSpeciesTrait } from './SpeciesEditor.types';
import { ABILITY_LABELS } from './SpeciesEditor.types';
import { Tabs } from '@/components/base/Tabs/Tabs';
import { EditorLayout } from '@/components/base/EditorLayout';
import { SpeciesCard } from '@/components/rules/species/SpeciesCard';

export function SpeciesEditor({
  value,
  onChange,
  onSubmit,
  onCancel,
  disabled = false,
  className,
  renderActions,
}: SpeciesEditorProps) {
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
      if (bonus === 0) delete abilityBonuses[ability];
      else abilityBonuses[ability] = bonus;
      update({ abilityBonuses });
    },
    [value, update],
  );

  const handleSave = (intent?: 'stay' | 'new' | 'close') => {
    if (onSubmit && value?.id) {
      onSubmit(value as Species, intent);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave('stay');
  };

  const isDirty = true;
  const isValid = Boolean(value?.id);

  const previewSpecies = useMemo(() => value as Species, [value]);

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
      preview={<SpeciesCard species={previewSpecies} density="compact" />}
      previewLabel="Preview"
      cancelLabel="Cancel"
      saveLabel="Save"
    >
      <Tabs.Root defaultValue="general" className="flex flex-1 flex-col">
        <Tabs.List variant="pills" className="mb-4">
          <Tabs.Trigger variant="pills" value="general">
            General
          </Tabs.Trigger>
          <Tabs.Trigger variant="pills" value="traits">
            Traits
          </Tabs.Trigger>
          <Tabs.Trigger variant="pills" value="options">
            Options
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
        </Tabs.Content>

        {/* Tab: Traits */}
        <Tabs.Content value="traits" className="space-y-6">
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

          <div className="space-y-3">
            <Text as="h3" variant="body" className="font-semibold">
              Traits
            </Text>
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
        </Tabs.Content>

        {/* Tab: Options */}
        <Tabs.Content value="options" className="space-y-6">
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
        </Tabs.Content>
      </Tabs.Root>
    </EditorLayout>
  );
}
