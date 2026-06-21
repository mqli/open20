import type { MonsterFormData } from '../MonsterEditor.types';
import { CHALLENGE_RATINGS_WITH_XP } from '../MonsterEditor.types';
import { Input } from '@/components/base/Input/Input';
import { Select } from '@/components/base/Select/Select';
import { Text } from '@/components/base/Text/Text';
import { Surface } from '@/components/base/Surface/Surface';

interface MetaSectionProps {
  formData: MonsterFormData;
  onChange: (updates: Partial<MonsterFormData>) => void;
  disabled?: boolean;
}

export function MetaSection({ formData, onChange, disabled }: MetaSectionProps) {
  const handleCRChange = (rating: string) => {
    const crEntry = CHALLENGE_RATINGS_WITH_XP.find((c) => String(c.rating) === rating);
    if (crEntry) {
      onChange({
        challengeRating: {
          ...formData.challengeRating,
          rating: crEntry.rating,
          xp: crEntry.xp,
        },
      });
    }
  };

  return (
    <Surface variant="default" padding="md" className="space-y-4">
      <Text as="h3" variant="heading" size="lg" className="text-text-primary">
        Meta
      </Text>

      {/* Challenge Rating */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Text as="label" variant="formLabel">
            Challenge Rating
          </Text>
          <Select.Root
            value={String(formData.challengeRating.rating)}
            onValueChange={(value) => {
              // Check if it's a fractional rating string
              if (value === '1/8' || value === '1/4' || value === '1/2') {
                handleCRChange(value);
              } else {
                handleCRChange(value);
              }
            }}
            disabled={disabled}
          >
            <Select.Trigger />
            <Select.Content>
              {CHALLENGE_RATINGS_WITH_XP.map((cr) => (
                <Select.Item key={String(cr.rating)} value={String(cr.rating)}>
                  {String(cr.rating)} ({cr.xp} XP)
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>
        <div className="space-y-2">
          <Text as="label" variant="formLabel">
            XP
          </Text>
          <Input
            type="number"
            value={formData.challengeRating.xp}
            onChange={(e) =>
              onChange({
                challengeRating: { ...formData.challengeRating, xp: Number(e.target.value) },
              })
            }
            disabled={disabled}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Text as="label" variant="formLabel">
            Lair XP
          </Text>
          <Input
            type="number"
            value={formData.challengeRating.lairXp ?? ''}
            onChange={(e) =>
              onChange({
                challengeRating: {
                  ...formData.challengeRating,
                  lairXp: e.target.value === '' ? undefined : Number(e.target.value),
                },
              })
            }
            placeholder="Optional"
            disabled={disabled}
            className="w-full"
          />
        </div>
      </div>

      {/* Equipment (gears) */}
      <div className="space-y-2">
        <Text as="label" variant="formLabel">
          Equipment
        </Text>
        <Input
          value={formData.gears.join(', ')}
          onChange={(e) =>
            onChange({
              gears: e.target.value
                .split(',')
                .map((g) => g.trim())
                .filter(Boolean),
            })
          }
          placeholder="e.g., spear, shield (comma separated)"
          disabled={disabled}
          className="w-full"
        />
      </div>

      {/* Environments */}
      <div className="space-y-2">
        <Text as="label" variant="formLabel">
          Environments
        </Text>
        <Input
          value={formData.environments.join(', ')}
          onChange={(e) =>
            onChange({
              environments: e.target.value
                .split(',')
                .map((e) => e.trim())
                .filter(Boolean),
            })
          }
          placeholder="e.g., forest, dungeon (comma separated)"
          disabled={disabled}
          className="w-full"
        />
      </div>
    </Surface>
  );
}
