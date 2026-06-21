import type { MonsterFormData, MutableMonsterSpellcasting } from '../MonsterEditor.types';
import type { AbilityName } from 'open20-core/types';
import { Input } from '@/components/base/Input/Input';
import { Select } from '@/components/base/Select/Select';
import { Text } from '@/components/base/Text/Text';
import { Surface } from '@/components/base/Surface/Surface';
import { ABILITY_NAMES } from '../MonsterEditor.types';

interface SpellcastingSectionProps {
  formData: MonsterFormData;
  onChange: (updates: Partial<MonsterFormData>) => void;
  disabled?: boolean;
}

export function SpellcastingSection({ formData, onChange, disabled }: SpellcastingSectionProps) {
  const handleSpellcastChange = (
    index: number,
    field: keyof MutableMonsterSpellcasting,
    value: unknown,
  ) => {
    const updated = formData.spellcasting.map((sc, i) =>
      i === index ? { ...sc, [field]: value } : sc,
    );
    onChange({ spellcasting: updated });
  };

  const addSpellcasting = () => {
    onChange({
      spellcasting: [
        ...formData.spellcasting,
        { ability: 'Intelligence' as AbilityName, saveDC: 10, atWill: [], daily: [] },
      ],
    });
  };

  const removeSpellcasting = (index: number) => {
    onChange({
      spellcasting: formData.spellcasting.filter((_, i) => i !== index),
    });
  };

  return (
    <Surface variant="default" padding="md" className="space-y-4">
      <Text as="h3" variant="heading" size="lg" className="text-text-primary">
        Spellcasting
      </Text>

      {formData.spellcasting.map((sc, index) => (
        <div key={index} className="p-3 bg-bg-secondary rounded-md space-y-3 relative">
          <button
            type="button"
            onClick={() => removeSpellcasting(index)}
            disabled={disabled}
            className="absolute top-2 right-2 text-text-tertiary hover:text-danger transition-colors text-sm"
          >
            ×
          </button>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Text variant="bodySm" className="text-text-secondary">
                Spellcasting Ability *
              </Text>
              <Select.Root
                value={sc.ability}
                onValueChange={(value) =>
                  handleSpellcastChange(index, 'ability', value as AbilityName)
                }
                disabled={disabled}
              >
                <Select.Trigger />
                <Select.Content>
                  {ABILITY_NAMES.map((ab: string) => (
                    <Select.Item key={ab} value={ab}>
                      {ab}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </div>
            <div className="space-y-1">
              <Text variant="bodySm" className="text-text-secondary">
                Save DC
              </Text>
              <Input
                type="number"
                value={sc.saveDC}
                onChange={(e) => handleSpellcastChange(index, 'saveDC', Number(e.target.value))}
                min={0}
                disabled={disabled}
              />
            </div>
            <div className="space-y-1">
              <Text variant="bodySm" className="text-text-secondary">
                Attack Bonus
              </Text>
              <Input
                type="number"
                value={sc.attackBonus ?? ''}
                onChange={(e) =>
                  handleSpellcastChange(
                    index,
                    'attackBonus',
                    e.target.value === '' ? undefined : Number(e.target.value),
                  )
                }
                disabled={disabled}
              />
            </div>
          </div>

          {/* At-will spells */}
          <div className="space-y-1">
            <Text variant="bodySm" className="text-text-secondary">
              At-will spells (comma separated)
            </Text>
            <Input
              value={(sc.atWill ?? []).join(', ')}
              onChange={(e) =>
                handleSpellcastChange(
                  index,
                  'atWill',
                  e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                )
              }
              placeholder="e.g., fire bolt, detect magic"
              disabled={disabled}
              className="w-full"
            />
          </div>

          {/* Daily spells */}
          <div className="space-y-1">
            <Text variant="bodySm" className="text-text-secondary">
              Daily spells (format: spell:times, comma separated)
            </Text>
            <Input
              value={(sc.daily ?? []).map((d) => `${d.spell}:${d.times}`).join(', ')}
              onChange={(e) => {
                const daily = e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((s) => {
                    const [spell, timesStr] = s.split(':');
                    return { spell: spell.trim(), times: Number(timesStr?.trim() || 1) };
                  });
                handleSpellcastChange(index, 'daily', daily);
              }}
              placeholder="e.g., fireball:1, shield:3"
              disabled={disabled}
              className="w-full"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addSpellcasting}
        disabled={disabled}
        className="text-sm text-primary-500 hover:text-primary-400 transition-colors"
      >
        + Add Spellcasting
      </button>
    </Surface>
  );
}
