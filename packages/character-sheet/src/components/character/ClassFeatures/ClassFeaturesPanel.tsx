// ClassFeaturesPanel.tsx — T-216
// Per-class features from Class.featuresByLevel up to the character's level.
// Expandable cards with feature name and description.

import { useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import { Surface, Text, Badge, cn } from '@open20/ui';
import type { AppCharacter } from '@/types';
import type { Feature, Class } from 'open20-core';
import { getClassById } from '@/core/content-resolver';
import { FeatureCard } from './FeatureCard';
import { useIsLargeScreen } from '@/hooks/useIsLargeScreen';

export interface ClassFeaturesPanelProps {
  character: AppCharacter;
  className?: string;
}

/** Collect features from Class.featuresByLevel up to the given level. */
function getFeaturesUpToLevel(klass: Class, level: number): Feature[] {
  const result: Feature[] = [];
  for (const entry of klass.featuresByLevel) {
    if (entry.level <= level) {
      result.push(...entry.features);
    }
  }
  return result;
}

interface ClassFeatureGroup {
  classId: string;
  className: string;
  level: number;
  features: Feature[];
}

export function ClassFeaturesPanel({ character, className }: ClassFeaturesPanelProps) {
  const { isDesktop } = useIsLargeScreen();

  const classGroups = useMemo(() => {
    const result: ClassFeatureGroup[] = [];

    for (const charClass of character.classes) {
      const klass = getClassById(charClass.classId);
      if (!klass) continue;

      const features = getFeaturesUpToLevel(klass, charClass.level);
      if (features.length === 0) continue;

      result.push({
        classId: charClass.classId,
        className: klass.name ?? charClass.classId,
        level: charClass.level,
        features,
      });
    }

    return result;
  }, [character.classes]);

  if (classGroups.length === 0) return null;

  return (
    <Surface variant="default" padding="sm" className={cn(className)}>
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="h-5 w-5 text-primary-500 shrink-0" aria-hidden />
        <Text variant="label" weight="bold">
          Class Features
        </Text>
      </div>

      <div className="flex flex-col gap-3">
        {classGroups.map((group) => (
          <div key={group.classId}>
            {/* Per-class header */}
            <div className="flex items-center gap-2 mb-1">
              <Text variant="bodySm" weight="bold">
                {group.className}
              </Text>
              <Badge variant="primary" size="sm">
                Level {group.level}
              </Badge>
            </div>

            {/* Feature cards */}
            <div className="divide-y divide-border">
              {group.features.map((feature, idx) => (
                <FeatureCard
                  key={`${feature.name}-${idx}`}
                  feature={feature}
                  initiallyExpanded={isDesktop}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Surface>
  );
}
