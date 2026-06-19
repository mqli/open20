import { useState } from 'react';
import type { Spell, Monster } from 'open20-core';
import { BookOpen, Skull, Pencil, Trash2 } from 'lucide-react';

interface ContentTableProps {
  spells?: Spell[];
  monsters?: Monster[];
  selectedIds: string[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  isReadOnly?: boolean;
  /** Source label for items that don't have their own source field (e.g., monsters from a pack) */
  sourceLabel?: string;
}

export function ContentTable({
  spells,
  monsters,
  selectedIds,
  onEdit,
  onDelete,
  onToggleSelect,
  onSelectAll,
  isReadOnly = false,
  sourceLabel,
}: ContentTableProps) {
  const [selectAllChecked, setSelectAllChecked] = useState(false);

  /** Determine mode based on which prop is provided */
  const mode: 'spells' | 'monsters' = monsters ? 'monsters' : 'spells';

  const items = mode === 'monsters' ? (monsters ?? []) : (spells ?? []);

  const handleSelectAll = () => {
    if (selectAllChecked) {
      onSelectAll([]);
    } else {
      onSelectAll(items.map((item) => item.id));
    }
    setSelectAllChecked(!selectAllChecked);
  };

  const handleToggleSelect = (id: string) => {
    onToggleSelect(id);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-2">
              <input
                type="checkbox"
                checked={selectAllChecked}
                onChange={handleSelectAll}
                className="cursor-pointer"
              />
            </th>
            <th className="text-left p-2 text-text-secondary text-sm font-medium">Type</th>
            <th className="text-left p-2 text-text-secondary text-sm font-medium">Name</th>
            {mode === 'spells' && (
              <>
                <th className="text-left p-2 text-text-secondary text-sm font-medium">Level</th>
                <th className="text-left p-2 text-text-secondary text-sm font-medium">School</th>
                <th className="text-left p-2 text-text-secondary text-sm font-medium">Classes</th>
              </>
            )}
            {mode === 'monsters' && (
              <>
                <th className="text-left p-2 text-text-secondary text-sm font-medium">Type</th>
                <th className="text-left p-2 text-text-secondary text-sm font-medium">Size</th>
                <th className="text-left p-2 text-text-secondary text-sm font-medium">CR</th>
              </>
            )}
            <th className="text-left p-2 text-text-secondary text-sm font-medium">Source</th>
            {(onEdit || onDelete) && !isReadOnly && (
              <th className="text-left p-2 text-text-secondary text-sm font-medium">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {mode === 'spells' &&
            spells?.map((spell) => (
              <tr
                key={spell.id}
                className="border-b border-border hover:bg-muted/50 transition-colors"
              >
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(spell.id)}
                    onChange={() => handleToggleSelect(spell.id)}
                    className="cursor-pointer"
                  />
                </td>
                <td className="p-2">
                  <BookOpen className="w-4 h-4 text-text-secondary" />
                </td>
                <td className="p-2 text-text-primary font-medium">{spell.name}</td>
                <td className="p-2 text-text-primary">{spell.level}</td>
                <td className="p-2 text-text-primary">{spell.school}</td>
                <td className="p-2 text-text-primary text-xs">
                  {spell.classes?.join(', ') || '-'}
                </td>
                <td className="p-2 text-text-primary text-xs">{spell.source}</td>
                {(onEdit || onDelete) && !isReadOnly && (
                  <td className="p-2">
                    <div className="flex gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(spell.id)}
                          className="p-1 hover:bg-muted rounded-md transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4 text-text-secondary hover:text-text-primary" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(spell.id)}
                          className="p-1 hover:bg-muted rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-destructive hover:text-destructive/80" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          {mode === 'monsters' &&
            monsters?.map((monster) => (
              <tr
                key={monster.id}
                className="border-b border-border hover:bg-muted/50 transition-colors"
              >
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(monster.id)}
                    onChange={() => handleToggleSelect(monster.id)}
                    className="cursor-pointer"
                  />
                </td>
                <td className="p-2">
                  <Skull className="w-4 h-4 text-text-secondary" />
                </td>
                <td className="p-2 text-text-primary font-medium">{monster.name}</td>
                <td className="p-2 text-text-primary">{monster.type}</td>
                <td className="p-2 text-text-primary">{monster.size}</td>
                <td className="p-2 text-text-primary">{String(monster.challengeRating.rating)}</td>
                <td className="p-2 text-text-primary text-xs">{sourceLabel || monster.source}</td>
                {(onEdit || onDelete) && !isReadOnly && (
                  <td className="p-2">
                    <div className="flex gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(monster.id)}
                          className="p-1 hover:bg-muted rounded-md transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4 text-text-secondary hover:text-text-primary" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(monster.id)}
                          className="p-1 hover:bg-muted rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-destructive hover:text-destructive/80" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
