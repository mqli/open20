import type { Spell } from 'open20-core';
import { Surface, Text } from '@open20/ui';

interface SpellStatsGridProps {
  spell: Spell;
}

function formatComponents(components: Spell['components']): string {
  if (Array.isArray(components)) return components.join(', ');
  if (components && typeof components === 'object') return Object.keys(components).join(', ');
  if (typeof components === 'string') return components;
  return 'None';
}

export function SpellStatsGrid({ spell }: SpellStatsGridProps) {
  const stats = [
    { label: 'Time', value: spell.castingTime ?? '—' },
    { label: 'Range', value: spell.range ?? '—' },
    { label: 'Duration', value: spell.duration ?? '—' },
    { label: 'Components', value: formatComponents(spell.components) },
    { label: 'Source', value: spell.source?.toUpperCase() || 'SRD' },
  ];

  return (
    <dl className="grid grid-cols-2 gap-3 mb-8">
      {stats.map((stat) => (
        <Surface key={stat.label} variant="default" padding="sm" className="overflow-hidden">
          <Text variant="labelSm" weight="black" className="mb-1 truncate">
            {stat.label}
          </Text>
          <Text variant="bodyBold" className="break-words">
            {stat.value}
          </Text>
        </Surface>
      ))}
    </dl>
  );
}
