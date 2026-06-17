import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { I18nProvider } from '@open20/ui';
import { PackDetail } from './PackDetail';

// Mock packDetailStore
vi.mock('../stores/packDetailStore', () => ({
  usePackDetailStore: vi.fn(),
}));

// Mock child components
vi.mock('../components/ContentTable', () => ({
  ContentTable: () => <div data-testid="content-table">ContentTable</div>,
}));

vi.mock('../components/InlineEditPanel', () => ({
  InlineEditPanel: () => <div data-testid="inline-edit-panel">InlineEditPanel</div>,
}));

vi.mock('../components/AddContentButton', () => ({
  AddContentButton: () => <div data-testid="add-content-button">AddContentButton</div>,
}));

const getPackDetailStore = async () => {
  const mod = await import('../stores/packDetailStore');
  return mod.usePackDetailStore;
};

describe('PackDetail', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const usePackDetailStore = await getPackDetailStore();
    vi.mocked(usePackDetailStore).mockReturnValue({
      pack: {
        meta: { id: 'test-pack', name: 'Test Pack', version: '1.0.0', source: 'Homebrew' },
        spells: [],
        monsters: [],
        species: [],
      },
      loading: false,
      error: null,
      activeTab: 'all',
      selectedIds: [],
      inlineEditSpell: null,
      isBuiltIn: false,
      loadPack: vi.fn(),
      setActiveTab: vi.fn(),
      toggleSelectedId: vi.fn(),
      selectAll: vi.fn(),
      setInlineEditSpell: vi.fn(),
    } as any);
  });

  const renderPackDetail = () => {
    return render(
      <MemoryRouter initialEntries={['/rulebook/packs/test-pack']}>
        <I18nProvider>
          <Routes>
            <Route path="/rulebook/packs/:id" element={<PackDetail />} />
          </Routes>
        </I18nProvider>
      </MemoryRouter>,
    );
  };

  it('renders pack name', () => {
    renderPackDetail();
    expect(screen.getByText('Test Pack')).toBeInTheDocument();
  });

  it('renders back to packs link', () => {
    renderPackDetail();
    expect(screen.getByText('Back to Packs')).toBeInTheDocument();
  });

  it('renders pack meta info', () => {
    renderPackDetail();
    expect(screen.getByText(/ID: test-pack/)).toBeInTheDocument();
    expect(screen.getByText(/v1\.0\.0/)).toBeInTheDocument();
  });

  it('renders Export All and Validate All buttons', () => {
    renderPackDetail();
    expect(screen.getByText('Export All')).toBeInTheDocument();
    expect(screen.getByText('Validate All')).toBeInTheDocument();
  });

  it('renders tabs with content counts', () => {
    renderPackDetail();
    // "All (0)" appears as a tab trigger
    expect(screen.getByText(/All \(0\)/)).toBeInTheDocument();
    expect(screen.getByText(/Spells \(0\)/)).toBeInTheDocument();
    expect(screen.getByText(/Monsters \(0\)/)).toBeInTheDocument();
    expect(screen.getByText(/Species \(0\)/)).toBeInTheDocument();
  });

  it('renders content table', () => {
    renderPackDetail();
    expect(screen.getByTestId('content-table')).toBeInTheDocument();
  });
});
