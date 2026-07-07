## 10. Character Export/Import via URL

### 10.1 Overview

This document analyzes the feasibility and design of URL-based character export/import for the spellbook app. The goal is to allow users to share characters (including custom spells and subclasses) via a simple URL that can be pasted into a browser.

**Key insight**: The data model already separates character state (string ID references) from content (shipped data), making JSON serialization trivial. No custom serialization framework is needed.

**Verdict**: Feasible with moderate effort. All infrastructure exists; the work is primarily wiring + UI.

---

### 10.2 Data Model Analysis

#### Why this works

The `Character` type stores only string IDs, never object references:

```typescript
// core/src/types/character.ts
interface Character {
  readonly species: string;          // "Elf"
  readonly background: string;       // "Acolyte"
  readonly classes: readonly CharacterClass[];
  // ...
  readonly spells: CharacterSpells;  // knownSpells/preparedSpells are string[]
}

interface CharacterClass {
  readonly classId: string;          // "Fighter"
  readonly subclassId: string | null;// "Battle-Master"
  // ...
}
```

All game entity data (species, backgrounds, spells, classes, subclasses, feats) is resolved at compute time via `RecomputeDerivedStatsDeps` — a lookup bag keyed by string ID. This separation means:

- `Character` objects are fully JSON-serializable with `JSON.stringify`
- Core provides `serialize(char)` → JSON string and `deserialize(json)` → `Character` with Zod validation + schema migration
- No circular references, no functions, no non-serializable data

#### What needs to be in the bundle

A sharable character must be self-contained. It needs:

| Data | Source | Why |
|---|---|---|
| **Character** (`AppCharacter`) | `CharacterStore` / `storageService.loadCharacters()` | The character itself |
| **Custom spells** referenced by the character | `CustomSpellStore` — cross-reference spell IDs against SRD | Custom spells are not shipped with the app |
| **Custom classes** referenced by the character | `CustomClassStore` — cross-reference class IDs against SRD | Custom classes may define spellcasting rules |
| **Custom/standalone subclasses** referenced by the character | `CustomClassStore` — cross-reference subclass IDs against SRD | Subclasses may define always-prepared spells |

SRD content (species, backgrounds, base classes, core spells) is NOT included — it's always available to the importing app.

#### Identifying what's custom

```typescript
// Pseudocode for dependency resolution

// 1. Gather all spell IDs referenced by the character
const referencedSpellIds = new Set<string>();
for (const [classId, spellData] of Object.entries(character.spells.classSpellcasting)) {
  spellData.knownCantrips?.forEach(id => referencedSpellIds.add(id));
  spellData.knownSpells?.forEach(id => referencedSpellIds.add(id));
  spellData.preparedSpells?.forEach(id => referencedSpellIds.add(id));
}
// Also check feat spells (Magic Initiate)
for (const [, featEntry] of Object.entries(character.spells.featSpells ?? {})) {
  featEntry.cantrips?.forEach(id => referencedSpellIds.add(id));
  featEntry.preparedSpells?.forEach(id => referencedSpellIds.add(id));
}

// 2. Compare against SRD to find custom spells
const srdSpellIds = new Set(srdSpells.map(s => s.id));
const customSpellIds = [...referencedSpellIds].filter(id => !srdSpellIds.has(id));

// 3. Same for class IDs and subclass IDs
const customClassIds = character.classes
  .map(c => c.classId)
  .filter(id => !srdClassIds.has(id));

const customSubclassIds = character.classes
  .filter(c => c.subclassId)
  .map(c => c.subclassId!)
  .filter(id => !srdSubclassIds.has(id));
```

#### Bundle format

```typescript
interface CharacterExportBundle {
  /** Format version for forward-compatibility */
  readonly v: 1;
  /** The character (without custom data — those are separate entries) */
  readonly character: AppCharacter;
  /** Custom spells referenced by this character (not found in SRD) */
  readonly customSpells: Spell[];
  /** Custom classes + their subclasses referenced by this character */
  readonly customClasses: CustomClassEntry[];
  /** Standalone subclasses (subclasses of SRD classes) referenced by this character */
  readonly standaloneSubclasses: Subclass[];
}
```

---

### 10.3 URL Encoding

#### Size estimation

| Scenario | Minified JSON | Base64url (+33%) | With lz-string (~50% reduction) |
|---|---|---|---|
| Minimal (character only, no custom data) | ~1-2 KB | ~1.5-3 KB | ~0.7-1.5 KB |
| Typical (character + 5 custom spells + 1 subclass) | ~4-8 KB | ~5-11 KB | ~2.5-5.5 KB |
| Large (character + 20 custom spells + 3 subclasses) | ~12-20 KB | ~16-27 KB | ~8-14 KB |

Browser hash fragment limits:
- Chrome: ~10 MB
- Firefox: effectively unlimited
- Safari: ~2 MB
- Mobile browsers: ~2 MB

**Even the largest realistic bundle is well within all limits.** lz-string is a nice-to-have optimization but not required for v1.

#### Encoding scheme

```
#o2c=BASE64URL_ENCODED_JSON
```

- Hash prefix `#o2c` (open20 character) identifies the format
- The data after `=` is base64url-encoded minified JSON
- Version field `v` inside the JSON handles format evolution

```typescript
// Encoding
function encodeExportBundle(bundle: CharacterExportBundle): string {
  const json = JSON.stringify(bundle); // no spaces — minified
  const base64 = btoa(unescape(encodeURIComponent(json))); // handles Unicode
  const urlSafe = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `#o2c=${urlSafe}`;
}

// Decoding
function decodeExportBundle(hash: string): CharacterExportBundle | null {
  const match = hash.match(/^#?o2c=(.+)$/);
  if (!match) return null;
  const base64 = match[1].replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(escape(atob(base64)));
  const parsed = JSON.parse(json);
  // Validate structure
  if (!parsed.v || !parsed.character || !Array.isArray(parsed.customSpells)) return null;
  return parsed as CharacterExportBundle;
}
```

Note: `unescape` / `escape` are used for UTF-8 safe binary encoding of non-ASCII characters (e.g., Chinese spell names). These are deprecated but remain universally supported and are the simplest approach for this use case. An alternative is `TextEncoder`/`TextDecoder`, but this is simpler and sufficient for JSON data.

#### With lz-string (v2 optimization)

```typescript
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

function encodeWithLzString(bundle: CharacterExportBundle): string {
  const json = JSON.stringify(bundle);
  const compressed = compressToEncodedURIComponent(json);
  return `#o2c=${compressed}`;
}

function decodeWithLzString(hash: string): CharacterExportBundle | null {
  const match = hash.match(/^#?o2c=(.+)$/);
  if (!match) return null;
  const json = decompressFromEncodedURIComponent(match[1]);
  if (!json) return null;
  return JSON.parse(json);
}
```

---

### 10.4 Export Flow

```
User clicks "Share Character" button
        │
        ▼
Get active character from CharacterStore
        │
        ▼
Get custom spells from CustomSpellStore
Get custom classes from CustomClassStore
Get standalone subclasses from CustomClassStore
        │
        ▼
Resolve which custom data is referenced by the character
(compare spell/class/subclass IDs against SRD content pack)
        │
        ▼
Build CharacterExportBundle
        │
        ▼
Encode to URL-safe format (base64url or lz-string)
        │
        ▼
Build full URL: `${window.location.origin}${window.location.pathname}#o2c=${encoded}`
        │
        ▼
Copy to clipboard + show confirmation toast
```

#### Export service API

```typescript
// src/core/export-service.ts

export interface ExportResult {
  /** The full URL with encoded character data */
  url: string;
  /** Diagnostic info for UI */
  stats: {
    characterSize: number;       // bytes of JSON
    customSpellsIncluded: number;
    customClassesIncluded: number;
    standaloneSubclassesIncluded: number;
    totalSize: number;           // bytes after encoding
  };
}

/**
 * Serialize a character and all its custom dependencies into a shareable URL.
 */
export function exportCharacterToUrl(
  character: AppCharacter,
  customSpells: Spell[],
  customClasses: CustomClassEntry[],
  standaloneSubclasses: Subclass[],
  srdSpellIds: Set<string>,
  srdClassIds: Set<string>,
  srdSubclassIds: Set<string>,
): ExportResult;

/**
 * Parse a URL hash and return the decoded bundle, or null if invalid.
 */
export function parseImportFromUrl(hash: string): CharacterExportBundle | null;
```

---

### 10.5 Import Flow

```
App mounts (SpellLibraryLayout)
        │
        ▼
Check window.location.hash for #o2c= prefix
        │
        ├── No → normal app startup
        │
        └── Yes → parseImportFromUrl(hash)
                │
                ├── Parse error → clear hash, ignore
                │
                └── Valid bundle
                        │
                        ▼
                    Show ImportCharacterDialog
                    ┌──────────────────────────┐
                    │ "Import character 'X'?"   │
                    │                          │
                    │ Custom spells: 5          │
                    │ Custom subclasses: 1      │
                    │                          │
                    │ [Import] [Cancel]        │
                    └──────────────────────────┘
                        │
                        ├── Cancel → clear hash, abort
                        │
                        └── Import
                                │
                                ▼
                            Import custom classes/subclasses
                            (CustomClassStore: dedup by ID)
                                │
                                ▼
                            Import custom spells
                            (CustomSpellStore.importSpells: dedup by ID)
                                │
                                ▼
                            Check character name conflict
                                │
                                ├── No conflict → import directly
                                └── Conflict → prompt "Character exists. Overwrite?"
                                        │
                                        ├── Overwrite → replace by ID
                                        └── Cancel → skip character only
                                │
                                ▼
                            Save character to CharacterStore
                                │
                                ▼
                            Reinit content pack (so SpellService sees new data)
                                │
                                ▼
                            Clear hash, show success toast,
                            auto-select imported character
```

#### Conflicts and error handling

| Scenario | Behavior |
|---|---|
| Character with same ID exists | Prompt: overwrite or skip |
| Custom spell ID already exists | Skip (dedup via `importSpells()`) |
| Custom class ID already exists | Skip (upsert via `saveClass()`) |
| Bundle references custom data not in bundle | Warn in console, import the character anyway (missing spells just won't be found in the library — they can be reassigned later) |
| URL hash malformed or too large | Parse error → ignore silently, normal startup |
| Character schema too old | Core `deserialize()` handles migration transparently |
| Custom spell fails Zod validation | Skip that spell, warn user |

---

### 10.6 Component Design

#### Share button

Placement: `CharacterSheet.tsx` or `CharacterPanel.tsx`

```tsx
// CharacterSheet.tsx — add in the sheet header or action area
<button
  onClick={handleShare}
  disabled={!activeCharacter}
  title="Share this character as a URL"
>
  Share
</button>
```

States:
- **Disabled** — no active character
- **Idle** — clickable
- **Copying** — after click, URL copied, show "Copied!" transient state (2s)

#### Import dialog

```tsx
// components/import/ImportCharacterDialog.tsx
interface ImportCharacterDialogProps {
  bundle: CharacterExportBundle;
  onImport: (options: ImportOptions) => void;
  onCancel: () => void;
}
```

Shows:
- Character name, class summary, level
- Number of custom spells/subclasses to import
- Warning if name conflicts with existing characters
- "Import" / "Cancel" buttons

States:
- **Idle** — showing details in dialog
- **Importing** — spinner, stores are writing
- **Error** — something failed, show error message + retry
- **Success** — imported, brief flash before auto-close

#### Integration point

In `SpellLibraryLayout` mount effect, after all stores are loaded:

```typescript
// SpellLibraryLayout.tsx — add after existing load calls

useEffect(() => {
  const bundle = parseImportFromUrl(window.location.hash);
  if (bundle) {
    setIsImporting(true);
    // Show the dialog — stores are loaded at this point
  }
}, [/* after all store loads complete */]);
```

---

### 10.7 Integration Points

| Integration | File | Notes |
|---|---|---|
| Share button | `CharacterSheet.tsx` or `CharacterPanel.tsx` | Needs access to active character, custom spell/class stores, and SRD content |
| Import detection | `SpellLibraryLayout.tsx` | Must run after all store loads complete |
| Import dialog | New component `ImportCharacterDialog.tsx` | Needs access to CharacterStore, CustomSpellStore, CustomClassStore |
| Export service | New file `src/core/export-service.ts` | Pure functions, no React deps, testable in isolation |
| SRD content resolution | `spellService` / `contentResolver` | Need a way to query "is this spell/class/subclass in SRD?" |

---

### 10.8 Files to Create / Modify

| File | Action | Purpose |
|---|---|---|
| `src/core/export-service.ts` | Create | Encode/decode, bundle building, URL generation |
| `src/components/import/ImportCharacterDialog.tsx` | Create | Dialog for confirming character import |
| `src/components/character/CharacterSheet/CharacterSheet.tsx` | Modify | Add Share button |
| `src/components/layout/SpellLibraryLayout.tsx` | Modify | Add import detection on mount |
| `src/core/spell-service.ts` | Modify | Expose `getSRDSpellIds()` or similar |

---

### 10.9 Optional: lz-string Compression

**Not required for v1.** The raw base64url approach covers all realistic bundle sizes. Consider lz-string for v2 if user feedback indicates long URLs are problematic on certain platforms.

Installation (if needed later):

```
pnpm --filter @open20/spellbook add lz-string
pnpm --filter @open20/spellbook add -D @types/lz-string
```

Bundle impact: ~3 KB gzipped for the lz-string library.

---

### 10.10 Security Considerations

- **Same-origin trust**: The bundle is only executed on the same origin it was created on (the spellbook app). No cross-origin code execution risk.
- **Input validation**: Bundle is validated against expected schema before import (version check, required fields, array type checks). Custom spells go through `ContentValidator.validateSpell()`.
- **No arbitrary code execution**: The bundle is pure JSON — no functions, no eval, no code injection surface.
- **DoS via large URL**: Browser hash parsing is fast (string operations only). A hash over ~10 MB could be a memory attack vector — add a size limit (e.g., 1 MB) during parsing.
- **localStorage quota**: Importing large custom content could exceed localStorage limits (typically 5-10 MB per origin). Unlikely with realistic bundles, but wrap in try/catch and report errors.

---

### 10.11 Testing Strategy

**Unit tests** (`src/core/__tests__/export-service.test.ts`):

1. Round-trip: export → import yields identical character + custom data
2. Round-trip with Unicode names (Chinese characters)
3. Empty custom data (character only, no custom spells/subclasses)
4. Bundle with all three custom types (spells + classes + subclasses)
5. Invalid hash → returns null
6. Hash size limit enforcement

**Integration tests**:

1. Import detection triggers dialog with valid hash
2. Import detection ignores invalid hash
3. Character name conflict handling (overwrite vs. skip)
4. Custom spell deduplication on import

---

### 10.12 Implementation Phases

#### Phase 1: Core encoding (1 session)

- Create `export-service.ts` with encode/decode + bundle building
- No compression (base64url only)
- Unit tests for round-trip

#### Phase 2: Import flow (1 session)

- Create `ImportCharacterDialog.tsx`
- Wire import detection in `SpellLibraryLayout`
- Handle name conflicts, store integration

#### Phase 3: Export UI (1 session)

- Add Share button to `CharacterSheet`
- Copy-to-clipboard with toast feedback
- Export stats display (number of custom spells included, etc.)

#### Phase 4: Polish & edge cases (1 session)

- Add size limit enforcement
- Handle corrupted data gracefully
- Integration tests
- Documentation

---

**Change Log**

| Version | Date | Changes | Author |
|---|---|---|---|
| v1.0 | 2026-07-07 | Initial version | — |
