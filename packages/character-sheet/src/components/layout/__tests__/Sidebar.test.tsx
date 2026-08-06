// Sidebar.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../Sidebar';
import { initContent } from '@/core/content-resolver';
import { makeCharacter } from '@/test/fixtures';

describe('Sidebar', () => {
  let char: ReturnType<typeof makeCharacter>;

  beforeEach(() => {
    initContent();
    char = makeCharacter({ name: 'Gandalf' });
  });

  // --- rendering ---

  it('renders character name from HeroCard', () => {
    render(
      <Sidebar
        character={char}
        activeSection="combat"
        onSectionChange={() => {}}
        onOpenCharacterSelector={() => {}}
        onEditCharacter={() => {}}
      />,
    );
    expect(screen.getByText('Gandalf')).toBeInTheDocument();
  });

  it('renders all 7 nav tab items', () => {
    render(
      <Sidebar
        character={char}
        activeSection="combat"
        onSectionChange={() => {}}
        onOpenCharacterSelector={() => {}}
        onEditCharacter={() => {}}
      />,
    );
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(7);
    expect(tabs[0]).toHaveTextContent('Combat');
    expect(tabs[1]).toHaveTextContent('Abilities');
    expect(tabs[2]).toHaveTextContent('Skills');
    expect(tabs[3]).toHaveTextContent('Spells');
    expect(tabs[4]).toHaveTextContent('Equipment');
    expect(tabs[5]).toHaveTextContent('Features');
    expect(tabs[6]).toHaveTextContent('Notes');
  });

  it('renders Characters and Edit buttons', () => {
    render(
      <Sidebar
        character={char}
        activeSection="combat"
        onSectionChange={() => {}}
        onOpenCharacterSelector={() => {}}
        onEditCharacter={() => {}}
      />,
    );
    expect(screen.getByText('Characters')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manage characters' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit character' })).toBeInTheDocument();
  });

  it('renders RestActions in sticky bottom area', () => {
    render(
      <Sidebar
        character={char}
        activeSection="combat"
        onSectionChange={() => {}}
        onOpenCharacterSelector={() => {}}
        onEditCharacter={() => {}}
      />,
    );
    // RestActions renders the "Rest Actions" label text
    expect(screen.getByText('Rest Actions')).toBeInTheDocument();
  });

  // --- nav selection ---

  it('calls onSectionChange when a nav tab is clicked', () => {
    const onSectionChange = vi.fn();
    render(
      <Sidebar
        character={char}
        activeSection="combat"
        onSectionChange={onSectionChange}
        onOpenCharacterSelector={() => {}}
        onEditCharacter={() => {}}
      />,
    );
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Skills' }));
    expect(onSectionChange).toHaveBeenCalledWith('skills');
  });

  it('calls onSectionChange with abilities when Abilities tab is clicked', () => {
    const onSectionChange = vi.fn();
    render(
      <Sidebar
        character={char}
        activeSection="combat"
        onSectionChange={onSectionChange}
        onOpenCharacterSelector={() => {}}
        onEditCharacter={() => {}}
      />,
    );
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Abilities' }));
    expect(onSectionChange).toHaveBeenCalledWith('abilities');
  });

  it('calls onSectionChange with spells when Spells tab is clicked', () => {
    const onSectionChange = vi.fn();
    render(
      <Sidebar
        character={char}
        activeSection="combat"
        onSectionChange={onSectionChange}
        onOpenCharacterSelector={() => {}}
        onEditCharacter={() => {}}
      />,
    );
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Spells' }));
    expect(onSectionChange).toHaveBeenCalledWith('spells');
  });

  it('calls onSectionChange with equipment when Equipment tab is clicked', () => {
    const onSectionChange = vi.fn();
    render(
      <Sidebar
        character={char}
        activeSection="combat"
        onSectionChange={onSectionChange}
        onOpenCharacterSelector={() => {}}
        onEditCharacter={() => {}}
      />,
    );
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Equipment' }));
    expect(onSectionChange).toHaveBeenCalledWith('equipment');
  });

  it('calls onSectionChange with features when Features tab is clicked', () => {
    const onSectionChange = vi.fn();
    render(
      <Sidebar
        character={char}
        activeSection="combat"
        onSectionChange={onSectionChange}
        onOpenCharacterSelector={() => {}}
        onEditCharacter={() => {}}
      />,
    );
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Features' }));
    expect(onSectionChange).toHaveBeenCalledWith('features');
  });

  it('calls onSectionChange with notes when Notes tab is clicked', () => {
    const onSectionChange = vi.fn();
    render(
      <Sidebar
        character={char}
        activeSection="combat"
        onSectionChange={onSectionChange}
        onOpenCharacterSelector={() => {}}
        onEditCharacter={() => {}}
      />,
    );
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Notes' }));
    expect(onSectionChange).toHaveBeenCalledWith('notes');
  });

  it('calls onSectionChange with combat when Combat tab is clicked from another section', () => {
    const onSectionChange = vi.fn();
    render(
      <Sidebar
        character={char}
        activeSection="skills"
        onSectionChange={onSectionChange}
        onOpenCharacterSelector={() => {}}
        onEditCharacter={() => {}}
      />,
    );
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Combat' }));
    expect(onSectionChange).toHaveBeenCalledWith('combat');
  });

  // --- character management buttons ---

  it('calls onOpenCharacterSelector when Characters button is clicked', () => {
    const onOpen = vi.fn();
    render(
      <Sidebar
        character={char}
        activeSection="combat"
        onSectionChange={() => {}}
        onOpenCharacterSelector={onOpen}
        onEditCharacter={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Manage characters' }));
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it('calls onEditCharacter when Edit button is clicked', () => {
    const onEdit = vi.fn();
    render(
      <Sidebar
        character={char}
        activeSection="combat"
        onSectionChange={() => {}}
        onOpenCharacterSelector={() => {}}
        onEditCharacter={onEdit}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Edit character' }));
    expect(onEdit).toHaveBeenCalledOnce();
  });

  // --- aria and accessibility ---

  it('renders aside with aria semantics', () => {
    render(
      <Sidebar
        character={char}
        activeSection="combat"
        onSectionChange={() => {}}
        onOpenCharacterSelector={() => {}}
        onEditCharacter={() => {}}
      />,
    );
    // The root element is an <aside>
    const aside = document.querySelector('aside');
    expect(aside).toBeInTheDocument();
    expect(aside?.className).toContain('w-[250px]');
  });

  it('applies className prop', () => {
    const { container } = render(
      <Sidebar
        character={char}
        activeSection="combat"
        onSectionChange={() => {}}
        onOpenCharacterSelector={() => {}}
        onEditCharacter={() => {}}
        className="sidebar-extra"
      />,
    );
    const aside = container.querySelector('aside');
    expect(aside?.className).toContain('sidebar-extra');
  });
});
