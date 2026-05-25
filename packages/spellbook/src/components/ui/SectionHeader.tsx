import { cn } from '@/utils/helpers';
import { Text } from '@open20/ui';
import type { ReactNode } from 'react';

interface SectionHeaderProps {
  icon?: ReactNode;
  title: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({
  icon,
  title,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center gap-2 mb-4', className)}>
      {icon && <span className="text-primary-500">{icon}</span>}
      <Text as="h3" variant="labelSm" weight="black" className="tracking-[0.2em] flex-1">
        {title}
      </Text>
      {action && <div>{action}</div>}
    </div>
  );
}
