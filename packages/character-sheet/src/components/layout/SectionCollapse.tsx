// SectionCollapse.tsx (T-127)
// Presentational accordion section: collapsible header + animated content area.
// Used by ContentArea to stack all sections vertically with collapse/expand behavior.
// NFR-01: color + redundant non-color cues (Chevron direction).
// NFR-02: >=44x44px tap target, keyboard operable, aria-expanded.

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import { Button, cn } from '@open20/ui';

export interface SectionCollapseProps {
  /** HTML id for scroll targeting */
  id: string;
  /** Section title displayed in header */
  title: string;
  /** Lucide icon */
  icon: LucideIcon;
  /** Whether the section content is visible */
  expanded: boolean;
  /** Called when header is clicked */
  onToggle: () => void;
  /** When true, no toggle button, always expanded */
  disabled?: boolean;
  /** Section content */
  children: ReactNode;
  /** Additional class for the outer wrapper */
  className?: string;
}

export function SectionCollapse({
  id,
  title,
  icon: Icon,
  expanded,
  onToggle,
  disabled = false,
  children,
  className,
}: SectionCollapseProps) {
  const headingId = `${id}-heading`;
  const panelId = `${id}-panel`;

  return (
    <section id={id} aria-labelledby={headingId} className={className}>
      {/* Header */}
      {disabled ? (
        /* Non-interactive header for always-visible sections (Combat) */
        <div className="flex items-center gap-2 mb-2">
          <Icon className="h-5 w-5 text-primary-500 shrink-0" aria-hidden="true" />
          <h2
            id={headingId}
            className={cn('flex-1 text-xs font-bold tracking-[0.2em] text-text-primary uppercase')}
          >
            {title}
          </h2>
        </div>
      ) : (
        /* Interactive header */
        <Button
          variant="ghost"
          size="md"
          className={cn(
            'w-full justify-between gap-2 py-2 px-0',
            'focus-visible:ring-2 focus-visible:ring-primary-600 rounded-md',
          )}
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={panelId}
        >
          <span className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary-500 shrink-0" aria-hidden="true" />
            <h2
              id={headingId}
              className={cn(
                'flex-1 text-xs font-bold tracking-[0.2em] text-text-primary uppercase',
              )}
            >
              {title}
            </h2>
          </span>
          <ChevronDown
            className={cn(
              'h-5 w-5 shrink-0 text-text-secondary transition-transform duration-200',
              'motion-reduce:transition-none',
              expanded && 'rotate-180',
            )}
            aria-hidden="true"
          />
        </Button>
      )}

      {/* Content — animated expand/collapse via CSS grid trick */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={headingId}
        aria-hidden={!expanded || undefined}
        className={cn(
          'grid transition-all duration-200 ease-in-out',
          'motion-reduce:transition-none',
          expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div className={disabled ? '' : 'pt-2 pb-1'}>{children}</div>
        </div>
      </div>
    </section>
  );
}
