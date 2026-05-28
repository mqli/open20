import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Text } from '@/components/Text';
import { useTranslation } from '@/i18n';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  const t = useTranslation();

  // Use provided title/description or fallback to i18n defaults
  const displayTitle = title || t('emptyState.noItems');
  const displayDescription = description || t('emptyState.getStarted');

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center space-y-3 py-12 text-center',
        className,
      )}
    >
      {icon && <div className="mb-2 text-text-tertiary/50">{icon}</div>}
      <Text variant="body" weight="medium">
        {displayTitle}
      </Text>
      {description && (
        <Text variant="caption" className="max-w-xs">
          {displayDescription}
        </Text>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
