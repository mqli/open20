import { Input, Surface, Text } from '@open20/ui';
import { useTranslation } from '@/i18n';

interface AbilityScoresSectionProps {
  abilities: Record<string, number>;
  onChange: (ability: string, value: string) => void;
}

export function AbilityScoresSection({ abilities, onChange }: AbilityScoresSectionProps) {
  const t = useTranslation();
  return (
    <Surface variant="primary" padding="lg" className="bg-bg-primary/50 shadow-inner">
      <Text
        as="label"
        variant="labelSm"
        weight="black"
        className="block tracking-[0.2em] mb-6 text-center"
      >
        {t('abilityScores')}
      </Text>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {Object.keys(abilities).map((ability) => (
          <div key={ability}>
            <Text
              as="label"
              size="sm"
              weight="bold"
              color="secondary"
              className="block uppercase mb-1"
            >
              {ability.substring(0, 3)}
            </Text>
            <Input
              type="number"
              min={1}
              max={30}
              value={abilities[ability as keyof typeof abilities]}
              onChange={(e) => onChange(ability, e.target.value)}
              className="text-center font-bold tabular-nums"
              data-testid={`ability-${ability.toLowerCase()}`}
            />
          </div>
        ))}
      </div>
    </Surface>
  );
}
