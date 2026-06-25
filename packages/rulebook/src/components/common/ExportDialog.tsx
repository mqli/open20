import { useState, useEffect, useCallback } from 'react';
import { Button } from '@open20/ui';
import { Switch } from '@open20/ui';
import manager from '../../stores/contentManager';
import { exportPack, exportContentType, EXPORTABLE_CONTENT_KEYS } from '@open20/content/io';
import type { ExportableContentKey } from '@open20/content/io';
import type { ContentPack } from 'open20-core';

interface ExportDialogProps {
  packId: string;
  packName: string;
  onClose: () => void;
}

type ExportSelection = 'full' | ExportableContentKey;

const CONTENT_TYPE_LABELS: Record<ExportableContentKey, string> = {
  spells: 'Spells',
  monsters: 'Monsters',
  species: 'Species',
  backgrounds: 'Backgrounds',
  classes: 'Classes',
  subclasses: 'Subclasses',
  feats: 'Feats',
  weapons: 'Weapons',
  armors: 'Armors',
  gears: 'Gears',
};

export function ExportDialog({ packId, packName, onClose }: ExportDialogProps) {
  const [pack, setPack] = useState<ContentPack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contentType, setContentType] = useState<ExportSelection>('full');
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

  // Get item count for a specific content type
  const getTypeCount = useCallback(
    (type: ExportableContentKey) => {
      if (!pack) return 0;
      const items = pack[type];
      return Array.isArray(items) ? items.length : 0;
    },
    [pack],
  );

  // Count total content items for summary
  const getContentSummary = useCallback(() => {
    if (!pack) return { total: 0, types: [] as string[] };

    let total = 0;
    const types: string[] = [];

    for (const type of EXPORTABLE_CONTENT_KEYS) {
      const count = getTypeCount(type);
      if (count > 0) {
        total += count;
        types.push(`${count} ${type}`);
      }
    }

    return { total, types };
  }, [pack, getTypeCount]);

  // Generate export JSON based on selected type
  const generateExportJson = useCallback(() => {
    if (!pack) return '';

    if (contentType === 'full') {
      const json = exportPack(pack);
      const parsed = JSON.parse(json);
      return JSON.stringify(parsed, null, minify ? 0 : 2);
    }

    return exportContentType(pack, contentType);
  }, [pack, contentType, minify]);

  // Get download filename
  const getDownloadFilename = useCallback(() => {
    const slug = packName.replace(/\s+/g, '-').toLowerCase();
    if (contentType === 'full') return `${slug}.json`;
    return `${slug}-${contentType}.json`;
  }, [packName, contentType]);

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
      a.download = getDownloadFilename();
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
  }, [pack, generateExportJson, getDownloadFilename, onClose]);

  const summary = getContentSummary();
  const exportJson = pack ? generateExportJson() : '';
  const fileSize = new Blob([exportJson]).size;
  const selectedCount = contentType === 'full' ? summary.total : getTypeCount(contentType);

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
            {/* Content Type Selection */}
            <div className="mb-4">
              <p className="text-sm font-medium mb-2 text-text-primary">Content Type</p>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as ExportSelection)}
                className="w-full p-2 border border-border rounded-md bg-bg-primary text-text-primary"
              >
                <option value="full">
                  Full Pack
                  {summary.total > 0 ? ` (${summary.total} items)` : ''}
                </option>
                {EXPORTABLE_CONTENT_KEYS.map((key) => {
                  const count = getTypeCount(key);
                  return (
                    <option key={key} value={key}>
                      {CONTENT_TYPE_LABELS[key]}
                      {count > 0 ? ` (${count})` : ' (empty)'}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Selection Summary */}
            <div className="mb-4 p-4 bg-bg-secondary rounded-lg">
              <p className="text-sm font-medium mb-2 text-text-primary">
                {contentType === 'full'
                  ? 'Content Summary'
                  : `Selected: ${CONTENT_TYPE_LABELS[contentType]}`}
              </p>
              {contentType === 'full' ? (
                summary.total === 0 ? (
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
                )
              ) : (
                <>
                  <p className="text-sm text-text-primary">
                    {selectedCount} {contentType}
                  </p>
                  <p className="text-xs text-text-tertiary mt-1">
                    File Size: ~
                    {fileSize < 1024 ? `${fileSize} B` : `${(fileSize / 1024).toFixed(1)} KB`} (pure
                    array)
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
          <Button
            onClick={handleExport}
            disabled={!pack || exporting || (contentType !== 'full' && selectedCount === 0)}
          >
            {exporting
              ? 'Exporting...'
              : contentType === 'full'
                ? 'Download JSON'
                : `Download ${CONTENT_TYPE_LABELS[contentType as ExportableContentKey] ?? ''}.json`}
          </Button>
        </div>
      </div>
    </div>
  );
}
