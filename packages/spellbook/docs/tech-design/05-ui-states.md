## 6. UI States

### 6.1 Spell Library Page States

```
┌─────────────────────────────────────────────────────────────┐
│ State: Initial Load                                        │
│ ├── Loading: true                                         │
│ ├── spells: []                                            │
│ └── filteredSpells: []                                    │
│                                                           │
│ Triggers: Page mount                                      │
│ Actions: Fetch spells from open20-core                     │
│ Next State: Loaded                                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ State: Loaded                                              │
│ ├── Loading: false                                        │
│ ├── spells: Spell[]                                      │
│ ├── filteredSpells: Spell[]                               │
│ ├── searchQuery: string                                   │
│ ├── selectedLevel: number | null                         │
│ ├── selectedClasses: string[]                            │
│ ├── selectedSchools: string[]                            │
│ └── showRitualOnly: boolean                              │
│                                                           │
│ User Actions:                                             │
│ ├── Type in search → update searchQuery → applyFilters    │
│ ├── Click level tab → update selectedLevel → applyFilters│
│ ├── Click class chip → toggle class → applyFilters        │
│ ├── Click school chip → toggle school → applyFilters      │
│ └── Click spell card → selectSpell → open flyout          │
│                                                           │
│ Next States: Filtered, Detail Open                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ State: Filtered                                            │
│ └── filteredSpells: Spell[] (subset of spells)             │
│                                                           │
│ Triggers: Any filter change                                │
│ Actions: applyFilters()                                   │
│ Next State: Loaded (with filters applied)                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ State: Detail Open (Flyout)                                │
│ ├── selectedSpell: Spell                                  │
│ ├── isDetailOpen: true                                    │
│ └── Flyout animation: sliding in                         │
│                                                           │
│ User Actions:                                               │
│ ├── Click X / Back → closeDetail()                        │
│ ├── Click backdrop → closeDetail()                        │
│ ├── Press Escape → closeDetail()                          │
│ ├── Click different spell card → selectSpell(newSpell)    │
│ ├── Click "Roll Attack" → dice roll                      │
│ └── Click "Roll Damage" → dice roll                      │
│                                                           │
│ Next States: Detail Open (new spell), Loaded              │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Character Sheet Page States

```
┌─────────────────────────────────────────────────────────────┐
│ State: No Character Selected                                │
│ ├── activeCharacter: null                                  │
│ └── Show: "Create Character" button                       │
│                                                           │
│ Triggers: App load, character deleted                      │
│ Next State: Character Selected (after creation)            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ State: Character Selected                                   │
│ ├── activeCharacter: Character                            │
│ ├── spellSlots: SpellSlotMap                              │
│ ├── preparedSpells: string[]                              │
│ ├── concentration: string | null                          │
│ └── spellSaveDC: number                                   │
│                                                           │
│ User Actions:                                               │
│ ├── Click spell slot circle → consume/recover slot        │
│ ├── Click "Long Rest" → longRest()                       │
│ ├── Click "Prepare Spells" → open modal                  │
│ ├── Click concentration indicator → dismiss concentration│
│ └── Click "Edit Character" → open setup page             │
│                                                           │
│ Next States: Slot Consumed, Preparing Spells, Editing     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ State: Preparing Spells (Modal Open)                       │
│ ├── showPrepareModal: true                                 │
│ ├── availableSpells: Spell[]                               │
│ ├── preparedCount: number                                  │
│ └── maxPrepare: number                                     │
│                                                           │
│ User Actions:                                               │
│ ├── Click spell → toggle prepare/unprepare                │
│ ├── Click "Done" → close modal, save                     │
│ └── Click "Cancel" → close modal, discard                │
│                                                           │
│ Next States: Character Selected (with updated spells)      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ State: Slot Consumed                                       │
│ └── activeCharacter: Character (updated with consumed slot) │
│                                                           │
│ Triggers: Click spell slot circle                          │
│ Actions: consumeSpellSlot() → update store                 │
│ Next State: Character Selected (updated)                   │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 Character Setup Page States

```
┌─────────────────────────────────────────────────────────────┐
│ State: Setup - Initial                                      │
│ ├── name: ''                                               │
│ ├── selectedClass: ''                                      │
│ ├── level: 1                                               │
│ ├── abilityScores: { str: 10, dex: 10, ... }              │
│ ├── errors: string[]                                       │
│ └── preview: { dc, attack, slots }                         │
│                                                           │
│ User Actions:                                               │
│ ├── Type name → update name                                │
│ ├── Click class → update selectedClass                    │
│ ├── Adjust level → update level                           │
│ ├── Adjust ability scores → update scores                 │
│ └── Form changes → update preview (real-time)             │
│                                                           │
│ Next States: Setup - Valid, Setup - Invalid                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ State: Setup - Invalid                                     │
│ └── errors: string[] (validation errors)                   │
│                                                           │
│ Triggers: Validation fails                                 │
│ Display: Error messages below fields                       │
│ Next State: Setup - Valid (after corrections)              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ State: Setup - Valid                                       │
│ └── errors: []                                             │
│                                                           │
│ Triggers: All validation passes                             │
│ Display: "Create Character" button enabled                 │
│ User Action: Click "Create Character"                      │
│ Next State: Character Selected                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.4 Dice Rolling States

```
┌─────────────────────────────────────────────────────────────┐
│ State: Idle                                                │
│ ├── isRolling: false                                       │
│ ├── rollResult: null                                       │
│ └── showResult: false                                      │
│                                                           │
│ Next State: Rolling                                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ State: Rolling                                             │
│ ├── isRolling: true                                        │
│ ├── animation: 'rolling'                                   │
│ └── Roll calculation: open20-core roll functions           │
│                                                           │
│ Duration: 300ms animation                                  │
│ Next State: Result                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ State: Result                                              │
│ ├── isRolling: false                                       │
│ ├── rollResult: RollResult                                │
│ ├── showResult: true                                       │
│ └── Display: Result overlay with animation                │
│                                                           │
│ User Actions:                                               │
│ ├── Click "Roll Again" → Rolling                          │
│ ├── Close flyout → Idle                                   │
│ └── Auto-dismiss: 5s timer                                │
│                                                           │
│ Next States: Rolling, Idle                                 │
└─────────────────────────────────────────────────────────────┘
```
