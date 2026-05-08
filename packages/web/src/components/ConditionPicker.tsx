import { useState } from 'react';
import type { ConditionName } from '@/types/open20-core';
import { useLocale } from '@/hooks';
import { Sheet, SheetHeader, SheetContent } from '@/components/ui';
import { Search } from 'lucide-react';

interface ConditionPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeConditions: readonly string[];
  onToggle: (condition: ConditionName) => void;
}

const ALL_CONDITIONS: ConditionName[] = [
  'Blinded', 'Charmed', 'Deafened', 'Exhaustion', 'Frightened',
  'Grappled', 'Incapacitated', 'Invisible', 'Paralyzed', 'Petrified',
  'Poisoned', 'Prone', 'Restrained', 'Stunned', 'Unconscious',
];

export function ConditionPicker({ open, onOpenChange, activeConditions, onToggle }: ConditionPickerProps) {
  const { t } = useLocale();
  const [search, setSearch] = useState('');

  const filtered = ALL_CONDITIONS.filter((condition) => {
    const name = t(`conditions.${condition.toLowerCase()}`).toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const handleToggle = (condition: ConditionName) => {
    onToggle(condition);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetHeader onClose={() => onOpenChange(false)}>
        <h2 className="font-semibold text-lg">{t('gameMode.addCondition')}</h2>
      </SheetHeader>

      <SheetContent className="flex flex-col max-h-[60vh]">
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--color-text-secondary]" />
          <input
            type="text"
            placeholder={t('common.search') || 'Search...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[--color-bg-elevated] border border-[--color-border] text-sm focus:outline-none focus:border-[--color-accent-blue]"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2 py-2">
            {filtered.map((condition) => {
              const isActive = activeConditions.includes(condition);
              return (
                <button
                  key={condition}
                  onClick={() => handleToggle(condition)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-condition text-left min-h-[44px] ${
                    isActive
                      ? 'bg-[--color-accent-red]/20 text-[--color-accent-red] border border-[--color-accent-red]/30'
                      : 'bg-[--color-bg-elevated] text-[--color-text-primary] border border-[--color-border] hover:bg-[--color-bg-surface]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{t(`conditions.${condition.toLowerCase()}`)}</span>
                    {isActive && <span className="shrink-0 ml-1">✓</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
