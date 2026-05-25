import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/helpers';

const pipVariants = cva(
  'rounded-md border transition-all duration-150 cursor-pointer hover:scale-110',
  {
    variants: {
      state: {
        available: 'bg-primary-500 border-primary-600 shadow-sm shadow-primary-500/30',
        used: 'bg-gray-300 border-gray-400',
        empty: 'bg-transparent border-dashed border-border/50',
      },
      size: {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
      },
    },
    defaultVariants: { state: 'available', size: 'md' },
  }
);

export interface SlotPipsProps extends VariantProps<typeof pipVariants> {
  total: number;
  used: number;
  onPipClick?: (index: number, isUsed: boolean) => void;
  className?: string;
}

export function SlotPips({
  total,
  used,
  size,
  onPipClick,
  className,
}: SlotPipsProps) {
  const available = total - used;
  return (
    <div className={cn('flex gap-1.5', className)}>
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          className={cn(pipVariants({ state: i < available ? 'available' : 'used', size }))}
          onClick={() => onPipClick?.(i, i >= available)}
          aria-label={i < available ? 'Available slot' : 'Used slot'}
        />
      ))}
    </div>
  );
}
