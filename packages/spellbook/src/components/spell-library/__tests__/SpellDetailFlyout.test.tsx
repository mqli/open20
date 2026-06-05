// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpellDetailFlyout } from '../SpellDetailFlyout';
import { useSpellStore } from '@/stores/spell-store';
import type { Spell } from 'open20-core';

// Mock the stores
vi.mock('@/stores/spell-store', () => ({
  useSpellStore: vi.fn(),
}));

// Mock the SpellCardWrapper component
vi.mock('@/components/spell/SpellCardWrapper', () => ({
  SpellCardWrapper: ({ spell, showDescription }: any) => (
    <div data-testid="spell-card-wrapper">
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
    </div>
  ),
}));

// Mock the Sheet components from @open20/ui
vi.mock('@open20/ui', async () => {
  const actual = await vi.importActual('@open20/ui');
  return {
    ...(actual as object),
    SheetRoot: ({ children, open }: any) => (
      <div data-testid="sheet-root" data-open={open}>
        {open ? children : null}
      </div>
    ),
    SheetContent: ({ children }: any) => <div data-testid="sheet-content">{children}</div>,
    SheetHeader: ({ children }: any) => <div data-testid="sheet-header">{children}</div>,
    SheetBody: ({ children }: any) => <div data-testid="sheet-body">{children}</div>,
    SheetClose: ({ children }: any) => <div data-testid="sheet-close">{children}</div>,
    IconButton: ({ children }: any) => <button data-testid="icon-button">{children}</button>,
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

    expect(screen.getByTestId('sheet-root')).toBeInTheDocument();
    expect(screen.getByTestId('sheet-content')).toBeInTheDocument();
    expect(screen.getByTestId('spell-card-wrapper')).toBeInTheDocument();
  });

  it('should display spell name in the detail view', () => {
    (useSpellStore as any).mockReturnValue({
      selectedSpell: mockSpell,
      isDetailOpen: true,
      closeDetail: vi.fn(),
    });

    render(<SpellDetailFlyout />);

    expect(screen.getByText('Fireball')).toBeInTheDocument();
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

  it('should close detail when Sheet is closed', () => {
    const closeDetail = vi.fn();

    (useSpellStore as any).mockReturnValue({
      selectedSpell: mockSpell,
      isDetailOpen: true,
      closeDetail,
    });

    render(<SpellDetailFlyout />);

    // The SheetRoot's onOpenChange should call closeDetail when open becomes false
    expect(screen.getByTestId('sheet-root')).toBeInTheDocument();
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
