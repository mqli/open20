import type { ReactNode } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import {
  overlayClasses,
  sheetSideClasses,
  textSizeVariants,
  textWeightVariants,
} from '@/styles/design-tokens';

const sheetVariants = cva('fixed z-50 flex flex-col bg-bg-secondary shadow-xl outline-none', {
  variants: {
    side: {
      right: sheetSideClasses.right,
      left: sheetSideClasses.left,
      bottom: sheetSideClasses.bottom,
    },
  },
  defaultVariants: {
    side: 'right',
  },
});

interface SheetContentProps
  extends RadixDialog.DialogContentProps, VariantProps<typeof sheetVariants> {}

export const Sheet = {
  Root: RadixDialog.Root,

  Trigger: RadixDialog.Trigger,

  Close: RadixDialog.Close,

  Content: ({ children, className, side = 'right', ...props }: SheetContentProps) => {
    return (
      <RadixDialog.Portal>
        <RadixDialog.Overlay className={overlayClasses} />
        <RadixDialog.Content className={cn(sheetVariants({ side }), className)} {...props}>
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    );
  },

  Header: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div
      className={cn(
        'sticky top-0 z-10 flex items-center justify-between border-b border-border bg-bg-primary p-4 md:bg-bg-secondary',
        className,
      )}
    >
      {children}
    </div>
  ),

  Title: ({ children, className }: { children: ReactNode; className?: string }) => (
    <RadixDialog.Title
      className={cn(
        textSizeVariants.xl,
        textWeightVariants.semibold,
        'text-text-secondary',
        className,
      )}
    >
      {children}
    </RadixDialog.Title>
  ),

  Body: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={cn('flex-1 overflow-y-auto bg-bg-primary p-4 md:p-6', className)}>
      {children}
    </div>
  ),
};
