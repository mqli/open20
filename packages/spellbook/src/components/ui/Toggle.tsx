import * as RadixToggle from '@radix-ui/react-toggle';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/helpers';
import type { ReactNode } from 'react';
import { toggleVariants as toggleVariantClasses, badgeToggleSizeVariants as sizeVariantClasses } from '@/styles/design-tokens';

const toggleVariants = cva(
  'inline-flex items-center justify-center font-medium transition-all duration-200 border cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: toggleVariantClasses,
      size: sizeVariantClasses,
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'md',
    },
  }
);

export interface ToggleProps
  extends Omit<RadixToggle.ToggleProps, 'asChild'>,
    VariantProps<typeof toggleVariants> {
  children: ReactNode;
}

export function Toggle({ variant, size, className, children, ...props }: ToggleProps) {
  return (
    <RadixToggle.Root
      className={cn(toggleVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </RadixToggle.Root>
  );
}

export default Toggle;
