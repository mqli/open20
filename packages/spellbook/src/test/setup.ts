import '@testing-library/jest-dom/vitest';

// Mock localStorage for node environment
if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
  const store: Record<string, string> = {};
  const localStorageMock = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
  };
  // @ts-expect-error — global mock in node env
  global.localStorage = localStorageMock;
}
