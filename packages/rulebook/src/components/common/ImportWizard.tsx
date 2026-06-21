import { useState, useEffect } from 'react';
import { Button } from '@open20/ui';
import manager from '../../stores/contentManager';
import { parsePackJson, importPack, checkImportConflicts } from '@open20/content/io';
import type { ContentPack, ContentPackMeta } from 'open20-core';
import type { ConflictEntry, ConflictResolution } from '@open20/content/io';

interface ImportWizardProps {
  onClose: () => void;
}

type WizardStep = 1 | 2 | 3;

export function ImportWizard({ onClose }: ImportWizardProps) {
  const [step, setStep] = useState<WizardStep>(1);
  const [jsonContent, setJsonContent] = useState<string>('');
  const [validatedPack, setValidatedPack] = useState<ContentPack | null>(null);
  const [importSummary, setImportSummary] = useState<{
    packName: string;
    version: string;
    contentCount: number;
    valid: boolean;
    errors: string[];
  } | null>(null);
  const [conflicts, setConflicts] = useState<ConflictEntry[]>([]);
  const [resolutions, setResolutions] = useState<Map<string, ConflictResolution>>(new Map());
  const [importAs, setImportAs] = useState<'new' | 'merge'>('new');
  const [targetPackId, setTargetPackId] = useState<string>('');
  const [availablePacks, setAvailablePacks] = useState<ContentPackMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPacks, setLoadingPacks] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load available packs for merge target dropdown
  useEffect(() => {
    const loadPacks = async () => {
      try {
        const packs = await manager.listPacks();
        setAvailablePacks(packs);
      } catch {
        // Silently fail — merge will just not have a populated list
      } finally {
        setLoadingPacks(false);
      }
    };
    loadPacks();
  }, []);

  // Handle file upload
  const handleFileUpload = (uploadedFile: File) => {
    if (uploadedFile.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.');
      return;
    }

    if (!uploadedFile.name.endsWith('.json')) {
      setError('Please upload a JSON file.');
      return;
    }

    setError(null);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        setJsonContent(content);

        // Parse and validate
        const parsed = parsePackJson(content);

        // Count content
        const contentTypes = [
          'spells',
          'monsters',
          'species',
          'backgrounds',
          'classes',
          'subclasses',
          'feats',
        ] as const;
        let contentCount = 0;
        for (const type of contentTypes) {
          if (Array.isArray(parsed[type])) {
            contentCount += parsed[type].length;
          }
        }

        setImportSummary({
          packName: parsed.meta.name || 'Unknown',
          version: parsed.meta.version || '1.0.0',
          contentCount,
          valid: true,
          errors: [],
        });

        setStep(2);
      } catch (err) {
        setError(`Invalid JSON: ${String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Failed to read file.');
      setLoading(false);
    };

    reader.readAsText(uploadedFile);
  };

  // Execute import
  const executeImport = async (pack: ContentPack) => {
    try {
      setLoading(true);

      if (importAs === 'new') {
        // Create new pack
        const newPack = manager.createPack({
          id: pack.meta.id || `imported-${Date.now()}`,
          name: pack.meta.name,
          version: pack.meta.version,
          source: pack.meta.source || pack.meta.name,
          author: pack.meta.author,
        });

        // Merge content into new pack
        const contentTypes = [
          'spells',
          'monsters',
          'species',
          'backgrounds',
          'classes',
          'subclasses',
          'feats',
        ] as const;
        for (const type of contentTypes) {
          if (pack[type]) {
            (newPack as unknown as Record<string, unknown>)[type] = pack[type];
          }
        }

        await manager.savePack(newPack);
      } else {
        // Merge into existing pack
        const targetPack = (await manager.loadPack(targetPackId)) as unknown as ContentPack;
        if (targetPack) {
          // Merge content (simplified - just merge spells for now)
          if (pack.spells) {
            if (!targetPack.spells) {
              (targetPack as unknown as Record<string, unknown>).spells = [];
            }
            const targetSpells = targetPack.spells as unknown[];
            const sourceSpells = pack.spells as unknown[];
            targetSpells.push(...sourceSpells);
          }
          await manager.savePack(targetPack as unknown as ContentPack);
        }
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(`Import failed: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle import confirmation
  const handleConfirmImport = async () => {
    if (!jsonContent) return;

    try {
      setLoading(true);
      setError(null);

      // Validate content
      const validated = importPack(jsonContent);
      setValidatedPack(validated);

      // Check for conflicts if merging
      if (importAs === 'merge' && targetPackId) {
        const targetPack = (await manager.loadPack(targetPackId)) as unknown as ContentPack;
        if (targetPack) {
          const detectedConflicts = checkImportConflicts(
            validated,
            targetPack as unknown as ContentPack,
          );
          setConflicts(detectedConflicts);

          if (detectedConflicts.length > 0) {
            setStep(3);
            return;
          }
        }
      }

      // No conflicts or new pack - proceed to import
      await executeImport(validated);
    } catch (err) {
      setError(`Import failed: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle conflict resolution
  const handleResolutionChange = (
    conflict: ConflictEntry,
    strategy: 'keep-both' | 'replace' | 'skip',
    newId?: string,
  ) => {
    const key = `spells:${conflict.incomingId}`;
    let resolution: ConflictResolution;

    switch (strategy) {
      case 'keep-both':
        resolution = { strategy: 'keep-both', newId: newId || `${conflict.incomingId}-copy` };
        break;
      case 'replace':
        resolution = { strategy: 'replace', targetId: conflict.existingId };
        break;
      case 'skip':
        resolution = { strategy: 'skip' };
        break;
    }

    setResolutions(new Map(resolutions.set(key, resolution)));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-bg-primary rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-text-primary">Import Content Pack</h2>
          <button
            onClick={onClose}
            className="text-text-primary hover:text-text-secondary"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full ${s <= step ? 'bg-primary' : 'bg-bg-secondary'}`}
            />
          ))}
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 border border-green-500 rounded-md text-green-700 dark:text-green-400 text-sm">
            ✓ Import successful!
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded-md text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Upload File */}
        {step === 1 && (
          <div>
            <p className="mb-4 text-text-primary">Step 1: Upload JSON File</p>
            <div
              className="border-2 border-dashed border-border rounded-lg p-12 text-center mb-4 cursor-pointer hover:border-primary transition-colors"
              onDrop={(e) => {
                e.preventDefault();
                const droppedFile = e.dataTransfer.files[0];
                if (droppedFile) handleFileUpload(droppedFile);
              }}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) handleFileUpload(file);
                };
                input.click();
              }}
            >
              <p className="text-text-primary mb-2">📁 Drop JSON file here or click to upload</p>
              <p className="text-sm text-text-tertiary">Supports .json files up to 10MB</p>
            </div>
            {loading && <p className="text-center text-text-tertiary">Reading file...</p>}
          </div>
        )}

        {/* Step 2: Confirm Import */}
        {step === 2 && importSummary && (
          <div>
            <p className="mb-4 text-text-primary">Step 2: Confirm Import</p>
            <div className="mb-4 p-4 bg-bg-secondary rounded-lg">
              <p className="font-medium text-text-primary">{importSummary.packName}</p>
              <p className="text-sm text-text-secondary">
                v{importSummary.version} · {importSummary.contentCount} content items
              </p>
              {importSummary.valid ? (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  ✅ All content valid
                </p>
              ) : (
                <p className="text-sm text-destructive mt-2">⚠️ Validation errors</p>
              )}
              {conflicts.length > 0 && (
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                  ⚠️ {conflicts.length} conflicts detected
                </p>
              )}
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium mb-2 text-text-primary">Import as</p>
              <label className="flex items-center gap-2 mb-2 text-text-primary">
                <input
                  type="radio"
                  name="importAs"
                  checked={importAs === 'new'}
                  onChange={() => setImportAs('new')}
                />
                New Pack (create &quot;{importSummary.packName}&quot;)
              </label>
              <label className="flex items-center gap-2 text-text-primary">
                <input
                  type="radio"
                  name="importAs"
                  checked={importAs === 'merge'}
                  onChange={() => setImportAs('merge')}
                />
                Merge into existing pack
              </label>

              {importAs === 'merge' && (
                <div className="mt-2">
                  <select
                    value={targetPackId}
                    onChange={(e) => setTargetPackId(e.target.value)}
                    className="w-full p-2 border border-border rounded-md bg-bg-primary text-text-primary"
                  >
                    <option value="">Select a pack...</option>
                    {loadingPacks && <option disabled>Loading packs...</option>}
                    {!loadingPacks &&
                      availablePacks.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (v{p.version})
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                ← Back
              </Button>
              <Button
                onClick={handleConfirmImport}
                disabled={loading || (importAs === 'merge' && !targetPackId)}
              >
                {loading ? 'Importing...' : 'Import →'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Resolve Conflicts */}
        {step === 3 && conflicts.length > 0 && (
          <div>
            <p className="mb-4 text-text-primary">Step 3: Resolve Conflicts</p>
            <p className="text-sm text-text-secondary mb-4">
              {conflicts.length} conflict(s) detected. Choose how to resolve each one.
            </p>

            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {conflicts.map((conflict, index) => (
                <div key={index} className="p-3 bg-bg-secondary rounded-lg">
                  <p className="text-sm font-medium text-text-primary">
                    {conflict.existingName} (ID: {conflict.existingId})
                  </p>
                  <p className="text-xs text-text-tertiary mb-2">Conflict type: {conflict.type}</p>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm text-text-primary">
                      <input
                        type="radio"
                        name={`conflict-${index}`}
                        onChange={() =>
                          handleResolutionChange(
                            conflict,
                            'keep-both',
                            `${conflict.incomingId}-copy`,
                          )
                        }
                      />
                      Keep both (rename incoming)
                    </label>
                    <label className="flex items-center gap-2 text-sm text-text-primary">
                      <input
                        type="radio"
                        name={`conflict-${index}`}
                        onChange={() => handleResolutionChange(conflict, 'replace')}
                      />
                      Replace existing
                    </label>
                    <label className="flex items-center gap-2 text-sm text-text-primary">
                      <input
                        type="radio"
                        name={`conflict-${index}`}
                        onChange={() => handleResolutionChange(conflict, 'skip')}
                      />
                      Skip (keep existing)
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                ← Back
              </Button>
              <Button
                onClick={() => executeImport(validatedPack!)}
                disabled={loading || resolutions.size < conflicts.length}
              >
                {loading ? 'Importing...' : 'Complete Import'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
