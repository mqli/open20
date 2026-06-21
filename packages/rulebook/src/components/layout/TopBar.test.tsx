import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '@open20/ui';
import { TopBar } from './TopBar';

describe('TopBar', () => {
  it('renders breadcrumb from current path', () => {
    render(
      <MemoryRouter initialEntries={['/rulebook/packs/test-pack']}>
        <I18nProvider>
          <TopBar />
        </I18nProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('rulebook > packs > test-pack')).toBeInTheDocument();
  });

  it('renders empty breadcrumb at root', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <I18nProvider>
          <TopBar />
        </I18nProvider>
      </MemoryRouter>,
    );
    // At root, the breadcrumb div is empty (pathname.split('/').filter(Boolean).join(' > ') = '')
    // The div still renders but with empty text
    const breadcrumbDiv = document.querySelector('.text-sm.text-muted-foreground');
    expect(breadcrumbDiv).toBeInTheDocument();
    expect(breadcrumbDiv?.textContent).toBe('');
  });

  it('renders search and settings buttons', () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <TopBar />
        </I18nProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTitle('Search content')).toBeInTheDocument();
    expect(screen.getByTitle('Settings')).toBeInTheDocument();
  });

  it('renders breadcrumb for browse path', () => {
    render(
      <MemoryRouter initialEntries={['/rulebook/browse']}>
        <I18nProvider>
          <TopBar />
        </I18nProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('rulebook > browse')).toBeInTheDocument();
  });

  it('renders breadcrumb for editor path', () => {
    render(
      <MemoryRouter initialEntries={['/rulebook/editor/my-pack/spell']}>
        <I18nProvider>
          <TopBar />
        </I18nProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('rulebook > editor > my-pack > spell')).toBeInTheDocument();
  });
});
