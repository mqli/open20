import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Text } from '../Text';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center space-y-3 py-12 text-center', className)}>
      {icon && <div className="mb-2 text-text-tertiary/50">{icon}</div>}
      <Text variant="body" weight="medium">
        {title}
      </Text>
      {description && (
        <Text variant="caption" className="max-w-xs">
          {description}
        </Text>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
