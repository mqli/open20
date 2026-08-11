// SpellBrowser.test.tsx
// Tests for the SpellBrowser dialog component.

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { I18nProvider, defaultTranslations } from '@open20/ui';

// Mock dependencies
vi.mock('@/core/content-resolver', () => ({
  initContent: vi.fn(),
  searchSpells: vi.fn(),
  resolveDeps: vi.fn(() => ({ classes: {} })),
  getClassName: vi.fn((id: string) => id),
  getSpell: vi.fn(),
}));

vi.mock('open20-core', async () => {
  const actual = await vi.importActual('open20-core');
  return {
    ...actual,
  };
});

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider initialLocale="en" translationsSet={{ en: defaultTranslations }}>
      {children}
    </I18nProvider>
  );
}

const noop = vi.fn();

describe('SpellBrowser', () => {
  it('renders the dialog when open', async () => {
    const { SpellBrowser } = await import('../SpellBrowser');
    const { searchSpells } = await import('@/core/content-resolver');

    vi.mocked(searchSpells).mockReturnValue([]);

    const character = {
      id: 'test-1',
      name: 'Test',
      spells: { classSpellcasting: {}, spellSlots: {} as any, pactMagicSlots: null },
    };

    render(
      <SpellBrowser
        character={character as any}
        open={true}
        onClose={noop}
        onPrepareSpell={noop}
        onUnprepareSpell={noop}
        onLearnSpell={noop}
        onUnlearnSpell={noop}
        onLearnCantrip={noop}
        onUnlearnCantrip={noop}
      />,
      { wrapper },
    );

    expect(screen.getByText('Spell Browser')).toBeDefined();
    expect(screen.getByPlaceholderText('Search spells by name...')).toBeDefined();
  });

  it('displays empty state when no spells match', async () => {
    const { SpellBrowser } = await import('../SpellBrowser');
    const { searchSpells } = await import('@/core/content-resolver');

    vi.mocked(searchSpells).mockReturnValue([]);

    const character = {
      id: 'test-1',
      name: 'Test',
      spells: { classSpellcasting: {}, spellSlots: {} as any, pactMagicSlots: null },
    };

    render(
      <SpellBrowser
        character={character as any}
        open={true}
        onClose={noop}
        onPrepareSpell={noop}
        onUnprepareSpell={noop}
        onLearnSpell={noop}
        onUnlearnSpell={noop}
        onLearnCantrip={noop}
        onUnlearnCantrip={noop}
      />,
      { wrapper },
    );

    expect(screen.getByText('No spells found')).toBeDefined();
  });

  it('displays search results', async () => {
    const { SpellBrowser } = await import('../SpellBrowser');
    const { searchSpells } = await import('@/core/content-resolver');

    vi.mocked(searchSpells).mockReturnValue([
      {
        id: 'fireball',
        name: 'Fireball',
        level: 3,
        school: 'Evocation',
        concentration: false,
        ritual: false,
        castingTime: '1 action',
        range: '150 feet',
        components: ['V', 'S', 'M'],
        duration: 'Instantaneous',
        description: [],
        source: 'SRD',
        classes: ['Wizard', 'Sorcerer'],
      } as any,
    ]);

    const character = {
      id: 'test-1',
      name: 'Test',
      spells: {
        classSpellcasting: {
          Wizard: {
            classId: 'Wizard',
            spellcastingAbility: 'Intelligence',
            spellSaveDC: 13,
            spellAttackBonus: 5,
            knownCantrips: [],
            maxCantripsKnown: 3,
            knownSpells: [],
            preparedSpells: [],
            maxPrepared: 2,
          },
        },
        spellSlots: {} as any,
        pactMagicSlots: null,
      },
    };

    render(
      <SpellBrowser
        character={character as any}
        open={true}
        onClose={noop}
        onPrepareSpell={noop}
        onUnprepareSpell={noop}
        onLearnSpell={noop}
        onUnlearnSpell={noop}
        onLearnCantrip={noop}
        onUnlearnCantrip={noop}
      />,
      { wrapper },
    );

    expect(screen.getByText('Fireball')).toBeDefined();
  });
});
