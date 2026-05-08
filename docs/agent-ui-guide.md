# Agent Guide: Building UI for DND 2024 Character Sheet

> **Purpose**: This document provides context, conventions, and patterns for AI agents building the React UI that consumes `open20-core`.

---

## 1. Project Overview

### 1.1 Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          React UI                                    │
│                (this project: /open20/web)                          │
├─────────────────────────────────────────────────────────────────────┤
│  packages/web/src/                                                  │
│  ┌──────────┬──────────┬──────────┬──────────────────────┐        │
│  │  stores/ │  hooks/   │features/ │     components/      │        │
│  └──────────┴──────────┴──────────┴──────────────────────┘        │
│                     │                                               │
│         ┌───────────┴───────────┐                                   │
│         ▼                       ▼                                   │
│  ┌──────────────────┐    ┌──────────────────┐                      │
│  │    theme/        │    │   lib/providers/ │  ← Abstraction     │
│  │ (design tokens)  │    │ (storage, comp)   │    Layer           │
│  └──────────────────┘    └──────────────────┘                      │
└────────────────────────────┬────────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Local (MVP)    │  │  IndexedDB      │  │  Remote API     │
│  LocalStorage   │  │  + Sync Queue   │  │  (Future)       │
│  open20-core    │  │                 │  │  Backend Svc    │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

**Key principle**: UI layer depends on interfaces, not implementations. Swap providers without touching UI code.

### 1.2 Project Structure

```
packages/
  core/               ← open20-core (headless engine)
  web/                ← new React app
    src/
      app/            ← routing, layout shell
      features/
        game-mode/    ← primary game view
        character-creation/
        character-sheet/
        level-up/
        settings/
      components/     ← shared UI components (from shadcn/ui)
      hooks/          ← custom React hooks wrapping core engine
      stores/         ← Zustand stores
      lib/
        providers/    ← Storage & Computation abstraction
          storage/    ← LocalStorageProvider, RemoteStorageProvider
          computation/ ← LocalComputationProvider, RemoteComputationProvider
      contexts/       ← AppContext, Provider composition
      theme/          ← Tailwind config, design tokens
```

### 1.3 Core Library Reference

**Repository**: https://github.com/mqli/open20-core/

**Key Exports**:
```typescript
// Data Loading
import { createDataLoader } from 'open20-core';

// Character Operations
import { createCharacter } from 'open20-core';
import { modifyHP, setTemporaryHP, consumeResource, recoverResource, 
         consumeSpellSlot, recoverSpellSlot, toggleCondition,
         equipItem, unequipItem, prepareSpell, unprepareSpell } from 'open20-core';
import { shortRest, longRest, levelUp } from 'open20-core';
import { validateCharacter, recomputeDerivedStats } from 'open20-core';

// Calculations (pure functions)
import { calculateAC, calculateMaxHP, calculateSpellSlots, 
         calculateInitiative, calculatePassivePerception, 
         calculateAttacks, getModifier, getProficiencyBonus,
         getSkillBonus, getSavingThrowBonus } from 'open20-core';

// Storage
import { serialize, deserialize, InMemoryStorage } from 'open20-core';

// Types
import type { Character, DataLoader, Resource, Attack,
               SpellSlotEntry, ActiveCondition, ConditionName,
               AbilityName, CombatStats, HitPoints } from 'open20-core';
```

### 1.4 Data Flow Pattern

```typescript
// 1. Initialize DataLoader (load rule data)
const dataLoader = createDataLoader();

// 2. Create or Load Character
const character = createCharacter(params, dataLoader);

// 3. Apply Mutations (returns NEW character object)
const updated = modifyHP(character, -5);

// 4. Recompute Derived Stats (AC, attacks, etc.)
const recomputed = recomputeDerivedStats(updated, dataLoader);

// 5. Store (auto-save or explicit)
localStorage.setItem('char', serialize(recomputed));
```

---

## 2. Key Types for UI

### 2.1 Character Structure

```typescript
interface Character {
  readonly schemaVersion: string;
  readonly name: string;
  readonly species: string;           // e.g., 'Dwarf'
  readonly speciesSubtype: string | null;
  readonly background: string;       // e.g., 'Soldier'
  readonly classes: readonly CharacterClass[];
  readonly abilityScores: AbilityScores;
  readonly skills: Record<string, SkillEntry>;
  readonly feats: readonly string[]; // Feat IDs
  readonly equipment: readonly EquipmentItem[];
  readonly spells: CharacterSpells;
  readonly resources: readonly Resource[];
  readonly hitPoints: HitPoints;
  readonly combatStats: CombatStats;
  readonly currency: Currency;
  readonly conditions: readonly ActiveCondition[];
  readonly notes: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface CharacterClass {
  readonly classId: string;
  readonly level: number;
  readonly subclassId: string | null;
  readonly subclassLevel: number | null;
  readonly hitDice: { readonly die: DieType; readonly used: number };
}

interface HitPoints {
  readonly max: number;
  readonly current: number;
  readonly temporary: number;
  readonly deathSaves: DeathSaves;
}

interface DeathSaves {
  readonly successes: number;  // 0-3
  readonly failures: number;   // 0-3
  readonly isStable: boolean;
}

interface CombatStats {
  readonly AC: number;
  readonly initiative: number;
  readonly speed: number;
  readonly passivePerception: number;
  readonly proficiencyBonus: number;
  readonly attacks: readonly Attack[];
}

interface Resource {
  readonly id: string;
  readonly max: number;
  readonly used: number;
  readonly resetOn: ResetType;
  readonly description: string;
}

interface Attack {
  readonly name: string;
  readonly attackBonus: number;
  readonly damage: string;      // e.g., "1d8+4"
  readonly damageType: string;
  readonly mastery?: WeaponMasteryProperty;
}
```

### 2.2 DataLoader Interface

```typescript
interface DataLoader {
  // Species
  getSpecies(id: string): Species | undefined;
  getAllSpecies(): Species[];
  
  // Backgrounds
  getBackground(id: string): Background | undefined;
  getAllBackgrounds(): Background[];
  
  // Classes & Subclasses
  getClass(id: string): Class | undefined;
  getAllClasses(): Class[];
  getSubclass(id: string): Subclass | undefined;
  getSubclassesForClass(classId: string): Subclass[];
  
  // Feats
  getFeat(id: string): Feat | undefined;
  getAllFeats(): Feat[];
  getFeatsByCategory(category: FeatCategory): Feat[];
  
  // Equipment
  getWeapon(id: string): Weapon | undefined;
  getAllWeapons(): Weapon[];
  getArmor(id: string): Armor | undefined;
  getAllArmor(): Armor[];
  
  // Spells
  getSpell(id: string): Spell | undefined;
  getSpellsByLevel(level: SpellLevel): Spell[];
  getAllSpells(): Spell[];
  
  // Lookup Tables
  getProficiencyBonus(level: number): number;
  getSpellSlots(classId: string, classLevel: number): Record<number, SpellSlotEntry>;
}
```

### 2.3 Enums and Constants

```typescript
// Ability Names
type AbilityName = 'Strength' | 'Dexterity' | 'Constitution' | 
                    'Intelligence' | 'Wisdom' | 'Charisma';

// Reset Types
enum ResetType {
  ShortRest = 'Short Rest',
  LongRest = 'Long Rest',
  PerTurn = 'Per Turn',
  Daily = 'Daily',
  Never = 'Never'
}

// Condition Names
type ConditionName = 'Blinded' | 'Charmed' | 'Deafened' | 'Exhaustion' | 
                     'Frightened' | 'Grappled' | 'Incapacitated' | 
                     'Invisible' | 'Paralyzed' | 'Petrified' | 
                     'Poisoned' | 'Prone' | 'Restrained' | 
                     'Stunned' | 'Unconscious';

// Die Types
type DieType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';
```

---

## 3. UI State Management Pattern

### 3.1 Zustand Store Structure

```typescript
// stores/characterStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  createCharacter, modifyHP, setTemporaryHP, consumeResource,
  recoverResource, consumeSpellSlot, recoverSpellSlot,
  toggleCondition, equipItem, unequipItem, shortRest, longRest,
  recomputeDerivedStats, serialize, deserialize
} from 'open20-core';

interface CharacterState {
  character: Character | null;
  dataLoader: DataLoader | null;
  
  // Actions
  initCharacter: (params: CreateCharacterParams) => void;
  loadCharacter: (json: string) => void;
  exportCharacter: () => string;
  
  // HP Actions
  damage: (amount: number) => void;
  heal: (amount: number) => void;
  setTempHP: (value: number) => void;
  
  // Resource Actions
  useResource: (resourceId: string) => void;
  recoverResourceById: (resourceId: string) => void;
  
  // Spell Slot Actions
  castSpell: (level: number) => void;
  recoverSpellSlotById: (level: number) => void;
  
  // Condition Actions
  toggleConditionById: (conditionId: ConditionName) => void;
  
  // Rest Actions
  doShortRest: (hitDiceToSpend?: number) => void;
  doLongRest: () => void;
}

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set, get) => ({
      character: null,
      dataLoader: null,
      
      initCharacter: (params) => {
        const dataLoader = createDataLoader();
        const character = createCharacter(params, dataLoader);
        set({ character, dataLoader });
      },
      
      loadCharacter: (json) => {
        const character = deserialize(json);
        const dataLoader = createDataLoader();
        set({ character, dataLoader });
      },
      
      exportCharacter: () => {
        const { character } = get();
        return character ? serialize(character) : '';
      },
      
      damage: (amount) => {
        const { character, dataLoader } = get();
        if (!character || !dataLoader) return;
        const updated = recomputeDerivedStats(
          modifyHP(character, -amount), dataLoader
        );
        set({ character: updated });
      },
      
      heal: (amount) => {
        const { character, dataLoader } = get();
        if (!character || !dataLoader) return;
        const updated = recomputeDerivedStats(
          modifyHP(character, amount), dataLoader
        );
        set({ character: updated });
      },
      
      // ... other actions follow same pattern
    }),
    {
      name: 'character-storage',
      partialize: (state) => ({ 
        exportedCharacter: state.exportCharacter() 
      }),
    }
  )
);
```

### 3.2 React Hook Pattern

```typescript
// hooks/useCharacter.ts
import { useCallback } from 'react';
import { useCharacterStore } from '../stores/characterStore';

export function useCharacter() {
  const { character, dataLoader, damage, heal, useResource } = 
    useCharacterStore();
  
  return {
    character,
    combatStats: character?.combatStats,
    hitPoints: character?.hitPoints,
    resources: character?.resources,
    
    // Convenience methods
    applyDamage: useCallback((amount: number) => damage(amount), [damage]),
    applyHealing: useCallback((amount: number) => heal(amount), [heal]),
    spendResource: useCallback(
      (id: string) =>     useResource(id), 
      [useResource]
    ),
  };
}
```

---

## 3.5 Storage & Computation Abstraction Layer

### 3.5.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        React UI                               │
│                      (open20/web)                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────────────────────────┐  │
│  │ App Providers │────│  StorageProvider (injected)     │  │
│  │              │    │  ComputationProvider (injected)  │  │
│  └──────┬───────┘    └─────────────────┬────────────────┘  │
│         │                              │                    │
└─────────┼──────────────────────────────┼────────────────────┘
          │                              │
          ▼                              ▼
┌─────────────────────┐    ┌─────────────────────────────────┐
│    Local (MVP)      │    │        Remote (Future)          │
├─────────────────────┤    ├─────────────────────────────────┤
│ LocalStorage        │    │ REST API / GraphQL              │
│ IndexedDB           │    │ PostgreSQL / Cloud DB           │
│ open20-core (local) │    │ Serverless Functions           │
│                    │    │ Auth (OAuth, JWT)              │
└─────────────────────┘    └─────────────────────────────────┘
```

### 3.5.2 Storage Provider Interface

```typescript
// lib/storage/StorageProvider.ts
export interface StorageProvider {
  // Character CRUD
  saveCharacter(id: string, data: string): Promise<void>;
  loadCharacter(id: string): Promise<string | null>;
  deleteCharacter(id: string): Promise<void>;
  listCharacters(): Promise<CharacterMeta[]>;
  
  // App settings
  saveSettings(settings: AppSettings): Promise<void>;
  loadSettings(): Promise<AppSettings | null>;
  
  // Sync status (for remote providers)
  getLastSyncTime(): Promise<number | null>;
  isOnline(): boolean;
}

interface CharacterMeta {
  id: string;
  name: string;
  updatedAt: string;
}
```

### 3.5.3 Computation Provider Interface

```typescript
// lib/computation/ComputationProvider.ts
export interface ComputationProvider {
  // Data loading
  createDataLoader(): DataLoader;
  
  // Character lifecycle
  createCharacter(params: CreateCharacterParams, loader: DataLoader): Character;
  validateCharacter(character: Character): ValidationResult;
  
  // Mutations (all return new immutable objects)
  modifyHP(character: Character, delta: number): Character;
  setTemporaryHP(character: Character, value: number): Character;
  consumeResource(character: Character, resourceId: string): Character;
  recoverResource(character: Character, resourceId: string): Character;
  consumeSpellSlot(character: Character, level: number): Character;
  recoverSpellSlot(character: Character, level: number): Character;
  toggleCondition(character: Character, condition: ConditionName): Character;
  
  // Rest operations
  shortRest(character: Character, hitDiceToSpend?: number): Character;
  longRest(character: Character): Character;
  levelUp(character: Character, options: LevelUpOptions): Character;
  
  // Derived stats recalculation
  recompute(character: Character, loader: DataLoader): Character;
  
  // Serialization
  serialize(character: Character): string;
  deserialize(json: string): Character;
}
```

### 3.5.4 Local Implementation (MVP)

```typescript
// lib/storage/LocalStorageProvider.ts
export class LocalStorageProvider implements StorageProvider {
  private readonly PREFIX = 'open20_char_';
  
  async saveCharacter(id: string, data: string): Promise<void> {
    localStorage.setItem(`${this.PREFIX}${id}`, data);
  }
  
  async loadCharacter(id: string): Promise<string | null> {
    return localStorage.getItem(`${this.PREFIX}${id}`);
  }
  
  async deleteCharacter(id: string): Promise<void> {
    localStorage.removeItem(`${this.PREFIX}${id}`);
  }
  
  async listCharacters(): Promise<CharacterMeta[]> {
    const metas: CharacterMeta[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.PREFIX)) {
        const id = key.slice(this.PREFIX.length);
        const data = localStorage.getItem(key);
        if (data) {
          const char = deserialize(data);
          metas.push({ id, name: char.name, updatedAt: char.updatedAt });
        }
      }
    }
    return metas;
  }
  
  isOnline(): boolean { return navigator.onLine; }
  getLastSyncTime(): Promise<number | null> { return Promise.resolve(null); }
}

// lib/computation/LocalComputationProvider.ts
export class LocalComputationProvider implements ComputationProvider {
  // Delegates to open20-core
  createDataLoader = createDataLoader;
  createCharacter = createCharacter;
  validateCharacter = validateCharacter;
  modifyHP = modifyHP;
  setTemporaryHP = setTemporaryHP;
  consumeResource = consumeResource;
  recoverResource = recoverResource;
  consumeSpellSlot = consumeSpellSlot;
  recoverSpellSlot = recoverSpellSlot;
  toggleCondition = toggleCondition;
  shortRest = shortRest;
  longRest = longRest;
  levelUp = levelUp;
  recompute = recomputeDerivedStats;
  serialize = serialize;
  deserialize = deserialize;
}
```

### 3.5.5 Remote Implementation (Future)

```typescript
// lib/storage/RemoteStorageProvider.ts
export class RemoteStorageProvider implements StorageProvider {
  constructor(private baseUrl: string, private authToken: string) {}
  
  private async fetch(endpoint: string, options?: RequestInit) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  }
  
  async saveCharacter(id: string, data: string): Promise<void> {
    await this.fetch(`/characters/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  }
  
  async loadCharacter(id: string): Promise<string | null> {
    const result = await this.fetch(`/characters/${id}`);
    return result.data ?? null;
  }
  
  async deleteCharacter(id: string): Promise<void> {
    await this.fetch(`/characters/${id}`, { method: 'DELETE' });
  }
  
  async listCharacters(): Promise<CharacterMeta[]> {
    return this.fetch('/characters');
  }
  
  async saveSettings(settings: AppSettings): Promise<void> {
    await this.fetch('/settings', { method: 'PUT', body: JSON.stringify(settings) });
  }
  
  async loadSettings(): Promise<AppSettings | null> {
    return this.fetch('/settings');
  }
  
  async getLastSyncTime(): Promise<number | null> {
    const result = await this.fetch('/sync/status');
    return result.lastSync ?? null;
  }
  
  isOnline(): boolean { return navigator.onLine; }
}

// lib/computation/RemoteComputationProvider.ts
// Delegates to serverless functions or backend API
export class RemoteComputationProvider implements ComputationProvider {
  constructor(private baseUrl: string) {}
  
  // Character creation/mutations happen server-side
  async createCharacter(params: CreateCharacterParams, loader: DataLoader): Promise<Character> {
    const result = await fetch(`${this.baseUrl}/character/create`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return result.json();
  }
  
  // ... other methods follow same pattern
}
```

### 3.5.6 Provider Context & Dependency Injection

```typescript
// contexts/Providers.tsx
interface AppContext {
  storage: StorageProvider;
  computation: ComputationProvider;
}

const AppContext = createContext<AppContext | null>(null);

export function AppProviders({ children }: { children: ReactNode }) {
  // Local by default, can be swapped via feature flag or settings
  const storage = useMemo(() => new LocalStorageProvider(), []);
  const computation = useMemo(() => new LocalComputationProvider(), []);
  
  return (
    <AppContext.Provider value={{ storage, computation }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProviders');
  return ctx;
}
```

### 3.5.7 Updated Store with Providers

```typescript
// stores/characterStore.ts
export const useCharacterStore = create<CharacterState>()(
  persist(
    (set, get) => ({
      character: null,
      dataLoader: null,
      
      initCharacter: (params) => {
        const { computation, storage } = useAppContext();
        const loader = computation.createDataLoader();
        const character = computation.createCharacter(params, loader);
        // Auto-save
        storage.saveCharacter(character.id, computation.serialize(character));
        set({ character, dataLoader: loader });
      },
      
      damage: (amount) => {
        const { character, dataLoader } = get();
        const { computation, storage } = useAppContext();
        if (!character || !dataLoader) return;
        
        const updated = computation.recompute(
          computation.modifyHP(character, -amount),
          dataLoader
        );
        // Auto-save
        storage.saveCharacter(updated.id, computation.serialize(updated));
        set({ character: updated });
      },
      // ... other actions follow same pattern
    }),
    // ...
  )
);
```

### 3.5.8 Migration Strategy

| Phase | Storage | Computation | Features |
|-------|---------|-------------|----------|
| **Phase 1 (MVP)** | LocalStorage | open20-core (local) | Full offline support |
| **Phase 2** | IndexedDB + sync queue | Same | Better offline, background sync |
| **Phase 3** | Remote API (opt-in) | Remote API | Cloud backup, multi-device |
| **Phase 4** | Remote as default | Remote | Full cloud experience |

**Data format remains compatible** — both providers use the same `Character` type, so migration is seamless.

---

## 4. Component Patterns

### 4.1 Game Mode Layout

```tsx
// features/game-mode/GameMode.tsx
export function GameMode() {
  const { character, combatStats, hitPoints, resources } = useCharacter();
  
  if (!character || !combatStats) {
    return <EmptyState />;
  }
  
  return (
    <div className="min-h-screen bg-[--bg-primary] text-[--text-primary]">
      <GameHeader character={character} />
      
      <div className="grid grid-cols-3 gap-4 p-4">
        <CombatStatsPanel 
          ac={combatStats.AC}
          hp={hitPoints}
          initiative={combatStats.initiative}
          pp={combatStats.passivePerception}
        />
        
        <WeaponsPanel attacks={combatStats.attacks} />
        
        <ResourcesPanel resources={resources} />
      </div>
      
      <QuickActionBar character={character} />
    </div>
  );
}
```

### 4.2 Stat Card Component

```tsx
// components/StatCard.tsx
interface StatCardProps {
  label: string;
  value: number;
  accent?: 'gold' | 'red' | 'green' | 'blue';
  onTap?: () => void;
}

export function StatCard({ label, value, accent = 'gold', onTap }: StatCardProps) {
  const accentColors = {
    gold: 'text-[--accent-gold]',
    red: 'text-[--accent-red]',
    green: 'text-[--accent-green]',
    blue: 'text-[--accent-blue]',
  };
  
  return (
    <button
      onClick={onTap}
      className="min-w-[100px] min-h-[80px] rounded-lg bg-[--bg-surface] 
                 border border-[--border] p-3 flex flex-col items-center
                 hover:bg-[--bg-elevated] transition-colors"
    >
      <span className="text-xs text-[--text-secondary] uppercase">
        {label}
      </span>
      <span className={`text-3xl font-bold ${accentColors[accent]}`}>
        {value}
      </span>
    </button>
  );
}
```

### 4.3 HP Display with Death Saves

```tsx
// components/HPDisplay.tsx
export function HPDisplay({ hitPoints }: { hitPoints: HitPoints }) {
  const isDead = hitPoints.current <= 0;
  const isStable = hitPoints.deathSaves.isStable;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <StatCard 
          label="HP" 
          value={hitPoints.current}
          accent={hitPoints.current < hitPoints.max ? 'red' : 'green'}
        />
        <span className="text-[--text-secondary]">/ {hitPoints.max}</span>
        {hitPoints.temporary > 0 && (
          <span className="text-[--accent-blue]">
            +{hitPoints.temporary} temp
          </span>
        )}
      </div>
      
      {isDead && !isStable && (
        <DeathSaves saves={hitPoints.deathSaves} />
      )}
    </div>
  );
}

function DeathSaves({ successes, failures }: DeathSaves) {
  return (
    <div className="flex gap-4 text-sm">
      <div className="flex gap-1">
        <span>Success:</span>
        {[0, 1, 2].map(i => (
          <span key={i} className={i < successes ? '●' : '○'} />
        ))}
      </div>
      <div className="flex gap-1">
        <span>Failure:</span>
        {[0, 1, 2].map(i => (
          <span key={i} className={i < failures ? '●' : '○'} />
        ))}
      </div>
    </div>
  );
}
```

### 4.4 Resource Tracker with Dots

```tsx
// components/ResourceTracker.tsx
interface ResourceTrackerProps {
  resource: Resource;
  onConsume: () => void;
  onRecover: () => void;
}

export function ResourceTracker({ resource, onConsume, onRecover }: ResourceTrackerProps) {
  const remaining = resource.max - resource.used;
  const dots = Array.from({ length: resource.max }, (_, i) => i < remaining);
  
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{resource.id}</span>
      <div className="flex gap-1">
        {dots.map((filled, i) => (
          <button
            key={i}
            onClick={filled ? onConsume : onRecover}
            className={`w-4 h-4 rounded-full border ${
              filled 
                ? 'bg-[--accent-gold] border-[--accent-gold]' 
                : 'bg-transparent border-[--border]'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
```

### 4.5 Spell Slot Tracker

```tsx
// components/SpellSlotTracker.tsx
interface SpellSlotTrackerProps {
  slots: Record<number, SpellSlotEntry>;
  onConsume: (level: number) => void;
  onRecover: (level: number) => void;
}

export function SpellSlotTracker({ slots, onConsume, onRecover }: SpellSlotTrackerProps) {
  return (
    <div className="space-y-2">
      {Object.entries(slots)
        .filter(([_, slot]) => slot.total > 0)
        .map(([level, slot]) => (
          <div key={level} className="flex items-center gap-3">
            <span className="text-sm w-8">L{level}</span>
            <div className="flex gap-1">
              {Array.from({ length: slot.total }).map((_, i) => {
                const used = i < slot.used;
                return (
                  <button
                    key={i}
                    onClick={() => used ? onRecover(Number(level)) : onConsume(Number(level))}
                    className={`w-6 h-6 rounded-full border-2 ${
                      used 
                        ? 'bg-[--text-muted] border-[--text-muted]' 
                        : 'bg-[--accent-purple]/20 border-[--accent-purple]'
                    }`}
                  />
                );
              })}
            </div>
            <span className="text-xs text-[--text-secondary]">
              ({slot.total - slot.used}/{slot.total})
            </span>
          </div>
        ))}
    </div>
  );
}
```

---

## 5. Common Patterns

### 5.1 Character Creation Flow

```typescript
// features/character-creation/steps/SpeciesStep.tsx
export function SpeciesStep({ onSelect }: { onSelect: (speciesId: string) => void }) {
  const { dataLoader } = useCharacterStore();
  const species = dataLoader?.getAllSpecies() ?? [];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {species.map(sp => (
        <Card key={sp.id} onClick={() => onSelect(sp.id)}>
          <h3>{sp.name}</h3>
          <p className="text-sm text-[--text-secondary]">{sp.description}</p>
        </Card>
      ))}
    </div>
  );
}
```

### 5.2 Level Up Modal

```tsx
// features/level-up/LevelUpModal.tsx
interface LevelUpModalProps {
  character: Character;
  targetLevel: number;
  onConfirm: (options: LevelUpOptions) => void;
}

export function LevelUpModal({ character, targetLevel, onConfirm }: LevelUpModalProps) {
  const [hpChoice, setHpChoice] = useState<'fixed' | 'roll'>('fixed');
  const [asiOrFeat, setAsiOrFeat] = useState<'asi' | 'feat'>('asi');
  
  const classInfo = character.classes[0];
  const newFeatures = getFeaturesForLevel(classInfo.classId, targetLevel);
  
  return (
    <Modal>
      <h2>Level Up: {classInfo.classId} {targetLevel}</h2>
      
      <div className="space-y-4">
        <HPPreview 
          currentMax={character.hitPoints.max}
          classId={classInfo.classId}
          choice={hpChoice}
        />
        
        {newFeatures.length > 0 && (
          <FeatureSelector features={newFeatures} />
        )}
        
        {isAsiLevel(targetLevel) && (
          <ASIFeatSelector 
            choice={asiOrFeat}
            onChange={setAsiOrFeat}
          />
        )}
      </div>
      
      <div className="flex justify-end gap-2">
        <Button variant="secondary">Cancel</Button>
        <Button onClick={() => onConfirm({
          classId: classInfo.classId,
          hpChoice,
          asiOrFeat: asiOrFeat === 'asi' ? { type: 'asi' } : undefined
        })}>
          Confirm
        </Button>
      </div>
    </Modal>
  );
}
```

### 5.3 Rest Workflow

```tsx
// features/rest/RestFlow.tsx
export function ShortRestFlow({ character, onComplete }: Props) {
  const [hitDiceToSpend, setHitDiceToSpend] = useState(0);
  
  const availableHitDice = character.classes.reduce(
    (sum, cls) => sum + (getHitDieCount(cls.die) - cls.hitDice.used), 0
  );
  
  const estimatedHealing = hitDiceToSpend * getAverageHitDieValue(); // Simplified
  
  return (
    <Dialog>
      <h3>Short Rest</h3>
      <p>Spend Hit Dice to recover HP?</p>
      
      <div className="my-4">
        <Label>Hit Dice: d10 ({availableHitDice} remaining)</Label>
        <Slider 
          value={hitDiceToSpend}
          onChange={setHitDiceToSpend}
          min={0}
          max={availableHitDice}
        />
        <p>Estimated healing: {estimatedHealing} HP</p>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button onClick={() => onComplete(0)}>Skip</Button>
        <Button onClick={() => onComplete(hitDiceToSpend)}>Spend {hitDiceToSpend} HD</Button>
      </div>
    </Dialog>
  );
}
```

---

## 6. Design Tokens (from ui-design.md)

### 6.1 Dark Theme Colors

```css
:root {
  --bg-primary: #0f1117;
  --bg-surface: #1a1d27;
  --bg-elevated: #252836;
  --text-primary: #e8e8ed;
  --text-secondary: #8b8d9a;
  --text-muted: #5c5e6e;
  --accent-gold: #c9a84c;   /* AC, primary actions */
  --accent-red: #e74c3c;    /* HP damage, death */
  --accent-green: #2ecc71;  /* HP healing, success */
  --accent-blue: #3498db;   /* Temporary HP, spell slots */
  --accent-purple: #9b59b6; /* Spellcasting, magic */
  --border: #2a2d3a;
}
```

### 6.2 Typography

| Role | Size | Weight |
|------|------|--------|
| Combat stat (AC, HP) | 28–32pt | Bold |
| Section heading | 20pt | Semi-bold |
| Body text | 16pt | Regular |
| Stat modifier | 18pt | Bold |
| Button label | 14pt | Medium |
| Caption/label | 12pt | Regular |

### 6.3 Spacing & Touch Targets

```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 16px;
--touch-min: 44px;  /* Minimum touch target */
```

### 6.4 Component Dimensions

|| Component | Width | Height | Notes |
|-----------|-------|--------|-------|
| Game stat card (AC/HP) | 100px | 80px | Prominent display |
| Weapon row | full | 48px | Name + bonus + damage |
| Skill row | full | 40px | Name + modifier + tap |
| Resource dots row | full | 36px | ●●○ + label |
| Spell slot circle | 36px | 36px | Filled/empty per slot |
| Quick action button | full/2 | 48px | Short Rest, Long Rest |
| Condition chip | auto | 32px | Horizontally scrollable |

### 6.5 Animation (CSS Transitions)

All animations use CSS transitions (no animation library needed):

|| Interaction | CSS Property | Duration |
|-------------|---------------|-----------|
| Condition chip appear/disappear | `opacity`, `transform` | 0.2s ease |
| Resource dot fill/unfill | `background-color` | 0.15s ease |
| Bottom sheet slide-up | `transform: translateY()` | 0.3s ease-out |
| Theme toggle | `background-color`, `color` | 0.3s ease |
| Skill chip hover/copy feedback | `transform: scale()` | 0.1s ease |

---

## 7. Key UI Components (Component Library)

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `<StatCard>` | Display AC, Initiative, PP | `label`, `value`, `accent?`, `onTap?` |
| `<HPDisplay>` | HP with death saves | `current`, `max`, `temporary`, `deathSaves` |
| `<ResourceTracker>` | Class resources (Rage, etc.) | `name`, `current`, `max`, `onChange` |
| `<SpellSlotTracker>` | Spell slot circles | `slots`, `onChange` |
| `<WeaponRow>` | Weapon attack display | `weapon`, `attackBonus`, `damage`, `mastery?` |
| `<SkillBadge>` | Skill with modifier | `name`, `bonus`, `proficient?`, `pinned?`, `onTap` |
| `<ConditionChip>` | Active conditions | `name`, `active`, `onTap` |
| `<StepWizard>` | Creation flow | `steps`, `currentStep`, `onNext`, `onBack` |
| `<HPModifyPanel>` | HP bottom sheet | `hp`, `temporaryHp`, `deathSaves`, `onApply` |
| `<RestFlowDialog>` | Rest confirmation | `type`, `character`, `onComplete` |

---

### 7.1 Component Library

**Primary**: **shadcn/ui** — copy-paste components, Tailwind-native, excellent accessibility.

```bash
# Components are copied into src/components/ui/
npx shadcn@latest add button card dialog slider
```

### 7.2 Internationalization (i18n)

**Library**: `react-i18next`

Data model already stores bilingual strings:
```typescript
// static/feats.json, static/spells.json, etc.
{ "id": "savage-attacker", "name": { "en": "Savage Attacker", "zh": "野蛮攻击者" } }
```

Implementation:
```typescript
// hooks/useLocale.ts
const { t } = useLocale();
// t('gameMode.ac') → "AC" (en) or "护甲等级" (zh)

// Language toggle in Settings
localStorage.setItem('language', 'en' | 'zh');

// Default: detect from navigator.language
```

**Rules**:
- All user-facing strings go through `t('key')` — no hardcoded labels
- Fallback chain: `zh` → `en` → raw key

---

## 8. Route Structure

| Route | View | Purpose |
|-------|------|---------|
| `/` | Redirect | → `/game/{lastCharId}` or `/create` |
| `/game/:id` | Game Mode | Primary view (90% usage) |
| `/create` | Character Creation | Step-by-step wizard |
| `/sheet/:id` | Full Character Sheet | Detailed tabbed view |
| `/edit/:id` | Character Editor | Edit character data |
| `/characters` | Character List | Manage multiple characters |
| `/settings` | App Settings | Theme, export/import |

---

## 9. Data Storage Strategy

> **Note**: Storage operations are abstracted through `StorageProvider`. See [Section 3.5](#35-storage--computation-abstraction-layer) for full details.

### 9.1 Local Storage (MVP)

Uses `LocalStorageProvider` for offline-first operation:

```typescript
// Auto-save via store (handled by StorageProvider)
const { storage, computation } = useAppContext();
const json = computation.serialize(character);
await storage.saveCharacter(character.id, json);

// List all characters
const characters = await storage.listCharacters();

// Delete character
await storage.deleteCharacter(characterId);
```

### 9.2 Export/Import

```typescript
// Export to JSON file
function exportCharacter(character: Character, computation: ComputationProvider) {
  const json = computation.serialize(character);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${character.name}-${character.schemaVersion}.dnd2024.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Import from JSON file
async function importCharacter(file: File, computation: ComputationProvider) {
  const text = await file.text();
  const character = computation.deserialize(text);
  // Validate via computation.validateCharacter(character)
  return character;
}
```

### 9.3 Future: Remote Sync

```typescript
// RemoteStorageProvider adds sync capabilities
const storage = new RemoteStorageProvider(API_URL, authToken);

// Check sync status
const lastSync = await storage.getLastSyncTime();

// Online/offline handling
if (storage.isOnline()) {
  await storage.saveCharacter(id, json);
  // Background sync when back online
}
```

---

## 10. Testing Pattern for UI

```tsx
// __tests__/components/HPDisplay.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { HPDisplay } from '../HPDisplay';

describe('HPDisplay', () => {
  it('shows current HP and max', () => {
    render(<HPDisplay hitPoints={{
      max: 42,
      current: 38,
      temporary: 5,
      deathSaves: { successes: 0, failures: 0, isStable: false }
    }} />);
    
    expect(screen.getByText('38')).toBeInTheDocument();
    expect(screen.getByText('/ 42')).toBeInTheDocument();
  });
  
  it('shows temporary HP when present', () => {
    render(<HPDisplay hitPoints={{
      max: 42,
      current: 33,
      temporary: 5,
      deathSaves: { successes: 0, failures: 0, isStable: false }
    }} />);
    
    expect(screen.getByText('+5 temp')).toBeInTheDocument();
  });
  
  it('shows death saves when HP is 0 or less', () => {
    render(<HPDisplay hitPoints={{
      max: 42,
      current: 0,
      temporary: 0,
      deathSaves: { successes: 1, failures: 2, isStable: false }
    }} />);
    
    expect(screen.getByText(/Success/)).toBeInTheDocument();
    expect(screen.getByText(/Failure/)).toBeInTheDocument();
  });
});
```

---

## 11. Common Issues & Solutions

### 11.1 Character Returns Undefined
```typescript
// Problem: character might be null initially
const { character } = useCharacterStore();
// character is Character | null

// Solution: Always check before use
if (!character) return <Loading />;
```

### 11.2 Recompute After Mutations
```typescript
// Problem: Mutations don't auto-recompute derived stats
const updated = modifyHP(character, -5);
// updated.combatStats.AC might be stale!

// Solution: Always call recomputeDerivedStats after mutations
const recomputed = recomputeDerivedStats(updated, dataLoader);
```

### 11.3 DataLoader Initialization
```typescript
// Problem: DataLoader might not be ready
const loader = createDataLoader(); // This is synchronous, should be fine

// But if using browser bundle:
const loader = createBrowserDataLoader(lookupTables);
```

---

## 12. Reference Links

- **Core Library**: https://github.com/mqli/open20-core/
- **Core README**: https://github.com/mqli/open20-core/blob/main/README.md
- **Agent Guide (Core)**: https://github.com/mqli/open20-core/blob/main/agent.md
- **HLD**: https://github.com/mqli/open20-core/blob/main/spec/high-level-design.md
- **Data Model**: https://github.com/mqli/open20-core/blob/main/spec/data-model.md
- **UI Design**: `/workspaces/open20/docs/ui-design.md`
- **PRD**: `/workspaces/open20/docs/PRD.md`

---

*Last updated: 2025-05-08*
