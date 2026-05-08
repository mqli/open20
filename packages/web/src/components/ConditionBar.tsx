import type { ActiveCondition, ConditionName } from '@/types/open20-core';
import { useLocale } from '@/hooks';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConditionBarProps {
  conditions: readonly ActiveCondition[];
  onToggle: (condition: ConditionName) => void;
  onAdd?: () => void;
}

export function ConditionBar({ conditions, onToggle, onAdd }: ConditionBarProps) {
  const { t } = useLocale();
  const activeConditions = conditions.map((c) => c.name);

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      {activeConditions.map((condition) => (
        <button
          key={condition}
          onClick={() => onToggle(condition)}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium transition-condition',
            'bg-[--color-accent-red]/20 text-[--color-accent-red] border border-[--color-accent-red]/30',
            'hover:bg-[--color-accent-red]/30 min-h-[36px]'
          )}
        >
          {t(`conditions.${condition.toLowerCase()}`)}
        </button>
      ))}
      {onAdd && (
        <button
          onClick={onAdd}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium transition-condition',
            'bg-[--color-bg-elevated] text-[--color-text-secondary] border border-[--color-border]',
            'hover:bg-[--color-bg-surface] flex items-center gap-1 min-h-[36px]'
          )}
        >
          <Plus className="w-3.5 h-3.5" />
          {t('gameMode.addCondition')}
        </button>
      )}
    </div>
  );
}
