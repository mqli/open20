import * as RadixDialog from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/helpers';
import { Text } from './Text';
import { closeButtonClasses } from '@/styles/design-tokens';

const dialogVariants = cva(
  'fixed z-50 bg-bg-secondary rounded-lg shadow-xl p-6 max-h-[85vh] overflow-y-auto outline-none',
  {
    variants: {
      position: {
        center: 'top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]',
        left: 'top-0 left-0 h-full',
        right: 'top-0 right-0 h-full',
      },
    },
    defaultVariants: { position: 'center' },
  }
);

const overlayVariants = cva(
  'fixed inset-0 z-40 animate-fade-in',
  {
    variants: {
      variant: {
        default: 'bg-black/50',
        blur: 'bg-black/40 backdrop-blur-sm',
      },
    },
    defaultVariants: { variant: 'blur' },
  }
);

export const Dialog = {
  Root: RadixDialog.Root,
  Trigger: RadixDialog.Trigger,

  Overlay: ({ variant, className, ...props }: VariantProps<typeof overlayVariants> & { className?: string }) => (
    <RadixDialog.Overlay
      className={cn(overlayVariants({ variant }), className)}
      {...props}
    />
  ),

  Content: ({ position, className, children, ...props }: VariantProps<typeof dialogVariants> & RadixDialog.DialogContentProps) => (
    <RadixDialog.Portal>
      <Dialog.Overlay />
      <RadixDialog.Content
        className={cn(dialogVariants({ position }), className)}
        {...props}
      >
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  ),

  Header: ({ className, children, ...props }: { className?: string; children: React.ReactNode }) => (
    <div className={cn('mb-4 pb-4 border-b border-border', className)} {...props}>
      {children}
    </div>
  ),

  Title: ({ className, children, ...props }: RadixDialog.DialogTitleProps) => (
    <RadixDialog.Title asChild {...props}>
      <Text as="h2" size="2xl" weight="bold" className={className}>{children}</Text>
    </RadixDialog.Title>
  ),

  Description: ({ className, children, ...props }: RadixDialog.DialogDescriptionProps) => (
    <RadixDialog.Description asChild {...props}>
      <Text variant="body" className={cn('mt-1', className)}>{children}</Text>
    </RadixDialog.Description>
  ),

  Close: ({ className, children, ...props }: RadixDialog.DialogCloseProps) => (
    <RadixDialog.Close
      className={cn(closeButtonClasses, className)}
      {...props}
    >
      {children || '×'}
    </RadixDialog.Close>
  ),
};
