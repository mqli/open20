import type { HTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import { Surface, type SurfaceProps } from '@/components/Surface';

/* ------------------------------------------------------------------ */
/*  Variants                                                            */
/* ------------------------------------------------------------------ */

const surfaceVariants = cva('flex flex-col transition-all', {
  variants: {
    density: {
      default: 'gap-3',
      compact: 'gap-2',
    },
  },
  defaultVariants: { density: 'default' },
});

export type CardSurfaceDensity = VariantProps<typeof surfaceVariants>['density'];

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */

export interface CardSurfaceProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onClick'> {
  /** Card content */
  children: ReactNode;
  /** Surface variant passed to the underlying Surface */
  surfaceVariant?: SurfaceProps['variant'];
  /** Padding size */
  padding?: SurfaceProps['padding'];
  /** Density: controls internal gap */
  density?: CardSurfaceDensity;
  /** Whether the card is clickable (adds role, tabIndex, hover styles) */
  clickable?: boolean;
  /** Click handler — also sets `clickable` to true */
  onClick?: () => void;
  /** Show decorative glow in the background */
  glow?: boolean;
  /** Additional className for the Surface */
  className?: string;
}

/**
 * Shared card surface used by SpellCard, FeatCard, etc.
 * Handles: Surface wrapper, clickable accessibility (role/tabIndex/keydown),
 * and optional glow background.
 */
export function CardSurface({
  children,
  surfaceVariant,
  padding = 'md',
  density = 'default',
  clickable = false,
  onClick,
  glow = false,
  className,
  ...props
}: CardSurfaceProps) {
  const isClickable = clickable || !!onClick;
  const isDefaultVariant = !surfaceVariant || surfaceVariant === 'default';

  return (
    <Surface
      variant={surfaceVariant}
      padding={padding}
      className={cn(
        surfaceVariants({ density }),
        glow && 'relative overflow-hidden',
        isClickable &&
          isDefaultVariant &&
          'cursor-pointer hover:shadow-md hover:border-primary-300',
        className,
      )}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      {...props}
    >
      {children}
    </Surface>
  );
}
