import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nProvider } from '@open20/ui';
import { FilterSidebar } from './FilterSidebar';

// Mock the browserStore
vi.mock('../stores/browserStore', () => ({
  useBrowserStore: vi.fn((selector) => {
    const state = {
      filters: {},
      setFilter: vi.fn(),
      clearFilters: vi.fn(),
    };
    return typeof selector === 'function' ? selector(state) : state;
  }),
}));

describe('FilterSidebar', () => {
  it('renders Filters heading', () => {
    render(
      <I18nProvider>
        <FilterSidebar />
      </I18nProvider>,
    );
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('renders Source filter section', () => {
    render(
      <I18nProvider>
        <FilterSidebar />
      </I18nProvider>,
    );
    expect(screen.getByText('Source')).toBeInTheDocument();
    expect(screen.getByText('SRD')).toBeInTheDocument();
    expect(screen.getByText('Homebrew')).toBeInTheDocument();
  });

  it('renders Level filter section', () => {
    render(
      <I18nProvider>
        <FilterSidebar />
      </I18nProvider>,
    );
    expect(screen.getByText('Level')).toBeInTheDocument();
    expect(screen.getByText('Cantrip')).toBeInTheDocument();
    expect(screen.getByText('1st')).toBeInTheDocument();
    expect(screen.getByText('2nd')).toBeInTheDocument();
    expect(screen.getByText('3rd')).toBeInTheDocument();
    expect(screen.getByText('4th+')).toBeInTheDocument();
  });

  it('renders School filter section', () => {
    render(
      <I18nProvider>
        <FilterSidebar />
      </I18nProvider>,
    );
    expect(screen.getByText('School')).toBeInTheDocument();
    expect(screen.getByText('Abjuration')).toBeInTheDocument();
    expect(screen.getByText('Evocation')).toBeInTheDocument();
    expect(screen.getByText('Necromancy')).toBeInTheDocument();
    expect(screen.getByText('Transmutation')).toBeInTheDocument();
  });

  it('renders all 8 spell schools', () => {
    render(
      <I18nProvider>
        <FilterSidebar />
      </I18nProvider>,
    );
    const schools = [
      'Abjuration',
      'Conjuration',
      'Divination',
      'Enchantment',
      'Evocation',
      'Illusion',
      'Necromancy',
      'Transmutation',
    ];
    schools.forEach((school) => {
      expect(screen.getByText(school)).toBeInTheDocument();
    });
  });

  it('does not show Clear All when no filters are active', () => {
    render(
      <I18nProvider>
        <FilterSidebar />
      </I18nProvider>,
    );
    expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
  });

  it('renders radio inputs for source and school filters', () => {
    render(
      <I18nProvider>
        <FilterSidebar />
      </I18nProvider>,
    );
    // 2 source (SRD, Homebrew) + 8 school = 10 radio inputs
    const radioInputs = screen.getAllByRole('radio');
    expect(radioInputs.length).toBe(10);
  });

  it('renders checkbox inputs for level filter', () => {
    render(
      <I18nProvider>
        <FilterSidebar />
      </I18nProvider>,
    );
    const levelCheckboxes = screen.getAllByRole('checkbox');
    expect(levelCheckboxes.length).toBe(5); // Cantrip, 1st, 2nd, 3rd, 4th+
  });
});
