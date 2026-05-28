/**
 * Shared test utilities for open20 packages
 */

/**
 * Mock localStorage for node environment tests
 */
export function setupLocalStorageMock() {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    const store: Record<string, string> = {};
    const localStorageMock = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        Object.keys(store).forEach((k) => delete store[k]);
      },
    };
    // @ts-expect-error — global mock in node env
    global.localStorage = localStorageMock;
  }
}

/**
 * Helper to create a basic test character object
 */
export function createTestCharacter(overrides: Record<string, unknown> = {}) {
  return {
    id: 'test-character-1',
    name: 'Test Character',
    level: 1,
    class: 'Fighter',
    ...overrides,
  };
}

/**
 * Helper to wait for async operations in tests
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
