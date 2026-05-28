import type { SpellFormData } from '@/components/spell/editor/SpellEditor.types';
import { Input } from '@/components/Input/Input';
import { Select } from '@/components/Select/Select';
import { Switch } from '@/components/Switch/Switch';
import { Text } from '@/components/Text/Text';
import { Surface } from '@/components/Surface/Surface';
import { Button } from '@/components/Button/Button';
import { ABILITY_NAMES, DAMAGE_TYPES } from '@/components/spell/editor/SpellEditor.types';

interface DamageHealSectionProps {
  formData: SpellFormData;
  onChange: (updates: Partial<SpellFormData>) => void;
  disabled?: boolean;
}

export function DamageHealSection({ formData, onChange, disabled }: DamageHealSectionProps) {
  const updateDamage = (
    field: 'entries' | 'additional' | 'perSlot',
    index: number,
    key: 'dice' | 'type',
    value: string,
  ) => {
    const currentDamage = formData.damage;
    if (!currentDamage) return;

    const current = currentDamage[field] || [];
    const updated = [...current];
    updated[index] = { ...updated[index], [key]: value };

    onChange({
      damage: {
        entries: field === 'entries' ? updated : currentDamage.entries,
        additional: field === 'additional' ? updated : currentDamage.additional,
        perSlot: field === 'perSlot' ? updated : currentDamage.perSlot,
      },
    });
  };

  const addDamageEntry = (field: 'entries' | 'additional' | 'perSlot') => {
    const currentDamage = formData.damage;
    const current = currentDamage?.[field] || [];

    onChange({
      damage: {
        entries:
          field === 'entries' ? [...current, { dice: '', type: '' }] : currentDamage?.entries || [],
        additional:
          field === 'additional'
            ? [...current, { dice: '', type: '' }]
            : currentDamage?.additional || [],
        perSlot:
          field === 'perSlot' ? [...current, { dice: '', type: '' }] : currentDamage?.perSlot || [],
      },
    });
  };

  const removeDamageEntry = (field: 'entries' | 'additional' | 'perSlot', index: number) => {
    const currentDamage = formData.damage;
    if (!currentDamage) return;

    const current = currentDamage[field] || [];
    const updated = current.filter((_, i) => i !== index);

    onChange({
      damage: {
        entries: field === 'entries' ? updated : currentDamage.entries,
        additional: field === 'additional' ? updated : currentDamage.additional,
        perSlot: field === 'perSlot' ? updated : currentDamage.perSlot,
      },
    });
  };

  return (
    <Surface variant="default" padding="md" className="space-y-4">
      <Text as="h3" variant="heading" size="lg" className="text-text-primary">
        Damage & Healing
      </Text>

      {/* Damage Entries */}
      <div className="space-y-2">
        <Text as="label" variant="formLabel">
          Damage Entries
        </Text>
        {(formData.damage?.entries || []).map((entry, index) => (
          <div key={index} className="flex gap-2 items-start">
            <Input
              value={entry.dice}
              onChange={(e) => updateDamage('entries', index, 'dice', e.target.value)}
              placeholder="e.g., 2d6"
              disabled={disabled}
              className="w-32"
            />
            <Select.Root
              value={entry.type}
              onValueChange={(value) => updateDamage('entries', index, 'type', value)}
              disabled={disabled}
            >
              <Select.Trigger placeholder="Type" />
              <Select.Content>
                {DAMAGE_TYPES.map((type) => (
                  <Select.Item key={type} value={type}>
                    {type}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeDamageEntry('entries', index)}
              disabled={disabled}
              className="text-danger hover:bg-danger/10"
            >
              ×
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => addDamageEntry('entries')}
          disabled={disabled}
          className="text-primary-600 dark:text-primary-400"
        >
          + Add Damage Entry
        </Button>
      </div>

      {/* Additional Damage */}
      <div className="space-y-2 pt-2 border-t border-border/50">
        <Text as="label" variant="formLabel">
          Additional Damage (doesn't scale)
        </Text>
        {(formData.damage?.additional || []).map((entry, index) => (
          <div key={index} className="flex gap-2 items-start">
            <Input
              value={entry.dice}
              onChange={(e) => updateDamage('additional', index, 'dice', e.target.value)}
              placeholder="e.g., 1d8"
              disabled={disabled}
              className="w-32"
            />
            <Select.Root
              value={entry.type}
              onValueChange={(value) => updateDamage('additional', index, 'type', value)}
              disabled={disabled}
            >
              <Select.Trigger placeholder="Type" />
              <Select.Content>
                {DAMAGE_TYPES.map((type) => (
                  <Select.Item key={type} value={type}>
                    {type}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeDamageEntry('additional', index)}
              disabled={disabled}
              className="text-danger hover:bg-danger/10"
            >
              ×
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => addDamageEntry('additional')}
          disabled={disabled}
          className="text-primary-600 dark:text-primary-400"
        >
          + Add Additional Damage
        </Button>
      </div>

      {/* Per Slot Damage (for upcasting) */}
      <div className="space-y-2 pt-2 border-t border-border/50">
        <Text as="label" variant="formLabel">
          Per Slot Damage (upcast scaling)
        </Text>
        {(formData.damage?.perSlot || []).map((entry, index) => (
          <div key={index} className="flex gap-2 items-start">
            <Input
              value={entry.dice}
              onChange={(e) => updateDamage('perSlot', index, 'dice', e.target.value)}
              placeholder="e.g., 1d6"
              disabled={disabled}
              className="w-32"
            />
            <Select.Root
              value={entry.type}
              onValueChange={(value) => updateDamage('perSlot', index, 'type', value)}
              disabled={disabled}
            >
              <Select.Trigger placeholder="Type" />
              <Select.Content>
                {DAMAGE_TYPES.map((type) => (
                  <Select.Item key={type} value={type}>
                    {type}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeDamageEntry('perSlot', index)}
              disabled={disabled}
              className="text-danger hover:bg-danger/10"
            >
              ×
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => addDamageEntry('perSlot')}
          disabled={disabled}
          className="text-primary-600 dark:text-primary-400"
        >
          + Add Per Slot Damage
        </Button>
      </div>

      {/* Healing */}
      <div className="space-y-2 pt-2 border-t border-border/50">
        <Text as="label" variant="formLabel">
          Healing Dice
        </Text>
        <Input
          value={formData.heal?.dice || ''}
          onChange={(e) =>
            onChange({
              heal: e.target.value ? { dice: e.target.value } : undefined,
            })
          }
          placeholder="e.g., 1d8 + 3"
          disabled={disabled}
          className="w-full"
        />
      </div>

      {/* Save DC */}
      <div className="space-y-2 pt-2 border-t border-border/50">
        <Text as="label" variant="formLabel">
          Saving Throw
        </Text>
        <Select.Root
          value={formData.save || '__none__'}
          onValueChange={(value) =>
            onChange({ save: (value === '__none__' ? undefined : value) as SpellFormData['save'] })
          }
          disabled={disabled}
        >
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="__none__">None</Select.Item>
            {ABILITY_NAMES.map((ability) => (
              <Select.Item key={ability} value={ability}>
                {ability}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </div>

      {/* Attack Roll */}
      <div className="flex items-center gap-2 pt-2">
        <Switch
          checked={formData.attack || false}
          onCheckedChange={(checked) => onChange({ attack: checked })}
          disabled={disabled}
        />
        <Text as="label" variant="bodySm">
          Requires Attack Roll
        </Text>
      </div>
    </Surface>
  );
}
