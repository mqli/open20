// BackgroundPanel.tsx (T-112)
// Displays background name and description.
// Handles unknown background IDs with a fallback.

import { useMemo } from 'react';
import { Bookmark } from 'lucide-react';
import { Surface, Text, Badge, cn } from '@open20/ui';
import type { AppCharacter } from '@/types';
import { getBackgroundById, getBackgroundName } from '@/core/content-resolver';

export interface BackgroundPanelProps {
  character: AppCharacter;
  className?: string;
}

export function BackgroundPanel({ character, className }: BackgroundPanelProps) {
  const background = useMemo(() => getBackgroundById(character.background), [character.background]);

  // Unknown background fallback
  if (!background) {
    const fallbackName = getBackgroundName(character.background);
    return (
      <Surface variant="default" padding="md" className={className}>
        <div className="flex items-center gap-2 mb-2">
          <Bookmark className="h-5 w-5 text-primary-500 shrink-0" aria-hidden />
          <Text variant="label" weight="bold">
            Background
          </Text>
          <Badge variant="warning" size="sm">
            Unknown
          </Badge>
        </div>
        <Text variant="bodySm" color="secondary">
          {fallbackName} — data not found in the SRD content pack.
        </Text>
      </Surface>
    );
  }

  const displayName = background.name ?? background.id;

  return (
    <Surface variant="default" padding="md" className={cn('flex flex-col gap-3', className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Bookmark className="h-5 w-5 text-primary-500 shrink-0" aria-hidden />
        <Text variant="label" weight="bold">
          Background
        </Text>
        <Badge variant="primary" size="sm">
          {displayName}
        </Badge>
      </div>

      {/* Description */}
      {background.description && (
        <Text variant="bodySm" color="secondary">
          {background.description}
        </Text>
      )}
    </Surface>
  );
}
