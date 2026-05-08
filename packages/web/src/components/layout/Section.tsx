import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui';

interface SectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Section({ title, children, className }: SectionProps) {
  return (
    <section className={cn('space-y-3', className)}>
      {title && (
        <h2 className="text-sm font-semibold text-[--color-text-secondary] uppercase tracking-wide px-1">
          {title}
        </h2>
      )}
      <Card>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </section>
  );
}
