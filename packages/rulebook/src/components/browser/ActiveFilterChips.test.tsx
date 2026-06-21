import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider } from '@open20/ui';
import { ActiveFilterChips } from './ActiveFilterChips';

const mockSetSpellFilter = vi.fn();
const mockSetMonsterFilter = vi.fn();
const mockClearFilters = vi.fn();

// Mock the browserStore - must be before any imports that use it
vi.mock('../../stores/browserStore', () => ({
  useBrowserStore: vi.fn(),
}));

import { useBrowserStore } from '../../stores/browserStore';

function mockStore(overrides: Record<string, unknown> = {}) {
  vi.mocked(useBrowserStore).mockReturnValue({
    activeTab: 'spells',
    spellFilters: {},
    monsterFilters: {},
    setSpellFilter: mockSetSpellFilter,
    setMonsterFilter: mockSetMonsterFilter,
    clearFilters: mockClearFilters,
    ...overrides,
  } as any);
}

describe('ActiveFilterChips', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when no filters are active', () => {
    mockStore();

    const { container } = render(
      <I18nProvider>
        <ActiveFilterChips />
      </I18nProvider>,
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows active source filter chip', () => {
    mockStore({ spellFilters: { source: 'SRD' } });

    render(
      <I18nProvider>
        <ActiveFilterChips />
      </I18nProvider>,
    );
    expect(screen.getByText('Active filters:')).toBeInTheDocument();
    expect(screen.getByText(/Source: SRD/)).toBeInTheDocument();
  });

  it('shows active school filter chip', () => {
    mockStore({ spellFilters: { school: 'Evocation' } });

    render(
      <I18nProvider>
        <ActiveFilterChips />
      </I18nProvider>,
    );
    expect(screen.getByText(/School: Evocation/)).toBeInTheDocument();
  });

  it('shows active level filter chip for cantrip', () => {
    mockStore({ spellFilters: { level: 0 } });

    render(
      <I18nProvider>
        <ActiveFilterChips />
      </I18nProvider>,
    );
    expect(screen.getByText(/Level: Cantrip/)).toBeInTheDocument();
  });

  it('shows active level filter chip with ordinal suffix', () => {
    mockStore({ spellFilters: { level: 1 } });

    render(
      <I18nProvider>
        <ActiveFilterChips />
      </I18nProvider>,
    );
    expect(screen.getByText(/Level: 1st/)).toBeInTheDocument();
  });

  it('shows Clear All button', () => {
    mockStore({ spellFilters: { source: 'Homebrew' } });

    render(
      <I18nProvider>
        <ActiveFilterChips />
      </I18nProvider>,
    );
    expect(screen.getByText('Clear All')).toBeInTheDocument();
  });

  it('calls clearFilters when Clear All is clicked', () => {
    mockStore({ spellFilters: { source: 'Homebrew' } });

    render(
      <I18nProvider>
        <ActiveFilterChips />
      </I18nProvider>,
    );
    fireEvent.click(screen.getByText('Clear All'));
    expect(mockClearFilters).toHaveBeenCalledTimes(1);
  });

  it('shows multiple chips for multiple active filters', () => {
    mockStore({ spellFilters: { source: 'SRD', school: 'Evocation', level: 3 } });

    render(
      <I18nProvider>
        <ActiveFilterChips />
      </I18nProvider>,
    );
    expect(screen.getByText(/Source: SRD/)).toBeInTheDocument();
    expect(screen.getByText(/School: Evocation/)).toBeInTheDocument();
    expect(screen.getByText(/Level: 3rd/)).toBeInTheDocument();
  });
});
