import { vi } from 'vitest';

// Export mock functions that can be shared between test and mock factory
export const mockToggleClassFilter = vi.fn();
export const mockToggleSchoolFilter = vi.fn();
export const mockSetShowRitualOnly = vi.fn();
export const mockSetShowConcentrationOnly = vi.fn();

// Mock store state
export const mockStoreState = {
  selectedClasses: [],
  selectedSchools: [],
  showRitualOnly: false,
  showConcentrationOnly: false,
  get toggleClassFilter() { return mockToggleClassFilter; },
  get toggleSchoolFilter() { return mockToggleSchoolFilter; },
  get setShowRitualOnly() { return mockSetShowRitualOnly; },
  get setShowConcentrationOnly() { return mockSetShowConcentrationOnly; },
};
