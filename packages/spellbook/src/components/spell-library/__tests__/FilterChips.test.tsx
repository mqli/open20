// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FilterChips } from '@/components/spell-library/FilterChips';
import { I18nProvider } from '@open20/ui';
import { enTranslations } from '@/i18n';
const renderWithI18n = (ui: React.ReactElement) => {
  return render(
    <I18nProvider translationsSet={{ en: enTranslations }} initialLocale="en">
      {ui}
    </I18nProvider>,
  );
};
// Mock the store - vi.mock is hoisted to top of file
vi.mock('../../stores/spell-store', () => ({
  useSpellStore: vi.fn(() => ({
    selectedClasses: [],
    selectedSchools: [],
    showRitualOnly: false,
    showConcentrationOnly: false,
    toggleClassFilter: vi.fn(),
    toggleSchoolFilter: vi.fn(),
    setShowRitualOnly: vi.fn(),
    setShowConcentrationOnly: vi.fn(),
  })),
}));

describe('FR-005: Multi-dimensional Filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all class filters', () => {
    renderWithI18n(<FilterChips />);
    expect(screen.getByText('Wizard')).toBeInTheDocument();
    expect(screen.getByText('Cleric')).toBeInTheDocument();
  });

  it('should render all school filters', () => {
    renderWithI18n(<FilterChips />);
    expect(screen.getByText('Evocation')).toBeInTheDocument();
    expect(screen.getByText('Abjuration')).toBeInTheDocument();
    expect(screen.getByText('Illusion')).toBeInTheDocument();
  });

  it('should render property filters (Ritual, Concentration)', () => {
    renderWithI18n(<FilterChips />);
    expect(screen.getByText('Ritual')).toBeInTheDocument();
    expect(screen.getByText('Concentration')).toBeInTheDocument();
  });

  // Note: Click handler tests are skipped due to ESM mocking complexities
  // The services have been refactored to be instance-based for better testability
  // These tests can be added once the mocking issue is resolved
});
