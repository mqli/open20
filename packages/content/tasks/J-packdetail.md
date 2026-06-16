# Task J: PackDetail Page

**Phase**: 2 (Rulebook UI)  
**Depends On**: Task I (PackList Page)  
**Estimated Effort**: Large  
**Target Package**: `@open20/rulebook`

---

## Objective

Implement `PackDetail` page with tabs (All Content, Spells), content table, inline edit panel, and global actions.

---

## Prerequisites

- [ ] Task I complete (PackList page with PackCard)
- [ ] `@open20/content` Phase 1 complete (ContentEditor, ContentBrowser)

---

## Steps

### 1. Create ContentTable Component

Create `src/components/ContentTable.tsx`:

```typescript
import type { Spell } from 'open20-core';

interface ContentTableProps {
  spells: Spell[];
  onEdit: (spellId: string) => void;
  onDelete: (spellId: string) => void;
}

export function ContentTable({ spells, onEdit, onDelete }: ContentTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [inlineEditSpell, setInlineEditSpell] = useState<Spell | null>(null);

  return (
    <div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-2">
              <input type="checkbox" />
            </th>
            <th className="text-left p-2">Type</th>
            <th className="text-left p-2">Name</th>
            <th className="text-left p-2">Level</th>
            <th className="text-left p-2">School</th>
            <th className="text-left p-2">Classes</th>
            <th className="text-left p-2">Source</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {spells.map((spell) => (
            <tr key={spell.id} className="border-b border-border hover:bg-muted/50">
              <td className="p-2">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(spell.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds([...selectedIds, spell.id]);
                    } else {
                      setSelectedIds(selectedIds.filter((id) => id !== spell.id));
                    }
                  }}
                />
              </td>
              <td className="p-2">🪄</td>
              <td className="p-2">{spell.name}</td>
              <td className="p-2">{spell.level}</td>
              <td className="p-2">{spell.school}</td>
              <td className="p-2">{spell.classes?.join(', ')}</td>
              <td className="p-2">{spell.source}</td>
              <td className="p-2">
                <button onClick={() => onEdit(spell.id)} className="mr-2">✏️</button>
                <button onClick={() => onDelete(spell.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {inlineEditSpell && (
        <InlineEditPanel
          spell={inlineEditSpell}
          onClose={() => setInlineEditSpell(null)}
        />
      )}
    </div>
  );
}
```

### 2. Create InlineEditPanel Component

Create `src/components/InlineEditPanel.tsx`:

```typescript
import type { Spell } from 'open20-core';

interface InlineEditPanelProps {
  spell: Spell;
  onClose: () => void;
}

export function InlineEditPanel({ spell, onClose }: InlineEditPanelProps) {
  const [description, setDescription] = useState(spell.description);

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-surface-primary border-l border-border p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Inline Edit: {spell.name}</h3>
        <button onClick={onClose}>✕</button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Description *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border border-border rounded-md"
          rows={4}
        />
      </div>

      <div className="mb-4 flex gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Level</label>
          <select className="w-full p-2 border border-border rounded-md">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
              <option key={level} value={level} selected={level === spell.level}>
                {level}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">School</label>
          <input
            type="text"
            value={spell.school}
            className="w-full p-2 border border-border rounded-md"
            readOnly
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
          Save
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 border border-border rounded-md"
        >
          Open Full Editor →
        </button>
      </div>
    </div>
  );
}
```

### 3. Implement PackDetail Page

Update `src/pages/PackDetail.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ContentTable } from '../components/ContentTable';
import { AddContentButton } from '../components/AddContentButton';

export function PackDetail() {
  const { id } = useParams<{ id: string }>();
  const [spells, setSpells] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // TODO: load pack details and spells
    console.log('Load pack', id);
  }, [id]);

  return (
    <div>
      <div className="mb-6">
        <button className="text-sm text-muted-foreground mb-2">← Back</button>
        <h1 className="text-2xl font-bold">{id}</h1>
        <p className="text-sm text-muted-foreground">
          ID: {id} | v1.0 | Enabled | Author: DM Awesome
        </p>
      </div>

      <div className="mb-4 flex gap-2">
        <button className="px-4 py-2 border border-border rounded-md">
          Export All
        </button>
        <button className="px-4 py-2 border border-border rounded-md">
          Validate All
        </button>
        <span className="ml-auto text-sm text-muted-foreground">
          12 items · ~32 KB
        </span>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All (12)</TabsTrigger>
          <TabsTrigger value="spells">🪄 Spells (6)</TabsTrigger>
          <TabsTrigger value="monsters">👹 Monsters (3)</TabsTrigger>
          <TabsTrigger value="species">🧝 Species (2)</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 p-2 border border-border rounded-md"
            />
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
              + Add
            </button>
            <button className="px-4 py-2 border border-border rounded-md">
              Filter
            </button>
          </div>
          <ContentTable
            spells={spells}
            onEdit={(spellId) => console.log('Edit', spellId)}
            onDelete={(spellId) => console.log('Delete', spellId)}
          />
        </TabsContent>

        <TabsContent value="spells">
          <ContentTable
            spells={spells}
            onEdit={(spellId) => console.log('Edit', spellId)}
            onDelete={(spellId) => console.log('Delete', spellId)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### 4. Create AddContentButton Component

Create `src/components/AddContentButton.tsx`:

```typescript
export function AddContentButton() {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
      >
        + Add ▼
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 mt-2 bg-surface-primary border border-border rounded-md shadow-lg p-2">
          <button className="block w-full text-left p-2 hover:bg-muted rounded-md">
            + Add Spell
          </button>
          <button className="block w-full text-left p-2 hover:bg-muted rounded-md">
            + Add Monster
          </button>
          <hr className="my-2" />
          <button className="block w-full text-left p-2 hover:bg-muted rounded-md">
            Import Content
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## Acceptance Criteria

- [ ] `PackDetail` page renders with pack info (name, version, author)
- [ ] Tabs work (All Content, Spells, Monsters, Species)
- [ ] `ContentTable` displays spells with all columns (Type, Name, Level, School, Classes, Source)
- [ ] Inline edit panel slides in from right when clicking "Edit"
- [ ] Global actions (Export All, Validate All) display
- [ ] Add content button shows dropdown with content types
- [ ] TypeScript compiles without errors
- [ ] ESLint passes

---

## Next Task

Proceed to **Task K** (Spell Editor) after this task completes.
