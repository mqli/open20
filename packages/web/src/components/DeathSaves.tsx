import type { DeathSaves as DeathSavesType } from '@/types/open20-core';
import { useLocale } from '@/hooks';

interface DeathSavesProps {
  deathSaves: DeathSavesType;
}

export function DeathSaves({ deathSaves }: DeathSavesProps) {
  const { t } = useLocale();

  return (
    <div className="flex gap-6 text-sm bg-[--color-bg-elevated] p-3 rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-[--color-text-secondary]">{t('hp.success')}:</span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`text-lg ${
                i < deathSaves.successes
                  ? 'text-[--color-accent-green]'
                  : 'text-[--color-text-muted]'
              }`}
            >
              ●
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[--color-text-secondary]">{t('hp.failure')}:</span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`text-lg ${
                i < deathSaves.failures
                  ? 'text-[--color-accent-red]'
                  : 'text-[--color-text-muted]'
              }`}
            >
              ●
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
