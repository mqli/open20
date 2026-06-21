import type { MonsterFormData } from '../MonsterEditor.types';
import type { AbilityName } from 'open20-core/types';
import { Input } from '@/components/base/Input/Input';
import { Text } from '@/components/base/Text/Text';
import { Surface } from '@/components/base/Surface/Surface';

interface AbilityScoresSectionProps {
  formData: MonsterFormData;
  onChange: (updates: Partial<MonsterFormData>) => void;
  disabled?: boolean;
}

const ABILITIES: { name: AbilityName; label: string }[] = [
  { name: 'Strength', label: 'STR' },
  { name: 'Dexterity', label: 'DEX' },
  { name: 'Constitution', label: 'CON' },
  { name: 'Intelligence', label: 'INT' },
  { name: 'Wisdom', label: 'WIS' },
  { name: 'Charisma', label: 'CHA' },
];

export function AbilityScoresSection({ formData, onChange, disabled }: AbilityScoresSectionProps) {
  const handleAbilityChange = (ability: AbilityName, value: string) => {
    onChange({
      abilityScores: {
        ...formData.abilityScores,
        [ability]: Number(value),
      },
    });
  };

  return (
    <Surface variant="default" padding="md" className="space-y-4">
      <Text as="h3" variant="heading" size="lg" className="text-text-primary">
        Ability Scores
      </Text>

      <div className="grid grid-cols-6 gap-3">
        {ABILITIES.map(({ name, label }) => {
          const score = formData.abilityScores[name];
          const modifier = Math.floor((score - 10) / 2);
          return (
            <div key={name} className="text-center space-y-1">
              <Text variant="labelSm" className="font-bold">
                {label}
              </Text>
              <Input
                type="number"
                value={score}
                onChange={(e) => handleAbilityChange(name, e.target.value)}
                min={1}
                max={30}
                disabled={disabled}
                className="text-center"
              />
              <Text variant="labelSm" className="text-text-secondary">
                {modifier >= 0 ? `+${modifier}` : modifier}
              </Text>
            </div>
          );
        })}
      </div>
    </Surface>
  );
}
