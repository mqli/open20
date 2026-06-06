import { Dialog } from './components/base/Dialog/index';
import { DropdownMenu } from './components/base/DropdownMenu/index';
import { Select } from './components/base/Select/index';
import { Sheet } from './components/base/Sheet/index';
import { Tabs } from './components/base/Tabs/index';

export { Badge } from './components/base/Badge/index';
export type { BadgeProps } from './components/base/Badge/index';
export { CardSurface, CardMetaItem } from './components/base/CardSurface/index';
export type {
  CardSurfaceProps,
  CardSurfaceDensity,
  CardMetaItemProps,
} from './components/base/CardSurface/index';
export { Button } from './components/base/Button/index';
export type { ButtonProps } from './components/base/Button/index';
export { Dialog };
export { Divider } from './components/base/Divider/index';
export type { DividerProps } from './components/base/Divider/index';
export { DropdownMenu };
export { EmptyState } from './components/base/EmptyState/index';
export { FilterChip } from './components/base/FilterChip/index';
export { IconButton } from './components/base/IconButton/index';
export { Input } from './components/base/Input/index';
export type { InputProps } from './components/base/Input/index';
export { SectionHeader } from './components/base/SectionHeader/index';
export { Select };
export { Sheet };
export { Slider } from './components/base/Slider/index';
export { SlotPips } from './components/base/SlotPips/index';
export { SpellCard } from './components/spell/index';
export type { SpellCardProps } from './components/spell/index';
export { FeatCard } from './components/rules/feat/index';
export type { FeatCardProps } from './components/rules/feat/index';
export { Surface } from './components/base/Surface/index';
export type { SurfaceProps } from './components/base/Surface/index';
export { Switch } from './components/base/Switch/index';
export type { SwitchProps } from './components/base/Switch/index';
export { Tabs };
export { Text } from './components/base/Text/index';
export type { TextProps } from './components/base/Text/index';
export { ThemeToggle } from './components/base/ThemeToggle/index';
export type { ThemeToggleProps } from './components/base/ThemeToggle/index';
export { Toggle } from './components/base/Toggle/index';
export type { ToggleProps } from './components/base/Toggle/index';
export { Tooltip, TooltipProvider } from './components/base/Tooltip/index';

export * from './components/base/icons';

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

// i18n exports - base translations for UI components
// Consuming apps can extend these with their own translations
export {
  I18nProvider,
  useI18n,
  useTranslation,
  defaultTranslations,
  zhCNTranslations,
  type BaseTranslationKeys,
  type BaseTranslations,
  type Translations,
} from './i18n';
