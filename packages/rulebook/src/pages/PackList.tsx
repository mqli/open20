import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePackStore } from '../stores/packStore';
import { PackCard } from '../components/PackCard';
import { EmptyState } from '@open20/ui';
import { CreatePackWizard } from '../components/CreatePackWizard';
import { ImportWizard } from '../components/ImportWizard';
import { ExportDialog } from '../components/ExportDialog';
import { Package } from 'lucide-react';

export function PackList() {
  const navigate = useNavigate();
  const { packs, loading, error, fetchPacks, isBuiltInPack } = usePackStore();
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportPackId, setExportPackId] = useState<string | null>(null);

  useEffect(() => {
    fetchPacks();
  }, [fetchPacks]);

  if (loading) {
    return <div className="text-text-primary">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Content Packs</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateWizard(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            + New
          </button>
          <button
            onClick={() => setShowImportWizard(true)}
            className="px-4 py-2 border border-border rounded-md text-text-primary hover:bg-bg-secondary"
          >
            📥 Import
          </button>
          <button
            onClick={() => {
              // Export button in header - need to select a pack first
              // This is just a placeholder - actual export is done from PackCard
            }}
            className="px-4 py-2 border border-border rounded-md text-text-primary hover:bg-bg-secondary"
            disabled
          >
            📤 Export All
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded-md text-destructive">
          Error: {error}
        </div>
      )}

      {packs.length === 0 ? (
        <EmptyState
          icon={<Package className="w-12 h-12 text-text-tertiary/50" />}
          title="Welcome to Rulebook"
          description="Create your first content pack or import one"
          action={
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateWizard(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Create Your First Pack
              </button>
              <button
                onClick={() => setShowImportWizard(true)}
                className="px-4 py-2 border border-border rounded-md text-text-primary hover:bg-bg-secondary"
              >
                Import a Pack
              </button>
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packs.map((pack) => (
            <PackCard
              key={pack.id}
              pack={pack}
              spellCount={0} // TODO: fetch from ContentBrowser
              isBuiltIn={isBuiltInPack(pack.id)}
              onOpen={() => navigate(`/rulebook/packs/${pack.id}`)}
              onExport={() => {
                setExportPackId(pack.id);
                setShowExportDialog(true);
              }}
            />
          ))}
          <div className="border-2 border-dashed border-border rounded-lg p-4 flex items-center justify-center min-h-[200px]">
            <button
              onClick={() => setShowCreateWizard(true)}
              className="text-text-tertiary hover:text-text-secondary"
            >
              + New Pack
            </button>
          </div>
        </div>
      )}

      {showCreateWizard && <CreatePackWizard onClose={() => setShowCreateWizard(false)} />}
      {showImportWizard && <ImportWizard onClose={() => setShowImportWizard(false)} />}
      {showExportDialog && exportPackId && (
        <ExportDialog
          packId={exportPackId}
          packName={packs.find((p) => p.id === exportPackId)?.name || exportPackId}
          onClose={() => {
            setShowExportDialog(false);
            setExportPackId(null);
          }}
        />
      )}
    </div>
  );
}
