import { useState, useEffect, useCallback } from 'react';
import { Button } from '@open20/ui';
import { Switch } from '@open20/ui';
import manager from '../../stores/contentManager';
import { exportPack } from '@open20/content/io';
import type { ContentPack } from 'open20-core';

interface ExportDialogProps {
  packId: string;
  packName: string;
  onClose: () => void;
}

export function ExportDialog({ packId, packName, onClose }: ExportDialogProps) {
  const [pack, setPack] = useState<ContentPack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [minify, setMinify] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Load pack data on mount
  useEffect(() => {
    const loadPack = async () => {
      try {
        setLoading(true);
        setError(null);
        const loadedPack = await manager.loadPack(packId);
        if (loadedPack) {
          setPack(loadedPack as unknown as ContentPack);
        } else {
          setError('Pack not found');
        }
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    loadPack();
  }, [packId]);

  // Count total content items
  const getContentSummary = useCallback(() => {
    if (!pack) return { total: 0, types: [] as string[] };

    const contentTypes = [
      'spells',
      'monsters',
      'species',
      'backgrounds',
      'classes',
      'subclasses',
      'feats',
      'weapons',
      'armors',
      'gears',
    ] as const;

    let total = 0;
    const types: string[] = [];

    for (const type of contentTypes) {
      const items = pack[type];
      if (Array.isArray(items) && items.length > 0) {
        total += items.length;
        types.push(`${items.length} ${type}`);
      }
    }

    return { total, types };
  }, [pack]);

  // Generate export JSON
  const generateExportJson = useCallback(() => {
    if (!pack) return '';
    const json = exportPack(pack);
    const parsed = JSON.parse(json);
    return JSON.stringify(parsed, null, minify ? 0 : 2);
  }, [pack, minify]);

  // Handle export/download
  const handleExport = useCallback(async () => {
    if (!pack) return;

    try {
      setExporting(true);
      const json = generateExportJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${packName.replace(/\s+/g, '-').toLowerCase()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onClose();
    } catch (err) {
      setError(`Export failed: ${String(err)}`);
    } finally {
      setExporting(false);
    }
  }, [pack, packName, generateExportJson, onClose]);

  const summary = getContentSummary();
  const exportJson = pack ? generateExportJson() : '';
  const fileSize = new Blob([exportJson]).size;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-bg-primary rounded-lg p-6 w-[480px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-text-primary">Export Content Pack</h2>
          <button
            onClick={onClose}
            className="text-text-primary hover:text-text-secondary"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-text-secondary mb-4">
          Export: <span className="font-medium">{packName}</span>
        </p>

        {loading && <div className="text-center py-8 text-text-tertiary">Loading pack data...</div>}

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded-md text-destructive text-sm">
            {error}
          </div>
        )}

        {!loading && !error && pack && (
          <>
            {/* Content Summary */}
            <div className="mb-4 p-4 bg-bg-secondary rounded-lg">
              <p className="text-sm font-medium mb-2 text-text-primary">Content Summary</p>
              {summary.total === 0 ? (
                <p className="text-sm text-text-tertiary">No content in this pack</p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    {summary.types.map((type) => (
                      <span
                        key={type}
                        className="px-2 py-1 text-xs bg-bg-primary rounded border border-border"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-text-tertiary mt-2">
                    File Size: ~
                    {fileSize < 1024 ? `${fileSize} B` : `${(fileSize / 1024).toFixed(1)} KB`}{' '}
                    (JSON)
                  </p>
                </>
              )}
            </div>

            {/* Export Options */}
            <div className="mb-4">
              <p className="text-sm font-medium mb-2 text-text-primary">Options</p>
              <label className="flex items-center gap-2 mb-2">
                <Switch checked={minify} onCheckedChange={setMinify} />
                <span className="text-sm text-text-primary">Minify JSON</span>
              </label>
            </div>

            {/* JSON Preview (collapsed) */}
            <div className="mb-4">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-sm text-primary flex items-center gap-1 hover:underline"
              >
                {showPreview ? '▼' : '▶'} Preview JSON
              </button>
              {showPreview && (
                <pre className="mt-2 p-3 bg-bg-secondary rounded-md text-xs overflow-x-auto max-h-48 overflow-y-auto">
                  {exportJson.substring(0, 1000)}
                  {exportJson.length > 1000 && '\n... (truncated)'}
                </pre>
              )}
            </div>
          </>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={!pack || exporting || summary.total === 0}>
            {exporting ? 'Exporting...' : 'Download JSON'}
          </Button>
        </div>
      </div>
    </div>
  );
}
