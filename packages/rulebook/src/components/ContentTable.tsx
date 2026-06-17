import { useState } from 'react';
import type { Spell } from 'open20-core';
import { BookOpen, Pencil, Trash2 } from 'lucide-react';

interface ContentTableProps {
  spells: Spell[];
  selectedIds: string[];
  onEdit: (spellId: string) => void;
  onDelete: (spellId: string) => void;
  onToggleSelect: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  isReadOnly?: boolean;
}

export function ContentTable({
  spells,
  selectedIds,
  onEdit,
  onDelete,
  onToggleSelect,
  onSelectAll,
  isReadOnly = false,
}: ContentTableProps) {
  const [selectAllChecked, setSelectAllChecked] = useState(false);

  const handleSelectAll = () => {
    if (selectAllChecked) {
      onSelectAll([]);
    } else {
      onSelectAll(spells.map((spell) => spell.id));
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
            <th className="text-left p-2 text-text-secondary text-sm font-medium">Level</th>
            <th className="text-left p-2 text-text-secondary text-sm font-medium">School</th>
            <th className="text-left p-2 text-text-secondary text-sm font-medium">Classes</th>
            <th className="text-left p-2 text-text-secondary text-sm font-medium">Source</th>
            <th className="text-left p-2 text-text-secondary text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {spells.map((spell) => (
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
              <td className="p-2 text-text-primary text-xs">{spell.classes?.join(', ') || '-'}</td>
              <td className="p-2 text-text-primary text-xs">{spell.source}</td>
              <td className="p-2">
                {!isReadOnly && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(spell.id)}
                      className="p-1 hover:bg-muted rounded-md transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4 text-text-secondary hover:text-text-primary" />
                    </button>
                    <button
                      onClick={() => onDelete(spell.id)}
                      className="p-1 hover:bg-muted rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-destructive hover:text-destructive/80" />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
