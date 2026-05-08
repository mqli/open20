import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'touch-target',
          {
            'bg-[--color-accent-gold] text-[--color-bg-primary] hover:bg-[--color-accent-gold]/90':
              variant === 'default',
            'bg-[--color-bg-elevated] text-[--color-text-primary] hover:bg-[--color-bg-surface]':
              variant === 'secondary',
            'bg-[--color-accent-red] text-white hover:bg-[--color-accent-red]/90':
              variant === 'destructive',
            'border border-[--color-border] bg-transparent hover:bg-[--color-bg-elevated]':
              variant === 'outline',
            'hover:bg-[--color-bg-elevated]': variant === 'ghost',
            'h-10 px-4 py-2 text-sm': size === 'default',
            'h-8 px-3 text-xs': size === 'sm',
            'h-12 px-8 text-base': size === 'lg',
            'h-10 w-10 p-0': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
