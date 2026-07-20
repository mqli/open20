import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nProvider } from '@open20/ui';
import { InlineEditPanel } from './InlineEditPanel';

// Mock Sheet from @open20/ui - need to provide sub-components
vi.mock('@open20/ui', async () => {
  const actual = await vi.importActual('@open20/ui');
  return {
    ...actual,
    Sheet: Object.assign(
      ({ open, children }: any) => {
        if (!open) return null;
        return <div data-testid="sheet">{children}</div>;
      },
      {
        Root: ({ open, onOpenChange: _onOpenChange, children }: any) => {
          if (!open) return null;
          return <div data-testid="sheet-root">{children}</div>;
        },
        Content: ({ children, side: _side, className }: any) => (
          <div data-testid="sheet-content" className={className}>
            {children}
          </div>
        ),
        Header: ({ children, className }: any) => (
          <div data-testid="sheet-header" className={className}>
            {children}
          </div>
        ),
        Title: ({ children }: any) => <h2 data-testid="sheet-title">{children}</h2>,
        Body: ({ children }: any) => <div data-testid="sheet-body">{children}</div>,
      },
    ),
  };
});

const mockSpell = {
  id: 'spell-1',
  name: 'Fireball',
  level: 3 as const,
  school: 'Evocation' as const,
  classes: ['Wizard', 'Sorcerer'],
  source: 'SRD',
  description: ['A bright streak flashes...', 'Each creature must make a Dex save.'],
  castingTime: '1 action',
  range: '150 feet',
  components: ['V', 'S', 'M'] as const,
  duration: 'Instantaneous',
  concentration: false,
  ritual: false,
};

describe('InlineEditPanel', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  it('returns null when spell is null', () => {
    const { container } = render(
      <I18nProvider>
        <InlineEditPanel open={true} spell={null} onClose={mockOnClose} onSave={mockOnSave} />
      </I18nProvider>,
    );
    expect(container.firstChild).toBeNull();
  });

  it('returns null when not open', () => {
    const { container } = render(
      <I18nProvider>
        <InlineEditPanel open={false} spell={mockSpell} onClose={mockOnClose} onSave={mockOnSave} />
      </I18nProvider>,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders edit title with spell name when open', () => {
    render(
      <I18nProvider>
        <InlineEditPanel open={true} spell={mockSpell} onClose={mockOnClose} onSave={mockOnSave} />
      </I18nProvider>,
    );
    expect(screen.getByText('Edit: Fireball')).toBeInTheDocument();
  });

  it('renders description textarea', () => {
    render(
      <I18nProvider>
        <InlineEditPanel open={true} spell={mockSpell} onClose={mockOnClose} onSave={mockOnSave} />
      </I18nProvider>,
    );
    // There are 2 textboxes: the description textarea and the school input
    const textboxes = screen.getAllByRole('textbox');
    const textarea = textboxes.find((el) => el.tagName === 'TEXTAREA');
    expect(textarea).toBeInTheDocument();
  });

  it('renders level select', () => {
    render(
      <I18nProvider>
        <InlineEditPanel open={true} spell={mockSpell} onClose={mockOnClose} onSave={mockOnSave} />
      </I18nProvider>,
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders school as read-only input', () => {
    render(
      <I18nProvider>
        <InlineEditPanel open={true} spell={mockSpell} onClose={mockOnClose} onSave={mockOnSave} />
      </I18nProvider>,
    );
    const schoolInput = screen.getByDisplayValue('Evocation');
    expect(schoolInput).toBeInTheDocument();
    expect(schoolInput).toHaveAttribute('readonly');
  });

  it('renders classes display', () => {
    render(
      <I18nProvider>
        <InlineEditPanel open={true} spell={mockSpell} onClose={mockOnClose} onSave={mockOnSave} />
      </I18nProvider>,
    );
    expect(screen.getByText('Wizard, Sorcerer')).toBeInTheDocument();
  });

  it('renders Save and Open Full Editor buttons', () => {
    render(
      <I18nProvider>
        <InlineEditPanel open={true} spell={mockSpell} onClose={mockOnClose} onSave={mockOnSave} />
      </I18nProvider>,
    );
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Open Full Editor →')).toBeInTheDocument();
  });
});
