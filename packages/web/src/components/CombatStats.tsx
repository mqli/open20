import type { CombatStats as CombatStatsType } from '@/types/open20-core';
import { useLocale } from '@/hooks';
import { StatCard } from './StatCard';

interface CombatStatsProps {
  combatStats: CombatStatsType;
}

export function CombatStats({ combatStats }: CombatStatsProps) {
  const { t } = useLocale();

  return (
    <div className="grid grid-cols-3 gap-3 w-full">
      <StatCard
        label={t('gameMode.ac')}
        value={combatStats.AC}
        accent="gold"
      />
      <StatCard
        label={t('gameMode.initiative')}
        value={combatStats.initiative >= 0 ? `+${combatStats.initiative}` : `${combatStats.initiative}`}
        accent="blue"
      />
      <StatCard
        label={t('gameMode.passivePerception')}
        value={combatStats.passivePerception}
        accent="purple"
      />
    </div>
  );
}
