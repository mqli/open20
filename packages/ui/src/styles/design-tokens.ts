import { cn } from '../lib/cn';

export const colors = {
  primary: {
    50: 'var(--color-primary-50)',
    100: 'var(--color-primary-100)',
    400: 'var(--color-primary-400)',
    600: 'var(--color-primary-600)',
    800: 'var(--color-primary-800)',
  },
  bg: {
    primary: 'var(--color-bg-primary)',
    secondary: 'var(--color-bg-secondary)',
    tertiary: 'var(--color-bg-tertiary)',
  },
  text: {
    primary: 'var(--color-text-primary)',
    secondary: 'var(--color-text-secondary)',
    tertiary: 'var(--color-text-tertiary)',
  },
  border: 'var(--color-border)',
  status: {
    success: 'var(--color-success)',
    danger: 'var(--color-danger)',
    warning: 'var(--color-warning)',
    info: 'var(--color-info)',
  },
} as const;

export const badgeVariants = {
  secondary: 'bg-bg-tertiary text-text-secondary border border-border/50',
  primary: 'bg-primary-500/15 text-primary-600 dark:text-primary-400 border border-primary-500/20',
  success: 'bg-success/15 text-success border border-success/20',
  danger: 'bg-danger/15 text-danger border border-danger/20',
  warning: 'bg-warning/15 text-warning border border-warning/20',
  info: 'bg-info/15 text-info border border-info/20',
  slate: 'bg-bg-tertiary text-text-secondary border border-border/50',
  purple: 'bg-primary-500/15 text-primary-600 dark:text-primary-400 border border-primary-500/20',
} as const;

export const toggleVariants = {
  secondary: cn(
    'bg-bg-tertiary text-text-secondary border border-border/50',
    'hover:bg-border hover:text-text-primary',
    'data-[state=on]:bg-border data-[state=on]:text-text-primary',
  ),
  primary: cn(
    'bg-primary-500/15 text-primary-600 dark:text-primary-400 border border-primary-500/20',
    'hover:bg-primary-500/25 shadow-sm shadow-primary-500/10',
    'data-[state=on]:bg-primary-500/30 data-[state=on]:border-primary-500/50',
  ),
  success: cn(
    'bg-success/15 text-success border border-success/20',
    'hover:bg-success/25',
    'data-[state=on]:bg-success/30 data-[state=on]:border-success/50',
  ),
  danger: cn(
    'bg-danger/15 text-danger border border-danger/20',
    'hover:bg-danger/25',
    'data-[state=on]:bg-danger/30 data-[state=on]:border-danger/50',
  ),
  warning: cn(
    'bg-warning/15 text-warning border border-warning/20',
    'hover:bg-warning/25',
    'data-[state=on]:bg-warning/30 data-[state=on]:border-warning/50',
  ),
  info: cn(
    'bg-info/15 text-info border border-info/20',
    'hover:bg-info/25',
    'data-[state=on]:bg-info/30 data-[state=on]:border-info/50',
  ),
  slate: cn(
    'bg-bg-tertiary text-text-secondary border border-border/50',
    'hover:bg-border hover:text-text-primary',
    'data-[state=on]:bg-border data-[state=on]:text-text-primary',
  ),
  purple: cn(
    'bg-primary-500/15 text-primary-600 dark:text-primary-400 border border-primary-500/20',
    'hover:bg-primary-500/25 shadow-sm shadow-primary-500/10',
    'data-[state=on]:bg-primary-500/30 data-[state=on]:border-primary-500/50',
  ),
} as const;

export const buttonVariants = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white border border-primary-700 shadow-md',
  secondary: 'bg-bg-tertiary hover:bg-border text-text-primary border border-border',
  outline: 'bg-transparent hover:bg-primary-100 text-primary-700 border border-primary-200',
  ghost: 'hover:bg-bg-tertiary text-primary-600 dark:text-primary-400',
  danger: 'bg-danger hover:bg-red-700 text-white border border-red-700',
  warning: 'bg-warning hover:bg-amber-600 text-white border border-amber-600',
} as const;

export const badgeToggleSizeVariants = {
  sm: 'px-1.5 py-0.5 text-[10px] rounded-full',
  md: 'px-2 py-0.5 text-xs rounded-full',
  lg: 'px-3 py-1 text-sm rounded-lg',
} as const;

export const buttonSizeVariants = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg',
} as const;

export const iconButtonSizeVariants = {
  sm: 'p-1',
  md: 'p-1.5',
  lg: 'p-2',
} as const;

export const surfaceVariants = {
  default: 'bg-bg-secondary border-border',
  primary: 'bg-bg-primary border-primary-200',
  elevated: 'bg-bg-primary border-border shadow-md',
  ghost: 'bg-transparent border-border/50',
  tint: 'bg-primary-500/5 border-primary-500/10',
  selected: 'border-primary-400 shadow-md ring-1 ring-primary-400/60',
  warning: 'border-warning ring-2 ring-warning/50 bg-warning/5',
  info: 'border-info/50 shadow-sm',
} as const;

export const surfacePaddingVariants = {
  none: 'p-0',
  xs: 'p-2',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
} as const;

export const surfaceShadowVariants = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-2xl',
} as const;

export const textVariants = {
  label: 'text-[9px] font-black text-text-tertiary uppercase tracking-widest',
  labelSm: 'text-[10px] font-bold text-text-tertiary uppercase tracking-widest',
  caption: 'text-[10px] text-text-tertiary',
  bodySm: 'text-xs text-text-secondary',
  body: 'text-sm text-text-secondary',
  bodyBold: 'text-sm font-bold text-text-primary',
  heading: 'font-bold text-text-primary',
  headingSm: 'text-sm font-black text-text-primary',
} as const;

export const textSizeVariants = {
  xs: 'text-[10px]',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
  '2xl': 'text-xl',
} as const;

export const textColorVariants = {
  primary: 'text-text-primary',
  secondary: 'text-text-secondary',
  tertiary: 'text-text-tertiary',
  accent: 'text-primary-600 dark:text-primary-400',
} as const;

export const textWeightVariants = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  black: 'font-black',
} as const;

export const dropdownContentClasses =
  'z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-bg-secondary p-1 text-text-primary shadow-md animate-in fade-in-80';

export const dropdownItemBaseClasses =
  'relative flex cursor-pointer select-none items-center rounded-sm text-sm outline-none transition-colors focus:bg-bg-tertiary data-[disabled]:pointer-events-none data-[disabled]:opacity-50';

export const inputBaseClasses =
  'flex h-10 w-full rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50';

export const overlayClasses =
  'fixed inset-0 bg-black/40 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0';

export const sheetSideClasses = {
  right:
    'inset-y-0 right-0 h-full w-full md:w-[540px] transition-transform data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
  left:
    'inset-y-0 left-0 h-full w-full md:w-[540px] transition-transform data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
  bottom:
    'inset-x-0 bottom-0 h-[85vh] w-full rounded-t-2xl transition-transform data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
} as const;

export const closeButtonClasses =
  'absolute top-4 right-4 p-1 rounded hover:bg-bg-tertiary text-text-secondary hover:text-text-primary transition-colors';
