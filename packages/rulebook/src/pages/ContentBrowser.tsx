import { useEffect, useState } from 'react';
import { Search, LayoutGrid, List, Skull, Sparkles } from 'lucide-react';
import { FilterSidebar } from '../components/browser/FilterSidebar';
import { ActiveFilterChips } from '../components/browser/ActiveFilterChips';
import { ContentCard } from '../components/content/ContentCard';
import { DetailDrawer } from '../components/editor/DetailDrawer';
import { useBrowserStore } from '../stores/browserStore';
import type { ContentBrowserTab } from '../stores/browserStore';
import type { Spell, Monster } from 'open20-core';

type ViewMode = 'grid' | 'list';

const TABS: { id: ContentBrowserTab; label: string; icon: React.ReactNode }[] = [
  { id: 'spells', label: 'Spells', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'monsters', label: 'Monsters', icon: <Skull className="w-4 h-4" /> },
];

export function ContentBrowser() {
  const {
    activeTab,
    results,
    loading,
    error,
    search,
    setActiveTab,
    setSpellFilter,
    setMonsterFilter,
  } = useBrowserStore();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Initial load
  useEffect(() => {
    search();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Search input handler
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (activeTab === 'spells') {
      setSpellFilter('name', value || undefined);
    } else {
      setMonsterFilter('name', value || undefined);
    }
  };

  // View detail
  const handleViewDetail = (spell: Spell) => {
    setSelectedSpell(spell);
    setShowDetailDrawer(true);
  };

  // Add to pack (for monsters this just logs)
  const handleAddToPack = (item: Spell | Monster) => {
    console.log('Add to pack:', item.name || (item as Spell).name);
  };

  // Check if result is a Spell (has 'level' property)
  const isSpell = (item: Spell | Monster): item is Spell => 'level' in item;

  return (
    <div className="flex h-full">
      {/* Filter Sidebar */}
      <FilterSidebar />

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Read-only indicator */}
        <div className="mb-4 p-2 bg-muted/50 rounded-md text-sm flex items-center gap-2">
          <span>🔒</span>
          <span>Read-only mode - Browse content from all enabled packs</span>
        </div>

        {/* Content Type Tabs */}
        <div className="flex gap-1 mb-4 border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={activeTab === 'spells' ? 'Search spells...' : 'Search monsters...'}
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <ActiveFilterChips />

        {/* Toolbar */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm text-muted-foreground">Showing {results.length} results</span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">Error: {error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            {results.length > 0 ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                    : 'space-y-4'
                }
              >
                {results.map((item) => {
                  if (isSpell(item)) {
                    return (
                      <ContentCard
                        key={item.id}
                        spell={item}
                        onViewDetail={handleViewDetail}
                        onAddToPack={handleAddToPack}
                      />
                    );
                  }
                  // Monster card (simplified)
                  const monster = item as Monster;
                  return (
                    <div
                      key={monster.id}
                      className="border border-border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-sm">{monster.name}</h3>
                        <span className="text-xs text-muted-foreground">{monster.source}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {monster.size} {monster.type} · CR {monster.challengeRating?.rating ?? '?'}
                      </p>
                      <p className="text-xs text-muted-foreground">{monster.alignment}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {activeTab === 'spells' ? '🔍 No spells found' : '👹 No monsters found'}
                </p>
                <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    useBrowserStore.getState().clearFilters();
                  }}
                  className="mt-4 px-4 py-2 border border-border rounded-md text-sm hover:bg-muted transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Drawer (spells only for now) */}
      {showDetailDrawer && selectedSpell && (
        <DetailDrawer
          spell={selectedSpell}
          onClose={() => setShowDetailDrawer(false)}
          onAddToPack={handleAddToPack}
        />
      )}
    </div>
  );
}
