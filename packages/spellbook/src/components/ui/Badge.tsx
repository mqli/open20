import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/helpers';
import type { HTMLAttributes, ReactNode } from 'react';
import { badgeVariants as badgeVariantClasses, badgeToggleSizeVariants as sizeVariantClasses } from '@/styles/design-tokens';

const badgeVariants = cva(
  'inline-flex items-center font-medium transition-colors',
  {
    variants: {
      variant: badgeVariantClasses,
      size: sizeVariantClasses,
    },
    defaultVariants: {
      variant: 'slate',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  children: ReactNode;
}

export function Badge({ variant, size, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </span>
  );
}
