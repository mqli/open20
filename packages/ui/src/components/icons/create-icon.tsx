import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn';

export const iconSizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6',
} as const;

export type IconSize = keyof typeof iconSizeClasses;

/**
 * Creates a D&D semantic icon component from a lucide-react icon.
 * Adds a `size` prop that applies Tailwind width/height classes,
 * so consumers don't need to repeat `className="w-3 h-3"`.
 */
export function createDndIcon(
  BaseIcon: LucideIcon,
): React.FC<
  Omit<React.ComponentProps<LucideIcon>, 'size'> & { size?: IconSize }
> {
  return function DndIcon({
    size,
    className,
    ...props
  }: {
    size?: IconSize;
    className?: string;
  } & Record<string, unknown>) {
    return (
      <BaseIcon
        className={cn(size && iconSizeClasses[size], className)}
        {...(props as Record<string, unknown>)}
      />
    );
  };
}
