// ConditionsSection.test.tsx — T-209

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nProvider, defaultTranslations } from '@open20/ui';
import { startConcentration } from 'open20-core';
import type { AppCharacter } from '@/types';
import { useCharacterStore } from '@/stores/characterStore';
import { initContent, getSpellName } from '@/core/content-resolver';
import { makeCharacter } from '@/test/fixtures';
import { ConditionsSection } from '../ConditionsSection';

function renderWithI18n(ui: React.ReactElement) {
  return render(
    <I18nProvider initialLocale="en" translationsSet={{ en: defaultTranslations }}>
      {ui}
    </I18nProvider>,
  );
}

function setCharacter(char: AppCharacter, overrides?: { lastDamage?: number | null }) {
  useCharacterStore.setState({
    character: char,
    characters: { [char.id]: char },
    activeCharacterId: char.id,
    isLoaded: true,
    error: null,
    lastDamageForConcentration: overrides?.lastDamage ?? null,
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

function makeConcentratingCharacter(): AppCharacter {
  const char = makeCharacter();
  // Start concentrating on a spell. Use a spell ID that exists in the resolver.
  return startConcentration(char, 'Magic Missile');
}

describe('ConditionsSection', () => {
  beforeEach(() => {
    initContent();
    localStorage.clear();
    resetStore();
  });

  it('renders nothing when no character is active', () => {
    const { container } = renderWithI18n(<ConditionsSection />);
    expect(container.innerHTML).toBe('');
  });

  it('renders ConditionsPanel (chips + add button + exhaustion) by default', () => {
    const character = makeCharacter();
    setCharacter(character);
    renderWithI18n(<ConditionsSection />);

    // ConditionsPanel renders add button and exhaustion tracker
    expect(screen.getByRole('button', { name: 'Add condition' })).toBeInTheDocument();
    expect(screen.getByText('Exhaustion')).toBeInTheDocument();
    expect(screen.getByText('No exhaustion')).toBeInTheDocument();
  });

  it('renders ConcentrationBanner when concentrating', () => {
    const character = makeConcentratingCharacter();
    setCharacter(character);
    renderWithI18n(<ConditionsSection />);

    expect(screen.getByText('Concentrating')).toBeInTheDocument();
    const spellName = getSpellName('Magic Missile');
    expect(screen.getByText(spellName)).toBeInTheDocument();
  });

  it('renders concentration save prompt when damaged', () => {
    const character = makeConcentratingCharacter();
    // Take 20 damage → DC = max(10, 10) = 10
    setCharacter(character, { lastDamage: 20 });
    renderWithI18n(<ConditionsSection />);

    expect(screen.getByText('Concentrating')).toBeInTheDocument();
    expect(screen.getByText('DC 10 CON save')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Roll DC 10/ })).toBeInTheDocument();
  });

  it('renders end concentration button when concentrating', () => {
    const character = makeConcentratingCharacter();
    setCharacter(character);
    renderWithI18n(<ConditionsSection />);

    const spellName = getSpellName('Magic Missile');
    expect(
      screen.getByRole('button', { name: `End concentration on ${spellName}` }),
    ).toBeInTheDocument();
  });

  it('does not render ConcentrationBanner when not concentrating', () => {
    const character = makeCharacter();
    setCharacter(character);
    renderWithI18n(<ConditionsSection />);

    expect(screen.queryByText('Concentrating')).not.toBeInTheDocument();
  });

  it('renders all sub-parts together when concentrating', () => {
    const character = makeConcentratingCharacter();
    setCharacter(character);
    renderWithI18n(<ConditionsSection />);

    // All four parts should be present
    expect(screen.getByText('Concentrating')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add condition' })).toBeInTheDocument();
    expect(screen.getByText('Exhaustion')).toBeInTheDocument();
    expect(screen.getByText('No exhaustion')).toBeInTheDocument();
  });
});
