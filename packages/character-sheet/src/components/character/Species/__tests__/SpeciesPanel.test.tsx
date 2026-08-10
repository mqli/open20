import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SpeciesPanel } from '../SpeciesPanel';
import { makeCharacter } from '@/test/fixtures';

describe('SpeciesPanel', () => {
  // --- normal rendering ---

  it('renders species name as a badge', () => {
    const char = makeCharacter({ speciesId: 'Elf' });
    render(<SpeciesPanel character={char} />);
    // Default fixture uses "Elf" species, no subtype -> displays "Elf"
    expect(screen.getByText('Elf')).toBeInTheDocument();
  });

  it('renders species subtype when character has one', () => {
    const char = makeCharacter({ speciesId: 'Elf' });
    // Manually patch the subtype onto the character for the test
    const charWithSubtype = { ...char, speciesSubtype: 'High Elf' };
    render(<SpeciesPanel character={charWithSubtype} />);
    // Should show the subtype name (not species + subtype concatenated)
    expect(screen.getByText('High Elf')).toBeInTheDocument();
  });

  it('renders size and speed', () => {
    const char = makeCharacter({ speciesId: 'Elf' });
    render(<SpeciesPanel character={char} />);
    // Elf: Medium, 30 ft
    expect(screen.getByText('Medium, 30 ft')).toBeInTheDocument();
  });

  it('renders species description text', () => {
    const char = makeCharacter({ speciesId: 'Elf' });
    render(<SpeciesPanel character={char} />);
    // Elf description mentions "graceful and perceptive"
    expect(screen.getByText(/graceful/i)).toBeInTheDocument();
  });

  it('renders trait names from baseTraits', () => {
    const char = makeCharacter({ speciesId: 'Elf' });
    render(<SpeciesPanel character={char} />);
    // Elf baseTraits: Darkvision, Fey Ancestry, Trance, Keen Senses
    // Note: Darkvision appears both as a sense row AND a trait card
    expect(screen.getAllByText('Darkvision').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Fey Ancestry')).toBeInTheDocument();
    expect(screen.getByText('Trance')).toBeInTheDocument();
    expect(screen.getByText('Keen Senses')).toBeInTheDocument();
  });

  it('renders subtype traits when speciesSubtype is set', () => {
    const char = makeCharacter({ speciesId: 'Elf' });
    const charWithSubtype = { ...char, speciesSubtype: 'High Elf' } as typeof char;
    render(<SpeciesPanel character={charWithSubtype} />);
    // High Elf subtype traits include "Keen Mind" and "Cantrip"
    expect(screen.getByText('Keen Mind')).toBeInTheDocument();
    expect(screen.getByText('Cantrip')).toBeInTheDocument();
  });

  // --- T-215: Senses ---

  it('renders Darkvision with range for High Elf', () => {
    const char = makeCharacter({ speciesId: 'Elf' });
    const charWithSubtype = { ...char, speciesSubtype: 'High Elf' } as typeof char;
    render(<SpeciesPanel character={charWithSubtype} />);

    // Senses section heading
    expect(screen.getByText('Senses')).toBeInTheDocument();
    // Darkvision 60 ft
    expect(screen.getByText('60 ft.')).toBeInTheDocument();
    // Darkvision appears in both senses section and traits section
    const darkvisionTexts = screen.getAllByText('Darkvision');
    expect(darkvisionTexts.length).toBeGreaterThanOrEqual(2); // sense row + trait card
  });

  it('shows no senses section when species has none', () => {
    // Human has no darkvision
    const char = makeCharacter({ speciesId: 'Human' });
    render(<SpeciesPanel character={char} />);

    expect(screen.queryByText('Senses')).not.toBeInTheDocument();
  });

  // --- T-215: Languages ---

  it('renders languages as badges for High Elf', () => {
    const char = makeCharacter({ speciesId: 'Elf' });
    const charWithSubtype = { ...char, speciesSubtype: 'High Elf' } as typeof char;
    render(<SpeciesPanel character={charWithSubtype} />);

    expect(screen.getByText('Languages')).toBeInTheDocument();
    expect(screen.getByText('Common')).toBeInTheDocument();
    expect(screen.getByText('Elvish')).toBeInTheDocument();
  });

  // --- T-215: Size label ---

  it('renders explicit size label for High Elf', () => {
    const char = makeCharacter({ speciesId: 'Elf' });
    const charWithSubtype = { ...char, speciesSubtype: 'High Elf' } as typeof char;
    render(<SpeciesPanel character={charWithSubtype} />);

    expect(screen.getByText('Size:')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  // --- expand/collapse ---

  it('expands trait description on click', () => {
    const char = makeCharacter({ speciesId: 'Elf' });
    render(<SpeciesPanel character={char} />);
    // Click the "Darkvision" toggle
    const darkvisionBtn = screen.getByRole('button', { name: 'Collapse Darkvision' });
    fireEvent.click(darkvisionBtn);

    // Collapsed: button aria should change to "Expand Darkvision"
    expect(screen.getByRole('button', { name: 'Expand Darkvision' })).toBeInTheDocument();
  });

  it('toggles expansion state on repeated clicks', () => {
    const char = makeCharacter({ speciesId: 'Elf' });
    render(<SpeciesPanel character={char} />);
    const btn = screen.getByRole('button', { name: 'Collapse Darkvision' });

    // Collapse
    fireEvent.click(btn);
    expect(screen.getByRole('button', { name: 'Expand Darkvision' })).toBeInTheDocument();

    // Re-expand
    fireEvent.click(screen.getByRole('button', { name: 'Expand Darkvision' }));
    expect(screen.getByRole('button', { name: 'Collapse Darkvision' })).toBeInTheDocument();
  });

  // --- fallback for unknown species ---

  it('shows fallback UI for unknown species ID', () => {
    // createCharacter() validates IDs against deps, so create a valid char
    // then patch species to an unknown value afterwards.
    const char = { ...makeCharacter(), species: 'unknown-species-123' };
    render(<SpeciesPanel character={char} />);
    // humanize('unknown-species-123') → 'Unknown Species 123'
    // The text is rendered inside a <p> as "Unknown Species 123 — data not found..."
    expect(screen.getByText(/Unknown Species 123/)).toBeInTheDocument();
    // Should show "Unknown" badge
    expect(screen.getByText('Unknown')).toBeInTheDocument();
    // Should show fallback message
    expect(screen.getByText(/data not found/i)).toBeInTheDocument();
  });
});
