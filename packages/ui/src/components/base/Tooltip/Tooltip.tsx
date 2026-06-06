import type { ReactNode } from 'react';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import { cn } from '@/lib/cn';

export function TooltipProvider({ children }: { children: ReactNode }) {
  return <RadixTooltip.Provider delayDuration={300}>{children}</RadixTooltip.Provider>;
}

export const Tooltip = {
  Root: RadixTooltip.Root,
  Trigger: RadixTooltip.Trigger,
  Content: ({ className, children, ...props }: RadixTooltip.TooltipContentProps) => (
    <RadixTooltip.Portal>
      <RadixTooltip.Content
        className={cn(
          'z-50 overflow-hidden rounded-md bg-bg-tertiary px-3 py-1.5 text-xs text-text-primary shadow-md animate-in fade-in-0 zoom-in-95',
          className,
        )}
        sideOffset={4}
        {...props}
      >
        {children}
        <RadixTooltip.Arrow className="fill-bg-tertiary" />
      </RadixTooltip.Content>
    </RadixTooltip.Portal>
  ),
};
