import type { ReactNode } from 'react';
import type { GlossaryEntry } from 'open20-core';
import { cn } from '@/lib/cn';
import { Text } from '@/components/base/Text';
import { Tooltip, TooltipProvider } from '@/components/base/Tooltip';
import { GlossaryEntryHeader } from './GlossaryEntryHeader';
import { getGlossaryTooltipSummary } from './glossary-summary';

export interface GlossaryEntryTooltipProps {
  entry: GlossaryEntry;
  children: ReactNode;
  /** Wrap with a local TooltipProvider when the app root does not provide one */
  withProvider?: boolean;
  className?: string;
}

function GlossaryEntryTooltipContent({ entry }: { entry: GlossaryEntry }) {
  return (
    <div className="max-w-xs space-y-2">
      <GlossaryEntryHeader entry={entry} titleSize="md" />
      <Text variant="caption" as="p" className="leading-relaxed text-text-secondary">
        {getGlossaryTooltipSummary(entry)}
      </Text>
    </div>
  );
}

export function GlossaryEntryTooltip({
  entry,
  children,
  withProvider = false,
  className,
}: GlossaryEntryTooltipProps) {
  const tooltip = (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <span className={cn('inline', className)}>{children}</span>
      </Tooltip.Trigger>
      <Tooltip.Content className="max-w-sm px-3 py-2 text-left">
        <GlossaryEntryTooltipContent entry={entry} />
      </Tooltip.Content>
    </Tooltip.Root>
  );

  if (withProvider) {
    return <TooltipProvider>{tooltip}</TooltipProvider>;
  }

  return tooltip;
}
