import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider, defaultTranslations } from '@open20/ui';
import { PreparedSpellList } from '../PreparedSpellList';
import { initContent } from '@/core/content-resolver';
import { makeCharacter } from '@/test/fixtures';

/** Wrapper that provides I18nProvider (required by @open20/ui components like EmptyState). */
function renderWithI18n(ui: React.ReactElement) {
  return render(
    <I18nProvider initialLocale="en" translationsSet={{ en: defaultTranslations }}>
      {ui}
    </I18nProvider>,
  );
}

describe('PreparedSpellList', () => {
  beforeEach(() => {
    initContent();
  });

  it('shows empty state when no spells are prepared', () => {
    const char = makeCharacter();
    const onCastSpell = vi.fn();

    // Fresh Wizard has empty prepared spells by default
    renderWithI18n(<PreparedSpellList character={char} onCastSpell={onCastSpell} />);

    expect(screen.getByText('No Spells')).toBeInTheDocument();
  });

  it('shows the Prepared/Known toggle', () => {
    const char = makeCharacter();
    const onCastSpell = vi.fn();

    renderWithI18n(<PreparedSpellList character={char} onCastSpell={onCastSpell} />);

    expect(screen.getByRole('button', { name: /showing prepared spells/i })).toBeInTheDocument();
  });

  it('toggles between Prepared and Known views', () => {
    const char = makeCharacter();
    const onCastSpell = vi.fn();

    renderWithI18n(<PreparedSpellList character={char} onCastSpell={onCastSpell} />);

    const toggle = screen.getByRole('button', { name: /showing prepared spells/i });
    fireEvent.click(toggle);

    // Should now show "Showing known spells"
    expect(screen.getByRole('button', { name: /showing known spells/i })).toBeInTheDocument();
  });

  it('renders spells when character has prepared spells', () => {
    const char = makeCharacter({
      preparedSpells: ['fireball', 'magic-missile'],
      knownCantrips: ['fire-bolt', 'light'],
    });
    const onCastSpell = vi.fn();

    renderWithI18n(<PreparedSpellList character={char} onCastSpell={onCastSpell} />);

    // Should show the class name and spell names
    expect(screen.getByText('Cantrips')).toBeInTheDocument();
    expect(screen.getByText('Fire Bolt')).toBeInTheDocument();
  });

  it('calls onCastSpell when a Cast button is clicked', () => {
    const char = makeCharacter({
      preparedSpells: ['magic-missile'],
    });
    const onCastSpell = vi.fn();

    renderWithI18n(<PreparedSpellList character={char} onCastSpell={onCastSpell} />);

    const castButton = screen.getByLabelText('Cast Magic Missile');
    fireEvent.click(castButton);

    expect(onCastSpell).toHaveBeenCalledWith('magic-missile', 1);
  });
});
