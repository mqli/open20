## 5. State Management (Zustand)

The application uses two primary Zustand stores to manage global state: `useCharacterStore` and `useSpellStore`.

### 5.1 Character Store (`useCharacterStore`)

Manages the active character and the list of all created characters.

**State Definition:**
- `activeCharacter`: `AppCharacter | null`
- `characters`: `AppCharacter[]`
- `isLoading`: `boolean`

**Key Actions:**
- `setActiveCharacter(character)`: Switches the current view context.
- `createCharacter(params)`: Initializes a new character via `CharacterService`.
- `updateCharacter(character)`: Updates state and persists to `StorageService` immediately.
- `learnSpell(spellId)` / `prepareSpell(spellId)`: Wraps logic in `CharacterService` and updates state.
- `longRest()`: Resets all spell slots for the active character.

### 5.2 Spell Store (`useSpellStore`)

Manages the spell library, search parameters, and filtering logic.

**State Definition:**
- `spells`: `Spell[]` (Full library)
- `filteredSpells`: `Spell[]` (Filtered result set)
- `searchQuery`: `string`
- `selectedLevel`: `number | null`
- `showKnownOnly`: `boolean`
- `showPreparedOnly`: `boolean`

**Filtering Logic:**
The `applyFilters()` action is triggered on every search or filter change. It combines:
1.  Text search against spell names.
2.  Level-based filtering.
3.  Meta-filters (Ritual, Concentration).
4.  Mutual exclusivity between "Known" and "Prepared" filters.

### 5.3 Roll Store (`useRollStore`)

A transient store for handling dice roll results without using blocking UI elements like `alert()`.

**State Definition:**
- `latestRoll`: `RollResult | null` (The most recent roll to display)
- `recentRolls`: `RollResult[]` (History of the last 10 rolls)

**Key Actions:**
- `addRoll(params)`: Adds a new roll result and triggers the `DiceRollOverlay` via a 5-second auto-clearing timer.
