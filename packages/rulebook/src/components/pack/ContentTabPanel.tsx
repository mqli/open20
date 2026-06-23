import { useNavigate } from 'react-router-dom';
import { Button, Input } from '@open20/ui';
import { Search, Filter } from 'lucide-react';
import { ContentTable } from '../content/ContentTable';
import type { ContentTypeMeta } from './pack-detail-types';

interface ContentTabPanelProps {
  packId: string | undefined;
  contentType: ContentTypeMeta;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isBuiltIn: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  sourceLabel: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ContentTabPanel({
  packId,
  contentType,
  items,
  searchQuery,
  setSearchQuery,
  isBuiltIn,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  sourceLabel,
  onEdit,
  onDelete,
}: ContentTabPanelProps) {
  const navigate = useNavigate();
  const isEmpty = items.length === 0;

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" />
          <Input
            placeholder={contentType.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
        {!isBuiltIn && (
          <Button
            onClick={() => navigate(`/rulebook/editor/${packId}/${contentType.routeSegment}`)}
          >
            {contentType.addButtonLabel}
          </Button>
        )}
      </div>

      {!isEmpty ? (
        <ContentTable
          mode={contentType.tabKey}
          items={items}
          selectedIds={selectedIds}
          onToggleSelect={onToggleSelect}
          onSelectAll={onSelectAll}
          isReadOnly={isBuiltIn}
          sourceLabel={sourceLabel}
          onEdit={contentType.tabKey === 'spells' ? onEdit : undefined}
          onDelete={contentType.tabKey === 'spells' ? onDelete : undefined}
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-4xl mb-4">{contentType.emptyEmoji}</div>
          <p className="text-lg font-medium mb-2">{contentType.emptyTitle}</p>
          <p className="text-sm text-muted-foreground max-w-sm">{contentType.emptyDescription}</p>
        </div>
      )}
    </div>
  );
}
