import type { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { GlossaryEntry } from 'open20-core';
import { I18nProvider } from '@/i18n';
import { TooltipProvider } from '@/components/base/Tooltip';
import { GlossaryTerm } from '../GlossaryTerm';
import { GlossaryEntryFlyout } from '../GlossaryEntryFlyout';
import { GlossaryEntryTooltip } from '../GlossaryEntryTooltip';

const advantageEntry: GlossaryEntry = {
  id: 'advantage',
  source: 'SRD 5.2',
  name: 'Advantage',
  content: ['If you have Advantage on a D20 Test, roll two d20s, and use the higher roll.'],
};

const blindedEntry: GlossaryEntry = {
  id: 'blinded',
  source: 'SRD 5.2',
  name: 'Blinded',
  tag: 'Condition',
  condition: 'Blinded',
  content: ['While you have the Blinded condition, you experience the following effects.'],
  subsections: [
    {
      title: "Can't See.",
      content: ["You can't see and automatically fail any ability check that requires sight."],
    },
  ],
};

function renderWithProviders(ui: ReactNode) {
  return render(
    <I18nProvider>
      <TooltipProvider>{ui}</TooltipProvider>
    </I18nProvider>,
  );
}

describe('GlossaryEntryTooltip', () => {
  it('renders a compact summary for the entry', () => {
    renderWithProviders(
      <GlossaryEntryTooltip entry={advantageEntry} withProvider>
        <button type="button">Advantage</button>
      </GlossaryEntryTooltip>,
    );

    expect(screen.getByRole('button', { name: 'Advantage' })).toBeInTheDocument();
  });
});

describe('GlossaryEntryFlyout', () => {
  it('renders the full entry when open', () => {
    const onOpenChange = vi.fn();

    renderWithProviders(
      <GlossaryEntryFlyout entry={blindedEntry} open onOpenChange={onOpenChange} />,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAccessibleName('Blinded');
    expect(screen.getByText("Can't See.")).toBeInTheDocument();
  });
});

describe('GlossaryTerm', () => {
  it('opens a flyout for rich entries in auto mode', () => {
    renderWithProviders(
      <GlossaryTerm entry={blindedEntry} display="auto">
        Blinded
      </GlossaryTerm>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Blinded' }));
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Blinded');
  });

  it('supports controlled flyout state', () => {
    const onOpenChange = vi.fn();

    renderWithProviders(
      <GlossaryTerm
        entry={advantageEntry}
        display="flyout"
        open={false}
        onOpenChange={onOpenChange}
      >
        Advantage
      </GlossaryTerm>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Advantage' }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});
