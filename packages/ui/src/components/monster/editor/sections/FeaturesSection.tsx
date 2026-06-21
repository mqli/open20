import type {
  MonsterFormData,
  MutableMonsterFeature,
  MutableMonsterAction,
  MutableMonsterReaction,
  MutableMonsterLegendaryAction,
} from '../MonsterEditor.types';
import { Input } from '@/components/base/Input/Input';
import { Text } from '@/components/base/Text/Text';
import { Surface } from '@/components/base/Surface/Surface';

interface FeaturesSectionProps {
  formData: MonsterFormData;
  onChange: (updates: Partial<MonsterFormData>) => void;
  disabled?: boolean;
}

interface ArrayFieldProps<T> {
  items: T[];
  label: string;
  renderItem: (item: T, index: number) => React.ReactNode;
  onAdd: () => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
}

function ArrayField<T>({
  items,
  label,
  renderItem,
  onAdd,
  onRemove,
  disabled,
}: ArrayFieldProps<T>) {
  return (
    <div className="space-y-3">
      <Text as="label" variant="formLabel">
        {label}
      </Text>
      {items.map((item, index) => (
        <div key={index} className="relative p-3 bg-bg-secondary rounded-md">
          <button
            type="button"
            onClick={() => onRemove(index)}
            disabled={disabled}
            className="absolute top-2 right-2 text-text-tertiary hover:text-danger transition-colors text-sm"
          >
            ×
          </button>
          {renderItem(item, index)}
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        disabled={disabled}
        className="text-sm text-primary-500 hover:text-primary-400 transition-colors"
      >
        + Add {label}
      </button>
    </div>
  );
}

export function FeaturesSection({ formData, onChange, disabled }: FeaturesSectionProps) {
  const handleTraitChange = (index: number, field: 'name' | 'description', value: string) => {
    const updated = formData.traits.map((t, i) => (i === index ? { ...t, [field]: value } : t));
    onChange({ traits: updated });
  };

  const handleActionChange = (
    index: number,
    field: 'name' | 'description',
    value: string,
    list: 'actions' | 'bonusActions',
  ) => {
    const items = formData[list];
    const updated = items.map((a: MutableMonsterAction, i: number) =>
      i === index ? { ...a, [field]: value } : a,
    );
    onChange({ [list]: updated });
  };

  const handleReactionChange = (index: number, field: 'name' | 'description', value: string) => {
    const updated = formData.reactions.map((r, i) => (i === index ? { ...r, [field]: value } : r));
    onChange({ reactions: updated });
  };

  const handleLegendaryChange = (
    index: number,
    field: 'name' | 'description' | 'cost',
    value: string | number,
  ) => {
    const updated = formData.legendaryActions.map((la, i) =>
      i === index ? { ...la, [field]: value } : la,
    );
    onChange({ legendaryActions: updated });
  };

  return (
    <Surface variant="default" padding="md" className="space-y-4">
      <Text as="h3" variant="heading" size="lg" className="text-text-primary">
        Features & Actions
      </Text>

      {/* Traits */}
      <ArrayField<MutableMonsterFeature>
        items={formData.traits}
        label="Traits"
        onAdd={() => onChange({ traits: [...formData.traits, { name: '', description: '' }] })}
        onRemove={(index) => onChange({ traits: formData.traits.filter((_, i) => i !== index) })}
        disabled={disabled}
        renderItem={(trait, index) => (
          <div className="space-y-2">
            <Input
              value={trait.name}
              onChange={(e) => handleTraitChange(index, 'name', e.target.value)}
              placeholder="Trait name"
              disabled={disabled}
            />
            <textarea
              value={trait.description}
              onChange={(e) => handleTraitChange(index, 'description', e.target.value)}
              placeholder="Trait description"
              disabled={disabled}
              rows={2}
              className="flex w-full rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        )}
      />

      {/* Actions */}
      <ArrayField<MutableMonsterAction>
        items={formData.actions}
        label="Actions"
        onAdd={() => onChange({ actions: [...formData.actions, { name: '', description: '' }] })}
        onRemove={(index) => onChange({ actions: formData.actions.filter((_, i) => i !== index) })}
        disabled={disabled}
        renderItem={(action, index) => (
          <div className="space-y-2">
            <Input
              value={action.name}
              onChange={(e) => handleActionChange(index, 'name', e.target.value, 'actions')}
              placeholder="Action name"
              disabled={disabled}
            />
            <textarea
              value={action.description ?? ''}
              onChange={(e) => handleActionChange(index, 'description', e.target.value, 'actions')}
              placeholder="Action description"
              disabled={disabled}
              rows={2}
              className="flex w-full rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        )}
      />

      {/* Bonus Actions */}
      <ArrayField<MutableMonsterAction>
        items={formData.bonusActions}
        label="Bonus Actions"
        onAdd={() =>
          onChange({ bonusActions: [...formData.bonusActions, { name: '', description: '' }] })
        }
        onRemove={(index) =>
          onChange({ bonusActions: formData.bonusActions.filter((_, i) => i !== index) })
        }
        disabled={disabled}
        renderItem={(action, index) => (
          <div className="space-y-2">
            <Input
              value={action.name}
              onChange={(e) => handleActionChange(index, 'name', e.target.value, 'bonusActions')}
              placeholder="Bonus action name"
              disabled={disabled}
            />
            <textarea
              value={action.description ?? ''}
              onChange={(e) =>
                handleActionChange(index, 'description', e.target.value, 'bonusActions')
              }
              placeholder="Bonus action description"
              disabled={disabled}
              rows={2}
              className="flex w-full rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        )}
      />

      {/* Reactions */}
      <ArrayField<MutableMonsterReaction>
        items={formData.reactions}
        label="Reactions"
        onAdd={() =>
          onChange({ reactions: [...formData.reactions, { name: '', description: '' }] })
        }
        onRemove={(index) =>
          onChange({ reactions: formData.reactions.filter((_, i) => i !== index) })
        }
        disabled={disabled}
        renderItem={(reaction, index) => (
          <div className="space-y-2">
            <Input
              value={reaction.name}
              onChange={(e) => handleReactionChange(index, 'name', e.target.value)}
              placeholder="Reaction name"
              disabled={disabled}
            />
            <textarea
              value={reaction.description}
              onChange={(e) => handleReactionChange(index, 'description', e.target.value)}
              placeholder="Reaction description"
              disabled={disabled}
              rows={2}
              className="flex w-full rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        )}
      />

      {/* Legendary Actions */}
      <ArrayField<MutableMonsterLegendaryAction>
        items={formData.legendaryActions}
        label="Legendary Actions"
        onAdd={() =>
          onChange({
            legendaryActions: [
              ...formData.legendaryActions,
              { name: '', description: '', cost: 1 },
            ],
          })
        }
        onRemove={(index) =>
          onChange({
            legendaryActions: formData.legendaryActions.filter((_, i) => i !== index),
          })
        }
        disabled={disabled}
        renderItem={(la, index) => (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={la.name}
                onChange={(e) => handleLegendaryChange(index, 'name', e.target.value)}
                placeholder="Legendary action name"
                disabled={disabled}
                className="flex-1"
              />
              <div className="w-24">
                <Input
                  type="number"
                  value={la.cost ?? 1}
                  onChange={(e) => handleLegendaryChange(index, 'cost', Number(e.target.value))}
                  placeholder="Cost"
                  min={1}
                  max={3}
                  disabled={disabled}
                />
              </div>
            </div>
            <textarea
              value={la.description}
              onChange={(e) => handleLegendaryChange(index, 'description', e.target.value)}
              placeholder="Legendary action description"
              disabled={disabled}
              rows={2}
              className="flex w-full rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        )}
      />
    </Surface>
  );
}
