import type { MonsterFormData } from '../MonsterEditor.types';
import { useCallback } from 'react';
import { Input } from '@/components/base/Input/Input';
import { Switch } from '@/components/base/Switch/Switch';
import { Text } from '@/components/base/Text/Text';
import { Surface } from '@/components/base/Surface/Surface';

interface CombatSectionProps {
  formData: MonsterFormData;
  onChange: (updates: Partial<MonsterFormData>) => void;
  disabled?: boolean;
}

export function CombatSection({ formData, onChange, disabled }: CombatSectionProps) {
  const handleACChange = useCallback(
    (index: number, field: 'value' | 'type' | 'condition', value: string | number) => {
      const updated = formData.armorClass.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry,
      );
      onChange({ armorClass: updated });
    },
    [formData.armorClass, onChange],
  );

  const addACEntry = useCallback(() => {
    onChange({ armorClass: [...formData.armorClass, { value: 10, type: 'natural armor' }] });
  }, [formData.armorClass, onChange]);

  const removeACEntry = useCallback(
    (index: number) => {
      onChange({ armorClass: formData.armorClass.filter((_, i) => i !== index) });
    },
    [formData.armorClass, onChange],
  );

  const handleSpeedChange = useCallback(
    (field: string, value: string | boolean) => {
      onChange({
        speed: {
          ...formData.speed,
          [field]: value === '' ? undefined : field === 'hover' ? value : Number(value),
        },
      });
    },
    [formData.speed, onChange],
  );

  return (
    <Surface variant="default" padding="md" className="space-y-4">
      <Text as="h3" variant="heading" size="lg" className="text-text-primary">
        Combat Stats
      </Text>

      {/* Armor Class */}
      <div className="space-y-3">
        <Text as="label" variant="formLabel">
          Armor Class *
        </Text>
        {formData.armorClass.map((ac, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="grid grid-cols-3 gap-2 flex-1">
              <Input
                type="number"
                value={ac.value}
                onChange={(e) => handleACChange(index, 'value', Number(e.target.value))}
                placeholder="AC"
                min={0}
                max={50}
                disabled={disabled}
              />
              <Input
                value={ac.type}
                onChange={(e) => handleACChange(index, 'type', e.target.value)}
                placeholder="Type (e.g., natural armor)"
                disabled={disabled}
              />
              <Input
                value={ac.condition ?? ''}
                onChange={(e) => handleACChange(index, 'condition', e.target.value)}
                placeholder="Condition (optional)"
                disabled={disabled}
              />
            </div>
            <button
              type="button"
              onClick={() => removeACEntry(index)}
              disabled={disabled || formData.armorClass.length <= 1}
              className="text-text-tertiary hover:text-danger transition-colors mt-2 shrink-0"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addACEntry}
          disabled={disabled}
          className="text-sm text-primary-500 hover:text-primary-400 transition-colors"
        >
          + Add AC entry
        </button>
      </div>

      {/* Hit Points */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Text as="label" variant="formLabel">
            Hit Points (value) *
          </Text>
          <Input
            type="number"
            value={formData.hitPoints.value}
            onChange={(e) =>
              onChange({ hitPoints: { ...formData.hitPoints, value: Number(e.target.value) } })
            }
            min={0}
            disabled={disabled}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Text as="label" variant="formLabel">
            HP Formula
          </Text>
          <Input
            value={formData.hitPoints.formula ?? ''}
            onChange={(e) =>
              onChange({ hitPoints: { ...formData.hitPoints, formula: e.target.value } })
            }
            placeholder="e.g., 6d8+18"
            disabled={disabled}
            className="w-full"
          />
        </div>
      </div>

      {/* Speed */}
      <div className="space-y-3">
        <Text as="label" variant="formLabel">
          Speed
        </Text>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Text variant="bodySm" className="text-text-secondary">
              Walk
            </Text>
            <Input
              type="number"
              value={formData.speed.walk ?? ''}
              onChange={(e) => handleSpeedChange('walk', e.target.value)}
              placeholder="30"
              min={0}
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <Text variant="bodySm" className="text-text-secondary">
              Burrow
            </Text>
            <Input
              type="number"
              value={formData.speed.burrow ?? ''}
              onChange={(e) => handleSpeedChange('burrow', e.target.value)}
              placeholder="—"
              min={0}
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <Text variant="bodySm" className="text-text-secondary">
              Climb
            </Text>
            <Input
              type="number"
              value={formData.speed.climb ?? ''}
              onChange={(e) => handleSpeedChange('climb', e.target.value)}
              placeholder="—"
              min={0}
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <Text variant="bodySm" className="text-text-secondary">
              Fly
            </Text>
            <Input
              type="number"
              value={formData.speed.fly ?? ''}
              onChange={(e) => handleSpeedChange('fly', e.target.value)}
              placeholder="—"
              min={0}
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <Text variant="bodySm" className="text-text-secondary">
              Swim
            </Text>
            <Input
              type="number"
              value={formData.speed.swim ?? ''}
              onChange={(e) => handleSpeedChange('swim', e.target.value)}
              placeholder="—"
              min={0}
              disabled={disabled}
            />
          </div>
          <div className="flex items-end pb-2 space-x-2">
            <Switch
              checked={formData.speed.hover ?? false}
              onCheckedChange={(checked) => handleSpeedChange('hover', checked)}
              disabled={disabled}
            />
            <Text variant="bodySm" className="text-text-secondary">
              Hover
            </Text>
          </div>
        </div>
      </div>

      {/* Initiative */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Text as="label" variant="formLabel">
            Initiative Modifier
          </Text>
          <Input
            type="number"
            value={formData.initiative?.modifier ?? ''}
            onChange={(e) =>
              onChange({
                initiative: {
                  modifier: Number(e.target.value),
                  score: formData.initiative?.score,
                },
              })
            }
            disabled={disabled}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Text as="label" variant="formLabel">
            Initiative Score
          </Text>
          <Input
            type="number"
            value={formData.initiative?.score ?? ''}
            onChange={(e) =>
              onChange({
                initiative: {
                  modifier: formData.initiative?.modifier ?? 0,
                  score: Number(e.target.value),
                },
              })
            }
            placeholder="Optional"
            disabled={disabled}
            className="w-full"
          />
        </div>
      </div>
    </Surface>
  );
}
