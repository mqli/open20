// CombatStatCard.tsx (T-107)
// Single stat card: icon + label + value.
// Optional onTap for rollable stats (Initiative, etc.).
// NFR-01: color + redundant non-color cues.
// NFR-02: >=44x44px tap target, keyboard operable, aria-label.

import type { LucideIcon } from 'lucide-react';
import { Surface, Text, cn } from '@open20/ui';

export interface CombatStatCardProps {
  /** Lucide icon component */
  icon: LucideIcon;
  /** Short label (e.g. "AC", "Init") */
  label: string;
  /** Formatted value string (e.g. "15", "+3") */
  value: string;
  /** Optional tap handler — when provided, the card is interactive */
  onTap?: () => void;
  /** Additional class for the card */
  className?: string;
}

export function CombatStatCard({
  icon: Icon,
  label,
  value,
  onTap,
  className,
}: CombatStatCardProps) {
  const isInteractive = !!onTap;

  const card = (
    <Surface
      variant="default"
      padding="sm"
      className={cn(
        'flex min-h-[64px] min-w-[68px] flex-col items-center justify-center gap-0.5',
        isInteractive && 'cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-900/20',
        className,
      )}
    >
      <Icon className="h-5 w-5 text-text-secondary" aria-hidden />
      <Text variant="labelSm" color="secondary">
        {label}
      </Text>
      <Text variant="headingSm" weight="bold" className="tabular-nums leading-none">
        {value}
      </Text>
    </Surface>
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        className="focus-visible:ring-2 focus-visible:ring-primary-600 rounded-md"
        onClick={onTap}
        aria-label={`Roll ${label}`}
      >
        {card}
      </button>
    );
  }

  return card;
}
