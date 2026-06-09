import { useState, type ReactNode } from 'react';
import type { GlossaryEntry } from 'open20-core';
import { cn } from '@/lib/cn';
import { GlossaryEntryFlyout } from './GlossaryEntryFlyout';
import { GlossaryEntryTooltip } from './GlossaryEntryTooltip';
import { shouldUseFlyoutForEntry } from './glossary-summary';

export type GlossaryTermDisplay = 'tooltip' | 'flyout' | 'auto';

export interface GlossaryTermProps {
  entry: GlossaryEntry;
  display?: GlossaryTermDisplay;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onTermClick?: (entryId: string) => void;
  resolveTermLabel?: (entryId: string) => string | undefined;
  withTooltipProvider?: boolean;
  className?: string;
  termClassName?: string;
}

export function GlossaryTerm({
  entry,
  display = 'auto',
  children,
  open: openProp,
  onOpenChange,
  onTermClick,
  resolveTermLabel,
  withTooltipProvider = false,
  className,
  termClassName,
}: GlossaryTermProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  const resolvedDisplay =
    display === 'auto' ? (shouldUseFlyoutForEntry(entry) ? 'flyout' : 'tooltip') : display;

  const termClassNames = cn(
    'inline cursor-help border-0 bg-transparent p-0 font-inherit text-inherit underline decoration-dotted underline-offset-2 hover:text-primary-500',
    termClassName,
  );

  if (resolvedDisplay === 'tooltip') {
    return (
      <GlossaryEntryTooltip entry={entry} withProvider={withTooltipProvider} className={className}>
        <button type="button" className={termClassNames}>
          {children}
        </button>
      </GlossaryEntryTooltip>
    );
  }

  const flyoutTrigger = isControlled ? (
    <button type="button" className={termClassNames} onClick={() => setOpen(true)}>
      {children}
    </button>
  ) : (
    <button type="button" className={termClassNames}>
      {children}
    </button>
  );

  return (
    <span className={cn('inline', className)}>
      <GlossaryEntryFlyout
        entry={entry}
        open={open}
        onOpenChange={setOpen}
        onTermClick={onTermClick}
        resolveTermLabel={resolveTermLabel}
        trigger={isControlled ? undefined : flyoutTrigger}
      />
      {isControlled ? flyoutTrigger : null}
    </span>
  );
}
