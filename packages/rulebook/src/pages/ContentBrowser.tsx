import { useEffect, useState } from 'react';
import { Search, LayoutGrid, List } from 'lucide-react';
import { FilterSidebar } from '../components/browser/FilterSidebar';
import { ActiveFilterChips } from '../components/browser/ActiveFilterChips';
import { ContentCard } from '../components/content/ContentCard';
import { DetailDrawer } from '../components/editor/DetailDrawer';
import { useBrowserStore } from '../stores/browserStore';
import type { Spell } from 'open20-core';

type ViewMode = 'grid' | 'list';

export function ContentBrowser() {
  const { results, loading, error, searchSpells, setFilter } = useBrowserStore();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 初始加载
  useEffect(() => {
    searchSpells();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 搜索输入处理
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setFilter('name', value || undefined);
  };

  // 查看详情
  const handleViewDetail = (spell: Spell) => {
    setSelectedSpell(spell);
    setShowDetailDrawer(true);
  };

  // 添加到包
  const handleAddToPack = (spell: Spell) => {
    // TODO: 实现添加到包的逻辑
    console.log('Add to pack:', spell.name);
  };

  return (
    <div className="flex h-full">
      {/* 筛选侧边栏 */}
      <FilterSidebar />

      {/* 主内容区 */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* 只读模式指示 */}
        <div className="mb-4 p-2 bg-muted/50 rounded-md text-sm flex items-center gap-2">
          <span>🔒</span>
          <span>Read-only mode - Browse content from all enabled packs</span>
        </div>

        {/* 搜索栏 */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search spells..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <ActiveFilterChips />

        {/* 工具栏 */}
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

        {/* 加载状态 */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">Error: {error}</p>
          </div>
        )}

        {/* 结果列表 */}
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
                {results.map((spell) => (
                  <ContentCard
                    key={spell.id}
                    spell={spell}
                    onViewDetail={handleViewDetail}
                    onAddToPack={handleAddToPack}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">🔍 No spells found</p>
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

      {/* 详情抽屉 */}
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
