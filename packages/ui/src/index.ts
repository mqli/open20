import { Dialog } from './components/Dialog/index';
import { DropdownMenu } from './components/DropdownMenu/index';
import { Select } from './components/Select/index';
import { Sheet } from './components/Sheet/index';
import { Tabs } from './components/Tabs/index';

export { Badge } from './components/Badge/index';
export type { BadgeProps } from './components/Badge/index';
export { Button } from './components/Button/index';
export type { ButtonProps } from './components/Button/index';
export { Dialog };
export { Divider } from './components/Divider/index';
export type { DividerProps } from './components/Divider/index';
export { DropdownMenu };
export { EmptyState } from './components/EmptyState/index';
export { FilterChip } from './components/FilterChip/index';
export { IconButton } from './components/IconButton/index';
export { Input } from './components/Input/index';
export type { InputProps } from './components/Input/index';
export { SectionHeader } from './components/SectionHeader/index';
export { Select };
export { Sheet };
export { Slider } from './components/Slider/index';
export { SlotPips } from './components/SlotPips/index';
export { SpellCard } from './components/spell/index';
export type { SpellCardProps } from './components/spell/index';
export { Surface } from './components/Surface/index';
export type { SurfaceProps } from './components/Surface/index';
export { Switch } from './components/Switch/index';
export type { SwitchProps } from './components/Switch/index';
export { Tabs };
export { Text } from './components/Text/index';
export type { TextProps } from './components/Text/index';
export { ThemeToggle } from './components/ThemeToggle/index';
export type { ThemeToggleProps } from './components/ThemeToggle/index';
export { Toggle } from './components/Toggle/index';
export type { ToggleProps } from './components/Toggle/index';
export { Tooltip, TooltipProvider } from './components/Tooltip/index';

export * from './components/icons';

// Shadcn-style aliases for easier incremental migration.
export const DialogRoot = Dialog.Root;
export const DialogTrigger = Dialog.Trigger;
export const DialogOverlay: typeof Dialog.Overlay = Dialog.Overlay;
export const DialogContent: typeof Dialog.Content = Dialog.Content;
export const DialogHeader: typeof Dialog.Header = Dialog.Header;
export const DialogTitle: typeof Dialog.Title = Dialog.Title;
export const DialogDescription: typeof Dialog.Description = Dialog.Description;
export const DialogClose: typeof Dialog.Close = Dialog.Close;

export const DropdownMenuRoot = DropdownMenu.Root;
export const DropdownMenuTrigger = DropdownMenu.Trigger;
export const DropdownMenuContent: typeof DropdownMenu.Content = DropdownMenu.Content;
export const DropdownMenuItem: typeof DropdownMenu.Item = DropdownMenu.Item;
export const DropdownMenuLabel = DropdownMenu.Label;
export const DropdownMenuSeparator = DropdownMenu.Separator;

export const SelectRoot = Select.Root;
export const SelectGroup = Select.Group;
export const SelectValue = Select.Value;
export const SelectTrigger: typeof Select.Trigger = Select.Trigger;
export const SelectContent: typeof Select.Content = Select.Content;
export const SelectItem: typeof Select.Item = Select.Item;
export const SelectLabel: typeof Select.Label = Select.Label;
export const SelectSeparator: typeof Select.Separator = Select.Separator;

export const SheetRoot = Sheet;
export const SheetTrigger = Sheet.Trigger;
export const SheetClose = Sheet.Close;
export const SheetContent: typeof Sheet.Content = Sheet.Content;
export const SheetHeader: typeof Sheet.Header = Sheet.Header;
export const SheetTitle: typeof Sheet.Title = Sheet.Title;
export const SheetBody: typeof Sheet.Body = Sheet.Body;

export const TabsRoot = Tabs.Root;
export const TabsList: typeof Tabs.List = Tabs.List;
export const TabsTrigger: typeof Tabs.Trigger = Tabs.Trigger;
export const TabsContent: typeof Tabs.Content = Tabs.Content;

export * from './styles/design-tokens';
