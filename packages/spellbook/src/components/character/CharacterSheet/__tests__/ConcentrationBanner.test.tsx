// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConcentrationBanner } from '../ConcentrationBanner';

// Mock the spell service
vi.mock('@/core/spell-service', () => ({
  spellService: {
    getSpell: vi.fn((id: string) => {
      const spells: Record<string, { name: string }> = {
        fireball: { name: 'Fireball' },
        haste: { name: 'Haste' },
      };
      return spells[id] || null;
    }),
  },
}));

// Mock the translations
vi.mock('@/i18n', () => ({
  useTranslation: () => (key: string) => {
    const translations: Record<string, string> = {
      concentrationBanner: 'You are concentrating on:',
    };
    return translations[key] || key;
  },
}));

// Mock the UI components
vi.mock('@open20/ui', async () => {
  const actual = await vi.importActual('@open20/ui');
  return {
    ...(actual as object),
    ConcentrationIcon: ({ size }: any) => (
      <svg
        data-testid="concentration-icon"
        width={size === 'md' ? 24 : 16}
        height={size === 'md' ? 24 : 16}
      />
    ),
    Surface: ({ children, variant, padding, className }: any) => (
      <div
        data-testid="surface"
        data-variant={variant}
        data-padding={padding}
        className={className}
      >
        {children}
      </div>
    ),
    Text: ({ children, variant, className, weight }: any) => (
      <span data-testid="text" data-variant={variant} data-weight={weight} className={className}>
        {children}
      </span>
    ),
  };
});

describe('ConcentrationBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render when concentratingSpellId is provided', () => {
    render(<ConcentrationBanner concentratingSpellId="fireball" />);

    // There are two surfaces (icon + banner), get the banner (second one with amber classes)
    const surfaces = screen.getAllByTestId('surface');
    expect(surfaces.length).toBeGreaterThan(0);
    expect(surfaces[0]).toBeInTheDocument();
  });

  it('should display concentration banner text', () => {
    render(<ConcentrationBanner concentratingSpellId="fireball" />);

    expect(screen.getByText('You are concentrating on:')).toBeInTheDocument();
  });

  it('should display spell name when spell is found', () => {
    render(<ConcentrationBanner concentratingSpellId="fireball" />);

    expect(screen.getByText('Fireball')).toBeInTheDocument();
  });

  it('should display formatted spell ID when spell is not found', () => {
    render(<ConcentrationBanner concentratingSpellId="unknown-spell" />);

    // Should format "unknown-spell" to "unknown spell"
    expect(screen.getByText('unknown spell')).toBeInTheDocument();
  });

  it('should render ConcentrationIcon', () => {
    render(<ConcentrationBanner concentratingSpellId="fireball" />);

    expect(screen.getByTestId('concentration-icon')).toBeInTheDocument();
  });

  it('should apply correct CSS classes for amber styling', () => {
    render(<ConcentrationBanner concentratingSpellId="fireball" />);

    // The main banner surface should have amber classes
    // Icon surface has 'bg-amber-500/15', banner surface has 'bg-amber-500/10'
    const surfaces = screen.getAllByTestId('surface');
    const bannerSurface =
      surfaces.find((s) => s.className.includes('bg-amber-500/10')) || surfaces[1];
    expect(bannerSurface).toHaveClass('bg-amber-500/10');
    expect(bannerSurface).toHaveClass('border-amber-500/25');
  });

  it('should render spell name with bold weight', () => {
    render(<ConcentrationBanner concentratingSpellId="fireball" />);

    const spellName = screen.getByText('Fireball');
    expect(spellName).toHaveAttribute('data-weight', 'bold');
  });

  it('should truncate long spell names', () => {
    render(<ConcentrationBanner concentratingSpellId="fireball" />);

    const spellName = screen.getByText('Fireball');
    expect(spellName).toHaveClass('truncate');
  });

  it('should render label with amber color', () => {
    render(<ConcentrationBanner concentratingSpellId="fireball" />);

    const label = screen.getByText('You are concentrating on:');
    expect(label).toHaveClass('text-amber-600');
  });
});
