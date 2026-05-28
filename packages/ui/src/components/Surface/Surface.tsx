import type { HTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@open20/ui/lib/cn';
import {
  surfacePaddingVariants as paddingClasses,
  surfaceShadowVariants as shadowClasses,
  surfaceVariants as surfaceVariantClasses,
} from '@open20/ui/styles/design-tokens';

const surfaceVariants = cva('rounded-xl border transition-all', {
  variants: {
    variant: surfaceVariantClasses,
    padding: paddingClasses,
    shadow: shadowClasses,
  },
  defaultVariants: {
    variant: 'default',
    padding: 'md',
    shadow: 'none',
  },
});

export interface SurfaceProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof surfaceVariants> {
  children: ReactNode;
}

export function Surface({
  variant,
  padding,
  shadow,
  className,
  children,
  ...props
}: SurfaceProps) {
  return (
    <div className={cn(surfaceVariants({ variant, padding, shadow }), className)} {...props}>
      {children}
    </div>
  );
}
