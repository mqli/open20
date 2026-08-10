// FeatureCard.tsx — T-216
// Single expandable feature card with chevron toggle and description.
// Follows TraitCard/FeatCard animation pattern.

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Text, Button, cn } from '@open20/ui';
import type { Feature } from 'open20-core';

export interface FeatureCardProps {
  feature: Feature;
  initiallyExpanded?: boolean;
}

export function FeatureCard({ feature, initiallyExpanded = false }: FeatureCardProps) {
  const [expanded, setExpanded] = useState(initiallyExpanded);

  // No description → plain non-expandable row
  if (!feature.description) {
    return (
      <div className="flex items-center gap-2 py-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-primary-500 shrink-0" />
        <Text variant="bodySm" weight="medium">
          {feature.name}
        </Text>
      </div>
    );
  }

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 py-1.5 px-0 hover:bg-primary-100 dark:hover:bg-primary-900/20 focus-visible:ring-2 focus-visible:ring-primary-600 rounded-md min-h-[44px]"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-label={`${expanded ? 'Collapse' : 'Expand'} ${feature.name}`}
      >
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-text-secondary transition-transform duration-200',
            'motion-reduce:transition-none',
            expanded && 'rotate-180',
          )}
          aria-hidden
        />
        <Text variant="bodySm" weight="medium" className="text-left">
          {feature.name}
        </Text>
      </Button>

      <div
        aria-hidden={!expanded || undefined}
        className={cn(
          'grid transition-all duration-200 ease-in-out',
          'motion-reduce:transition-none',
          expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <Text variant="bodySm" color="secondary" className="pl-6 pb-2">
            {feature.description}
          </Text>
        </div>
      </div>
    </div>
  );
}
