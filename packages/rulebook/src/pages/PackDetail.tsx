import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Spell } from 'open20-core';
import { Tabs, Button } from '@open20/ui';
import { ArrowLeft, FileDown, CheckCircle2, Database } from 'lucide-react';
import { usePackDetailStore } from '../stores/packDetailStore';
import { InlineEditPanel } from '../components/editor/InlineEditPanel';
import { DeleteConfirmDialog } from '../components/common/DeleteConfirmDialog';
import type { ConfirmMode } from '../components/common/DeleteConfirmDialog';
import { ContentTabPanel } from '../components/pack/ContentTabPanel';
import { AllTabContent } from '../components/pack/AllTabContent';
import {
  CONTENT_TYPES,
  getContentCounts,
  buildSections,
} from '../components/pack/pack-detail-types';
import manager from '../stores/contentManager';
import { exportPack } from '@open20/content/io';
import { ContentValidator } from '@open20/content/validator';
import type { EditableContentPack } from '@open20/content/types';
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<ConfirmMode>('delete-content');
  const [confirmItems, setConfirmItems] = useState<string[]>([]);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<string | null>(null);

  // ---- Data loading ----
  useEffect(() => {
    if (id) loadPack(id);
  }, [id, loadPack]);

  // ---- Spell event handlers ----
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
      const editor = new ContentEditor(pack as EditableContentPack);
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
        const editor = new ContentEditor(pack as EditableContentPack);
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

  // ---- Pack-level actions ----
  const handleExportAll = useCallback(async () => {
    if (!pack) return;
    try {
      const json = exportPack(pack as EditableContentPack);
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
      const report = validator.validatePack(pack as EditableContentPack);
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

  // ---- Content filtering ----
  const getFilteredItems = <T extends { name?: string; id: string }>(
    items: T[] | undefined,
    query: string,
  ): T[] => {
    if (!items) return [];
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter((item) => {
      const name = ('name' in item && item.name) || item.id;
      return name.toLowerCase().includes(q);
    });
  };

  const filteredSpells = getFilteredItems(pack?.spells, searchQuery);
  const filteredMonsters = getFilteredItems(pack?.monsters, searchQuery);
  const filteredSpecies = getFilteredItems(pack?.species, searchQuery);
  const filteredBackgrounds = getFilteredItems(pack?.backgrounds, searchQuery);
  const filteredFeats = getFilteredItems(pack?.feats, searchQuery);
  const filteredWeapons = getFilteredItems(pack?.weapons, searchQuery);
  const filteredArmors = getFilteredItems(pack?.armors, searchQuery);
  const filteredGears = getFilteredItems(pack?.gears, searchQuery);

  // ---- Render states ----
  if (loading) return <div className="text-text-primary">Loading...</div>;

  if (error) {
    return (
      <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded-md text-destructive">
        Error: {error}
      </div>
    );
  }

  if (!pack) return <div className="text-text-primary">Pack not found</div>;

  const counts = getContentCounts(pack);
  const contentCount = counts.total;

  // Build filtered-items map for All tab
  const filteredMap = new Map();
  for (const ct of CONTENT_TYPES) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filtered = getFilteredItems(pack[ct.tabKey] as any, searchQuery);
    filteredMap.set(ct, filtered);
  }

  // Map tab key → filtered items for ContentTabPanel
  const filteredByType: Record<string, Record<string, unknown>[]> = {
    spells: filteredSpells as unknown as Record<string, unknown>[],
    monsters: filteredMonsters as unknown as Record<string, unknown>[],
    species: filteredSpecies as unknown as Record<string, unknown>[],
    backgrounds: filteredBackgrounds as unknown as Record<string, unknown>[],
    feats: filteredFeats as unknown as Record<string, unknown>[],
    weapons: filteredWeapons as unknown as Record<string, unknown>[],
    armors: filteredArmors as unknown as Record<string, unknown>[],
    gears: filteredGears as unknown as Record<string, unknown>[],
  };

  return (
    <div>
      {/* Header */}
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

      {/* Actions bar */}
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

      {/* Tabs */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Trigger value="all">All ({contentCount})</Tabs.Trigger>
          {CONTENT_TYPES.map((ct) => {
            const Icon = ct.icon;
            return (
              <Tabs.Trigger key={ct.tabKey} value={ct.tabKey}>
                <Icon className="w-4 h-4 mr-2" />
                {ct.label} ({counts[ct.tabKey]})
              </Tabs.Trigger>
            );
          })}
        </Tabs.List>

        <Tabs.Content value="all">
          <AllTabContent
            packId={id}
            packName={pack.meta.name}
            contentCount={contentCount}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isBuiltIn={isBuiltIn}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelectedId}
            onSelectAll={selectAll}
            onEdit={handleEdit}
            onDelete={handleDelete}
            sections={buildSections(filteredMap)}
          />
        </Tabs.Content>

        {CONTENT_TYPES.map((ct) => (
          <Tabs.Content key={ct.tabKey} value={ct.tabKey}>
            <ContentTabPanel
              packId={id}
              contentType={ct}
              items={filteredByType[ct.tabKey] ?? []}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isBuiltIn={isBuiltIn}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelectedId}
              onSelectAll={selectAll}
              sourceLabel={pack.meta.name}
              onEdit={ct.tabKey === 'spells' ? handleEdit : undefined}
              onDelete={ct.tabKey === 'spells' ? handleDelete : undefined}
            />
          </Tabs.Content>
        ))}
      </Tabs.Root>

      {/* Inline edit panel */}
      <InlineEditPanel
        open={inlineEditSpell !== null}
        spell={inlineEditSpell}
        onClose={() => setInlineEditSpell(null)}
        onSave={handleSave}
        onOpenFullEditor={(spellId) => {
          if (id) navigate(`/rulebook/editor/${id}/spell/${spellId}`);
        }}
      />

      {/* Delete confirmation */}
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
