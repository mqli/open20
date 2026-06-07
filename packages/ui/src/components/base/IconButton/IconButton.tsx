import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import {
  iconButtonActiveVariants as activeVariantClasses,
  iconButtonSizeVariants as sizeVariantClasses,
  iconButtonVariants as variantClasses,
  interactiveBase,
} from '@/styles/design-tokens';

const iconButtonVariants = cva(
  cn('inline-flex items-center justify-center rounded-lg border', interactiveBase),
  {
    variants: {
      variant: variantClasses,
      size: sizeVariantClasses,
      active: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      { variant: 'secondary', active: true, className: activeVariantClasses.secondary },
      { variant: 'primary', active: true, className: activeVariantClasses.primary },
      { variant: 'info', active: true, className: activeVariantClasses.info },
      { variant: 'warning', active: true, className: activeVariantClasses.warning },
      { variant: 'danger', active: true, className: activeVariantClasses.danger },
      { variant: 'success', active: true, className: activeVariantClasses.success },
    ],
    defaultVariants: {
      variant: 'secondary',
      size: 'md',
      active: false,
    },
  },
);

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof iconButtonVariants> {
  children: ReactNode;
}

export function IconButton({
  variant,
  size,
  active,
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <button className={cn(iconButtonVariants({ variant, size, active }), className)} {...props}>
      {children}
    </button>
  );
}
