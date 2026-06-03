# Component Patterns

Full code examples for component patterns in `@open20/ui`. Read this when implementing new components or refactoring existing ones.

## cva + cn Pattern

```tsx
// 1. Define variants with cva, referencing design-tokens
const myVariants = cva('base classes', {
  variants: {
    variant: someVariantClasses, // from design-tokens
    size: someSizeClasses,
  },
  defaultVariants: { variant: 'default', size: 'md' },
});

// 2. Props = HTMLAttributes + VariantProps
export interface MyProps extends HTMLAttributes<HTMLElement>, VariantProps<typeof myVariants> {
  children: ReactNode;
}

// 3. Render: cn(cva(...), className) — always merge user className last
export function MyComponent({ variant, size, className, children, ...props }: MyProps) {
  return (
    <div className={cn(myVariants({ variant, size }), className)} {...props}>
      {children}
    </div>
  );
}
```

## Design Tokens — Single Source of Truth

All variant class strings live in **`src/styles/design-tokens.ts`**, not inline in components. Components import tokens and pass them to cva.

```ts
// ✅ CORRECT — in design-tokens.ts
export const myComponentVariants = {
  primary: 'bg-primary-600 text-white',
  secondary: 'bg-bg-tertiary text-text-primary',
} as const;

// ✅ CORRECT — in component
import { myComponentVariants } from '../../styles/design-tokens';
const myVariants = cva('base', { variants: { variant: myComponentVariants } });

// ❌ WRONG — inline class strings in component
const myVariants = cva('base', {
  variants: { variant: { primary: 'bg-primary-600 text-white', ... } }
});
```

## Radix UI Wrappers

Radix components use namespace exports:

```tsx
// Component file
export const Dialog = {
  Root: DialogPrimitive.Root,
  Trigger: DialogPrimitive.Trigger,
  Content: ForwardRefComponent,
  // ...
};

// index.ts — also re-export flat aliases in src/index.ts
export const DialogRoot = Dialog.Root;
export const DialogTrigger = Dialog.Trigger;
```

## ForwardRef & typing (example)

```tsx
import React, { forwardRef } from 'react';
import { VariantProps } from 'class-variance-authority';

const buttonVariants = {
  /*...*/
} as const;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants(props as any), className)} {...props} />
));
Button.displayName = 'Button';
```
