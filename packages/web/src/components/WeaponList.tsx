import type { Attack } from '@/types/open20-core';
import { useLocale } from '@/hooks';
import { WeaponRow } from './WeaponRow';

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
    <section className="w-full bg-[--color-bg-surface] rounded-lg p-4 border border-[--color-border]">
      <h2 className="text-sm font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-3">
        {t('gameMode.weapons')}
      </h2>
      <div className="space-y-2">
        {attacks.map((attack, index) => (
          <WeaponRow
            key={`${attack.name}-${index}`}
            attack={attack}
            onAttack={() => onAttack?.(attack)}
          />
        ))}
      </div>
    </section>
  );
}
