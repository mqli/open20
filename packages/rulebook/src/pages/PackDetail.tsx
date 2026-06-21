import { useState, useEffect, useCallback } from 'react';
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
  Award,
  ScrollText,
} from 'lucide-react';
import { usePackDetailStore } from '../stores/packDetailStore';
import { ContentTable } from '../components/content/ContentTable';
import { InlineEditPanel } from '../components/editor/InlineEditPanel';
import { AddContentButton } from '../components/common/AddContentButton';
import { DeleteConfirmDialog } from '../components/common/DeleteConfirmDialog';
import type { ConfirmMode } from '../components/common/DeleteConfirmDialog';
import manager from '../stores/contentManager';
import { exportPack } from '@open20/content/io';
import { ContentValidator } from '@open20/content/validator';
import { formatFileSize } from '../lib/utils';

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

  // DeleteConfirmDialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<ConfirmMode>('delete-content');
  const [confirmItems, setConfirmItems] = useState<string[]>([]);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // External validation state
  const [validationResult, setValidationResult] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPack(id);
    }
  }, [id, loadPack]);

  const handleEdit = (spellId: string) => {
    navigate(`/rulebook/editor/${id}/spell/${spellId}`);
  };

  const handleDelete = useCallback(
    (spellId: string) => {
      if (!pack) return;
      const spell = pack.spells?.find((s: Spell) => s.id === spellId);
      setConfirmMode('delete-content');
      setConfirmItems(spell ? [spell.name] : [spellId]);
      setPendingDeleteId(spellId);
      setConfirmOpen(true);
    },
    [pack],
  );

  const confirmDeleteContent = useCallback(async () => {
    if (!id || !pack || !pendingDeleteId) return;
    setConfirmLoading(true);
    try {
      const { ContentEditor } = await import('@open20/content/editor');
      const editor = new ContentEditor(pack as any);
      editor.removeSpell(pendingDeleteId);
      await manager.savePack(pack);
      await loadPack(id);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setConfirmLoading(false);
      setConfirmOpen(false);
      setPendingDeleteId(null);
    }
  }, [id, pack, pendingDeleteId, loadPack]);

  const handleSave = useCallback(
    async (spell: Spell, _description: string, _level: number) => {
      if (!id || !pack) return;
      try {
        const { ContentEditor } = await import('@open20/content/editor');
        const editor = new ContentEditor(pack as any);
        editor.updateSpell(spell.id, spell);
        await manager.savePack(pack);
        await loadPack(id);
        setInlineEditSpell(null);
      } catch (err) {
        console.error('Save failed:', err);
      }
    },
    [id, pack, loadPack, setInlineEditSpell],
  );

  const handleExportAll = useCallback(async () => {
    if (!pack) return;
    try {
      const json = exportPack(pack as any);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pack.meta.name.replace(/\s+/g, '-').toLowerCase()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  }, [pack]);

  const handleValidateAll = useCallback(async () => {
    if (!pack) return;
    try {
      const validator = new ContentValidator();
      const report = validator.validatePack(pack as any);
      let totalErrors = 0;
      let totalWarnings = 0;
      for (const result of Object.values(report.results)) {
        for (const error of result.errors) {
          if (error.severity === 'error') totalErrors++;
          else totalWarnings++;
        }
      }
      setValidationResult(
        totalErrors === 0 && totalWarnings === 0
          ? 'Validation complete: no issues found'
          : `Validation complete: ${totalErrors} error(s), ${totalWarnings} warning(s)`,
      );
    } catch (err) {
      setValidationResult(`Validation failed: ${String(err)}`);
    }
  }, [pack]);

  const getPackJSONSize = useCallback(() => {
    if (!pack) return 0;
    try {
      return new Blob([JSON.stringify(pack)]).size;
    } catch {
      return 0;
    }
  }, [pack]);

  const getFilteredSpells = () => {
    if (!pack?.spells) return [];
    if (!searchQuery) return pack.spells;

    const query = searchQuery.toLowerCase();
    return pack.spells.filter((spell: Spell) => spell.name.toLowerCase().includes(query));
  };

  const getContentCount = () => {
    if (!pack) return 0;
    return (
      (pack.spells?.length || 0) +
      (pack.monsters?.length || 0) +
      (pack.species?.length || 0) +
      (pack.backgrounds?.length || 0) +
      (pack.feats?.length || 0)
    );
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
  const backgroundsCount = pack.backgrounds?.length || 0;
  const featsCount = pack.feats?.length || 0;

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
          <Button variant="outline" onClick={handleExportAll}>
            <FileDown className="w-4 h-4 mr-2" />
            Export All
          </Button>
          <Button variant="outline" onClick={handleValidateAll}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Validate All
          </Button>
        </div>
        <span className="text-sm text-muted-foreground">
          {contentCount} items · {formatFileSize(getPackJSONSize())}
        </span>
      </div>
      {validationResult && (
        <div className="mb-4 p-3 bg-bg-secondary border border-border rounded-md text-sm text-text-primary">
          {validationResult}
          <button
            className="ml-2 text-xs text-muted-foreground hover:text-text-primary"
            onClick={() => setValidationResult(null)}
          >
            Dismiss
          </button>
        </div>
      )}

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
          <Tabs.Trigger value="backgrounds">
            <ScrollText className="w-4 h-4 mr-2" />
            Backgrounds ({backgroundsCount})
          </Tabs.Trigger>
          <Tabs.Trigger value="feats">
            <Award className="w-4 h-4 mr-2" />
            Feats ({featsCount})
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
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-4xl mb-4">👹</div>
              <p className="text-lg font-medium mb-2">No monsters yet</p>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Add creatures, NPCs, and monsters to this content pack.
              </p>
              {!isBuiltIn && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate(`/rulebook/editor/${id}/monster`)}
                >
                  + Add Monster
                </Button>
              )}
            </div>
          )}
        </Tabs.Content>

        <Tabs.Content value="species">
          {speciesCount > 0 ? (
            <ContentTable
              species={pack.species}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelectedId}
              onSelectAll={(ids) => selectAll(ids)}
              isReadOnly={isBuiltIn}
              sourceLabel={pack.meta.name}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-4xl mb-4">🧝</div>
              <p className="text-lg font-medium mb-2">No species yet</p>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Add playable species and races to this content pack.
              </p>
              {!isBuiltIn && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate(`/rulebook/editor/${id}/species`)}
                >
                  + Add Species
                </Button>
              )}
            </div>
          )}
        </Tabs.Content>

        <Tabs.Content value="backgrounds">
          {backgroundsCount > 0 ? (
            <ContentTable
              backgrounds={pack.backgrounds}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelectedId}
              onSelectAll={(ids) => selectAll(ids)}
              isReadOnly={isBuiltIn}
              sourceLabel={pack.meta.name}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-4xl mb-4">📜</div>
              <p className="text-lg font-medium mb-2">No backgrounds yet</p>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Add character backgrounds to this content pack.
              </p>
              {!isBuiltIn && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate(`/rulebook/editor/${id}/background`)}
                >
                  + Add Background
                </Button>
              )}
            </div>
          )}
        </Tabs.Content>

        <Tabs.Content value="feats">
          {featsCount > 0 ? (
            <ContentTable
              feats={pack.feats}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelectedId}
              onSelectAll={(ids) => selectAll(ids)}
              isReadOnly={isBuiltIn}
              sourceLabel={pack.meta.name}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-4xl mb-4">🏆</div>
              <p className="text-lg font-medium mb-2">No feats yet</p>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Add feats and talents to this content pack.
              </p>
              {!isBuiltIn && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate(`/rulebook/editor/${id}/feat`)}
                >
                  + Add Feat
                </Button>
              )}
            </div>
          )}
        </Tabs.Content>
      </Tabs.Root>

      <InlineEditPanel
        open={inlineEditSpell !== null}
        spell={inlineEditSpell}
        onClose={() => setInlineEditSpell(null)}
        onSave={handleSave}
        onOpenFullEditor={(spellId) => {
          if (id) {
            navigate(`/rulebook/editor/${id}/spell/${spellId}`);
          }
        }}
      />

      <DeleteConfirmDialog
        open={confirmOpen}
        mode={confirmMode}
        packName={pack?.meta.name}
        content={{ items: confirmItems }}
        loading={confirmLoading}
        onConfirm={confirmDeleteContent}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingDeleteId(null);
        }}
      />
    </div>
  );
}
