import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import { slotPipStateVariants } from '@/styles/design-tokens';

const pipVariants = cva(
  'cursor-pointer rounded-md border transition-all duration-150 hover:scale-110',
  {
    variants: {
      state: slotPipStateVariants,
      size: {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
      },
    },
    defaultVariants: { state: 'available', size: 'md' },
  },
);

export interface SlotPipsProps extends VariantProps<typeof pipVariants> {
  total: number;
  used: number;
  onPipClick?: (index: number, isUsed: boolean) => void;
  className?: string;
}

export function SlotPips({ total, used, size, onPipClick, className }: SlotPipsProps) {
  const available = total - used;

  return (
    <div data-testid="slot-pips" className={cn('flex gap-1.5', className)}>
      {Array.from({ length: total }, (_, index) => (
        <button
          key={index}
          type="button"
          data-testid={`slot-pip-${index}`}
          className={cn(pipVariants({ state: index < available ? 'available' : 'used', size }))}
          onClick={() => onPipClick?.(index, index >= available)}
          aria-label={index < available ? 'Available slot' : 'Used slot'}
          aria-checked={index >= available}
        />
      ))}
    </div>
  );
}
