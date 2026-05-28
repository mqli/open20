import * as RadixSwitch from '@radix-ui/react-switch';
import { cva } from 'class-variance-authority';
import { cn } from '@open20/ui/lib/cn';

const switchVariants = cva(
  'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary-600 data-[state=unchecked]:bg-bg-tertiary',
);

const thumbVariants = cva(
  'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
);

export interface SwitchProps extends Omit<RadixSwitch.SwitchProps, 'asChild'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function Switch({ className, checked, onCheckedChange, ...props }: SwitchProps) {
  return (
    <RadixSwitch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(switchVariants(), className)}
      {...props}
    >
      <RadixSwitch.Thumb className={cn(thumbVariants())} />
    </RadixSwitch.Root>
  );
}

export default Switch;
