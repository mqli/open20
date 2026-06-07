import { cn } from '@/lib/cn';

export const colors = {
  primary: {
    50: 'var(--color-primary-50)',
    100: 'var(--color-primary-100)',
    400: 'var(--color-primary-400)',
    500: 'var(--color-primary-500)',
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

// ── Shared interactive base (focus, disabled, transition) ──
export const interactiveBase = cn(
  'transition-all duration-200',
  'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

export const badgeVariants = {
  secondary: 'bg-bg-tertiary text-text-secondary border border-border/50',
  primary: 'bg-primary-500/15 text-primary-600 dark:text-primary-400 border border-primary-500/20',
  success: 'bg-success/15 text-success border border-success/20',
  danger: 'bg-danger/15 text-danger border border-danger/20',
  warning: 'bg-warning/15 text-warning border border-warning/20',
  info: 'bg-info/15 text-info border border-info/20',
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
} as const;

export const buttonVariants = {
  primary: 'bg-primary-600 hover:bg-primary-800 text-white border border-primary-800 shadow-md',
  secondary: 'bg-bg-tertiary hover:bg-border text-text-primary border border-border',
  outline:
    'bg-transparent hover:bg-primary-100 text-primary-600 dark:text-primary-400 border border-primary-400/40',
  ghost: 'hover:bg-bg-tertiary text-primary-600 dark:text-primary-400',
  danger: 'bg-danger hover:bg-danger/90 text-white border border-danger/90',
  warning: 'bg-warning hover:bg-warning/90 text-white border border-warning/90',
} as const;

export const badgeToggleSizeVariants = {
  sm: 'px-1.5 py-0.5 text-[10px] rounded-full',
  md: 'px-2 py-0.5 text-xs rounded-md',
  lg: 'px-3 py-1 text-sm rounded-lg',
} as const;

export const buttonSizeVariants = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg',
} as const;

export const iconButtonSizeVariants = {
  sm: 'p-1 [&>svg]:w-3.5 [&>svg]:h-3.5',
  md: 'p-1.5 [&>svg]:w-4 [&>svg]:h-4',
  lg: 'p-2 [&>svg]:w-5 [&>svg]:h-5',
} as const;

export const iconButtonVariants = {
  secondary: 'bg-bg-tertiary text-text-tertiary hover:bg-bg-secondary border-border',
  primary:
    'bg-primary-500/15 text-primary-600 dark:text-primary-400 border-primary-500/30 hover:bg-primary-500/25',
  info: 'bg-info/15 text-info border-info/30 hover:bg-info/25',
  warning: 'bg-warning/15 text-warning border-warning/30 hover:bg-warning/25',
  danger: 'bg-danger/15 text-danger border-danger/30 hover:bg-danger/25',
  success: 'bg-success/15 text-success border-success/30 hover:bg-success/25',
} as const;

export const iconButtonActiveVariants = {
  secondary: 'bg-bg-secondary text-text-primary border-border/80',
  primary:
    'bg-primary-500/30 text-primary-600 dark:text-primary-300 border-primary-500/50 shadow-sm shadow-primary-500/10',
  info: 'bg-info/30 text-info border-info/50 shadow-sm',
  warning: 'bg-warning/30 text-warning border-warning/50 shadow-sm',
  danger: 'bg-danger/30 text-danger border-danger/50 shadow-sm',
  success: 'bg-success/30 text-success border-success/50 shadow-sm',
} as const;

export const sliderTrackClasses =
  'relative h-2 w-full grow overflow-hidden rounded-full bg-bg-tertiary';
export const sliderRangeClasses = 'absolute h-full bg-primary-600';
export const sliderThumbClasses =
  'block h-5 w-5 rounded-full border-2 border-primary-600 bg-bg-primary ring-offset-bg-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

export const slotPipStateVariants = {
  available: 'bg-primary-500 border-primary-600 shadow-sm shadow-primary-500/30',
  used: 'border-border bg-bg-tertiary',
  empty: 'border-border/50 border-dashed bg-transparent',
} as const;

export const surfaceVariants = {
  default: 'bg-bg-secondary border-border',
  primary: 'bg-bg-primary border-primary-400/30',
  elevated: 'bg-bg-primary border-border', // shadow via shadow prop
  ghost: 'bg-transparent border-border/50',
  tint: 'bg-primary-500/5 border-primary-500/10',
  selected: 'border-primary-400 ring-1 ring-primary-400/60', // no shadow baked in
  warning: 'border-warning ring-2 ring-warning/50 bg-warning/5', // no shadow baked in
  info: 'border-info/50', // no shadow baked in
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
  formLabel: 'block text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em] mb-2',
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
  'z-50 min-w-32 overflow-hidden rounded-md border border-border bg-bg-secondary p-1 text-text-primary shadow-md animate-in fade-in-80';

export const dropdownItemBaseClasses =
  'relative flex cursor-pointer select-none items-center rounded-sm text-sm outline-none transition-colors focus:bg-bg-tertiary data-disabled:pointer-events-none data-disabled:opacity-50';

export const inputBaseClasses =
  'flex h-10 w-full rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50';

export const overlayClasses =
  'fixed inset-0 bg-black/40 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0';

export const sheetSideClasses = {
  right:
    'inset-y-0 right-0 h-full w-full md:w-[540px] transition-transform data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
  left: 'inset-y-0 left-0 h-full w-full md:w-[540px] transition-transform data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
  bottom:
    'inset-x-0 bottom-0 h-[85vh] w-full rounded-t-2xl transition-transform data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
} as const;

export const closeButtonClasses =
  'absolute top-4 right-4 p-1 rounded hover:bg-bg-tertiary text-text-secondary hover:text-text-primary transition-colors';

// Spell school color tokens — each D&D school gets a distinct color.
export const spellSchoolVariants = {
  Abjuration: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20',
  Conjuration: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20',
  Divination: 'bg-slate-400/15 text-slate-500 dark:text-slate-400 border border-slate-400/20',
  Enchantment: 'bg-pink-500/15 text-pink-600 dark:text-pink-400 border border-pink-500/20',
  Evocation: 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20',
  Illusion: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20',
  Necromancy:
    'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  Transmutation: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20',
} as const;

// ── Cantrip badge color (distinct from schools) ──
export const cantripBadgeVariants = {
  true: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  false: 'bg-primary-500/15 text-primary-600 dark:text-primary-400 border border-primary-500/20',
} as const;
