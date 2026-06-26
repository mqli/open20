import { useEffect, useState } from 'react';
import {
  Search,
  LayoutGrid,
  List,
  Skull,
  Sparkles,
  User,
  ScrollText,
  Award,
  Swords,
  Shield,
  Backpack,
} from 'lucide-react';
import { cva } from 'class-variance-authority';
import { FilterSidebar } from '../components/browser/FilterSidebar';
import { ActiveFilterChips } from '../components/browser/ActiveFilterChips';
import { ContentCard } from '../components/content/ContentCard';
import { DetailDrawer } from '../components/editor/DetailDrawer';
import { useBrowserStore } from '../stores/browserStore';
import type { ContentBrowserTab } from '../stores/browserStore';
import type { Spell, Monster, Species, Background, Feat, Weapon, Armor, Gear } from 'open20-core';

type ViewMode = 'grid' | 'list';

const tabVariants = cva(
  'flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors',
  {
    variants: {
      isActive: {
        true: 'border-primary text-primary',
        false: 'border-transparent text-muted-foreground hover:text-foreground',
      },
    },
    defaultVariants: {
      isActive: false,
    },
  },
);

const viewModeButtonVariants = cva('p-2 rounded-md transition-colors', {
  variants: {
    isActive: {
      true: 'bg-primary text-primary-foreground',
      false: 'hover:bg-muted',
    },
  },
  defaultVariants: {
    isActive: false,
  },
});

const resultsLayoutVariants = cva('', {
  variants: {
    mode: {
      grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
      list: 'space-y-4',
    },
  },
  defaultVariants: {
    mode: 'grid',
  },
});

const TAB_EMPTY: Record<ContentBrowserTab, string> = {
  spells: '🔍 No spells found',
  monsters: '👹 No monsters found',
  species: '🧝 No species found',
  backgrounds: '📜 No backgrounds found',
  feats: '🏆 No feats found',
  weapons: '⚔️ No weapons found',
  armors: '🛡️ No armors found',
  gears: '🎒 No gear found',
};

const TAB_SEARCH_PLACEHOLDER: Record<ContentBrowserTab, string> = {
  spells: 'Search spells...',
  monsters: 'Search monsters...',
  species: 'Search species...',
  backgrounds: 'Search backgrounds...',
  feats: 'Search feats...',
  weapons: 'Search weapons...',
  armors: 'Search armors...',
  gears: 'Search gears...',
};

const TABS: { id: ContentBrowserTab; label: string; icon: React.ReactNode }[] = [
  { id: 'spells', label: 'Spells', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'monsters', label: 'Monsters', icon: <Skull className="w-4 h-4" /> },
  { id: 'species', label: 'Species', icon: <User className="w-4 h-4" /> },
  { id: 'backgrounds', label: 'Backgrounds', icon: <ScrollText className="w-4 h-4" /> },
  { id: 'feats', label: 'Feats', icon: <Award className="w-4 h-4" /> },
  { id: 'weapons', label: 'Weapons', icon: <Swords className="w-4 h-4" /> },
  { id: 'armors', label: 'Armors', icon: <Shield className="w-4 h-4" /> },
  { id: 'gears', label: 'Gears', icon: <Backpack className="w-4 h-4" /> },
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
    setSpeciesFilter,
    setBackgroundFilter,
    setFeatFilter,
    setWeaponFilter,
    setArmorFilter,
    setGearFilter,
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
    const filterValue = value || undefined;
    switch (activeTab) {
      case 'spells':
        setSpellFilter('name', filterValue);
        break;
      case 'monsters':
        setMonsterFilter('name', filterValue);
        break;
      case 'species':
        setSpeciesFilter('name', filterValue);
        break;
      case 'backgrounds':
        setBackgroundFilter('name', filterValue);
        break;
      case 'feats':
        setFeatFilter('name', filterValue);
        break;
      case 'weapons':
        setWeaponFilter('name', filterValue);
        break;
      case 'armors':
        setArmorFilter('name', filterValue);
        break;
      case 'gears':
        setGearFilter('name', filterValue);
        break;
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
  const isSpell = (item: unknown): item is Spell =>
    typeof item === 'object' && item !== null && 'level' in item;
  const isMonster = (item: unknown): item is Monster =>
    typeof item === 'object' &&
    item !== null &&
    'size' in item &&
    'type' in item &&
    !('skillProficiencies' in item);
  const isSpecies = (item: unknown): item is Species =>
    typeof item === 'object' &&
    item !== null &&
    'size' in item &&
    'speed' in item &&
    'baseTraits' in item;
  const isBackground = (item: unknown): item is Background =>
    typeof item === 'object' &&
    item !== null &&
    'skillProficiencies' in item &&
    'originFeatId' in item;
  const isFeat = (item: unknown): item is Feat =>
    typeof item === 'object' && item !== null && 'category' in item && 'grants' in item;
  const isWeapon = (item: unknown): item is Weapon =>
    (typeof item === 'object' &&
      item !== null &&
      'damage' in item &&
      'properties' in item &&
      'category' in item &&
      (item as Record<string, unknown>).category === 'Simple') ||
    (item as Record<string, unknown>).category === 'Martial';
  const isArmor = (item: unknown): item is Armor =>
    typeof item === 'object' &&
    item !== null &&
    'ac' in item &&
    'dexBonus' in item &&
    'category' in item &&
    (['Light', 'Medium', 'Heavy', 'Shield'] as string[]).includes(
      (item as Record<string, unknown>).category as string,
    );
  const isGear = (item: unknown): item is Gear =>
    typeof item === 'object' &&
    item !== null &&
    'equipped' in item &&
    'type' in item &&
    (['gears', 'consumable'] as string[]).includes(
      (item as Record<string, unknown>).type as string,
    );

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
              className={tabVariants({ isActive: activeTab === tab.id })}
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
              placeholder={TAB_SEARCH_PLACEHOLDER[activeTab]}
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
              className={viewModeButtonVariants({ isActive: viewMode === 'list' })}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={viewModeButtonVariants({ isActive: viewMode === 'grid' })}
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
              <div className={resultsLayoutVariants({ mode: viewMode })}>
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
                  if (isMonster(item)) {
                    return (
                      <div
                        key={item.id}
                        className="border border-border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-sm">{item.name}</h3>
                          <span className="text-xs text-muted-foreground">{item.source}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {item.size} {item.type} · CR {item.challengeRating?.rating ?? '?'}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.alignment}</p>
                      </div>
                    );
                  }
                  if (isSpecies(item)) {
                    return (
                      <div
                        key={item.id}
                        className="border border-border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-sm">{item.id}</h3>
                          <span className="text-xs text-muted-foreground">{item.source}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {item.size} · Speed {item.speed}ft · {item.languages?.length || 0}{' '}
                          languages
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    );
                  }
                  if (isBackground(item)) {
                    return (
                      <div
                        key={item.id}
                        className="border border-border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-sm">{item.name || item.id}</h3>
                          <span className="text-xs text-muted-foreground">{item.source}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Skills: {item.skillProficiencies?.join(', ') || 'None'} · Gold:{' '}
                          {item.startingGold}gp
                        </p>
                      </div>
                    );
                  }
                  if (isFeat(item)) {
                    return (
                      <div
                        key={item.id}
                        className="border border-border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-sm">{item.name || item.id}</h3>
                          <span className="text-xs text-muted-foreground">{item.source}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Category: {item.category}
                          {item.prerequisites ? ' · Has prerequisite' : ''}
                          {item.repeatable ? ' · Repeatable' : ''}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    );
                  }
                  if (isWeapon(item)) {
                    return (
                      <div
                        key={item.id}
                        className="border border-border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-sm">{item.name}</h3>
                          <span className="text-xs text-muted-foreground">{item.source}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {item.category} · {item.damage.entries[0]?.dice ?? '?'}{' '}
                          {item.damage.entries[0]?.type ?? ''}
                          {item.properties.length > 0 && ` · ${item.properties.join(', ')}`}
                        </p>
                      </div>
                    );
                  }
                  if (isArmor(item)) {
                    return (
                      <div
                        key={item.id}
                        className="border border-border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-sm">{item.name}</h3>
                          <span className="text-xs text-muted-foreground">{item.source}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {item.category} · AC {item.ac}
                          {item.strengthRequirement ? ` · Str ${item.strengthRequirement}` : ''}
                          {item.stealthDisadvantage ? ' · Stealth Disadv.' : ''}
                        </p>
                      </div>
                    );
                  }
                  if (isGear(item)) {
                    return (
                      <div
                        key={item.id}
                        className="border border-border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-sm">{item.name}</h3>
                          <span className="text-xs text-muted-foreground">{item.source}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {item.type === 'consumable' ? 'Consumable' : 'Gear'}
                          {item.cost ? ` · ${item.cost.quantity} ${item.cost.unit}` : ''}
                          {item.weight ? ` · ${item.weight} lbs` : ''}
                          {item.quantity ? ` · x${item.quantity}` : ''}
                        </p>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">{TAB_EMPTY[activeTab]}</p>
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
