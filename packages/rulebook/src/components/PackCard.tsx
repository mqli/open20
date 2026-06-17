import type { ContentPackMeta } from 'open20-core';
import { Button } from '@open20/ui';
import { usePackStore } from '../stores/packStore';
import { Database } from 'lucide-react';

interface PackCardProps {
  pack: ContentPackMeta;
  spellCount: number;
  isBuiltIn?: boolean;
  onOpen: () => void;
  onExport: () => void;
}

export function PackCard({ pack, spellCount, isBuiltIn = false, onOpen, onExport }: PackCardProps) {
  const isEnabled = usePackStore((state) => state.isPackEnabled(pack.id));
  const togglePackEnabled = usePackStore((state) => state.togglePackEnabled);
  const deletePackAndStorage = usePackStore((state) => state.deletePackAndStorage);

  return (
    <div className="border border-border rounded-lg p-4 hover:shadow-lg hover:scale-[1.02] transition-all">
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-3 h-3 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
        <h3 className="font-semibold">{pack.name}</h3>
        {isBuiltIn && (
          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
            <Database className="w-3 h-3" />
            Built-in
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-1">
        v{pack.version} · {pack.source}
      </p>
      <p className="text-sm text-muted-foreground mb-3">🪄 {spellCount} spells</p>
      <div className="flex gap-2">
        <Button size="sm" onClick={onOpen}>
          Open
        </Button>
        <Button size="sm" variant="outline" onClick={onExport}>
          Export
        </Button>
        <Button size="sm" variant="outline" onClick={() => togglePackEnabled(pack.id)}>
          {isEnabled ? 'Disable' : 'Enable'}
        </Button>
        {!isBuiltIn && (
          <Button size="sm" variant="danger" onClick={() => deletePackAndStorage(pack.id)}>
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
