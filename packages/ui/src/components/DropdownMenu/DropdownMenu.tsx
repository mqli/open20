import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '@open20/ui/lib/cn';
import { dropdownContentClasses, dropdownItemBaseClasses } from '@open20/ui/styles/design-tokens';

export const DropdownMenu = {
  Root: RadixDropdownMenu.Root,
  Trigger: RadixDropdownMenu.Trigger,
  Group: RadixDropdownMenu.Group,
  Label: RadixDropdownMenu.Label,
  Separator: RadixDropdownMenu.Separator,

  Content: ({ className, sideOffset = 4, ...props }: RadixDropdownMenu.DropdownMenuContentProps) => (
    <RadixDropdownMenu.Portal>
      <RadixDropdownMenu.Content
        sideOffset={sideOffset}
        className={cn(dropdownContentClasses, className)}
        {...props}
      >
        {props.children}
        <RadixDropdownMenu.Arrow className="fill-bg-secondary" />
      </RadixDropdownMenu.Content>
    </RadixDropdownMenu.Portal>
  ),

  Item: ({ className, children, ...props }: RadixDropdownMenu.DropdownMenuItemProps) => (
    <RadixDropdownMenu.Item className={cn(dropdownItemBaseClasses, 'px-2 py-1.5', className)} {...props}>
      {children}
    </RadixDropdownMenu.Item>
  ),

  CheckboxItem: ({ className, children, ...props }: RadixDropdownMenu.DropdownMenuCheckboxItemProps) => (
    <RadixDropdownMenu.CheckboxItem
      className={cn(dropdownItemBaseClasses, 'py-1.5 pl-8 pr-2', className)}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <RadixDropdownMenu.ItemIndicator>
          <Check className="h-4 w-4" />
        </RadixDropdownMenu.ItemIndicator>
      </span>
      {children}
    </RadixDropdownMenu.CheckboxItem>
  ),

  RadioGroup: RadixDropdownMenu.RadioGroup,

  RadioItem: ({ className, children, ...props }: RadixDropdownMenu.DropdownMenuRadioItemProps) => (
    <RadixDropdownMenu.RadioItem className={cn(dropdownItemBaseClasses, 'py-1.5 pl-8 pr-2', className)} {...props}>
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <RadixDropdownMenu.ItemIndicator>
          <div className="h-2 w-2 rounded-full bg-primary-600" />
        </RadixDropdownMenu.ItemIndicator>
      </span>
      {children}
    </RadixDropdownMenu.RadioItem>
  ),

  Sub: RadixDropdownMenu.Sub,

  SubTrigger: ({ className, children, ...props }: RadixDropdownMenu.DropdownMenuSubTriggerProps) => (
    <RadixDropdownMenu.SubTrigger
      className={cn(
        dropdownItemBaseClasses,
        'px-2 py-1.5 focus:bg-bg-tertiary data-[state=open]:bg-bg-tertiary',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto h-4 w-4" />
    </RadixDropdownMenu.SubTrigger>
  ),

  SubContent: ({ className, ...props }: RadixDropdownMenu.DropdownMenuSubContentProps) => (
    <RadixDropdownMenu.Portal>
      <RadixDropdownMenu.SubContent className={cn(dropdownContentClasses, className)} {...props} />
    </RadixDropdownMenu.Portal>
  ),
};
