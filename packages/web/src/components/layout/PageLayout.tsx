import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PageLayoutProps {
  title: string;
  backTo?: string;
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({ title, backTo, children, className }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-[--color-bg-primary] text-[--color-text-primary]">
      <header className="p-4 border-b border-[--color-border] w-full">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          {backTo && (
            <Link to={backTo}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
          )}
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
      </header>

      <main className={cn('p-4 w-full max-w-2xl mx-auto space-y-6 pb-8', className)}>
        {children}
      </main>
    </div>
  );
}
