// ClassFeaturesPanel.test.tsx — T-216

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClassFeaturesPanel } from '../ClassFeaturesPanel';
import { makeCharacter } from '@/test/fixtures';

describe('ClassFeaturesPanel', () => {
  // ── Rendering ──

  it('renders class name and level header', () => {
    const char = makeCharacter({ classId: 'Wizard', classLevel: 5 });
    render(<ClassFeaturesPanel character={char} />);

    expect(screen.getByText('Class Features')).toBeInTheDocument();
    expect(screen.getByText('Wizard')).toBeInTheDocument();
    expect(screen.getByText('Level 5')).toBeInTheDocument();
  });

  it('renders feature names for Wizard 5', () => {
    const char = makeCharacter({ classId: 'Wizard', classLevel: 5 });
    render(<ClassFeaturesPanel character={char} />);

    // Wizard 1-5 features
    expect(screen.getByText('Spellcasting')).toBeInTheDocument();
    expect(screen.getByText('Ritual Adept')).toBeInTheDocument();
    expect(screen.getByText('Arcane Recovery')).toBeInTheDocument();
    expect(screen.getByText('Scholar')).toBeInTheDocument();
    expect(screen.getByText('Wizard Subclass')).toBeInTheDocument();
    expect(screen.getByText('Ability Score Improvement')).toBeInTheDocument();
    expect(screen.getByText('Memorize Spell')).toBeInTheDocument();
  });

  // ── Level filtering ──

  it('only shows features up to character level (Wizard 1)', () => {
    const char = makeCharacter({ classId: 'Wizard', classLevel: 1 });
    render(<ClassFeaturesPanel character={char} />);

    // Level 1 features
    expect(screen.getByText('Spellcasting')).toBeInTheDocument();
    expect(screen.getByText('Ritual Adept')).toBeInTheDocument();
    expect(screen.getByText('Arcane Recovery')).toBeInTheDocument();

    // Level 2+ features should NOT appear
    expect(screen.queryByText('Scholar')).not.toBeInTheDocument();
    expect(screen.queryByText('Memorize Spell')).not.toBeInTheDocument();
  });

  it('shows features up to Wizard level 3', () => {
    const char = makeCharacter({ classId: 'Wizard', classLevel: 3 });
    render(<ClassFeaturesPanel character={char} />);

    expect(screen.getByText('Spellcasting')).toBeInTheDocument();
    expect(screen.getByText('Ritual Adept')).toBeInTheDocument();
    expect(screen.getByText('Arcane Recovery')).toBeInTheDocument();
    expect(screen.getByText('Scholar')).toBeInTheDocument();
    expect(screen.getByText('Wizard Subclass')).toBeInTheDocument();

    // Level 4+ should not appear
    expect(screen.queryByText('Ability Score Improvement')).not.toBeInTheDocument();
    expect(screen.queryByText('Memorize Spell')).not.toBeInTheDocument();
  });

  // ── Expand / Collapse ──

  it('features are expandable on click', () => {
    const char = makeCharacter({ classId: 'Wizard', classLevel: 5 });
    render(<ClassFeaturesPanel character={char} />);

    // Arcane Recovery has a description
    const arcaneBtn = screen.getByRole('button', { name: 'Collapse Arcane Recovery' });
    fireEvent.click(arcaneBtn);

    expect(screen.getByRole('button', { name: 'Expand Arcane Recovery' })).toBeInTheDocument();
  });

  it('toggles expansion on repeated clicks', () => {
    const char = makeCharacter({ classId: 'Wizard', classLevel: 5 });
    render(<ClassFeaturesPanel character={char} />);

    const btn = screen.getByRole('button', { name: 'Collapse Spellcasting' });
    fireEvent.click(btn);
    expect(screen.getByRole('button', { name: 'Expand Spellcasting' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Expand Spellcasting' }));
    expect(screen.getByRole('button', { name: 'Collapse Spellcasting' })).toBeInTheDocument();
  });

  // ── Unknown class ──

  it('returns nothing for character with no classes (not rendered)', () => {
    const char = makeCharacter();
    // Patch classes to empty
    const noClasses = { ...char, classes: [] };
    const { container } = render(<ClassFeaturesPanel character={noClasses} />);

    expect(container.innerHTML).toBe('');
  });

  it('skips unknown class IDs gracefully', () => {
    const char = makeCharacter({ classId: 'Wizard', classLevel: 5 });
    // Patch class ID to an unknown one
    const unknownClass = { ...char, classes: [{ ...char.classes[0]!, classId: 'UnknownClass' }] };
    const { container } = render(<ClassFeaturesPanel character={unknownClass} />);

    expect(container.innerHTML).toBe('');
  });

  // ── className prop ──

  it('applies className prop', () => {
    const char = makeCharacter({ classId: 'Wizard', classLevel: 5 });
    const { container } = render(<ClassFeaturesPanel character={char} className="custom-class" />);

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
