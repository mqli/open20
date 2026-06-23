import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { TABLE_CONFIGS } from './content-table-config';
import type { ContentTypeKey } from '../pack/pack-detail-types';

export interface ContentTableProps {
  mode: ContentTypeKey;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[];
  selectedIds: string[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  isReadOnly?: boolean;
  sourceLabel?: string;
}

export function ContentTable({
  mode,
  items,
  selectedIds,
  onEdit,
  onDelete,
  onToggleSelect,
  onSelectAll,
  isReadOnly = false,
  sourceLabel,
}: ContentTableProps) {
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const config = TABLE_CONFIGS[mode];
  const showActions = (onEdit || onDelete) && !isReadOnly;

  const handleSelectAll = () => {
    if (selectAllChecked) {
      onSelectAll([]);
    } else {
      onSelectAll(items.map((item) => item.id));
    }
    setSelectAllChecked(!selectAllChecked);
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
            {config.columns.map((col) => (
              <th
                key={col.header}
                className="text-left p-2 text-text-secondary text-sm font-medium"
              >
                {col.header}
              </th>
            ))}
            <th className="text-left p-2 text-text-secondary text-sm font-medium">Source</th>
            {showActions && (
              <th className="text-left p-2 text-text-secondary text-sm font-medium">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-border hover:bg-muted/50 transition-colors"
            >
              <td className="p-2">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => onToggleSelect(item.id)}
                  className="cursor-pointer"
                />
              </td>
              <td className="p-2">
                <config.icon className="w-4 h-4 text-text-secondary" />
              </td>
              <td className="p-2 text-text-primary font-medium">{config.getName(item)}</td>
              {config.columns.map((col) => (
                <td key={col.header} className="p-2 text-text-primary">
                  {col.render(item)}
                </td>
              ))}
              <td className="p-2 text-text-primary text-xs">
                {config.getSource(item, sourceLabel)}
              </td>
              {showActions && (
                <td className="p-2">
                  <div className="flex gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(item.id)}
                        className="p-1 hover:bg-muted rounded-md transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4 text-text-secondary hover:text-text-primary" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(item.id)}
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
