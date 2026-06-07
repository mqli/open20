import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import {
  buttonSizeVariants as sizeVariantClasses,
  buttonVariants as buttonVariantClasses,
  interactiveBase,
} from '@/styles/design-tokens';

const buttonVariants = cva(
  cn(
    'inline-flex items-center justify-center rounded-md font-medium',
    interactiveBase,
    'focus:ring-offset-2 focus:ring-offset-bg-primary', // Button-specific offset
  ),
  {
    variants: {
      variant: buttonVariantClasses,
      size: sizeVariantClasses,
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  children: ReactNode;
}

export function Button({ variant, size, className, children, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {children}
    </button>
  );
}
