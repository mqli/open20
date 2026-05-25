## 3. Project Structure

```
open20-spellbook/
├── public/
│   ├── index.html
│   ├── manifest.json              # PWA manifest
│   └── favicon.svg
├── src/
│   ├── main.tsx                   # Entry point
│   ├── App.tsx                    # Root component, routing
│   ├── vite-env.d.ts              # Vite type declarations
│   │
│   ├── core/                      # open20-core integration layer
│   │   ├── types.ts               # TypeScript types (re-exported from core)
│   │   ├── character-service.ts    # Character CRUD operations
│   │   ├── spell-service.ts       # Spell queries and preparation
│   │   ├── rules-service.ts       # Rule calculations (DC, attack, etc.)
│   │   └── storage-service.ts     # Persistence layer (localStorage)
│   │
│   ├── stores/                    # Zustand stores
│   │   ├── character-store.ts     # Character state
│   │   ├── spell-store.ts         # Spell library state
│   │   ├── ui-store.ts            # UI state (theme, sidebar, etc.)
│   │   └── index.ts              # Combined store exports
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── use-character.ts      # Character data hooks
│   │   ├── use-spells.ts         # Spell query hooks
│   │   ├── use-dice-roll.ts      # Dice rolling hooks
│   │   └── use-persistence.ts    # Persistence hooks
│   │
│   ├── components/                # React components
│   │   ├── ui/                  # Wrapped Radix UI components (shared)
│   │   │   ├── Dialog.tsx       # Wrapped dialog/flyout
│   │   │   ├── DropdownMenu.tsx # Wrapped dropdown
│   │   │   ├── Tabs.tsx         # Wrapped tabs
│   │   │   ├── Tooltip.tsx      # Wrapped tooltip
│   │   │   ├── Slider.tsx       # Wrapped slider
│   │   │   ├── Switch.tsx       # Wrapped switch
│   │   │   ├── Button.tsx       # Button variants
│   │   │   ├── Badge.tsx        # Badge/label component
│   │   │   ├── Input.tsx        # Form input
│   │   │   └── Select.tsx       # Wrapped select dropdown
│   │   │
│   │   ├── layout/
│   │   │   ├── AppShell.tsx      # Main layout shell
│   │   │   ├── Sidebar.tsx       # Navigation sidebar
│   │   │   ├── Header.tsx        # Top header bar
│   │   │   └── ThemeProvider.tsx # Theme context provider
│   │   │
│   │   ├── spell-library/
│   │   │   ├── SpellLibrary.tsx  # Main spell list page
│   │   │   ├── SpellCard.tsx     # Spell card component
│   │   │   ├── SpellDetail.tsx   # Flyout panel
│   │   │   ├── SearchBar.tsx     # Search input
│   │   │   ├── FilterChips.tsx   # Filter chips
│   │   │   └── LevelTabs.tsx     # Level tab bar
│   │   │
│   │   ├── character-sheet/
│   │   │   ├── CharacterSheet.tsx # Main character page
│   │   │   ├── SpellSlots.tsx    # Spell slot tracker
│   │   │   ├── ConcentrationIndicator.tsx
│   │   │   ├── PreparedSpells.tsx # Prepared spells list
│   │   │   └── DiceRoller.tsx    # Dice roller component
│   │   │
│   │   ├── character-setup/
│   │   │   ├── CharacterSetup.tsx # Create/edit character
│   │   │   ├── ClassSelector.tsx  # Class selection grid
│   │   │   └── AbilityScoreInput.tsx
│   │   │
│   │   └── dice/
│   │       ├── DiceRoll.tsx      # Dice roll animation
│   │       └── RollResult.tsx    # Roll result display
│   │
│   ├── styles/                    # Global styles
│   │   ├── tokens.css            # Design tokens (CSS custom properties)
│   │   ├── reset.css             # CSS reset
│   │   ├── typography.css        # Typography styles
│   │   └── theme.css             # Theme variations
│   │
│   └── utils/                     # Utility functions
│       ├── constants.ts          # App constants
│       ├── helpers.ts            # Helper functions
│       └── formatters.ts        # Display formatters
│
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── eslint.config.js
├── .prettierrc
└── README.md
```
