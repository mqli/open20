import type { HitPoints } from '@/types/open20-core';
import { useLocale } from '@/hooks';
import { StatCard } from './StatCard';
import { DeathSaves } from './DeathSaves';

interface HPDisplayProps {
  hitPoints: HitPoints;
  onTap?: () => void;
}

export function HPDisplay({ hitPoints, onTap }: HPDisplayProps) {
  const { t } = useLocale();
  const isDead = hitPoints.current <= 0;
  const isStable = hitPoints.deathSaves.isStable;
  const isLow = hitPoints.current < hitPoints.max * 0.3;

  const accent = isDead ? 'red' : isLow ? 'red' : 'green';

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 flex-wrap">
        <StatCard
          label={t('gameMode.hp')}
          value={hitPoints.current}
          accent={accent}
          onTap={onTap}
          className="flex-1 min-w-[140px]"
        />
        <div className="flex items-center gap-2">
          <span className="text-xl text-[--color-text-secondary] font-semibold">/ {hitPoints.max}</span>
          {hitPoints.temporary > 0 && (
            <span className="text-sm text-[--color-accent-blue] font-medium">
              +{hitPoints.temporary} {t('gameMode.tempHP')}
            </span>
          )}
        </div>
      </div>

      {isDead && !isStable && (
        <DeathSaves deathSaves={hitPoints.deathSaves} />
      )}
    </div>
  );
}
