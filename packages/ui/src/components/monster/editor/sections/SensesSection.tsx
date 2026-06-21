import type { MonsterFormData } from '../MonsterEditor.types';
import { Input } from '@/components/base/Input/Input';
import { Text } from '@/components/base/Text/Text';
import { Surface } from '@/components/base/Surface/Surface';

interface SensesSectionProps {
  formData: MonsterFormData;
  onChange: (updates: Partial<MonsterFormData>) => void;
  disabled?: boolean;
}

export function SensesSection({ formData, onChange, disabled }: SensesSectionProps) {
  const handleSenseChange = (field: string, value: string) => {
    onChange({
      senses: {
        ...formData.senses,
        [field]: value === '' ? undefined : Number(value),
      },
    });
  };

  return (
    <Surface variant="default" padding="md" className="space-y-4">
      <Text as="h3" variant="heading" size="lg" className="text-text-primary">
        Senses & Languages
      </Text>

      {/* Senses */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Text as="label" variant="formLabel">
            Darkvision (ft)
          </Text>
          <Input
            type="number"
            value={formData.senses.darkvision ?? ''}
            onChange={(e) => handleSenseChange('darkvision', e.target.value)}
            placeholder="—"
            min={0}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Text as="label" variant="formLabel">
            Blindsight (ft)
          </Text>
          <Input
            type="number"
            value={formData.senses.blindsight ?? ''}
            onChange={(e) => handleSenseChange('blindsight', e.target.value)}
            placeholder="—"
            min={0}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Text as="label" variant="formLabel">
            Tremorsense (ft)
          </Text>
          <Input
            type="number"
            value={formData.senses.tremorsense ?? ''}
            onChange={(e) => handleSenseChange('tremorsense', e.target.value)}
            placeholder="—"
            min={0}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Text as="label" variant="formLabel">
            Truesight (ft)
          </Text>
          <Input
            type="number"
            value={formData.senses.truesight ?? ''}
            onChange={(e) => handleSenseChange('truesight', e.target.value)}
            placeholder="—"
            min={0}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Text as="label" variant="formLabel">
            Passive Perception *
          </Text>
          <Input
            type="number"
            value={formData.senses.passivePerception}
            onChange={(e) =>
              onChange({
                senses: { ...formData.senses, passivePerception: Number(e.target.value) },
              })
            }
            min={0}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Languages */}
      <div className="space-y-2">
        <Text as="label" variant="formLabel">
          Languages
        </Text>
        <Input
          value={formData.languages.join(', ')}
          onChange={(e) =>
            onChange({
              languages: e.target.value
                .split(',')
                .map((l) => l.trim())
                .filter(Boolean),
            })
          }
          placeholder="e.g., Common, Draconic (comma separated)"
          disabled={disabled}
          className="w-full"
        />
      </div>
    </Surface>
  );
}
