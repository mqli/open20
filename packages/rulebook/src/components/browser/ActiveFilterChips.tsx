import { X } from 'lucide-react';
import { useBrowserStore } from '../../stores/browserStore';

export function ActiveFilterChips() {
  const { filters, setFilter, clearFilters } = useBrowserStore();

  const chips: { key: string; label: string }[] = [];

  // 构建筛选标签列表
  if (filters.name) {
    chips.push({ key: 'name', label: `Name: ${filters.name}` });
  }
  if (filters.level !== undefined) {
    const levelLabel =
      filters.level === 0 ? 'Cantrip' : `${filters.level}${getOrdinalSuffix(filters.level)}`;
    chips.push({ key: 'level', label: `Level: ${levelLabel}` });
  }
  if (filters.levelRange) {
    chips.push({
      key: 'levelRange',
      label: `Level: ${filters.levelRange.min}+`,
    });
  }
  if (filters.school) {
    chips.push({ key: 'school', label: `School: ${filters.school}` });
  }
  if (filters.classes && filters.classes.length > 0) {
    chips.push({ key: 'classes', label: `Classes: ${filters.classes.join(', ')}` });
  }
  if (filters.source) {
    chips.push({ key: 'source', label: `Source: ${filters.source}` });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm text-muted-foreground">Active filters:</span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
        >
          {chip.label}
          <button
            onClick={() => {
              if (chip.key === 'levelRange') {
                setFilter('levelRange', undefined);
              } else {
                setFilter(chip.key as keyof typeof filters, undefined);
              }
            }}
            className="hover:bg-secondary/80 rounded p-0.5"
            aria-label={`Remove filter: ${chip.label}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <button onClick={clearFilters} className="text-xs text-primary hover:underline">
        Clear All
      </button>
    </div>
  );
}

function getOrdinalSuffix(num: number): string {
  if (num === 1) return 'st';
  if (num === 2) return 'nd';
  if (num === 3) return 'rd';
  return 'th';
}
