import { useCallback, useMemo } from 'react';
import { Input, Text } from '@open20/ui';
import type { Feat, FeatCategory, FeatGrant } from 'open20-core';
import type { FeatEditorProps } from './FeatEditor.types';
import { FEAT_CATEGORIES } from './FeatEditor.types';
import { Tabs } from '@/components/base/Tabs/Tabs';
import { EditorLayout } from '@/components/base/EditorLayout';
import { FeatCard } from '@/components/rules/feat/FeatCard';

export function FeatEditor({
  value,
  onChange,
  onSubmit,
  onCancel,
  disabled = false,
  className,
  renderActions,
}: FeatEditorProps) {
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

  const handleSave = (intent?: 'stay' | 'new' | 'close') => {
    if (onSubmit && value?.id) {
      onSubmit(value as Feat, intent);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave('stay');
  };

  const isDirty = true;
  const isValid = Boolean(value?.id);

  const previewFeat = useMemo(() => value as Feat, [value]);

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
      preview={<FeatCard feat={previewFeat} density="compact" />}
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
          <Tabs.Trigger variant="pills" value="description">
            Description
          </Tabs.Trigger>
          <Tabs.Trigger variant="pills" value="effects">
            Effects
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

          <label
            className={`flex items-center gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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
        </Tabs.Content>

        {/* Tab: Description */}
        <Tabs.Content value="description" className="space-y-6">
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
        </Tabs.Content>

        {/* Tab: Effects */}
        <Tabs.Content value="effects" className="space-y-6">
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
        </Tabs.Content>
      </Tabs.Root>
    </EditorLayout>
  );
}
