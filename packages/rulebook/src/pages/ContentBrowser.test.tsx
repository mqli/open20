import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '@open20/ui';
import { ContentBrowser } from './ContentBrowser';

// Mock the browserStore
vi.mock('../stores/browserStore', () => ({
  useBrowserStore: vi.fn(),
}));

// Mock the child components
vi.mock('../components/FilterSidebar', () => ({
  FilterSidebar: () => <div data-testid="filter-sidebar">FilterSidebar</div>,
}));

vi.mock('../components/ActiveFilterChips', () => ({
  ActiveFilterChips: () => <div data-testid="active-filter-chips">ActiveFilterChips</div>,
}));

vi.mock('../components/ContentCard', () => ({
  ContentCard: ({ spell, onViewDetail }: any) => (
    <div data-testid="content-card" onClick={() => onViewDetail(spell)}>
      {spell.name}
    </div>
  ),
}));

vi.mock('../components/DetailDrawer', () => ({
  DetailDrawer: ({ spell, onClose }: any) => (
    <div data-testid="detail-drawer">
      DetailDrawer: {spell.name}
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

const getBrowserStore = async () => {
  const mod = await import('../stores/browserStore');
  return mod.useBrowserStore;
};

describe('ContentBrowser', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const useBrowserStore = await getBrowserStore();
    vi.mocked(useBrowserStore).mockReturnValue({
      filters: {},
      results: [
        {
          id: 'spell-1',
          name: 'Fireball',
          level: 3,
          school: 'Evocation',
          source: 'SRD',
          description: ['A bright streak...'],
          classes: ['Wizard'],
          castingTime: '1 action',
          range: '150 feet',
          components: ['V', 'S', 'M'],
          duration: 'Instantaneous',
          concentration: false,
          ritual: false,
        },
        {
          id: 'spell-2',
          name: 'Magic Missile',
          level: 1,
          school: 'Evocation',
          source: 'SRD',
          description: ['Three glowing darts...'],
          classes: ['Wizard'],
          castingTime: '1 action',
          range: '120 feet',
          components: ['V', 'S'],
          duration: 'Instantaneous',
          concentration: false,
          ritual: false,
        },
      ],
      loading: false,
      error: null,
      setFilter: vi.fn(),
      clearFilters: vi.fn(),
      searchSpells: vi.fn(),
    } as any);
  });

  const renderBrowser = () => {
    return render(
      <MemoryRouter>
        <I18nProvider>
          <ContentBrowser />
        </I18nProvider>
      </MemoryRouter>,
    );
  };

  it('renders read-only mode indicator', () => {
    renderBrowser();
    expect(screen.getByText(/Read-only mode/)).toBeInTheDocument();
  });

  it('renders search input', () => {
    renderBrowser();
    expect(screen.getByPlaceholderText('Search spells...')).toBeInTheDocument();
  });

  it('renders spell results', () => {
    renderBrowser();
    expect(screen.getByText('Fireball')).toBeInTheDocument();
    expect(screen.getByText('Magic Missile')).toBeInTheDocument();
  });

  it('shows result count', () => {
    renderBrowser();
    expect(screen.getByText('Showing 2 results')).toBeInTheDocument();
  });

  it('renders grid and list view toggle buttons', () => {
    renderBrowser();
    expect(screen.getByTitle('List view')).toBeInTheDocument();
    expect(screen.getByTitle('Grid view')).toBeInTheDocument();
  });

  it('renders filter sidebar', () => {
    renderBrowser();
    expect(screen.getByTestId('filter-sidebar')).toBeInTheDocument();
  });
});
