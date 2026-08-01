// FeatCard.tsx
// Single expandable feat card with category badge, name, and description.
// Follows SpeciesPanel TraitCard animation pattern: ChevronDown rotation + grid-rows transition.
// Default collapsed (feat descriptions are long); NFR-01: chevron + aria-expanded; NFR-02: >=44px targets.

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Text, Badge, Button, cn } from '@open20/ui';
import type { Feat } from 'open20-core';

export interface FeatCardProps {
  feat: Feat;
  initiallyExpanded?: boolean;
}

export function FeatCard({ feat, initiallyExpanded = false }: FeatCardProps) {
  const [expanded, setExpanded] = useState(initiallyExpanded);

  const displayName = feat.name ?? feat.id;

  // Match TraitCard pattern: no description → plain non-expandable row
  if (!feat.description) {
    return (
      <div className="flex items-center gap-2 py-1.5">
        <Badge variant="primary" size="sm">
          {displayName}
        </Badge>
        <Badge variant="secondary" size="sm">
          {feat.category}
        </Badge>
      </div>
    );
  }

  return (
    <div className="py-1.5">
      {/* Header row: chevron + name badge + category badge */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 py-1.5 px-0 hover:bg-primary-100 dark:hover:bg-primary-900/20 focus-visible:ring-2 focus-visible:ring-primary-600 rounded-md"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-label={`${expanded ? 'Collapse' : 'Expand'} ${displayName}`}
      >
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-text-secondary transition-transform duration-200',
            'motion-reduce:transition-none',
            expanded && 'rotate-180',
          )}
          aria-hidden
        />
        <Badge variant="primary" size="sm">
          {displayName}
        </Badge>
        <Badge variant="secondary" size="sm">
          {feat.category}
        </Badge>
      </Button>

      {/* Expandable description */}
      <div
        aria-hidden={!expanded || undefined}
        className={cn(
          'grid transition-all duration-200 ease-in-out',
          'motion-reduce:transition-none',
          expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <Text variant="bodySm" color="secondary" className="pl-6 pb-1">
            {feat.description}
          </Text>
        </div>
      </div>
    </div>
  );
}
