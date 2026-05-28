import type { ReactNode } from 'react';
import * as RadixToggle from '@radix-ui/react-toggle';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@open20/ui/lib/cn';
import {
  badgeToggleSizeVariants as sizeVariantClasses,
  toggleVariants as toggleVariantClasses,
} from '@open20/ui/styles/design-tokens';

const toggleVariants = cva(
  'inline-flex cursor-pointer select-none items-center justify-center border font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: toggleVariantClasses,
      size: sizeVariantClasses,
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'md',
    },
  },
);

export interface ToggleProps
  extends Omit<RadixToggle.ToggleProps, 'asChild'>,
    VariantProps<typeof toggleVariants> {
  children: ReactNode;
}

export function Toggle({ variant, size, className, children, ...props }: ToggleProps) {
  return (
    <RadixToggle.Root className={cn(toggleVariants({ variant, size }), className)} {...props}>
      {children}
    </RadixToggle.Root>
  );
}

export default Toggle;
