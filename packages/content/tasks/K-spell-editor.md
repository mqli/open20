# Task K: Spell Editor

**Phase**: 2 (Rulebook UI)  
**Depends On**: Task J (PackDetail Page)  
**Estimated Effort**: Large  
**Target Package**: `@open20/rulebook`

---

## Objective

Implement `ContentEditor` page for spells with accordion form sections, preview drawer, and three save button behaviors.

---

## Prerequisites

- [ ] Task J complete (PackDetail page with tabs + table)
- [ ] `@open20/content` Phase 1 complete (ContentEditor with spell CRUD)

---

## Steps

### 1. Create SpellEditor Form Component

Create `src/components/SpellEditorForm.tsx`:

```typescript
import { useState } from 'react';
import type { Spell } from 'open20-core';

interface SpellEditorFormProps {
  spell?: Spell; // undefined = create new
  onSave: (spell: Spell) => void;
  onCancel: () => void;
}

export function SpellEditorForm({ spell, onSave, onCancel }: SpellEditorFormProps) {
  const [formData, setFormData] = useState<Partial<Spell>>(
    spell ?? {
      id: '',
      name: '',
      level: 0,
      school: 'Evocation',
      classes: [],
      castingTime: '',
      range: '',
      components: {},
      duration: '',
      description: '',
      source: 'Homebrew',
    }
  );

  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    casting: false,
    description: false,
  });

  const handleSave = () => {
    onSave(formData as Spell);
  };

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">
          {spell ? `Edit Spell: ${spell.name}` : 'New Spell'}
        </h2>
        <div className="flex gap-2">
          <span className="text-sm text-muted-foreground">Unsaved</span>
          <button onClick={handleSave} className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
            Save
          </button>
          <button className="px-4 py-2 border border-border rounded-md">
            Save & New
          </button>
          <button className="px-4 py-2 border border-border rounded-md">
            Save & Close
          </button>
          <button onClick={onCancel} className="px-4 py-2 border border-destructive text-destructive rounded-md">
            Delete
          </button>
        </div>
      </div>

      {/* Section: Basic Information */}
      <div className="mb-4 border border-border rounded-lg">
        <button
          onClick={() => setExpandedSections({ ...expandedSections, basic: !expandedSections.basic })}
          className="w-full p-4 flex justify-between items-center"
        >
          <span className="font-semibold">Basic Information {expandedSections.basic ? '✓' : '○'}</span>
          <span>{expandedSections.basic ? '▼' : '▶'}</span>
        </button>
        {expandedSections.basic && (
          <div className="p-4 border-t border-border">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Spell ID *</label>
                <input
                  type="text"
                  value={formData.id ?? ''}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full p-2 border border-border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Spell Name *</label>
                <input
                  type="text"
                  value={formData.name ?? ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-border rounded-md"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Level</label>
                <select
                  value={formData.level ?? 0}
                  onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                  className="w-full p-2 border border-border rounded-md"
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                    <option key={level} value={level}>
                      {level} {level === 0 ? '(Cantrip)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">School</label>
                <select
                  value={formData.school ?? 'Evocation'}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value as Spell['school'] })}
                  className="w-full p-2 border border-border rounded-md"
                >
                  {['Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Evocation', 'Illusion', 'Necromancy', 'Transmutation'].map((school) => (
                    <option key={school} value={school}>{school}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section: Casting Information */}
      <div className="mb-4 border border-border rounded-lg">
        <button
          onClick={() => setExpandedSections({ ...expandedSections, casting: !expandedSections.casting })}
          className="w-full p-4 flex justify-between items-center"
        >
          <span className="font-semibold">Casting Information {expandedSections.casting ? '✓' : '○'}</span>
          <span>{expandedSections.casting ? '▼' : '▶'}</span>
        </button>
        {expandedSections.casting && (
          <div className="p-4 border-t border-border">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Casting Time *</label>
                <input
                  type="text"
                  value={formData.castingTime ?? ''}
                  onChange={(e) => setFormData({ ...formData, castingTime: e.target.value })}
                  className="w-full p-2 border border-border rounded-md"
                  placeholder="1 action"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Range *</label>
                <input
                  type="text"
                  value={formData.range ?? ''}
                  onChange={(e) => setFormData({ ...formData, range: e.target.value })}
                  className="w-full p-2 border border-border rounded-md"
                  placeholder="150 feet"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section: Description */}
      <div className="mb-4 border border-border rounded-lg">
        <button
          onClick={() => setExpandedSections({ ...expandedSections, description: !expandedSections.description })}
          className="w-full p-4 flex justify-between items-center"
        >
          <span className="font-semibold">Description {expandedSections.description ? '✓' : '○'}</span>
          <span>{expandedSections.description ? '▼' : '▶'}</span>
        </button>
        {expandedSections.description && (
          <div className="p-4 border-t border-border">
            <textarea
              value={formData.description ?? ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border border-border rounded-md"
              rows={6}
              placeholder="Spell description..."
            />
          </div>
        )}
      </div>
    </div>
  );
}
```

### 2. Implement ContentEditor Page

Update `src/pages/ContentEditor.tsx`:

```typescript
import { useParams, useNavigate } from 'react-router-dom';
import { SpellEditorForm } from '../components/SpellEditorForm';

export function ContentEditor() {
  const { packId, contentId } = useParams<{ packId: string; contentId?: string }>();
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="flex">
      <div className={`${showPreview ? 'w-2/3' : 'w-full'} transition-all`}>
        <SpellEditorForm
          spell={contentId ? undefined : undefined} // TODO: load spell if editing
          onSave={(spell) => {
            console.log('Save spell', spell);
            // TODO: call ContentEditor.addSpell() or updateSpell()
          }}
          onCancel={() => navigate(`/rulebook/packs/${packId}`)}
        />
      </div>

      {showPreview && (
        <div className="w-1/3 border-l border-border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Preview</h3>
            <button onClick={() => setShowPreview(false)}>✕</button>
          </div>
          <div className="bg-surface-secondary p-4 rounded-lg">
            {/* TODO: render SpellCard component */}
            <p>SpellCard preview (live render)</p>
          </div>
          <button className="mt-4 w-full p-2 border border-border rounded-md">
            Open Full Preview in New Tab
          </button>
        </div>
      )}

      <button
        onClick={() => setShowPreview(!showPreview)}
        className="fixed top-4 right-4 px-4 py-2 bg-secondary text-secondary-foreground rounded-md"
      >
        👁 Preview
      </button>
    </div>
  );
}
```

### 3. Implement Save Button Behaviors

Update `SpellEditorForm` to handle three save intents:

```typescript
const handleSave = (intent: 'stay' | 'new' | 'close') => {
  // Validate required fields
  if (!formData.id || !formData.name) {
    alert('Spell ID and Name are required');
    return;
  }

  // Save spell
  // TODO: call ContentEditor.addSpell() or updateSpell()
  console.log('Save spell', formData);

  // Handle intent
  switch (intent) {
    case 'stay':
      // Stay on editor (continue editing)
      break;
    case 'new':
      // Clear form for new spell
      setFormData({
        id: '',
        name: '',
        level: 0,
        school: 'Evocation',
        classes: [],
        castingTime: '',
        range: '',
        components: {},
        duration: '',
        description: '',
        source: 'Homebrew',
      });
      break;
    case 'close':
      // Navigate back to PackDetail
      onCancel();
      break;
  }
};
```

---

## Acceptance Criteria

- [ ] `ContentEditor` page renders with accordion form sections
- [ ] Form sections expand/collapse correctly
- [ ] Preview drawer slides in from right when clicking "👁 Preview"
- [ ] Three save buttons work: [Save] (stay), [Save & New] (clear form), [Save & Close] (navigate back)
- [ ] Unsaved changes protection works (prompt before leaving)
- [ ] TypeScript compiles without errors
- [ ] ESLint passes

---

## Next Task

Proceed to **Task L** (ContentBrowser Page) after this task completes.
