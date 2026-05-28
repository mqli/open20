import * as RadixSlider from '@radix-ui/react-slider';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@open20/ui/lib/cn';
import { sliderRangeClasses, sliderThumbClasses, sliderTrackClasses } from '@open20/ui/styles/design-tokens';

const sliderVariants = cva('relative flex w-full touch-none select-none items-center');

const thumbVariants = cva(sliderThumbClasses);

export interface SliderProps
  extends Omit<RadixSlider.SliderProps, 'asChild'>,
    VariantProps<typeof sliderVariants> {
  min?: number;
  max?: number;
  step?: number;
  value?: number[];
  onValueChange?: (value: number[]) => void;
}

export function Slider({
  className,
  min = 0,
  max = 100,
  step = 1,
  value,
  onValueChange,
  ...props
}: SliderProps) {
  return (
    <RadixSlider.Root
      min={min}
      max={max}
      step={step}
      value={value}
      onValueChange={onValueChange}
      className={cn(sliderVariants(), className)}
      {...props}
    >
      <RadixSlider.Track className={sliderTrackClasses}>
        <RadixSlider.Range className={sliderRangeClasses} />
      </RadixSlider.Track>
      {value?.map((_, index) => (
        <RadixSlider.Thumb key={index} className={cn(thumbVariants())} />
      ))}
    </RadixSlider.Root>
  );
}
