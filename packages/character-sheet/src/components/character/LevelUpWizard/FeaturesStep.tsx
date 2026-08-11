// FeaturesStep.tsx (T-212)
// Informational preview of features gained at the new level.
// No user input — always valid. Displays features as expandable cards.

import { useMemo } from 'react';
import { BookOpen, Sparkles, Star } from 'lucide-react';
import { Text, Surface, cn } from '@open20/ui';
import { getClassById } from '@/core/content-resolver';

export interface FeaturesStepProps {
  /** The class being advanced. */
  classId: string;
  /** The new level after level-up (current + 1). */
  newLevel: number;
  className?: string;
}

export function FeaturesStep({ classId, newLevel, className }: FeaturesStepProps) {
  const klass = getClassById(classId);

  const levelEntry = useMemo(() => {
    if (!klass) return null;
    return klass.featuresByLevel.find((f) => f.level === newLevel) ?? null;
  }, [klass, newLevel]);

  if (!klass) {
    return (
      <div className={cn('flex flex-col gap-3', className)}>
        <Text variant="labelSm" color="secondary">
          Class not found
        </Text>
      </div>
    );
  }

  const features = levelEntry?.features ?? [];
  const hasProgression =
    features.length > 0 ||
    levelEntry?.cantripsKnown !== undefined ||
    levelEntry?.preparedSpells !== undefined;

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <Text variant="labelSm" color="secondary">
        {klass.name} Level {newLevel} — What You Gain
      </Text>

      {!hasProgression && (
        <Text variant="bodySm" color="secondary">
          Nothing new at this level.
        </Text>
      )}

      {/* Spellcasting progression */}
      {(levelEntry?.cantripsKnown !== undefined || levelEntry?.preparedSpells !== undefined) && (
        <Surface padding="sm" className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary-400" aria-hidden="true" />
            <Text variant="bodySm" weight="bold">
              Spellcasting
            </Text>
          </div>
          {levelEntry.cantripsKnown !== undefined && (
            <Text variant="bodySm" color="secondary">
              Cantrips Known: {levelEntry.cantripsKnown}
            </Text>
          )}
          {levelEntry.preparedSpells !== undefined && (
            <Text variant="bodySm" color="secondary">
              Prepared Spells: {levelEntry.preparedSpells}
            </Text>
          )}
        </Surface>
      )}

      {/* Feature cards */}
      {features.map((feature, i) => (
        <Surface key={`${feature.name}-${i}`} padding="sm" className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            {feature.featureType === 'acFormula' ? (
              <Star className="h-4 w-4 text-info" aria-hidden="true" />
            ) : (
              <BookOpen className="h-4 w-4 text-primary-400" aria-hidden="true" />
            )}
            <Text variant="bodySm" weight="bold">
              {feature.name}
            </Text>
          </div>
          <Text variant="bodySm" color="secondary">
            {feature.description}
          </Text>
        </Surface>
      ))}
    </div>
  );
}
