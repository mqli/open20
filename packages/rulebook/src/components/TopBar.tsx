import { useLocation } from 'react-router-dom';
import { Search, Settings } from 'lucide-react';

export function TopBar() {
  const location = useLocation();
  const breadcrumb = location.pathname.split('/').filter(Boolean).join(' > ');

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-4">
      <div className="text-sm text-muted-foreground">{breadcrumb}</div>
      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-muted rounded-md" title="Search">
          <Search className="w-4 h-4" />
        </button>
        <button className="p-2 hover:bg-muted rounded-md" title="Settings">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
