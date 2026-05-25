import * as RadixTabs from '@radix-ui/react-tabs';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/helpers';

const tabsListVariants = cva(
  'flex border-b border-border overflow-x-auto hide-scrollbar',
  {
    variants: {
      variant: {
        default: '',
        pills: 'border-b-0 gap-1',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

const tabsTriggerVariants = cva(
  'px-4 py-2 -mb-[1px] border-b-2 border-transparent whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-400 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: 'text-text-secondary hover:text-text-primary data-[state=active]:border-primary-600 data-[state=active]:text-primary-600',
        pills: 'rounded-full border-0 data-[state=active]:bg-primary-500 data-[state=active]:text-white data-[state=active]:shadow-sm',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export const Tabs = {
  Root: RadixTabs.Root,

  List: ({ variant, className, ...props }: VariantProps<typeof tabsListVariants> & RadixTabs.TabsListProps) => (
    <RadixTabs.List
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  ),

  Trigger: ({ variant, className, ...props }: VariantProps<typeof tabsTriggerVariants> & RadixTabs.TabsTriggerProps) => (
    <RadixTabs.Trigger
      className={cn(tabsTriggerVariants({ variant }), className)}
      {...props}
    />
  ),

  Content: ({ className, ...props }: RadixTabs.TabsContentProps) => (
    <RadixTabs.Content
      className={cn('outline-none mt-4', className)}
      {...props}
    />
  ),
};
