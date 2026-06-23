import { Button, Input } from '@open20/ui';
import { Search, Filter } from 'lucide-react';
import { ContentTable } from '../content/ContentTable';
import { AddContentButton } from '../common/AddContentButton';
import { type ContentSectionData } from './pack-detail-types';

interface AllTabContentProps {
  packId: string | undefined;
  packName: string;
  contentCount: number;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isBuiltIn: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  /** Pre-filtered sections — each must provide its meta + items */
  sections: ContentSectionData[];
}

export function AllTabContent({
  packId,
  packName,
  contentCount,
  searchQuery,
  setSearchQuery,
  isBuiltIn,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onEdit,
  onDelete,
  sections,
}: AllTabContentProps) {
  const nonEmptySections = sections.filter((s) => s.items.length > 0);

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" />
          <Input
            placeholder="Search all content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
        {!isBuiltIn && <AddContentButton packId={packId} />}
      </div>

      {nonEmptySections.map((section) => {
        const Icon = section.meta.icon;
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const tableProps: any = {
          selectedIds,
          onToggleSelect,
          onSelectAll,
          isReadOnly: isBuiltIn,
          sourceLabel: packName,
        };

        // Attach edit/delete only for spells
        if (section.meta.tabKey === 'spells') {
          tableProps.onEdit = onEdit;
          tableProps.onDelete = onDelete;
        }

        // Attach the data array to the correct prop key
        tableProps[section.meta.tabKey] = section.items;
        /* eslint-enable @typescript-eslint/no-explicit-any */

        return (
          <div key={section.meta.tabKey} className="mb-6">
            <h3 className="text-sm font-semibold text-text-secondary mb-2 flex items-center gap-2">
              <Icon className="w-4 h-4" /> {section.meta.label} ({section.items.length})
            </h3>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <ContentTable {...(tableProps as any)} />
          </div>
        );
      })}

      {contentCount === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-medium mb-2">No content yet</p>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Add spells, monsters, species, and more to this content pack.
          </p>
        </div>
      )}
    </div>
  );
}
