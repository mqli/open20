import type { ContentPackMeta } from 'open20-core';
import { Button } from '@open20/ui';
import { usePackStore } from '../stores/packStore';

interface PackCardProps {
  pack: ContentPackMeta;
  spellCount: number;
  onOpen: () => void;
  onExport: () => void;
}

export function PackCard({ pack, spellCount, onOpen, onExport }: PackCardProps) {
  const isEnabled = usePackStore((state) => state.isPackEnabled(pack.id));
  const togglePackEnabled = usePackStore((state) => state.togglePackEnabled);
  const deletePackAndStorage = usePackStore((state) => state.deletePackAndStorage);

  return (
    <div className="border border-border rounded-lg p-4 hover:shadow-lg hover:scale-[1.02] transition-all">
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-3 h-3 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
        <h3 className="font-semibold">{pack.name}</h3>
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
        <Button size="sm" variant="danger" onClick={() => deletePackAndStorage(pack.id)}>
          Delete
        </Button>
      </div>
    </div>
  );
}
