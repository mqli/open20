import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const dividerVariants = cva('flex-shrink-0', {
  variants: {
    orientation: {
      horizontal: 'h-px w-full',
      vertical: 'w-px',
    },
    size: {
      sm: '',
      md: '',
    },
  },
  compoundVariants: [
    { orientation: 'vertical', size: 'sm', class: 'h-4' },
    { orientation: 'vertical', size: 'md', class: 'h-5' },
  ],
  defaultVariants: {
    orientation: 'horizontal',
    size: 'md',
  },
});

export interface DividerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>, VariantProps<typeof dividerVariants> {}

export function Divider({ orientation, size, className, style, ...props }: DividerProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation ?? 'horizontal'}
      className={cn(dividerVariants({ orientation, size }), className)}
      style={{
        backgroundColor: 'color-mix(in oklab, var(--color-border) 60%, transparent)',
        ...style,
      }}
      {...props}
    />
  );
}
