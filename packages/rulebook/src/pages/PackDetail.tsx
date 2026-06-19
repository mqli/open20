import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Spell } from 'open20-core';
import { Tabs, Button, Input } from '@open20/ui';
import {
  ArrowLeft,
  FileDown,
  CheckCircle2,
  Search,
  Filter,
  BookOpen,
  Skull,
  User,
  Database,
} from 'lucide-react';
import { usePackDetailStore } from '../stores/packDetailStore';
import { ContentTable } from '../components/content/ContentTable';
import { InlineEditPanel } from '../components/editor/InlineEditPanel';
import { AddContentButton } from '../components/common/AddContentButton';

export function PackDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    pack,
    loading,
    error,
    activeTab,
    selectedIds,
    inlineEditSpell,
    isBuiltIn,
    loadPack,
    setActiveTab,
    toggleSelectedId,
    selectAll,
    setInlineEditSpell,
  } = usePackDetailStore();

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (id) {
      loadPack(id);
    }
  }, [id, loadPack]);

  const handleEdit = (spellId: string) => {
    navigate(`/rulebook/editor/${id}/spell/${spellId}`);
  };

  const handleDelete = (spellId: string) => {
    if (window.confirm('Are you sure you want to delete this spell?')) {
      console.log('Delete spell', spellId);
      // TODO: Implement delete logic in Task K
    }
  };

  const handleSave = (spell: Spell, description: string, level: number) => {
    console.log('Save spell', spell.id, { description, level });
    // TODO: Implement save logic in Task K
    setInlineEditSpell(null);
  };

  const getFilteredSpells = () => {
    if (!pack?.spells) return [];
    if (!searchQuery) return pack.spells;

    const query = searchQuery.toLowerCase();
    return pack.spells.filter((spell: Spell) => spell.name.toLowerCase().includes(query));
  };

  const getContentCount = () => {
    if (!pack) return 0;
    return (pack.spells?.length || 0) + (pack.monsters?.length || 0) + (pack.species?.length || 0);
  };

  if (loading) {
    return <div className="text-text-primary">Loading...</div>;
  }

  if (error) {
    return (
      <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded-md text-destructive">
        Error: {error}
      </div>
    );
  }

  if (!pack) {
    return <div className="text-text-primary">Pack not found</div>;
  }

  const filteredSpells = getFilteredSpells();
  const contentCount = getContentCount();
  const spellsCount = pack.spells?.length || 0;
  const monstersCount = pack.monsters?.length || 0;
  const speciesCount = pack.species?.length || 0;

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/rulebook"
          className="text-sm text-muted-foreground mb-2 inline-block hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 inline-block mr-1" />
          Back to Packs
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-text-primary">{pack.meta.name}</h1>
          {isBuiltIn && (
            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
              <Database className="w-3 h-3" />
              Built-in
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          ID: {pack.meta.id} | v{pack.meta.version} | {pack.meta.source}
          {pack.meta.author && ` | Author: ${pack.meta.author}`}
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => console.log('Export all')}>
            <FileDown className="w-4 h-4 mr-2" />
            Export All
          </Button>
          <Button variant="outline" onClick={() => console.log('Validate all')}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Validate All
          </Button>
        </div>
        <span className="text-sm text-muted-foreground">
          {contentCount} items · ~{/* TODO: Calculate actual size */}32 KB
        </span>
      </div>

      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Trigger value="all">All ({contentCount})</Tabs.Trigger>
          <Tabs.Trigger value="spells">
            <BookOpen className="w-4 h-4 mr-2" />
            Spells ({spellsCount})
          </Tabs.Trigger>
          <Tabs.Trigger value="monsters">
            <Skull className="w-4 h-4 mr-2" />
            Monsters ({monstersCount})
          </Tabs.Trigger>
          <Tabs.Trigger value="species">
            <User className="w-4 h-4 mr-2" />
            Species ({speciesCount})
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="all">
          <div className="mb-4 flex gap-2">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            {!isBuiltIn && <AddContentButton packId={id} />}
          </div>
          <ContentTable
            spells={filteredSpells}
            selectedIds={selectedIds}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleSelect={toggleSelectedId}
            onSelectAll={(ids) => selectAll(ids)}
            isReadOnly={isBuiltIn}
          />
        </Tabs.Content>

        <Tabs.Content value="spells">
          <div className="mb-4 flex gap-2">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            {!isBuiltIn && <AddContentButton packId={id} />}
          </div>
          <ContentTable
            spells={filteredSpells}
            selectedIds={selectedIds}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleSelect={toggleSelectedId}
            onSelectAll={(ids) => selectAll(ids)}
            isReadOnly={isBuiltIn}
          />
        </Tabs.Content>

        <Tabs.Content value="monsters">
          {monstersCount > 0 ? (
            <ContentTable
              monsters={pack.monsters}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelectedId}
              onSelectAll={(ids) => selectAll(ids)}
              isReadOnly={isBuiltIn}
              sourceLabel={pack.meta.name}
            />
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No monsters in this pack yet.
            </div>
          )}
        </Tabs.Content>

        <Tabs.Content value="species">
          <div className="p-4 text-center text-muted-foreground">No species in this pack yet.</div>
        </Tabs.Content>
      </Tabs.Root>

      <InlineEditPanel
        open={inlineEditSpell !== null}
        spell={inlineEditSpell}
        onClose={() => setInlineEditSpell(null)}
        onSave={handleSave}
      />
    </div>
  );
}
