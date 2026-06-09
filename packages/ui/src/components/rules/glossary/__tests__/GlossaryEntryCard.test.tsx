import type { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { GlossaryEntry } from 'open20-core';
import { I18nProvider } from '@/i18n';
import { GlossaryEntryCard } from '../GlossaryEntryCard';
import { GlossaryEntryContent } from '../GlossaryEntryContent';

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
  seeAlso: [{ type: 'entry', id: 'advantage' }],
};

function renderWithI18n(ui: ReactNode) {
  return render(<I18nProvider>{ui}</I18nProvider>);
}

describe('GlossaryEntryCard', () => {
  it('renders entry name, tag, and body content', () => {
    renderWithI18n(<GlossaryEntryCard entry={blindedEntry} />);

    expect(screen.getByRole('heading', { name: 'Blinded' })).toBeInTheDocument();
    expect(screen.getByText('Condition')).toBeInTheDocument();
    expect(screen.getAllByText('Blinded').length).toBeGreaterThan(0);
    expect(screen.getByText("Can't See.")).toBeInTheDocument();
    expect(
      screen.getByText(
        "You can't see and automatically fail any ability check that requires sight.",
      ),
    ).toBeInTheDocument();
  });

  it('calls onTermClick when a see-also entry chip is clicked', () => {
    const onTermClick = vi.fn();

    renderWithI18n(<GlossaryEntryCard entry={blindedEntry} onTermClick={onTermClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'advantage' }));
    expect(onTermClick).toHaveBeenCalledWith('advantage');
  });
});

describe('GlossaryEntryContent', () => {
  it('renders related entry chips without buttons when onTermClick is omitted', () => {
    const entry: GlossaryEntry = {
      id: 'action',
      source: 'SRD 5.2',
      name: 'Action',
      content: ['On your turn, you can take one action.'],
      relatedEntryIds: ['attack', 'dash'],
    };

    renderWithI18n(<GlossaryEntryContent entry={entry} resolveTermLabel={(id) => id} />);

    expect(screen.getByText('Related entries')).toBeInTheDocument();
    expect(screen.getByText('attack')).toBeInTheDocument();
    expect(screen.getByText('dash')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'attack' })).not.toBeInTheDocument();
  });
});
