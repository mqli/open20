import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number | string;
  accent?: 'gold' | 'red' | 'green' | 'blue' | 'purple';
  onTap?: () => void;
  className?: string;
}

export function StatCard({ label, value, accent = 'gold', onTap, className }: StatCardProps) {
  const accentColors = {
    gold: 'text-[--color-accent-gold]',
    red: 'text-[--color-accent-red]',
    green: 'text-[--color-accent-green]',
    blue: 'text-[--color-accent-blue]',
    purple: 'text-[--color-accent-purple]',
  };

  return (
    <button
      onClick={onTap}
      className={cn(
        'flex-1 min-w-0 rounded-lg bg-[--color-bg-surface]',
        'border border-[--color-border] p-3 flex flex-col items-center justify-center',
        'hover:bg-[--color-bg-elevated] transition-colors',
        'min-h-[90px]',
        onTap && 'cursor-pointer',
        className
      )}
    >
      <span className="text-xs text-[--color-text-secondary] uppercase tracking-wide">
        {label}
      </span>
      <span className={cn('text-2xl font-bold mt-1', accentColors[accent])}>
        {value}
      </span>
    </button>
  );
}
