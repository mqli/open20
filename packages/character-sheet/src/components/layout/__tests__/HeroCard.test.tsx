import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroCard } from '../HeroCard';
import { makeCharacter } from '@/test/fixtures';

describe('HeroCard', () => {
  // --- basic rendering ---

  it('renders character name', () => {
    const char = makeCharacter({ name: 'Gandalf' });
    render(<HeroCard character={char} />);
    expect(screen.getByText('Gandalf')).toBeInTheDocument();
  });

  it('renders species and level/class', () => {
    const char = makeCharacter({ speciesId: 'Elf', classId: 'Wizard', classLevel: 5 });
    render(<HeroCard character={char} />);
    // Species "Elf" and "Lvl 5 Wizard" are in the identity subtitle line
    const subtitle = screen.getByText(
      (_content: string, element: Element | null) =>
        element?.tagName === 'P' &&
        element?.textContent?.includes('Elf') === true &&
        element?.textContent?.includes('Lvl') === true &&
        element?.textContent?.includes('Wizard') === true,
    );
    expect(subtitle).toBeInTheDocument();
  });

  it('renders multi-class format', () => {
    const char = makeCharacter({ classId: 'Wizard', classLevel: 3 });
    // Patch a second class onto the character, copying the real shape from the existing class
    const existingClass = char.classes[0];
    const multiclass = {
      ...char,
      classes: [existingClass, { ...existingClass, classId: 'Fighter', level: 2 }],
    };
    render(<HeroCard character={multiclass} />);
    // "Lvl 5 Wizard / Fighter"
    expect(screen.getByText(/Fighter/)).toBeInTheDocument();
    expect(screen.getByText(/Wizard/)).toBeInTheDocument();
  });

  it('renders HP current/max', () => {
    const char = makeCharacter();
    render(<HeroCard character={char} />);
    expect(screen.getByText(`${char.hitPoints.current}/${char.hitPoints.max}`)).toBeInTheDocument();
  });

  it('renders temp HP badge when temporary > 0', () => {
    const char = makeCharacter();
    const withTemp = {
      ...char,
      hitPoints: { ...char.hitPoints, temporary: 10 },
    };
    render(<HeroCard character={withTemp} />);
    // The +10 badge should be visible in the HP area
    expect(screen.getByText('+10')).toBeInTheDocument();
  });

  it('hides temp HP when temporary is 0', () => {
    const char = makeCharacter();
    render(<HeroCard character={char} />);
    // Should not find any temp HP badge text matching "+N"
    const hpRow = screen.getByRole('status');
    expect(hpRow.textContent).not.toMatch(/^\+\d/);
  });

  it('applies className prop to root Surface', () => {
    const char = makeCharacter();
    const { container } = render(<HeroCard character={char} className="test-class-123" />);
    // The root Surface element should carry the custom class
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain('test-class-123');
  });

  it('handles 0 classes without crashing', () => {
    const char = makeCharacter();
    const emptyClasses = { ...char, classes: [] as typeof char.classes };
    render(<HeroCard character={emptyClasses} />);
    // Should show fallback text "No class"
    expect(screen.getByText(/No class/)).toBeInTheDocument();
  });

  it('has aria-live on HP area and aria-hidden on icons', () => {
    const char = makeCharacter();
    render(<HeroCard character={char} />);
    // HP row should have role="status" and aria-live="polite"
    const hpRow = screen.getByRole('status');
    expect(hpRow).toHaveAttribute('aria-live', 'polite');
    // Check that icons rendered via lucide are aria-hidden
    const heartIcon = hpRow.querySelector('svg');
    expect(heartIcon).toBeInTheDocument();
    expect(heartIcon!).toHaveAttribute('aria-hidden', 'true');
  });
});
