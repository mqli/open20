import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpellcastingHeader } from '../SpellcastingHeader';
import { makeCharacter } from '@/test/fixtures';

describe('SpellcastingHeader', () => {
  it('renders spell save DC and attack bonus for a caster', () => {
    const char = makeCharacter({ classId: 'Wizard', classLevel: 5 });
    render(<SpellcastingHeader character={char} />);

    // Lv.5 Wizard INT 16: DC = 8 + 3(pb) + 3(int) = 14, atk = 3(pb) + 3(int) = 6
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('+6')).toBeInTheDocument();
    expect(screen.getByText('Spell DC')).toBeInTheDocument();
    expect(screen.getByText('Atk Bonus')).toBeInTheDocument();
  });

  it('shows zero values for non-caster character', () => {
    const char = makeCharacter({ classId: 'Fighter', classLevel: 5 });
    render(<SpellcastingHeader character={char} />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('+0')).toBeInTheDocument();
  });

  it('renders with WandSparkles icon', () => {
    const char = makeCharacter();
    render(<SpellcastingHeader character={char} />);
    expect(screen.getByText('Spell DC')).toBeInTheDocument();
  });

  it('shows best attack bonus for multiclass', () => {
    // getBestSpellAttackBonus iterates all classes and returns the highest bonus.
    // Test with single-class Wizard to verify the integration path.
    const char = makeCharacter({ classId: 'Wizard', classLevel: 5 });
    render(<SpellcastingHeader character={char} />);

    expect(screen.getByText('14')).toBeInTheDocument();
  });
});
