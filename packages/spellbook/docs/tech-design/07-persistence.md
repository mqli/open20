## 8. Persistence Layer

### 8.1 Storage Service (localStorage)

Simple persistence using localStorage for MVP. Suitable for storing character data and user preferences.

```typescript
// src/core/storage-service.ts
import type { Character } from 'open20-core';

const STORAGE_KEY = 'open20-spellbook-characters';
const PREFERENCES_KEY = 'open20-spellbook-preferences';

export class StorageService {
  /**
   * Save a character to localStorage
   */
  static saveCharacter(character: Character): void {
    const characters = this.loadCharacters();
    const index = characters.findIndex(c => c.id === character.id);
    
    if (index >= 0) {
      characters[index] = character;
    } else {
      characters.push(character);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
  }

  /**
   * Load all characters from localStorage
   */
  static loadCharacters(): Character[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    try {
      return JSON.parse(data) as Character[];
    } catch {
      return [];
    }
  }

  /**
   * Delete a character by ID
   */
  static deleteCharacter(id: string): void {
    const characters = this.loadCharacters();
    const filtered = characters.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }

  /**
   * Save UI preferences (theme, sidebar state, etc.)
   */
  static savePreferences(preferences: Record<string, unknown>): void {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  }

  /**
   * Load UI preferences
   */
  static loadPreferences(): Record<string, unknown> {
    const data = localStorage.getItem(PREFERENCES_KEY);
    if (!data) return {};
    
    try {
      return JSON.parse(data) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  /**
   * Clear all data
   */
  static clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PREFERENCES_KEY);
  }
}
```

### 8.2 Spell Database Caching

To support full offline access to the SRD spell database (FR-003) without bloating the initial JavaScript payload:

- **Service Worker**: The Vite PWA plugin will be configured to generate a service worker that caches the `open20-core` spell database payload.
- **IndexedDB**: If the spell database payload grows too large for efficient SW caching, it will be lazily fetched and stored in IndexedDB on first load.
