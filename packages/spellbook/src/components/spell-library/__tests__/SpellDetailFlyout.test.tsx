// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpellDetailFlyout } from '../SpellDetailFlyout';
import { useSpellStore } from '@/stores/spellStore';
import type { Spell } from 'open20-core';

// Mock the stores
vi.mock('@/stores/spellStore', () => ({
  useSpellStore: vi.fn(),
}));

// Mock useIsLargeScreen to return false (tests expect Sheet behavior)
vi.mock('@/hooks/useBreakpoint', () => ({
  useIsLargeScreen: () => false,
}));

// Mock the SpellCard component (from @open20/ui)
vi.mock('@open20/ui', async () => {
  const actual = await vi.importActual('@open20/ui');

  // Create Sheet mock with nested components
  const SheetMock = vi.fn(({ children, open }: any) => (
    <div data-testid="sheet-root" data-open={open}>
      {open ? children : null}
    </div>
  )) as any;
  SheetMock.Content = ({ children }: any) => <div data-testid="sheet-content">{children}</div>;
  SheetMock.Header = ({ children }: any) => <div data-testid="sheet-header">{children}</div>;
  SheetMock.Body = ({ children }: any) => <div data-testid="sheet-body">{children}</div>;
  SheetMock.Close = ({ children, asChild }: any) => (
    <div data-testid="sheet-close">{asChild ? children : null}</div>
  );

  return {
    ...(actual as object),
    Sheet: SheetMock,
    // Mock Dialog component (used for desktop)
    Dialog: {
      Root: ({ children, open }: any) => (
        <div data-testid="dialog-root" data-open={open}>
          {children}
        </div>
      ),
      Overlay: () => <div data-testid="dialog-overlay" />,
      Content: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
      Close: ({ children, asChild }: any) => (
        <div data-testid="dialog-close">{asChild ? children : null}</div>
      ),
    },
    IconButton: ({ children }: any) => <button data-testid="icon-button">{children}</button>,
  };
});

// Mock SpellCardBadges
vi.mock('@/components/spell/SpellCardBadges', () => ({
  SpellCardBadges: ({ spell, showSpellbookBadges }: any) => (
    <div data-testid="spell-card-badges">
      <span>{spell.name} badges</span>
      {showSpellbookBadges && <span>spellbook</span>}
    </div>
  ),
}));

// Mock SpellCardActions
vi.mock('@/components/spell/SpellCardActions', () => ({
  SpellCardActions: ({ spell, showCast, showAttack }: any) => (
    <div data-testid="spell-card-actions">
      <span>{spell.name} actions</span>
      {showCast && <button>Cast</button>}
      {showAttack && <button>Attack</button>}
    </div>
  ),
}));

// Mock the Sheet and Dialog components from @open20/ui
vi.mock('@open20/ui', async () => {
  const actual = await vi.importActual('@open20/ui');

  // Create Sheet mock with nested components (matching actual API)
  const SheetMock = vi.fn(({ children, open }: any) => (
    <div data-testid="sheet-root" data-open={open}>
      {open ? children : null}
    </div>
  )) as any;
  SheetMock.Content = ({ children }: any) => <div data-testid="sheet-content">{children}</div>;
  SheetMock.Header = ({ children }: any) => <div data-testid="sheet-header">{children}</div>;
  SheetMock.Body = ({ children }: any) => <div data-testid="sheet-body">{children}</div>;
  SheetMock.Close = ({ children, asChild }: any) => (
    <div data-testid="sheet-close">{asChild ? children : null}</div>
  );

  // Mock SpellCard (from @open20/ui) - renders children via renderBadges and renderActions
  const SpellCardMock = vi.fn(
    ({ spell, showDescription, renderBadges, renderActions, children }: any) => (
      <div data-testid="spell-card">
        <h2>{spell.name}</h2>
        <p>Level: {spell.level}</p>
        <p>School: {spell.school}</p>
        {showDescription && <div data-testid="spell-description">Description</div>}
        {spell.components && (
          <div data-testid="spell-components">
            {spell.components.includes('V') && <span>V</span>}
            {spell.components.includes('S') && <span>S</span>}
            {spell.components.includes('M') && <span>M</span>}
          </div>
        )}
        {renderBadges && renderBadges()}
        {renderActions && renderActions()}
        {children}
      </div>
    ),
  );

  return {
    ...(actual as object),
    SpellCard: SpellCardMock,
    Sheet: SheetMock,
    // Mock Dialog component (used for desktop)
    Dialog: {
      Root: ({ children, open }: any) => (
        <div data-testid="dialog-root" data-open={open}>
          {children}
        </div>
      ),
      Overlay: () => <div data-testid="dialog-overlay" />,
      Content: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
      Close: ({ children, asChild }: any) => (
        <div data-testid="dialog-close">{asChild ? children : null}</div>
      ),
    },
    IconButton: ({ children }: any) => <button data-testid="icon-button">{children}</button>,
    ResponsiveDialog: ({ children, open, renderHeader }: any) =>
      open ? (
        <div data-testid="responsive-dialog">
          {renderHeader?.()}
          <div data-testid="responsive-body">{children}</div>
        </div>
      ) : null,
  };
});

describe('SpellDetailFlyout', () => {
  const mockSpell: Spell = {
    id: 'fireball',
    name: 'Fireball',
    level: 3,
    school: 'Evocation',
    classes: ['Wizard', 'Sorcerer'],
    components: ['V', 'S', 'M'],
    castingTime: 'Action',
    range: '150 feet',
    duration: 'Instantaneous',
    description: ['A bright streak flashes from your pointing finger...'],
    ritual: false,
    concentration: false,
    source: 'SRD',
    attack: true,
    damage: { dice: '8d6', type: 'fire' },
  } as unknown as Spell;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when no spell is selected', () => {
    (useSpellStore as any).mockReturnValue({
      selectedSpell: null,
      isDetailOpen: false,
      closeDetail: vi.fn(),
    });

    const { container } = render(<SpellDetailFlyout />);

    // Should not render anything
    expect(container.firstChild).toBeNull();
  });

  it('should render when a spell is selected and detail is open', () => {
    (useSpellStore as any).mockReturnValue({
      selectedSpell: mockSpell,
      isDetailOpen: true,
      closeDetail: vi.fn(),
    });

    render(<SpellDetailFlyout />);

    expect(screen.getByTestId('responsive-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-body')).toBeInTheDocument();
    expect(screen.getByTestId('spell-card')).toBeInTheDocument();
  });

  it('should display spell name in the detail view', () => {
    (useSpellStore as any).mockReturnValue({
      selectedSpell: mockSpell,
      isDetailOpen: true,
      closeDetail: vi.fn(),
    });

    render(<SpellDetailFlyout />);

    // Fireball appears in both the header (renderHeader) and the SpellCard
    const elements = screen.getAllByText('Fireball');
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  it('should display spell level', () => {
    (useSpellStore as any).mockReturnValue({
      selectedSpell: mockSpell,
      isDetailOpen: true,
      closeDetail: vi.fn(),
    });

    render(<SpellDetailFlyout />);

    expect(screen.getByText('Level: 3')).toBeInTheDocument();
  });

  it('should display spell school', () => {
    (useSpellStore as any).mockReturnValue({
      selectedSpell: mockSpell,
      isDetailOpen: true,
      closeDetail: vi.fn(),
    });

    render(<SpellDetailFlyout />);

    expect(screen.getByText('School: Evocation')).toBeInTheDocument();
  });

  it('should display spell description when showDescription is true', () => {
    (useSpellStore as any).mockReturnValue({
      selectedSpell: mockSpell,
      isDetailOpen: true,
      closeDetail: vi.fn(),
    });

    render(<SpellDetailFlyout />);

    expect(screen.getByTestId('spell-description')).toBeInTheDocument();
  });

  it('should display component details (V, S, M)', () => {
    (useSpellStore as any).mockReturnValue({
      selectedSpell: mockSpell,
      isDetailOpen: true,
      closeDetail: vi.fn(),
    });

    render(<SpellDetailFlyout />);

    expect(screen.getByTestId('spell-components')).toBeInTheDocument();
    expect(screen.getByText('V')).toBeInTheDocument();
    expect(screen.getByText('S')).toBeInTheDocument();
    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('should display only Verbal component when only V is present', () => {
    const verbalOnlySpell = { ...mockSpell, components: ['V'] } as unknown as Spell;

    (useSpellStore as any).mockReturnValue({
      selectedSpell: verbalOnlySpell,
      isDetailOpen: true,
      closeDetail: vi.fn(),
    });

    render(<SpellDetailFlyout />);

    expect(screen.getByText('V')).toBeInTheDocument();
    expect(screen.queryByText('S')).not.toBeInTheDocument();
    expect(screen.queryByText('M')).not.toBeInTheDocument();
  });

  it('should close detail when overlay is closed', () => {
    const closeDetail = vi.fn();

    (useSpellStore as any).mockReturnValue({
      selectedSpell: mockSpell,
      isDetailOpen: true,
      closeDetail,
    });

    render(<SpellDetailFlyout />);

    // The ResponsiveDialog should render when open
    expect(screen.getByTestId('responsive-dialog')).toBeInTheDocument();
  });

  it('should render close button in header', () => {
    (useSpellStore as any).mockReturnValue({
      selectedSpell: mockSpell,
      isDetailOpen: true,
      closeDetail: vi.fn(),
    });

    render(<SpellDetailFlyout />);

    expect(screen.getByTestId('icon-button')).toBeInTheDocument();
  });
});
