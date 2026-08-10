// HitDiceRow.test.tsx — T-205

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider, defaultTranslations } from '@open20/ui';
import { useCharacterStore } from '@/stores/characterStore';
import { initContent, resolveDeps } from '@/core/content-resolver';
import { makeCharacter } from '@/test/fixtures';
import { HitDiceRow } from '../HitDiceRow';
import { shortRest } from 'open20-core';
import type { AppCharacter } from '@/types';

function renderWithI18n(ui: React.ReactElement) {
  return render(
    <I18nProvider initialLocale="en" translationsSet={{ en: defaultTranslations }}>
      {ui}
    </I18nProvider>,
  );
}

function setCharacter(char: AppCharacter) {
  useCharacterStore.setState({
    character: char,
    characters: { [char.id]: char },
    activeCharacterId: char.id,
    isLoaded: true,
    error: null,
    lastDamageForConcentration: null,
  });
}

function resetStore() {
  useCharacterStore.setState({
    character: null,
    characters: {},
    activeCharacterId: null,
    isLoaded: false,
    error: null,
    lastDamageForConcentration: null,
  });
}

describe('HitDiceRow', () => {
  beforeEach(() => {
    initContent();
    localStorage.clear();
    resetStore();
  });

  // ── Rendering ──

  it('renders nothing when no character is active', () => {
    const { container } = renderWithI18n(<HitDiceRow />);
    expect(container.innerHTML).toBe('');
  });

  it('renders Hit Dice heading', () => {
    const character = makeCharacter();
    setCharacter(character);
    renderWithI18n(<HitDiceRow />);
    expect(screen.getByText('Hit Dice')).toBeInTheDocument();
  });

  it('renders per-class row with class name, die type, used/total', () => {
    const character = makeCharacter();
    setCharacter(character);
    renderWithI18n(<HitDiceRow />);

    // Default: Level-5 Wizard → d6, 0 / 5
    expect(screen.getByText('Wizard')).toBeInTheDocument();
    expect(screen.getByText('d6')).toBeInTheDocument();
    expect(screen.getByText('0 / 5')).toBeInTheDocument();
  });

  it('renders Spend button per class row', () => {
    const character = makeCharacter();
    setCharacter(character);
    renderWithI18n(<HitDiceRow />);
    expect(screen.getByRole('button', { name: 'Spend Wizard hit dice' })).toBeInTheDocument();
  });

  it('renders footer formula with CON modifier', () => {
    // Default: Con 14 → +2
    const character = makeCharacter();
    setCharacter(character);
    renderWithI18n(<HitDiceRow />);
    expect(
      screen.getByText(/Spend during Short Rest: d6 \+ CON \(2\) per hit die/),
    ).toBeInTheDocument();
  });

  it('shows negative CON modifier correctly', () => {
    const character = makeCharacter({ abilityScores: { Constitution: 8 } });
    setCharacter(character);
    renderWithI18n(<HitDiceRow />);
    expect(
      screen.getByText(/Spend during Short Rest: d6 − CON \(1\) per hit die/),
    ).toBeInTheDocument();
  });

  // ── Used / Total display ──

  it('displays correct used/total when some hit dice are spent', () => {
    const character = makeCharacter();
    const deps = resolveDeps(character);
    // Spend 2 hit dice via short rest
    const char = shortRest(character, { Wizard: 2 }, deps);
    setCharacter(char);
    renderWithI18n(<HitDiceRow />);
    expect(screen.getByText('2 / 5')).toBeInTheDocument();
  });

  it('displays all dice spent (5 / 5)', () => {
    const character = makeCharacter();
    const deps = resolveDeps(character);
    const char = shortRest(character, { Wizard: 5 }, deps);
    setCharacter(char);
    renderWithI18n(<HitDiceRow />);
    expect(screen.getByText('5 / 5')).toBeInTheDocument();
  });

  // ── Spend button ──

  it('calls onSpend with classId when Spend is clicked', () => {
    const character = makeCharacter();
    setCharacter(character);
    const onSpend = vi.fn();
    renderWithI18n(<HitDiceRow onSpend={onSpend} />);

    fireEvent.click(screen.getByRole('button', { name: 'Spend Wizard hit dice' }));
    expect(onSpend).toHaveBeenCalledWith('Wizard');
  });

  it('disables Spend button when all hit dice are used', () => {
    const character = makeCharacter();
    const deps = resolveDeps(character);
    const char = shortRest(character, { Wizard: 5 }, deps);
    setCharacter(char);
    renderWithI18n(<HitDiceRow />);

    expect(screen.getByRole('button', { name: 'Spend Wizard hit dice' })).toBeDisabled();
  });

  // ── className prop ──

  it('applies className prop', () => {
    const character = makeCharacter();
    setCharacter(character);
    const { container } = renderWithI18n(<HitDiceRow className="custom-class" />);

    // Surface wrapper should have the custom class
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
