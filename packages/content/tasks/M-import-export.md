# Task M: Import/Export UI

**Phase**: 2 (Rulebook UI)  
**Depends On**: Task J (PackDetail Page) + Task L (ContentBrowser)  
**Estimated Effort**: Medium  
**Target Package**: `@open20/rulebook`

---

## Objective

Implement ImportWizard (Quick/Guided mode) and ExportDialog components.

---

## Prerequisites

- [ ] Task J complete (PackDetail page)
- [ ] Task L complete (ContentBrowser page)
- [ ] `@open20/content` Phase 1 complete (import/export functions)

---

## Steps

### 1. Create ExportDialog Component

Create `src/components/ExportDialog.tsx`:

```typescript
import { useState } from 'react';

interface ExportDialogProps {
  packId: string;
  packName: string;
  onClose: () => void;
}

export function ExportDialog({ packId, packName, onClose }: ExportDialogProps) {
  const [format, setFormat] = useState<'single' | 'multiple'>('single');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [minify, setMinify] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleExport = () => {
    // TODO: call exportPack()
    console.log('Export pack', packId, { format, includeMetadata, minify });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface-primary rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Export Content Pack</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Export: {packName}
        </p>

        {/* Content Summary */}
        <div className="mb-4 p-4 bg-surface-secondary rounded-lg">
          <p className="text-sm font-medium mb-2">✅ Content Summary</p>
          <p className="text-sm">🪄 12 Spells</p>
          <p className="text-sm text-muted-foreground mt-2">
            File Size: ~32 KB (JSON)
          </p>
        </div>

        {/* Format Options */}
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Format</p>
          <label className="flex items-center gap-2 mb-2">
            <input
              type="radio"
              name="format"
              checked={format === 'single'}
              onChange={() => setFormat('single')}
            />
            Single JSON (recommended)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="format"
              checked={format === 'multiple'}
              onChange={() => setFormat('multiple')}
            />
            Multiple files (spells.json + monsters.json...)
          </label>
        </div>

        {/* Export Options */}
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Options</p>
          <label className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={includeMetadata}
              onChange={(e) => setIncludeMetadata(e.target.checked)}
            />
            Include edit metadata
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={minify}
              onChange={(e) => setMinify(e.target.checked)}
            />
            Minify JSON
          </label>
        </div>

        {/* JSON Preview (collapsed) */}
        <div className="mb-4">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="text-sm text-primary flex items-center gap-1"
          >
            {showPreview ? '▼' : '▶'} Preview JSON
          </button>
          {showPreview && (
            <pre className="mt-2 p-2 bg-surface-secondary rounded-md text-xs overflow-x-auto">
              {'{\n  "meta": {...},\n  "spells": [...]\n}'}
            </pre>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Download JSON
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 2. Create ImportWizard Component

Create `src/components/ImportWizard.tsx`:

```typescript
import { useState } from 'react';

interface ImportWizardProps {
  onClose: () => void;
}

export function ImportWizard({ onClose }: ImportWizardProps) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [importSummary, setImportSummary] = useState<any>(null);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [importAs, setImportAs] = useState<'new' | 'merge'>('new');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      // TODO: parse file and validate
      setImportSummary({
        packName: 'My Homebrew Spells',
        version: '1.0.0',
        spellCount: 12,
        valid: true,
        conflictCount: 0,
      });
      setStep(2);
    }
  };

  const handleImport = () => {
    // TODO: call importPack()
    console.log('Import pack', { file, importAs });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface-primary rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Import Content Pack</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Step Indicator */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full ${
                s <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <>
            <p className="mb-4">Step 1: Upload JSON File</p>
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center mb-4">
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-primary"
              >
                📁 Drop JSON file or click to upload
              </label>
              <p className="text-sm text-muted-foreground mt-2">
                Supports .json files up to 10MB
              </p>
            </div>
          </>
        )}

        {step === 2 && importSummary && (
          <>
            <p className="mb-4">Step 2: Confirm Import</p>
            <div className="mb-4 p-4 bg-surface-secondary rounded-lg">
              <p className="font-medium">{importSummary.packName}</p>
              <p className="text-sm text-muted-foreground">
                v{importSummary.version} · {importSummary.spellCount} spells
              </p>
              {importSummary.valid ? (
                <p className="text-sm text-green-600 mt-2">✅ All content valid</p>
              ) : (
                <p className="text-sm text-red-600 mt-2">⚠️ Validation errors</p>
              )}
              {importSummary.conflictCount > 0 && (
                <p className="text-sm text-amber-600 mt-1">
                  ⚠️ {importSummary.conflictCount} conflicts detected
                </p>
              )}
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Import as</p>
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="radio"
                  name="importAs"
                  checked={importAs === 'new'}
                  onChange={() => setImportAs('new')}
                />
                New Pack (create "{importSummary.packName}")
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="importAs"
                  checked={importAs === 'merge'}
                  onChange={() => setImportAs('merge')}
                />
                Merge into existing pack
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-border rounded-md"
              >
                ← Back
              </button>
              <button
                onClick={handleImport}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
              >
                Import Now →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

### 3. Integrate with PackList and ContentBrowser

Update `src/pages/PackList.tsx` to show ExportDialog:

```typescript
const [showExportDialog, setShowExportDialog] = useState(false);
const [exportPackId, setExportPackId] = useState<string | null>(null);

// In PackCard onExport handler:
onExport={() => {
  setExportPackId(pack.id);
  setShowExportDialog(true);
}}

// In render:
{showExportDialog && exportPackId && (
  <ExportDialog
    packId={exportPackId}
    packName={exportPackId}
    onClose={() => setShowExportDialog(false)}
  />
)}
```

Update `src/pages/PackList.tsx` to show ImportWizard:

```typescript
{showImportWizard && (
  <ImportWizard onClose={() => setShowImportWizard(false)} />
)}
```

---

## Acceptance Criteria

- [ ] `ExportDialog` renders with content summary + format options
- [ ] JSON preview collapsible (click to expand/collapse)
- [ ] `ImportWizard` Step 1: file upload works (drag & drop or click)
- [ ] `ImportWizard` Step 2: shows import summary + conflicts
- [ ] Import as: New Pack or Merge into existing
- [ ] TypeScript compiles without errors
- [ ] ESLint passes

---

## Next Task

Phase 2 complete! Proceed to **Phase 3** (Extended Content Types) after Phase 2 testing.
