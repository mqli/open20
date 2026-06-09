import type { GlossaryEntry, GlossaryEntryTag } from 'open20-core';
import { Text } from '@/components/base/Text';
import { Badge, type BadgeProps } from '@/components/base/Badge';
import { useTranslation } from '@/i18n';

const tagVariantMap: Record<GlossaryEntryTag, BadgeProps['variant']> = {
  Action: 'primary',
  'Area of Effect': 'info',
  Attitude: 'secondary',
  Condition: 'warning',
  Hazard: 'danger',
};

export interface GlossaryEntryHeaderProps {
  entry: GlossaryEntry;
  titleSize?: 'md' | 'lg';
  showName?: boolean;
}

export function GlossaryEntryHeader({
  entry,
  titleSize = 'lg',
  showName = true,
}: GlossaryEntryHeaderProps) {
  const t = useTranslation();

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2 min-w-0">
        {showName && (
          <Text
            as="h3"
            variant="heading"
            size={titleSize}
            className={titleSize === 'md' ? 'text-sm' : undefined}
          >
            {entry.name}
          </Text>
        )}

        {entry.tag && (
          <Badge variant={tagVariantMap[entry.tag]} size="sm">
            {entry.tag}
          </Badge>
        )}

        {entry.condition && (
          <Badge variant="warning" size="sm">
            {entry.condition}
          </Badge>
        )}
      </div>

      {entry.aliases && entry.aliases.length > 0 && (
        <Text variant="caption" as="p" className="text-text-tertiary">
          {t('glossary.aliases', { aliases: entry.aliases.join(', ') })}
        </Text>
      )}
    </div>
  );
}
