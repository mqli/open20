import { Dialog } from './components/Dialog';
import { DropdownMenu } from './components/DropdownMenu';
import { Select } from './components/Select';
import { Sheet } from './components/Sheet';
import { Tabs } from './components/Tabs';

export { Badge } from './components/Badge';
export type { BadgeProps } from './components/Badge';
export { Button } from './components/Button';
export type { ButtonProps } from './components/Button';
export { Dialog };
export { DropdownMenu };
export { EmptyState } from './components/EmptyState';
export { FilterChip } from './components/FilterChip';
export { IconButton } from './components/IconButton';
export { Input } from './components/Input';
export type { InputProps } from './components/Input';
export { SectionHeader } from './components/SectionHeader';
export { Select };
export { Sheet };
export { Slider } from './components/Slider';
export { SlotPips } from './components/SlotPips';
export { Surface } from './components/Surface';
export type { SurfaceProps } from './components/Surface';
export { Switch } from './components/Switch';
export type { SwitchProps } from './components/Switch';
export { Tabs };
export { Text } from './components/Text';
export type { TextProps } from './components/Text';
export { Toggle } from './components/Toggle';
export type { ToggleProps } from './components/Toggle';
export { Tooltip, TooltipProvider } from './components/Tooltip';

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
