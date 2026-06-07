import { cn } from '@/lib/cn';

// ── Generic chip/badge base (rounded-md, small) ──
export const chipBase = cn(
  'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold',
);

// ── Generic inline metadata item (icon + text) ──
export const inlineMeta = cn(
  'inline-flex items-center gap-1 whitespace-nowrap text-[10px] text-text-tertiary',
);

// ── Generic section divider (thin border-top + padding) ──
export const sectionDivider = cn('pt-2 border-t border-border/50');

// ── Generic collapse/show-more toggle ──
export const collapseToggle = cn(
  'flex items-center gap-1 self-start text-[10px] font-medium text-text-tertiary hover:text-text-secondary transition-colors',
);

// ── Shared icon size tokens ──
export const iconSizes = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
} as const;
