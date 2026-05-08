import type { Attack } from '@/types/open20-core';
import { useLocale } from '@/hooks';
import { WeaponRow } from './WeaponRow';
import { Section } from './layout';

interface WeaponListProps {
  attacks: readonly Attack[];
  onAttack?: (attack: Attack) => void;
}

export function WeaponList({ attacks, onAttack }: WeaponListProps) {
  const { t } = useLocale();

  if (!attacks || attacks.length === 0) {
    return null;
  }

  return (
    <Section title={t('gameMode.weapons')}>
      <div className="space-y-2">
        {attacks.map((attack, index) => (
          <WeaponRow
            key={`${attack.name}-${index}`}
            attack={attack}
            onAttack={() => onAttack?.(attack)}
          />
        ))}
      </div>
    </Section>
  );
}
