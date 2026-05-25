import * as RadixSelect from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../lib/cn';
import {
  dropdownContentClasses,
  dropdownItemBaseClasses,
  inputBaseClasses,
} from '../styles/design-tokens';

interface SelectTriggerProps extends RadixSelect.SelectTriggerProps {
  placeholder?: string;
}

export const Select = {
  Root: RadixSelect.Root,
  Group: RadixSelect.Group,
  Value: RadixSelect.Value,

  Trigger: ({ className, children, placeholder, ...props }: SelectTriggerProps) => (
    <RadixSelect.Trigger className={cn(inputBaseClasses, 'items-center justify-between', className)} {...props}>
      <RadixSelect.Value placeholder={placeholder} />
      {children}
      <RadixSelect.Icon asChild>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </RadixSelect.Icon>
    </RadixSelect.Trigger>
  ),

  Content: ({ className, children, ...props }: RadixSelect.SelectContentProps) => (
    <RadixSelect.Portal>
      <RadixSelect.Content className={cn('relative', dropdownContentClasses, className)} position="popper" {...props}>
        <RadixSelect.ScrollUpButton className="flex h-6 cursor-default items-center justify-center bg-bg-secondary">
          <ChevronUp className="h-4 w-4" />
        </RadixSelect.ScrollUpButton>
        <RadixSelect.Viewport className="p-1">{children}</RadixSelect.Viewport>
        <RadixSelect.ScrollDownButton className="flex h-6 cursor-default items-center justify-center bg-bg-secondary">
          <ChevronDown className="h-4 w-4" />
        </RadixSelect.ScrollDownButton>
      </RadixSelect.Content>
    </RadixSelect.Portal>
  ),

  Item: ({ className, children, ...props }: RadixSelect.SelectItemProps) => (
    <RadixSelect.Item className={cn(dropdownItemBaseClasses, 'w-full py-1.5 pl-8 pr-2', className)} {...props}>
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <RadixSelect.ItemIndicator>
          <Check className="h-4 w-4" />
        </RadixSelect.ItemIndicator>
      </span>
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
    </RadixSelect.Item>
  ),

  Label: ({ className, ...props }: RadixSelect.SelectLabelProps) => (
    <RadixSelect.Label className={cn('py-1.5 pl-8 pr-2 text-sm font-semibold text-text-secondary', className)} {...props} />
  ),

  Separator: ({ className, ...props }: RadixSelect.SelectSeparatorProps) => (
    <RadixSelect.Separator className={cn('-mx-1 my-1 h-px bg-border', className)} {...props} />
  ),
};
