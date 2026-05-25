import type { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import {
  textColorVariants,
  textSizeVariants,
  textVariants as textVariantClasses,
  textWeightVariants,
} from '../../styles/design-tokens';

const textVariants = cva('', {
  variants: {
    variant: textVariantClasses,
    size: textSizeVariants,
    color: textColorVariants,
    weight: textWeightVariants,
  },
  defaultVariants: {
    variant: 'body',
  },
});

export interface TextProps extends VariantProps<typeof textVariants> {
  children: ReactNode;
  as?: 'p' | 'span' | 'div' | 'label' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  className?: string;
}

const elementMap = {
  p: 'p',
  span: 'span',
  div: 'div',
  label: 'label',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
} as const;

export function Text({ variant, size, color, weight, as = 'p', className, children }: TextProps) {
  const Component = elementMap[as] || 'p';
  return <Component className={cn(textVariants({ variant, size, color, weight }), className)}>{children}</Component>;
}
