import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider } from '@open20/ui';
import { ContentCard } from './ContentCard';

const mockSpell = {
  id: 'spell-1',
  name: 'Fireball',
  level: 3 as const,
  school: 'Evocation' as const,
  classes: ['Wizard', 'Sorcerer'],
  source: 'SRD',
  description: [
    'A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame.',
  ],
  castingTime: '1 action',
  range: '150 feet',
  components: ['V', 'S', 'M'] as const,
  duration: 'Instantaneous',
  concentration: false,
  ritual: false,
};

describe('ContentCard', () => {
  const mockOnViewDetail = vi.fn();
  const mockOnAddToPack = vi.fn();

  it('renders spell name', () => {
    render(
      <I18nProvider>
        <ContentCard
          spell={mockSpell}
          onViewDetail={mockOnViewDetail}
          onAddToPack={mockOnAddToPack}
        />
      </I18nProvider>,
    );
    expect(screen.getByText('Fireball')).toBeInTheDocument();
  });

  it('renders level and school', () => {
    render(
      <I18nProvider>
        <ContentCard
          spell={mockSpell}
          onViewDetail={mockOnViewDetail}
          onAddToPack={mockOnAddToPack}
        />
      </I18nProvider>,
    );
    expect(screen.getByText(/Lv3/)).toBeInTheDocument();
    expect(screen.getByText(/Evocation/)).toBeInTheDocument();
  });

  it('renders source', () => {
    render(
      <I18nProvider>
        <ContentCard
          spell={mockSpell}
          onViewDetail={mockOnViewDetail}
          onAddToPack={mockOnAddToPack}
        />
      </I18nProvider>,
    );
    expect(screen.getByText('SRD')).toBeInTheDocument();
  });

  it('renders description summary', () => {
    render(
      <I18nProvider>
        <ContentCard
          spell={mockSpell}
          onViewDetail={mockOnViewDetail}
          onAddToPack={mockOnAddToPack}
        />
      </I18nProvider>,
    );
    expect(screen.getByText(/A bright streak flashes/)).toBeInTheDocument();
  });

  it('renders Add to button', () => {
    render(
      <I18nProvider>
        <ContentCard
          spell={mockSpell}
          onViewDetail={mockOnViewDetail}
          onAddToPack={mockOnAddToPack}
        />
      </I18nProvider>,
    );
    expect(screen.getByText('Add to')).toBeInTheDocument();
  });

  it('calls onViewDetail when card is clicked', () => {
    render(
      <I18nProvider>
        <ContentCard
          spell={mockSpell}
          onViewDetail={mockOnViewDetail}
          onAddToPack={mockOnAddToPack}
        />
      </I18nProvider>,
    );
    fireEvent.click(screen.getByText('Fireball'));
    expect(mockOnViewDetail).toHaveBeenCalledWith(mockSpell);
  });

  it('shows dropdown when Add to button is clicked', () => {
    render(
      <I18nProvider>
        <ContentCard
          spell={mockSpell}
          onViewDetail={mockOnViewDetail}
          onAddToPack={mockOnAddToPack}
        />
      </I18nProvider>,
    );
    fireEvent.click(screen.getByText('Add to'));
    expect(screen.getByText('📦 My Spells')).toBeInTheDocument();
    expect(screen.getByText('📦 Campaign')).toBeInTheDocument();
    expect(screen.getByText('+ New Pack...')).toBeInTheDocument();
  });

  it('truncates long descriptions', () => {
    const longDescriptionSpell = {
      ...mockSpell,
      description: ['A'.repeat(200)],
    };
    render(
      <I18nProvider>
        <ContentCard
          spell={longDescriptionSpell}
          onViewDetail={mockOnViewDetail}
          onAddToPack={mockOnAddToPack}
        />
      </I18nProvider>,
    );
    // The description should end with "..."
    const descriptionEl = document.querySelector('.line-clamp-2');
    expect(descriptionEl?.textContent).toContain('...');
  });
});
