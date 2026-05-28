import * as RadixTabs from '@radix-ui/react-tabs';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const tabsListVariants = cva('flex border-b border-border', {
  variants: {
    variant: {
      default: '',
      pills: 'gap-1 border-b-0',
    },
    scrollable: {
      true: 'overflow-x-auto hide-scrollbar',
      false: '',
    },
  },
  defaultVariants: { variant: 'default', scrollable: false },
});

const tabsTriggerVariants = cva(
  'px-4 py-2 -mb-[1px] border-b-2 border-transparent whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-400 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'text-text-secondary hover:text-text-primary data-[state=active]:border-primary-600 data-[state=active]:text-primary-600',
        pills:
          'rounded-full border-0 data-[state=active]:bg-primary-500 data-[state=active]:text-white data-[state=active]:shadow-sm',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export const Tabs = {
  Root: RadixTabs.Root,

  List: ({
    variant,
    scrollable,
    className,
    ...props
  }: VariantProps<typeof tabsListVariants> & RadixTabs.TabsListProps) => (
    <RadixTabs.List
      className={cn(tabsListVariants({ variant, scrollable }), className)}
      {...props}
    />
  ),

  Trigger: ({
    variant,
    className,
    ...props
  }: VariantProps<typeof tabsTriggerVariants> & RadixTabs.TabsTriggerProps) => (
    <RadixTabs.Trigger className={cn(tabsTriggerVariants({ variant }), className)} {...props} />
  ),

  Content: ({ className, ...props }: RadixTabs.TabsContentProps) => (
    <RadixTabs.Content className={cn('mt-4 outline-none', className)} {...props} />
  ),
};
