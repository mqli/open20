import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const dividerVariants = cva('bg-border/60 flex-shrink-0', {
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

export function Divider({ orientation, size, className, ...props }: DividerProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation ?? 'horizontal'}
      className={cn(dividerVariants({ orientation, size }), className)}
      {...props}
    />
  );
}
