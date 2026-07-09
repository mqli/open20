// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CustomClassModal } from '@/components/class/CustomClassModal';
import { I18nProvider } from '@open20/ui';
import { enTranslations } from '@/i18n';
import type { Class, Subclass } from 'open20-core';
import type { CustomClassEntry } from '@/stores/customClassStore';

// ---- Inline test data (can't import from e2e/fixtures/ outside vitest source tree) ----

const TEST_CUSTOM_CLASS: Class = {
  id: 'my-wizard',
  name: 'My Wizard',
  source: 'Homebrew',
  hitDie: 'd8',
  savingThrowProficiencies: [],
  armorTraining: [],
  weaponMastery: false,
  featuresByLevel: [{ level: 1, cantripsKnown: 3, preparedSpells: 4, features: [] }],
  spellcasting: {
    ability: 'Intelligence',
    knownSource: 'class_list',
    preparationTiming: 'long_rest',
    changesPerPreparation: 'all',
  },
  spellSlotsByLevel: { 1: [2, 0, 0, 0, 0, 0, 0, 0, 0] },
};

const TEST_CUSTOM_CLASS_ENTRY: CustomClassEntry = {
  class: TEST_CUSTOM_CLASS,
  subclasses: [],
};

const TEST_STANDALONE_SUBCLASS: Subclass = {
  id: 'my-bladesinger',
  parentClass: 'Wizard',
  grantedAtLevel: 1,
  featuresByLevel: [],
  source: 'Homebrew',
} as Subclass;

const mockSrdClasses = [
  {
    id: 'Wizard',
    name: 'Wizard',
    source: 'PHB',
    spellcasting: {
      ability: 'Intelligence',
      knownSource: 'spellbook',
      preparationTiming: 'long_rest',
      changesPerPreparation: 'all',
    },
    hitDie: 'd6',
    savingThrowProficiencies: [],
    armorTraining: [],
    weaponMastery: false,
    featuresByLevel: [],
    spellSlotsByLevel: {},
  },
  {
    id: 'Cleric',
    name: 'Cleric',
    source: 'PHB',
    spellcasting: {
      ability: 'Wisdom',
      knownSource: 'class_list',
      preparationTiming: 'long_rest',
      changesPerPreparation: 'all',
    },
    hitDie: 'd8',
    savingThrowProficiencies: [],
    armorTraining: [],
    weaponMastery: false,
    featuresByLevel: [],
    spellSlotsByLevel: {},
  },
  {
    id: 'Fighter',
    name: 'Fighter',
    source: 'PHB',
    hitDie: 'd10',
    savingThrowProficiencies: [],
    armorTraining: [],
    weaponMastery: false,
    featuresByLevel: [],
    spellSlotsByLevel: {},
  },
] as Class[];

const mockEmptyStore = {
  classes: [] as CustomClassEntry[],
  standaloneSubclasses: [] as Subclass[],
  saveClass: vi.fn(),
  deleteClass: vi.fn(),
  addSubclass: vi.fn(),
  addStandaloneSubclass: vi.fn(),
};

// Mutable state for per-test overrides
let storeState = { ...mockEmptyStore };

vi.mock('@/stores/customClassStore', () => ({
  useCustomClassStore: () => storeState,
}));

vi.mock('@/core/content-resolver', () => ({
  getAllClasses: () => mockSrdClasses,
}));

vi.mock('@/hooks/useBreakpoint', () => ({
  useIsLargeScreen: () => true,
}));

const renderWithI18n = (ui: React.ReactElement) => {
  return render(
    <I18nProvider translationsSet={{ en: enTranslations }} initialLocale="en">
      {ui}
    </I18nProvider>,
  );
};

describe('CustomClassModal', () => {
  beforeEach(() => {
    storeState = { ...mockEmptyStore };
    vi.clearAllMocks();
  });

  it('should show empty state when no custom classes exist', () => {
    renderWithI18n(<CustomClassModal open onOpenChange={vi.fn()} />);

    expect(
      screen.getByText('No custom classes yet. Create one to get started.'),
    ).toBeInTheDocument();
  });

  it('should show Create Custom Class button', () => {
    renderWithI18n(<CustomClassModal open onOpenChange={vi.fn()} />);

    expect(screen.getByText('Create Custom Class')).toBeInTheDocument();
  });

  it('should display SRD Classes section', () => {
    renderWithI18n(<CustomClassModal open onOpenChange={vi.fn()} />);

    expect(screen.getByText('SRD Classes')).toBeInTheDocument();
  });

  it('should display spellcasting SRD classes (Wizard, Cleric) and omit non-spellcasters', () => {
    renderWithI18n(<CustomClassModal open onOpenChange={vi.fn()} />);

    expect(screen.getByText('Wizard')).toBeInTheDocument();
    expect(screen.getByText('Cleric')).toBeInTheDocument();
    // Fighter has no spellcasting → should not appear
    expect(screen.queryByText('Fighter')).not.toBeInTheDocument();
  });

  it('should show SRD only label for classes without custom subclasses', () => {
    renderWithI18n(<CustomClassModal open onOpenChange={vi.fn()} />);

    // Both Wizard and Cleric show "SRD only" (2 matches)
    const labels = screen.getAllByText((content) => content.includes('SRD only'));
    expect(labels).toHaveLength(2);
  });

  it('should show custom subclass count when standalone subclasses exist', () => {
    storeState = {
      ...mockEmptyStore,
      standaloneSubclasses: [TEST_STANDALONE_SUBCLASS],
    };

    renderWithI18n(<CustomClassModal key="standalone" open onOpenChange={vi.fn()} />);

    // Wizard should show "1 custom subclass" since TEST_STANDALONE_SUBCLASS.parentClass = 'Wizard'
    expect(
      screen.getByText((content) => content.includes('1 custom subclass')),
    ).toBeInTheDocument();
  });

  it('should show Manage Custom Classes title', () => {
    renderWithI18n(<CustomClassModal open onOpenChange={vi.fn()} />);

    expect(screen.getByText('Manage Custom Classes')).toBeInTheDocument();
  });

  it('should display custom class entries in the list', () => {
    storeState = {
      ...mockEmptyStore,
      classes: [TEST_CUSTOM_CLASS_ENTRY],
    };

    renderWithI18n(<CustomClassModal key="with-entries" open onOpenChange={vi.fn()} />);

    expect(screen.getByText('My Wizard')).toBeInTheDocument();
  });
});
