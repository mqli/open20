import type { HTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import {
  badgeToggleSizeVariants as sizeVariantClasses,
  badgeVariants as badgeVariantClasses,
} from '@/styles/design-tokens';

const badgeVariants = cva('inline-flex items-center font-medium transition-colors', {
  variants: {
    variant: badgeVariantClasses,
    size: sizeVariantClasses,
  },
  defaultVariants: {
    variant: 'secondary',
    size: 'md',
  },
});

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  children: ReactNode;
}

export function Badge({ variant, size, className, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {children}
    </span>
  );
}
