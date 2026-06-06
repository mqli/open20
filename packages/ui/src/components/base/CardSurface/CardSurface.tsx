import type { HTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import { Surface, type SurfaceProps } from '@/components/base/Surface';
import { Text } from '@/components/base/Text';

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
  /** Card content (rendered above the optional source/actions row) */
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
  /** Show decorative glow in the background. Pass `renderGlow` to customize the glow content. */
  glow?: boolean;
  /** Custom glow element rendered in the top-right corner. If omitted, a default dot is rendered when `glow` is true. */
  renderGlow?: () => ReactNode;
  /** Source label rendered in the bottom-left of the card (e.g. "PHB", "XGE") */
  source?: string;
  /** Extra content rendered after the source label (e.g. a collapse toggle button) */
  renderSourceSuffix?: () => ReactNode;
  /** Action buttons rendered in the bottom-right of the card. Click events are stopPropagation'd automatically. */
  renderActions?: () => ReactNode;
  /** Additional className for the Surface */
  className?: string;
}

/**
 * Shared card surface used by SpellCard, FeatCard, etc.
 * Handles: Surface wrapper, clickable accessibility (role/tabIndex/keydown),
 * optional glow background, and optional source/actions bottom row.
 */
export function CardSurface({
  children,
  surfaceVariant,
  padding = 'md',
  density = 'default',
  clickable = false,
  onClick,
  glow = false,
  renderGlow,
  source,
  renderActions,
  className,
  ...props
}: CardSurfaceProps) {
  const isClickable = clickable || !!onClick;
  const isDefaultVariant = !surfaceVariant || surfaceVariant === 'default';
  const showSourceRow = source || renderActions;

  return (
    <Surface
      variant={surfaceVariant}
      padding={padding}
      className={cn(
        surfaceVariants({ density }),
        (glow || renderGlow) && 'relative overflow-hidden',
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
      {/* ── Glow ─────────────────────────────────────────────── */}
      {(glow || renderGlow) && (
        <div className="absolute -top-1 -right-1 p-2 opacity-10 pointer-events-none">
          {renderGlow ? renderGlow() : <div className="w-12 h-12 rounded-full bg-primary-500" />}
        </div>
      )}

      {children}

      {/* ── Source / Actions Row ─────────────────────────────── */}
      {showSourceRow && (
        <div
          className={cn(
            'flex items-center pt-1',
            renderActions ? 'justify-between' : 'justify-start',
          )}
        >
          {source && (
            <Text variant="caption" as="p" className="uppercase opacity-70">
              {source}
            </Text>
          )}
          {renderActions && (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              {renderActions()}
            </div>
          )}
        </div>
      )}
    </Surface>
  );
}
