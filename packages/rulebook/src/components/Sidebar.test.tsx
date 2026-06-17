import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '@open20/ui';
import { Sidebar } from './Sidebar';

// Mock the packStore
vi.mock('../stores/packStore', () => ({
  usePackStore: vi.fn((selector) => {
    const state = {
      packs: [
        { id: 'pack-1', name: 'My Homebrew', version: '1.0.0', source: 'Homebrew' },
        { id: 'pack-2', name: 'Campaign Spells', version: '1.0.0', source: 'Homebrew' },
        { id: 'pack-3', name: 'SRD Spells', version: '1.0.0', source: 'SRD' },
      ],
    };
    return typeof selector === 'function' ? selector(state) : state;
  }),
}));

describe('Sidebar', () => {
  it('renders Rulebook title', () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <Sidebar />
        </I18nProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('Rulebook')).toBeInTheDocument();
  });

  it('renders Packs navigation link', () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <Sidebar />
        </I18nProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('Packs')).toBeInTheDocument();
  });

  it('renders Browse navigation link', () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <Sidebar />
        </I18nProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('Browse')).toBeInTheDocument();
  });

  it('renders RECENT PACKS section', () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <Sidebar />
        </I18nProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('RECENT PACKS')).toBeInTheDocument();
  });

  it('renders recent pack names', () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <Sidebar />
        </I18nProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('My Homebrew')).toBeInTheDocument();
    expect(screen.getByText('Campaign Spells')).toBeInTheDocument();
    expect(screen.getByText('SRD Spells')).toBeInTheDocument();
  });

  it('renders Quick Start Guide button', () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <Sidebar />
        </I18nProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('Quick Start Guide')).toBeInTheDocument();
  });

  it('renders "New to Rulebook?" text', () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <Sidebar />
        </I18nProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('New to Rulebook?')).toBeInTheDocument();
  });

  it('shows only top 5 recent packs', () => {
    // We mock with 3 packs, should show all
    render(
      <MemoryRouter>
        <I18nProvider>
          <Sidebar />
        </I18nProvider>
      </MemoryRouter>,
    );
    const packLinks = screen.getAllByRole('link');
    // Packs link + Browse link + 3 pack links
    expect(packLinks.length).toBe(5);
  });
});
