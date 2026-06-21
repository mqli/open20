import { NavLink, useNavigate } from 'react-router-dom';
import { usePackStore } from '../../stores/packStore';
import { Package, Search, Plus } from 'lucide-react';
import { useState } from 'react';

export function Sidebar() {
  const navigate = useNavigate();
  const packs = usePackStore((state) => state.packs);
  const recentPacks = packs.slice(0, 5); // Top 5 recent packs
  const [showQuickStart, setShowQuickStart] = useState(false);

  return (
    <aside className="w-60 h-screen bg-surface-secondary border-r border-border flex flex-col">
      <div className="p-4">
        <h1 className="text-xl font-bold">Rulebook</h1>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <NavLink to="/rulebook" className="block p-3 hover:bg-muted" end>
          <Package className="w-4 h-4 inline mr-2" />
          Packs
        </NavLink>
        <NavLink to="/rulebook/browse" className="block p-3 hover:bg-muted">
          <Search className="w-4 h-4 inline mr-2" />
          Browse
        </NavLink>
        {recentPacks.length > 0 && (
          <>
            <hr className="my-2" />
            <p className="px-3 text-sm text-muted-foreground">RECENT PACKS</p>
            {recentPacks.map((pack) => (
              <NavLink
                key={pack.id}
                to={`/rulebook/packs/${pack.id}`}
                className="block p-2 text-sm hover:bg-muted"
              >
                {pack.name}
              </NavLink>
            ))}
          </>
        )}
      </nav>
      <div className="p-4 border-t border-border">
        <p className="text-sm text-muted-foreground">New to Rulebook?</p>
        {showQuickStart ? (
          <div className="mt-2 p-2 bg-bg-primary rounded-md border border-border space-y-2">
            <p className="text-xs text-text-secondary">
              Create a content pack, then add spells using the &quot;Add&quot; menu. You can also
              import existing JSON content packs.
            </p>
            <button
              className="text-xs text-primary hover:underline flex items-center gap-1"
              onClick={() => {
                setShowQuickStart(false);
                navigate('/rulebook');
              }}
            >
              <Plus className="w-3 h-3" />
              Create your first pack
            </button>
            <button
              className="block text-xs text-text-tertiary hover:text-text-secondary"
              onClick={() => setShowQuickStart(false)}
            >
              Dismiss
            </button>
          </div>
        ) : (
          <button
            className="text-sm text-primary hover:underline"
            onClick={() => setShowQuickStart(true)}
          >
            Quick Start Guide
          </button>
        )}
      </div>
    </aside>
  );
}
