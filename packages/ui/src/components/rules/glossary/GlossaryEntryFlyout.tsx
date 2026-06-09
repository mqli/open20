import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import type { GlossaryEntry } from 'open20-core';
import { cn } from '@/lib/cn';
import { Sheet } from '@/components/base/Sheet';
import { IconButton } from '@/components/base/IconButton';
import { useTranslation } from '@/i18n';
import { GlossaryEntryHeader } from './GlossaryEntryHeader';
import { GlossaryEntryContent } from './GlossaryEntryContent';

export interface GlossaryEntryFlyoutProps {
  entry: GlossaryEntry | null | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTermClick?: (entryId: string) => void;
  resolveTermLabel?: (entryId: string) => string | undefined;
  trigger?: ReactNode;
  side?: 'right' | 'left' | 'bottom';
  className?: string;
}

export function GlossaryEntryFlyout({
  entry,
  open,
  onOpenChange,
  onTermClick,
  resolveTermLabel,
  trigger,
  side = 'right',
  className,
}: GlossaryEntryFlyoutProps) {
  const t = useTranslation();

  if (!entry) return trigger ?? null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger && <Sheet.Trigger asChild>{trigger}</Sheet.Trigger>}
      <Sheet.Content side={side} className={cn('w-full sm:w-[min(100vw,420px)]', className)}>
        <Sheet.Header>
          <Sheet.Title>{entry.name}</Sheet.Title>
          <Sheet.Close asChild>
            <IconButton size="sm" aria-label={t('glossary.close')}>
              <X />
            </IconButton>
          </Sheet.Close>
        </Sheet.Header>
        <Sheet.Body>
          <div className="space-y-4">
            <GlossaryEntryHeader entry={entry} showName={false} />
            <GlossaryEntryContent
              entry={entry}
              onTermClick={onTermClick}
              resolveTermLabel={resolveTermLabel}
            />
          </div>
        </Sheet.Body>
      </Sheet.Content>
    </Sheet>
  );
}
