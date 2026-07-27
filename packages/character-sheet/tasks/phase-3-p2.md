# Phase 3 — P2 Nice-to-haves

Notes, JSON export/import, roll history. Same shared conventions as [`phase-1-p0-ui.md`](./phase-1-p0-ui.md). All depend on Phase 0/1 foundations. One component per task.

---

### T-301 — NotesSection (FR-149) — §4.18

**Files:** `src/components/character/Notes/NotesSection.tsx` (+ test); **Store:** `setNotes`.

- Collapsible `textarea` bound to `character.notes` (field exists in core). **Debounced auto-save** (500 ms) → `setNotes(text)` → replace snapshot + persist. Subtle "saved" indicator.
- **Accept:** edits persist after debounce; reopening shows saved notes. **Tests:** debounce fires one save w/ final text (fake timers); initial value from `character.notes`.

### T-302 — ExportButton (FR-150; NFR-04) — §4.18

**Files:** `src/components/character/Management/ExportButton.tsx` (+ test).

- `serialize(character)` (core) → download `.json`; filename via `sanitizeFilename(character.name)`.
- **Accept:** downloads a blob with sanitized filename containing serialized character. **Tests:** blob content = `serialize` output; filename sanitized.

### T-303 — ImportButton (FR-151; NFR-04) — §4.18, §10.2

**Files:** `src/components/character/Management/ImportButton.tsx` (+ test); **Store:** `importCharacter`.

- File upload → read text → **`validateSchemaVersion(json)` FIRST**; if `!compatible` → toast ("Could not import — incompatible version"), **no state change**. Else `deserialize(json)` (may throw → toast) → add to store + persist. Warn on overwrite when a same-name/id character exists.
- **Accept:** export→import round-trips to an equal character; incompatible version rejected non-destructively; malformed JSON handled, no crash. **Tests:** happy path adds; incompatible schema → no state change; malformed JSON toast.

### T-304 — RollHistoryPanel (FR-148) — §8.3

**Depends on:** T-010 · **Files:** `src/components/dice/RollHistoryPanel.tsx` (+ test); optionally extend ui `useRollStore`.

- Surface `useRollStore.recentRolls` in a panel/drawer accessible app-wide (dice icon in app bar / bottom "More"). Each entry: label, expression, total, relative timestamp, `components` breakdown; crit/miss styling reuses overlay logic. Optionally raise buffer >10 and/or persist to localStorage — if extending the store, do it in `@open20/ui` and keep spellbook green.
- **Accept:** rolling populates history newest-first w/ breakdown; opens from anywhere. **Tests:** newest-first render w/ breakdown; empty state.

---

_End of task specs. See [`README.md`](./README.md) for the verified API surface and PRD/wireframe corrections._
