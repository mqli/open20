import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Settings } from 'lucide-react';
import { useState } from 'react';

export function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const breadcrumb = location.pathname.split('/').filter(Boolean).join(' > ');
  const [showSettingsHint, setShowSettingsHint] = useState(false);

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-4 relative">
      <div className="text-sm text-muted-foreground">{breadcrumb}</div>
      <div className="flex items-center gap-2">
        <button
          className="p-2 hover:bg-muted rounded-md"
          title="Search content"
          onClick={() => navigate('/rulebook/browse')}
        >
          <Search className="w-4 h-4" />
        </button>
        <div className="relative">
          <button
            className="p-2 hover:bg-muted rounded-md"
            title="Settings"
            onClick={() => setShowSettingsHint(!showSettingsHint)}
          >
            <Settings className="w-4 h-4" />
          </button>
          {showSettingsHint && (
            <div className="absolute right-0 top-full mt-1 w-48 p-3 bg-bg-primary border border-border rounded-md shadow-lg z-50">
              <p className="text-xs text-text-secondary">
                Settings panel coming in a future update.
              </p>
              <button
                className="mt-2 text-xs text-primary hover:underline"
                onClick={() => setShowSettingsHint(false)}
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
