import { useState } from 'react';
import { Button } from '@open20/ui';
import { Plus } from 'lucide-react';

interface AddAlwaysPreparedRowProps {
  onAdd: (level: number, spells: string) => void;
}

export function AddAlwaysPreparedRow({ onAdd }: AddAlwaysPreparedRowProps) {
  const [level, setLevel] = useState('3');
  const [spells, setSpells] = useState('');

  const handleAdd = () => {
    const lvl = parseInt(level, 10);
    if (isNaN(lvl) || lvl < 1 || !spells.trim()) return;
    onAdd(lvl, spells.trim());
    setSpells('');
  };

  return (
    <div className="flex items-center gap-1 mt-1">
      <input
        type="number"
        className="w-12 px-1 py-0.5 text-xs border rounded bg-bg-secondary text-text-primary"
        value={level}
        onChange={(e) => setLevel((e.target as HTMLInputElement).value)}
        min={1}
        max={20}
      />
      <input
        type="text"
        className="flex-1 px-1.5 py-0.5 text-xs border rounded bg-bg-secondary text-text-primary"
        placeholder="spell-id, spell-id"
        value={spells}
        onChange={(e) => setSpells((e.target as HTMLInputElement).value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleAdd();
        }}
      />
      <Button variant="ghost" size="sm" className="h-5 px-1 shrink-0" onClick={handleAdd}>
        <Plus className="w-3 h-3" />
      </Button>
    </div>
  );
}
