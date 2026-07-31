import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BackgroundPanel } from '../BackgroundPanel';
import { makeCharacter } from '@/test/fixtures';

describe('BackgroundPanel', () => {
  // --- normal rendering ---

  it('renders background name as a badge', () => {
    const char = makeCharacter({ backgroundId: 'sage' });
    render(<BackgroundPanel character={char} />);
    // Sage background name is "Sage"
    expect(screen.getByText('Sage')).toBeInTheDocument();
  });

  it('renders background description text', () => {
    const char = makeCharacter({ backgroundId: 'sage' });
    render(<BackgroundPanel character={char} />);
    // Sage description mentions "thirst for knowledge"
    expect(screen.getByText(/thirst for knowledge/i)).toBeInTheDocument();
  });

  it('renders the section header label', () => {
    const char = makeCharacter();
    render(<BackgroundPanel character={char} />);
    expect(screen.getByText('Background')).toBeInTheDocument();
  });

  // --- fallback for unknown background ---

  it('shows fallback UI for unknown background ID', () => {
    // createCharacter() validates IDs against deps, so create a valid char
    // then patch background to an unknown value afterwards.
    const char = { ...makeCharacter(), background: 'unknown-background-id' };
    render(<BackgroundPanel character={char} />);
    // humanize('unknown-background-id') → 'Unknown Background Id'
    expect(screen.getByText(/Unknown Background Id/)).toBeInTheDocument();
    // Should show "Unknown" badge
    expect(screen.getByText('Unknown')).toBeInTheDocument();
    // Should show fallback message
    expect(screen.getByText(/data not found/i)).toBeInTheDocument();
  });

  it('falls back to id as display name when name field is missing', () => {
    // Patch background to an unknown ID to test the humanize fallback path.
    const char = { ...makeCharacter(), background: 'custom-bg' };
    render(<BackgroundPanel character={char} />);
    // humanize('custom-bg') → 'Custom Bg'
    expect(screen.getByText(/Custom Bg/)).toBeInTheDocument();
  });
});
