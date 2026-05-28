/**
 * Shared test utilities for open20 packages
 */
/**
 * Mock localStorage for node environment tests
 */
export declare function setupLocalStorageMock(): void;
/**
 * Helper to create a basic test character object
 */
export declare function createTestCharacter(overrides?: Record<string, unknown>): {
  id: string;
  name: string;
  level: number;
  class: string;
};
/**
 * Helper to wait for async operations in tests
 */
export declare function waitFor(ms: number): Promise<void>;
