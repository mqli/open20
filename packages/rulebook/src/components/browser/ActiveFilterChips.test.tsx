import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider } from '@open20/ui';
import { ActiveFilterChips } from './ActiveFilterChips';

const mockSetFilter = vi.fn();
const mockClearFilters = vi.fn();

// Mock the browserStore - must be before any imports that use it
vi.mock('../../stores/browserStore', () => ({
  useBrowserStore: vi.fn(),
}));

import { useBrowserStore } from '../../stores/browserStore';

describe('ActiveFilterChips', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when no filters are active', () => {
    vi.mocked(useBrowserStore).mockReturnValue({
      filters: {},
      setFilter: mockSetFilter,
      clearFilters: mockClearFilters,
    } as any);

    const { container } = render(
      <I18nProvider>
        <ActiveFilterChips />
      </I18nProvider>,
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows active source filter chip', () => {
    vi.mocked(useBrowserStore).mockReturnValue({
      filters: { source: 'SRD' },
      setFilter: mockSetFilter,
      clearFilters: mockClearFilters,
    } as any);

    render(
      <I18nProvider>
        <ActiveFilterChips />
      </I18nProvider>,
    );
    expect(screen.getByText('Active filters:')).toBeInTheDocument();
    expect(screen.getByText(/Source: SRD/)).toBeInTheDocument();
  });

  it('shows active school filter chip', () => {
    vi.mocked(useBrowserStore).mockReturnValue({
      filters: { school: 'Evocation' },
      setFilter: mockSetFilter,
      clearFilters: mockClearFilters,
    } as any);

    render(
      <I18nProvider>
        <ActiveFilterChips />
      </I18nProvider>,
    );
    expect(screen.getByText(/School: Evocation/)).toBeInTheDocument();
  });

  it('shows active level filter chip for cantrip', () => {
    vi.mocked(useBrowserStore).mockReturnValue({
      filters: { level: 0 },
      setFilter: mockSetFilter,
      clearFilters: mockClearFilters,
    } as any);

    render(
      <I18nProvider>
        <ActiveFilterChips />
      </I18nProvider>,
    );
    expect(screen.getByText(/Level: Cantrip/)).toBeInTheDocument();
  });

  it('shows active level filter chip with ordinal suffix', () => {
    vi.mocked(useBrowserStore).mockReturnValue({
      filters: { level: 1 },
      setFilter: mockSetFilter,
      clearFilters: mockClearFilters,
    } as any);

    render(
      <I18nProvider>
        <ActiveFilterChips />
      </I18nProvider>,
    );
    expect(screen.getByText(/Level: 1st/)).toBeInTheDocument();
  });

  it('shows Clear All button', () => {
    vi.mocked(useBrowserStore).mockReturnValue({
      filters: { source: 'Homebrew' },
      setFilter: mockSetFilter,
      clearFilters: mockClearFilters,
    } as any);

    render(
      <I18nProvider>
        <ActiveFilterChips />
      </I18nProvider>,
    );
    expect(screen.getByText('Clear All')).toBeInTheDocument();
  });

  it('calls clearFilters when Clear All is clicked', () => {
    vi.mocked(useBrowserStore).mockReturnValue({
      filters: { source: 'Homebrew' },
      setFilter: mockSetFilter,
      clearFilters: mockClearFilters,
    } as any);

    render(
      <I18nProvider>
        <ActiveFilterChips />
      </I18nProvider>,
    );
    fireEvent.click(screen.getByText('Clear All'));
    expect(mockClearFilters).toHaveBeenCalledTimes(1);
  });

  it('shows multiple chips for multiple active filters', () => {
    vi.mocked(useBrowserStore).mockReturnValue({
      filters: { source: 'SRD', school: 'Evocation', level: 3 },
      setFilter: mockSetFilter,
      clearFilters: mockClearFilters,
    } as any);

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
