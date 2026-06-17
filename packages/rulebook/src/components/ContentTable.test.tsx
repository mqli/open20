import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider } from '@open20/ui';
import { ContentTable } from './ContentTable';

const mockSpells = [
  {
    id: 'spell-1',
    name: 'Fireball',
    level: 3 as const,
    school: 'Evocation' as const,
    classes: ['Wizard', 'Sorcerer'],
    source: 'SRD',
    description: ['A bright streak flashes...'],
    castingTime: '1 action',
    range: '150 feet',
    components: ['V', 'S', 'M'] as const,
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
  },
  {
    id: 'spell-2',
    name: 'Magic Missile',
    level: 1 as const,
    school: 'Evocation' as const,
    classes: ['Wizard', 'Sorcerer'],
    source: 'SRD',
    description: ['You create three glowing darts...'],
    castingTime: '1 action',
    range: '120 feet',
    components: ['V', 'S'] as const,
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
  },
  {
    id: 'spell-3',
    name: 'Cure Wounds',
    level: 1 as const,
    school: 'Evocation' as const,
    classes: ['Bard', 'Cleric', 'Druid'],
    source: 'SRD',
    description: ['A creature you touch regains...'],
    castingTime: '1 action',
    range: 'Touch',
    components: ['V', 'S'] as const,
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
  },
];

describe('ContentTable', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnToggleSelect = vi.fn();
  const mockOnSelectAll = vi.fn();

  it('renders table with column headers', () => {
    render(
      <I18nProvider>
        <ContentTable
          spells={mockSpells}
          selectedIds={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleSelect={mockOnToggleSelect}
          onSelectAll={mockOnSelectAll}
        />
      </I18nProvider>,
    );
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Level')).toBeInTheDocument();
    expect(screen.getByText('School')).toBeInTheDocument();
    expect(screen.getByText('Classes')).toBeInTheDocument();
    expect(screen.getByText('Source')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('renders spell names in table', () => {
    render(
      <I18nProvider>
        <ContentTable
          spells={mockSpells}
          selectedIds={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleSelect={mockOnToggleSelect}
          onSelectAll={mockOnSelectAll}
        />
      </I18nProvider>,
    );
    expect(screen.getByText('Fireball')).toBeInTheDocument();
    expect(screen.getByText('Magic Missile')).toBeInTheDocument();
    expect(screen.getByText('Cure Wounds')).toBeInTheDocument();
  });

  it('renders spell levels and schools', () => {
    render(
      <I18nProvider>
        <ContentTable
          spells={mockSpells}
          selectedIds={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleSelect={mockOnToggleSelect}
          onSelectAll={mockOnSelectAll}
        />
      </I18nProvider>,
    );
    expect(screen.getByText('3')).toBeInTheDocument();
    // There should be at least 2 occurrences of "1" (level column)
    const levelOnes = screen.getAllByText('1');
    expect(levelOnes.length).toBeGreaterThanOrEqual(2);
  });

  it('renders spell classes joined by comma', () => {
    render(
      <I18nProvider>
        <ContentTable
          spells={mockSpells}
          selectedIds={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleSelect={mockOnToggleSelect}
          onSelectAll={mockOnSelectAll}
        />
      </I18nProvider>,
    );
    // Wizard, Sorcerer appears twice (for spell-1 and spell-2)
    const wizardSorcererElements = screen.getAllByText('Wizard, Sorcerer');
    expect(wizardSorcererElements.length).toBe(2);
    expect(screen.getByText('Bard, Cleric, Druid')).toBeInTheDocument();
  });

  it('shows edit and delete buttons when not read-only', () => {
    render(
      <I18nProvider>
        <ContentTable
          spells={mockSpells}
          selectedIds={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleSelect={mockOnToggleSelect}
          onSelectAll={mockOnSelectAll}
        />
      </I18nProvider>,
    );
    const editButtons = screen.getAllByTitle('Edit');
    const deleteButtons = screen.getAllByTitle('Delete');
    expect(editButtons.length).toBe(3);
    expect(deleteButtons.length).toBe(3);
  });

  it('hides action buttons when read-only', () => {
    render(
      <I18nProvider>
        <ContentTable
          spells={mockSpells}
          selectedIds={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleSelect={mockOnToggleSelect}
          onSelectAll={mockOnSelectAll}
          isReadOnly={true}
        />
      </I18nProvider>,
    );
    expect(screen.queryByTitle('Edit')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Delete')).not.toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <I18nProvider>
        <ContentTable
          spells={mockSpells}
          selectedIds={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleSelect={mockOnToggleSelect}
          onSelectAll={mockOnSelectAll}
        />
      </I18nProvider>,
    );
    const editButtons = screen.getAllByTitle('Edit');
    fireEvent.click(editButtons[0]);
    expect(mockOnEdit).toHaveBeenCalledWith('spell-1');
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <I18nProvider>
        <ContentTable
          spells={mockSpells}
          selectedIds={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleSelect={mockOnToggleSelect}
          onSelectAll={mockOnSelectAll}
        />
      </I18nProvider>,
    );
    const deleteButtons = screen.getAllByTitle('Delete');
    fireEvent.click(deleteButtons[1]);
    expect(mockOnDelete).toHaveBeenCalledWith('spell-2');
  });

  it('renders empty table when no spells provided', () => {
    render(
      <I18nProvider>
        <ContentTable
          spells={[]}
          selectedIds={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onToggleSelect={mockOnToggleSelect}
          onSelectAll={mockOnSelectAll}
        />
      </I18nProvider>,
    );
    expect(screen.getByText('Type')).toBeInTheDocument();
    // Only header row present
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(1);
  });
});
