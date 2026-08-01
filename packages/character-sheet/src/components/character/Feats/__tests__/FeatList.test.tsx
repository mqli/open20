import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider, defaultTranslations } from '@open20/ui';
import { FeatList } from '../FeatList';
import { makeCharacter } from '@/test/fixtures';
import type { AppCharacter } from '@/types';
import type { CharacterFeatEntry } from 'open20-core';

/** Wrapper that provides I18nProvider (required by @open20/ui components like EmptyState). */
function renderWithI18n(ui: React.ReactElement) {
  return render(
    <I18nProvider initialLocale="en" translationsSet={{ en: defaultTranslations }}>
      {ui}
    </I18nProvider>,
  );
}

/** Create a character with specific feats for testing. */
function makeCharWithFeats(feats: readonly CharacterFeatEntry[]): AppCharacter {
  return { ...makeCharacter(), feats } as AppCharacter;
}

describe('FeatList', () => {
  // --- empty state ---

  it('shows empty state when character has no feats', () => {
    const char = makeCharacter();
    renderWithI18n(<FeatList character={char} />);
    expect(screen.getByText('No Feats')).toBeInTheDocument();
    expect(screen.getByText(/This character has no feats yet/)).toBeInTheDocument();
  });

  // --- normal rendering ---

  it('renders feat names from character.feats', () => {
    const char = makeCharWithFeats([{ featId: 'alert' }]);
    renderWithI18n(<FeatList character={char} />);
    // "Alert" is the SRD name for feat id "alert"
    expect(screen.getByText('Alert')).toBeInTheDocument();
  });

  it('renders feat category badge', () => {
    const char = makeCharWithFeats([{ featId: 'alert' }]);
    renderWithI18n(<FeatList character={char} />);
    // Alert feat has category "Origin"
    expect(screen.getByText('Origin')).toBeInTheDocument();
  });

  it('renders multiple feats', () => {
    const char = makeCharWithFeats([{ featId: 'alert' }, { featId: 'savage-attacker' }]);
    renderWithI18n(<FeatList character={char} />);
    expect(screen.getByText('Alert')).toBeInTheDocument();
    expect(screen.getByText('Savage Attacker')).toBeInTheDocument();
  });

  it('renders section header with Sparkles icon', () => {
    const char = makeCharWithFeats([{ featId: 'alert' }]);
    renderWithI18n(<FeatList character={char} />);
    expect(screen.getByText('Feats')).toBeInTheDocument();
  });

  // --- expand / collapse ---

  it('feat description is hidden by default (collapsed)', () => {
    const char = makeCharWithFeats([{ featId: 'alert' }]);
    renderWithI18n(<FeatList character={char} />);
    // The description text exists but is hidden via grid-rows-[0fr] + opacity-0
    const description = screen.getByText(/Initiative Proficiency/);
    expect(description).toBeInTheDocument();
    // The parent overflow container should be aria-hidden=true when collapsed
    expect(description.closest('[aria-hidden="true"]')).toBeTruthy();
  });

  it('clicking feat name expands to show description', () => {
    const char = makeCharWithFeats([{ featId: 'alert' }]);
    renderWithI18n(<FeatList character={char} />);
    const expandBtn = screen.getByRole('button', { name: 'Expand Alert' });
    fireEvent.click(expandBtn);

    // After expand, description should be visible (not aria-hidden)
    const description = screen.getByText(/Initiative Proficiency/);
    expect(description.closest('[aria-hidden="true"]')).toBeFalsy();
  });

  it('toggles expansion state on repeated clicks', () => {
    const char = makeCharWithFeats([{ featId: 'alert' }]);
    renderWithI18n(<FeatList character={char} />);
    const btn = screen.getByRole('button', { name: 'Expand Alert' });

    // Expand
    fireEvent.click(btn);
    expect(screen.getByRole('button', { name: 'Collapse Alert' })).toBeInTheDocument();

    // Collapse
    fireEvent.click(screen.getByRole('button', { name: 'Collapse Alert' }));
    expect(screen.getByRole('button', { name: 'Expand Alert' })).toBeInTheDocument();
  });

  // --- unknown ID fallback ---

  it('shows fallback for unknown feat ID', () => {
    const char = makeCharWithFeats([{ featId: 'non-existent-feat-xyz' }]);
    renderWithI18n(<FeatList character={char} />);
    // humanize('non-existent-feat-xyz') → 'Non Existent Feat Xyz'
    expect(screen.getByText('Non Existent Feat Xyz')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  // --- mixed known + unknown ---

  it('renders mix of known and unknown feats', () => {
    const char = makeCharWithFeats([{ featId: 'alert' }, { featId: 'made-up-feat' }]);
    renderWithI18n(<FeatList character={char} />);
    expect(screen.getByText('Alert')).toBeInTheDocument();
    expect(screen.getByText('Made Up Feat')).toBeInTheDocument();
    // Only the unknown one has "Unknown" badge
    const unknownBadges = screen.getAllByText('Unknown');
    expect(unknownBadges).toHaveLength(1);
  });
});
