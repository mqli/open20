import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { inlineMeta } from '@/styles/component-styles';

export interface CardMetaItemProps {
  /** Icon element (typically a lucide-react icon) */
  icon: ReactNode;
  /** Text label */
  label: string;
  /** Additional className */
  className?: string;
}

/**
 * Inline meta item used in cards — icon + text pair.
 * Used by SpellCard meta row, and reusable in FeatCard.
 */
export function CardMetaItem({ icon, label, className }: CardMetaItemProps) {
  return (
    <span className={cn(inlineMeta, className)}>
      {icon}
      <span>{label}</span>
    </span>
  );
}
