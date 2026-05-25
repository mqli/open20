import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';
import { iconButtonSizeVariants as sizeVariantClasses } from '../styles/design-tokens';

const iconButtonVariants = cva(
  'inline-flex items-center justify-center rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        secondary: 'bg-bg-tertiary text-text-tertiary hover:bg-bg-secondary border-border',
        primary: 'bg-primary-500/15 text-primary-600 dark:text-primary-400 border-primary-500/30 hover:bg-primary-500/25',
        info: 'bg-info/15 text-info border-info/30 hover:bg-info/25',
        warning: 'bg-warning/15 text-warning border-warning/30 hover:bg-warning/25',
        danger: 'bg-danger/15 text-danger border-danger/30 hover:bg-danger/25',
        success: 'bg-success/15 text-success border-success/30 hover:bg-success/25',
      },
      size: sizeVariantClasses,
      active: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      { variant: 'secondary', active: true, className: 'bg-bg-secondary text-text-primary border-border/80' },
      {
        variant: 'primary',
        active: true,
        className: 'bg-primary-500/30 text-primary-700 dark:text-primary-300 border-primary-500/50 shadow-sm shadow-primary-500/10',
      },
      { variant: 'info', active: true, className: 'bg-info/30 text-info border-info/50 shadow-sm' },
      { variant: 'warning', active: true, className: 'bg-warning/30 text-warning border-warning/50 shadow-sm' },
      { variant: 'danger', active: true, className: 'bg-danger/30 text-danger border-danger/50 shadow-sm' },
      { variant: 'success', active: true, className: 'bg-success/30 text-success border-success/50 shadow-sm' },
    ],
    defaultVariants: {
      variant: 'secondary',
      size: 'md',
      active: false,
    },
  },
);

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
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
