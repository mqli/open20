# Task I: PackList Page

**Phase**: 2 (Rulebook UI)  
**Depends On**: Task H (Layout & Routing)  
**Estimated Effort**: Medium  
**Target Package**: `@open20/rulebook`

---

## Objective

Implement `PackList` page with content pack card grid, empty state, and toolbar actions (Create, Import, Export).

---

## Prerequisites

- [ ] Task H complete (RulebookLayout with sidebar + topbar + routing)
- [ ] `@open20/ui` components available (Card, Button, Dialog, etc.)

---

## Steps

### 1. Create PackCard Component

Create `src/components/PackCard.tsx`:

```typescript
import type { ContentPackMeta } from 'open20-core';

interface PackCardProps {
  pack: ContentPackMeta;
  spellCount: number;
  onOpen: () => void;
  onExport: () => void;
  onDisable: () => void;
  onDelete: () => void;
}

export function PackCard({ pack, spellCount, onOpen, onExport, onDisable, onDelete }: PackCardProps) {
  const isEnabled = pack.priority >= 0;

  return (
    <div className="border border-border rounded-lg p-4 hover:shadow-lg hover:scale-[1.02] transition-all">
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-3 h-3 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
        <h3 className="font-semibold">{pack.name}</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-1">
        v{pack.version} · {pack.source}
      </p>
      <p className="text-sm text-muted-foreground mb-3">
        🪄 {spellCount} spells
      </p>
      <div className="flex gap-2">
        <button onClick={onOpen} className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm">
          Open
        </button>
        <button onClick={onExport} className="px-3 py-1 border border-border rounded-md text-sm">
          Export
        </button>
        <button onClick={onDisable} className="px-3 py-1 border border-border rounded-md text-sm">
          {isEnabled ? 'Disable' : 'Enable'}
        </button>
        <button onClick={onDelete} className="px-3 py-1 border border-destructive text-destructive rounded-md text-sm">
          Delete
        </button>
      </div>
    </div>
  );
}
```

### 2. Create EmptyState Component

Create `src/components/EmptyState.tsx`:

```typescript
export function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📦</div>
      <h2 className="text-2xl font-bold mb-2">Welcome to Rulebook</h2>
      <p className="text-muted-foreground mb-6">
        Create your first content pack or import one
      </p>
      <div className="flex gap-4 justify-center">
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
          Create Your First Pack
        </button>
        <button className="px-4 py-2 border border-border rounded-md">
          Import a Pack
        </button>
      </div>
    </div>
  );
}
```

### 3. Implement PackList Page

Update `src/pages/PackList.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { usePackStore } from '../stores/packStore';
import { PackCard } from '../components/PackCard';
import { EmptyState } from '../components/EmptyState';

export function PackList() {
  const { packs, loading, fetchPacks } = usePackStore();
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [showImportWizard, setShowImportWizard] = useState(false);

  useEffect(() => {
    fetchPacks();
  }, [fetchPacks]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Content Packs</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateWizard(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            + New
          </button>
          <button
            onClick={() => setShowImportWizard(true)}
            className="px-4 py-2 border border-border rounded-md"
          >
            📥 Import
          </button>
          <button className="px-4 py-2 border border-border rounded-md">
            📤 Export
          </button>
        </div>
      </div>

      {packs.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packs.map((pack) => (
            <PackCard
              key={pack.id}
              pack={pack}
              spellCount={0} // TODO: fetch from ContentBrowser
              onOpen={() => console.log('Open', pack.id)}
              onExport={() => console.log('Export', pack.id)}
              onDisable={() => console.log('Disable', pack.id)}
              onDelete={() => console.log('Delete', pack.id)}
            />
          ))}
          <div className="border-2 border-dashed border-border rounded-lg p-4 flex items-center justify-center">
            <span className="text-muted-foreground">+ New Pack</span>
          </div>
        </div>
      )}

      {showCreateWizard && (
        <CreatePackWizard onClose={() => setShowCreateWizard(false)} />
      )}
      {showImportWizard && (
        <ImportWizard onClose={() => setShowImportWizard(false)} />
      )}
    </div>
  );
}
```

### 4. Create CreatePackWizard Modal

Create `src/components/CreatePackWizard.tsx`:

```typescript
import { useState } from 'react';

interface CreatePackWizardProps {
  onClose: () => void;
}

export function CreatePackWizard({ onClose }: CreatePackWizardProps) {
  const [step, setStep] = useState(1);
  const [packId, setPackId] = useState('');
  const [packName, setPackName] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    }
  };

  const handleCreate = () => {
    // TODO: call ContentPackManager.createPack()
    console.log('Create pack', { packId, packName, version, author, description });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface-primary rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Content Pack</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="mb-4">
          <span className="text-sm">Step {step} of 2: </span>
          <span className="text-sm font-semibold">
            {step === 1 ? 'Basic Information' : 'Confirm & Create'}
          </span>
        </div>

        {step === 1 ? (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Pack ID *</label>
              <input
                type="text"
                value={packId}
                onChange={(e) => setPackId(e.target.value)}
                className="w-full p-2 border border-border rounded-md"
                placeholder="my-homebrew"
              />
              <p className="text-xs text-muted-foreground mt-1">kebab-case, unique</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Pack Name *</label>
              <input
                type="text"
                value={packName}
                onChange={(e) => setPackName(e.target.value)}
                className="w-full p-2 border border-border rounded-md"
                placeholder="My Homebrew Spells"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Version</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full p-2 border border-border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Author</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full p-2 border border-border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-border rounded-md"
                rows={3}
              />
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Confirm Pack Details</h3>
              <p><strong>ID:</strong> {packId}</p>
              <p><strong>Name:</strong> {packName}</p>
              <p><strong>Version:</strong> {version}</p>
              <p><strong>Author:</strong> {author}</p>
              {description && <p><strong>Description:</strong> {description}</p>}
            </div>
          </>
        )}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border border-border rounded-md">
            Cancel
          </button>
          {step === 1 ? (
            <button onClick={handleNext} className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
              Next →
            </button>
          ) : (
            <button onClick={handleCreate} className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
              Create Pack
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Acceptance Criteria

- [ ] `PackList` page renders with toolbar (New, Import, Export buttons)
- [ ] `PackCard` component displays pack info (name, version, source, spell count)
- [ ] `EmptyState` component shows welcome message when 0 packs
- [ ] `CreatePackWizard` modal works (2 steps: basic info → confirm)
- [ ] Clicking "Open" on a pack card logs to console (navigation will be added in Task J)
- [ ] TypeScript compiles without errors
- [ ] ESLint passes

---

## Next Task

Proceed to **Task J** (PackDetail Page) after this task completes.
