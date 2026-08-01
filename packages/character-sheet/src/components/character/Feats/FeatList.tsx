// FeatList.tsx
// Displays a character's feat list as expandable FeatCards inside a Surface panel.
// Handles: normal render, empty state, unknown ID fallback (mirrors SpeciesPanel/BackgroundPanel).

import { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { Surface, Text, Badge, EmptyState, cn } from '@open20/ui';
import type { AppCharacter } from '@/types';
import { getFeatById, getFeatName } from '@/core/content-resolver';
import { FeatCard } from './FeatCard';

export interface FeatListProps {
  character: AppCharacter;
  className?: string;
}

export function FeatList({ character, className }: FeatListProps) {
  const feats = character.feats;

  // Resolve each CharacterFeatEntry to a Feat object (or undefined for unknown IDs)
  const resolved = useMemo(
    () => feats.map((entry) => ({ entry, data: getFeatById(entry.featId) })),
    [feats],
  );

  // Empty state
  if (feats.length === 0) {
    return (
      <Surface variant="default" padding="sm" className={className}>
        <EmptyState
          title="No Feats"
          description="This character has no feats yet. Feats are gained during level-up or character creation."
        />
      </Surface>
    );
  }

  return (
    <Surface variant="default" padding="sm" className={cn('flex flex-col gap-1', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="h-5 w-5 text-primary-500 shrink-0" aria-hidden />
        <Text variant="label" weight="bold">
          Feats
        </Text>
      </div>

      {/* Feat cards */}
      <div className="divide-y divide-border">
        {resolved.map(({ entry, data }) => {
          // Unknown feat ID fallback
          if (!data) {
            const fallbackName = getFeatName(entry.featId);
            return (
              <div key={entry.featId} className="flex items-center gap-2 py-2">
                <div className="h-1.5 w-1.5 rounded-full bg-warning shrink-0" />
                <Text variant="bodySm" weight="medium">
                  {fallbackName}
                </Text>
                <Badge variant="warning" size="sm">
                  Unknown
                </Badge>
              </div>
            );
          }

          return <FeatCard key={entry.featId} feat={data} />;
        })}
      </div>
    </Surface>
  );
}
