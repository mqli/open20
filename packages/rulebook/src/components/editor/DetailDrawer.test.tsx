import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider } from '@open20/ui';
import { DetailDrawer } from './DetailDrawer';

const mockSpell = {
  id: 'spell-1',
  name: 'Fireball',
  level: 3 as const,
  school: 'Evocation' as const,
  classes: ['Wizard', 'Sorcerer'],
  source: 'SRD',
  description: [
    'A bright streak flashes from your pointing finger to a point you choose within range.',
    'Each creature in a 20-foot-radius sphere must make a Dexterity saving throw.',
  ],
  castingTime: '1 action',
  range: '150 feet',
  components: ['V', 'S', 'M'] as const,
  duration: 'Instantaneous',
  concentration: false,
  ritual: false,
};

describe('DetailDrawer', () => {
  const mockOnClose = vi.fn();
  const mockOnAddToPack = vi.fn();

  it('renders spell name as heading', () => {
    render(
      <I18nProvider>
        <DetailDrawer spell={mockSpell} onClose={mockOnClose} onAddToPack={mockOnAddToPack} />
      </I18nProvider>,
    );
    expect(screen.getByText('Fireball')).toBeInTheDocument();
  });

  it('renders level label with ordinal suffix', () => {
    render(
      <I18nProvider>
        <DetailDrawer spell={mockSpell} onClose={mockOnClose} onAddToPack={mockOnAddToPack} />
      </I18nProvider>,
    );
    expect(screen.getByText('3rd')).toBeInTheDocument();
  });

  it('renders cantrip level label for level 0', () => {
    const cantripSpell = { ...mockSpell, level: 0 as const };
    render(
      <I18nProvider>
        <DetailDrawer spell={cantripSpell} onClose={mockOnClose} onAddToPack={mockOnAddToPack} />
      </I18nProvider>,
    );
    expect(screen.getByText('Cantrip')).toBeInTheDocument();
  });

  it('renders school', () => {
    render(
      <I18nProvider>
        <DetailDrawer spell={mockSpell} onClose={mockOnClose} onAddToPack={mockOnAddToPack} />
      </I18nProvider>,
    );
    expect(screen.getByText('Evocation')).toBeInTheDocument();
  });

  it('renders source', () => {
    render(
      <I18nProvider>
        <DetailDrawer spell={mockSpell} onClose={mockOnClose} onAddToPack={mockOnAddToPack} />
      </I18nProvider>,
    );
    expect(screen.getByText(/Source: SRD/)).toBeInTheDocument();
  });

  it('renders casting time, range, and duration', () => {
    render(
      <I18nProvider>
        <DetailDrawer spell={mockSpell} onClose={mockOnClose} onAddToPack={mockOnAddToPack} />
      </I18nProvider>,
    );
    expect(screen.getByText('1 action')).toBeInTheDocument();
    expect(screen.getByText('Range: 150 feet')).toBeInTheDocument();
    expect(screen.getByText('Duration: Instantaneous')).toBeInTheDocument();
  });

  it('renders components', () => {
    render(
      <I18nProvider>
        <DetailDrawer spell={mockSpell} onClose={mockOnClose} onAddToPack={mockOnAddToPack} />
      </I18nProvider>,
    );
    expect(screen.getByText('V, S, M')).toBeInTheDocument();
  });

  it('renders classes', () => {
    render(
      <I18nProvider>
        <DetailDrawer spell={mockSpell} onClose={mockOnClose} onAddToPack={mockOnAddToPack} />
      </I18nProvider>,
    );
    expect(screen.getByText('Wizard, Sorcerer')).toBeInTheDocument();
  });

  it('renders description paragraphs', () => {
    render(
      <I18nProvider>
        <DetailDrawer spell={mockSpell} onClose={mockOnClose} onAddToPack={mockOnAddToPack} />
      </I18nProvider>,
    );
    expect(screen.getByText(/A bright streak flashes/)).toBeInTheDocument();
    expect(screen.getByText(/Each creature in a 20-foot-radius/)).toBeInTheDocument();
  });

  it('renders Add to My Pack button', () => {
    render(
      <I18nProvider>
        <DetailDrawer spell={mockSpell} onClose={mockOnClose} onAddToPack={mockOnAddToPack} />
      </I18nProvider>,
    );
    expect(screen.getByText('Add to My Pack')).toBeInTheDocument();
  });

  it('renders read-only indicator', () => {
    render(
      <I18nProvider>
        <DetailDrawer spell={mockSpell} onClose={mockOnClose} onAddToPack={mockOnAddToPack} />
      </I18nProvider>,
    );
    expect(screen.getByText(/Read-only content from SRD/)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <I18nProvider>
        <DetailDrawer spell={mockSpell} onClose={mockOnClose} onAddToPack={mockOnAddToPack} />
      </I18nProvider>,
    );
    fireEvent.click(screen.getByLabelText('Close'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('shows concentration badge when spell requires concentration', () => {
    const concentrationSpell = { ...mockSpell, concentration: true };
    render(
      <I18nProvider>
        <DetailDrawer
          spell={concentrationSpell}
          onClose={mockOnClose}
          onAddToPack={mockOnAddToPack}
        />
      </I18nProvider>,
    );
    expect(screen.getByText('Concentration')).toBeInTheDocument();
  });

  it('shows ritual badge when spell is a ritual', () => {
    const ritualSpell = { ...mockSpell, ritual: true };
    render(
      <I18nProvider>
        <DetailDrawer spell={ritualSpell} onClose={mockOnClose} onAddToPack={mockOnAddToPack} />
      </I18nProvider>,
    );
    expect(screen.getByText('Ritual')).toBeInTheDocument();
  });

  it('renders higher level section when present', () => {
    const higherLevelSpell = {
      ...mockSpell,
      usingAHigherLevelSpellSlot: [
        'When you cast this spell using a spell slot of 4th level or higher...',
      ],
    };
    render(
      <I18nProvider>
        <DetailDrawer
          spell={higherLevelSpell}
          onClose={mockOnClose}
          onAddToPack={mockOnAddToPack}
        />
      </I18nProvider>,
    );
    expect(screen.getByText('At Higher Levels')).toBeInTheDocument();
  });
});
