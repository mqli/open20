import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Text } from './Text';

interface SectionHeaderProps {
  icon?: ReactNode;
  title: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({ icon, title, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('mb-4 flex items-center gap-2', className)}>
      {icon && <span className="text-primary-500">{icon}</span>}
      <Text as="h3" variant="labelSm" weight="black" className="flex-1 tracking-[0.2em]">
        {title}
      </Text>
      {action && <div>{action}</div>}
    </div>
  );
}
