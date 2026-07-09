// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpellSlots } from '@/components/spell-slots/SpellSlots';
import { I18nProvider } from '@open20/ui';
import { enTranslations } from '@/i18n';

const renderWithI18n = (ui: React.ReactElement) => {
  return render(
    <I18nProvider translationsSet={{ en: enTranslations }} initialLocale="en">
      {ui}
    </I18nProvider>,
  );
};

const mockSlots = {
  0: { total: 0, used: 0 },
  1: { total: 4, used: 0 },
  2: { total: 3, used: 1 },
  3: { total: 2, used: 0 },
  4: { total: 0, used: 0 },
  5: { total: 0, used: 0 },
  6: { total: 0, used: 0 },
  7: { total: 0, used: 0 },
  8: { total: 0, used: 0 },
  9: { total: 0, used: 0 },
};

describe('SpellSlots', () => {
  const noop = vi.fn();

  it('should display spell slots for a character with available slots', () => {
    renderWithI18n(<SpellSlots slots={mockSlots} onConsumeSlot={noop} onRecoverSlot={noop} />);

    // Total pips: level 1 (4) + level 2 (3) + level 3 (2) = 9
    const pips = document.querySelectorAll('.slot-pip');
    expect(pips.length).toBeGreaterThan(0);
  });

  it('should render remaining/total count for each level', () => {
    renderWithI18n(
      <SpellSlots slots={mockSlots} onConsumeSlot={noop} onRecoverSlot={noop} showLabels />,
    );

    // Level 1: 4/4 available
    expect(screen.getByText('4/4')).toBeInTheDocument();
    // Level 2: 2/3 available (1 used)
    expect(screen.getByText('2/3')).toBeInTheDocument();
  });

  it('should display section header when showLabels is true', () => {
    renderWithI18n(
      <SpellSlots slots={mockSlots} onConsumeSlot={noop} onRecoverSlot={noop} showLabels />,
    );

    expect(screen.getByText('Spell Slots')).toBeInTheDocument();
  });

  it('should hide section header when showLabels is false', () => {
    renderWithI18n(
      <SpellSlots slots={mockSlots} onConsumeSlot={noop} onRecoverSlot={noop} showLabels={false} />,
    );

    expect(screen.queryByText('Spell Slots')).not.toBeInTheDocument();
  });

  it('should show Combined label when isMulticlass is true', () => {
    renderWithI18n(
      <SpellSlots slots={mockSlots} onConsumeSlot={noop} onRecoverSlot={noop} isMulticlass />,
    );

    expect(screen.getByText('(Combined)')).toBeInTheDocument();
  });

  it('should render null when no slots are available', () => {
    const emptySlots = {
      0: { total: 0, used: 0 },
      1: { total: 0, used: 0 },
      2: { total: 0, used: 0 },
      3: { total: 0, used: 0 },
    };

    const { container } = renderWithI18n(
      <SpellSlots slots={emptySlots} onConsumeSlot={noop} onRecoverSlot={noop} />,
    );

    expect(container.innerHTML).toBe('');
  });

  it('should render pact magic slots when provided', () => {
    renderWithI18n(
      <SpellSlots
        slots={mockSlots}
        pactMagicSlots={{ total: 2, used: 1, level: 1 }}
        onConsumeSlot={noop}
        onRecoverSlot={noop}
        onConsumePactSlot={noop}
        onRecoverPactSlot={noop}
      />,
    );

    expect(screen.getByText(/Pact 1st/)).toBeInTheDocument();
  });

  it('should render in compact density without labels', () => {
    renderWithI18n(
      <SpellSlots slots={mockSlots} onConsumeSlot={noop} onRecoverSlot={noop} density="compact" />,
    );

    // Compact mode doesn't show section header
    expect(screen.queryByText('Spell Slots')).not.toBeInTheDocument();
    // But still shows pips
    const pips = document.querySelectorAll('.slot-pip');
    expect(pips.length).toBeGreaterThan(0);
  });
});
