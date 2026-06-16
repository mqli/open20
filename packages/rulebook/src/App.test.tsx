import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nProvider } from '@open20/ui';
import { PackList } from './pages/PackList';

// Mock the packStore module
vi.mock('./stores/packStore', () => ({
  usePackStore: vi.fn((selector) => {
    const state = {
      packs: [],
      loading: false,
      error: null,
      fetchPacks: vi.fn(),
      createAndSavePack: vi.fn(),
      deletePackAndStorage: vi.fn(),
      togglePackEnabled: vi.fn(),
      isPackEnabled: vi.fn(() => true),
    };
    return typeof selector === 'function' ? selector(state) : state;
  }),
}));

describe('PackList', () => {
  it('renders content packs heading', () => {
    render(
      <I18nProvider>
        <PackList />
      </I18nProvider>,
    );
    expect(screen.getByText('Content Packs')).toBeInTheDocument();
  });

  it('renders empty state when no packs', () => {
    render(
      <I18nProvider>
        <PackList />
      </I18nProvider>,
    );
    expect(screen.getByText('Welcome to Rulebook')).toBeInTheDocument();
  });
});
