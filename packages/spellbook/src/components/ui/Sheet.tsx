import * as RadixDialog from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/helpers';
import type { ReactNode } from 'react';
import { Text } from './Text';
import { overlayClasses, sheetSideClasses } from '@/styles/design-tokens';

const sheetVariants = cva(
  'fixed z-50 bg-bg-secondary flex flex-col shadow-xl outline-none',
  {
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
  }
);

interface SheetProps extends RadixDialog.DialogProps {
  children?: ReactNode;
}

export function Sheet({ children, ...props }: SheetProps) {
  return <RadixDialog.Root {...props}>{children}</RadixDialog.Root>;
}

Sheet.Trigger = RadixDialog.Trigger;
Sheet.Close = RadixDialog.Close;

interface SheetContentProps extends RadixDialog.DialogContentProps, VariantProps<typeof sheetVariants> {}

Sheet.Content = ({ 
  children, 
  className, 
  side = 'right', 
  ...props 
}: SheetContentProps) => {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className={overlayClasses} />
      <RadixDialog.Content
        className={cn(sheetVariants({ side }), className)}
        {...props}
      >
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
};

Sheet.Header = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('flex items-center justify-between p-4 border-b border-border bg-bg-primary md:bg-bg-secondary sticky top-0 z-10', className)}>
    {children}
  </div>
);

Sheet.Title = ({ children, className }: { children: ReactNode; className?: string }) => (
  <RadixDialog.Title asChild>
    <Text as="h2" size="xl" weight="semibold" className={className}>{children}</Text>
  </RadixDialog.Title>
);

Sheet.Body = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('flex-1 overflow-y-auto p-4 md:p-6 bg-bg-primary', className)}>
    {children}
  </div>
);
