import type { HTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@open20/ui/lib/cn';
import {
  badgeToggleSizeVariants as sizeVariantClasses,
  badgeVariants as badgeVariantClasses,
} from '@open20/ui/styles/design-tokens';

const badgeVariants = cva('inline-flex items-center font-medium transition-colors', {
  variants: {
    variant: badgeVariantClasses,
    size: sizeVariantClasses,
  },
  defaultVariants: {
    variant: 'slate',
    size: 'md',
  },
});

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  children: ReactNode;
}

export function Badge({ variant, size, className, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {children}
    </span>
  );
}
