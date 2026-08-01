import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider, defaultTranslations } from '@open20/ui';
import { WeaponAttacksList } from '../WeaponAttacksList';
import type { CharacterAttack } from 'open20-core';
import { makeCharacter } from '@/test/fixtures';

// Mock rollWeaponAttack to avoid side effects
vi.mock('@/core/roll-adapter', () => ({
  rollWeaponAttack: vi.fn(),
  rollInitiative: vi.fn(),
  rollSkill: vi.fn(),
  rollAbility: vi.fn(),
  rollSave: vi.fn(),
}));

import { rollWeaponAttack } from '@/core/roll-adapter';

function renderWithI18n(ui: React.ReactElement) {
  return render(
    <I18nProvider initialLocale="en" translationsSet={{ en: defaultTranslations }}>
      {ui}
    </I18nProvider>,
  );
}

function makeAttack(name: string, overrides: Partial<CharacterAttack> = {}): CharacterAttack {
  return {
    name,
    attackBonus: 5,
    damage: '1d8+3 Slashing',
    damageType: 'Slashing',
    abilityUsed: 'Strength',
    mastery: [],
    ...overrides,
  };
}

/** Build a character with specified attacks in combatStats */
function makeCharacterWithAttacks(attacks: CharacterAttack[]) {
  const char = makeCharacter();
  return {
    ...char,
    combatStats: {
      ...char.combatStats,
      attacks: attacks as readonly CharacterAttack[],
    },
  };
}

describe('WeaponAttacksList', () => {
  // --- rendering attacks ---

  it('renders each attack name from the list', () => {
    const char = makeCharacterWithAttacks([
      makeAttack('Longsword'),
      makeAttack('Dagger', {
        damage: '1d4+3 Piercing',
        damageType: 'Piercing',
        abilityUsed: 'Dexterity',
      }),
    ]);
    renderWithI18n(<WeaponAttacksList character={char} />);

    expect(screen.getByText('Longsword')).toBeInTheDocument();
    expect(screen.getByText('Dagger')).toBeInTheDocument();
  });

  it('renders attack count in the header', () => {
    const char = makeCharacterWithAttacks([makeAttack('Longsword'), makeAttack('Shortbow')]);
    renderWithI18n(<WeaponAttacksList character={char} />);

    expect(screen.getByText('(2)')).toBeInTheDocument();
  });

  it('renders "Weapon Attacks" section header', () => {
    const char = makeCharacterWithAttacks([makeAttack('Longsword')]);
    renderWithI18n(<WeaponAttacksList character={char} />);

    expect(screen.getByText('Weapon Attacks')).toBeInTheDocument();
  });

  // --- empty state ---

  it('shows empty state when no attacks', () => {
    const char = makeCharacterWithAttacks([]);
    renderWithI18n(<WeaponAttacksList character={char} />);

    expect(screen.getByText('No weapon attacks')).toBeInTheDocument();
    expect(screen.getByText('Equip a weapon to see attack options here.')).toBeInTheDocument();
  });

  // --- "+ Add Weapon" button ---

  it('renders "+ Add Weapon" placeholder button', () => {
    const char = makeCharacterWithAttacks([makeAttack('Longsword')]);
    renderWithI18n(<WeaponAttacksList character={char} />);

    expect(screen.getByText('Add Weapon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add weapon' })).toBeInTheDocument();
  });

  it('does NOT show "Add Weapon" button when list is empty', () => {
    const char = makeCharacterWithAttacks([]);
    renderWithI18n(<WeaponAttacksList character={char} />);

    expect(screen.queryByText('Add Weapon')).not.toBeInTheDocument();
  });

  // --- roll callback ---

  it('calls rollWeaponAttack when an attack card is rolled (normal)', () => {
    const attack = makeAttack('Longsword');
    const char = makeCharacterWithAttacks([attack]);
    renderWithI18n(<WeaponAttacksList character={char} />);

    fireEvent.click(screen.getByRole('button', { name: 'Roll attack with Longsword' }));
    expect(rollWeaponAttack).toHaveBeenCalledWith(char, attack, 'none');
  });
});
