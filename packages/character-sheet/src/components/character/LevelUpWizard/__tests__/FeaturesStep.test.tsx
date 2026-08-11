import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { initContent } from '@/core/content-resolver';
import { FeaturesStep } from '../FeaturesStep';

describe('FeaturesStep', () => {
  beforeEach(() => {
    initContent();
  });

  it('shows the class name and new level header', () => {
    render(<FeaturesStep classId="Wizard" newLevel={6} />);
    expect(screen.getByText(/Wizard Level 6/)).toBeInTheDocument();
  });

  it('shows features gained at the new level', () => {
    render(<FeaturesStep classId="Wizard" newLevel={2} />);
    // Wizard level 2 gets Scholar feature
    expect(screen.getByText('Scholar')).toBeInTheDocument();
    expect(screen.getByText(/What You Gain/)).toBeInTheDocument();
  });

  it('shows spellcasting progression changes', () => {
    render(<FeaturesStep classId="Wizard" newLevel={3} />);
    expect(screen.getByText('Spellcasting')).toBeInTheDocument();
  });

  it('shows spellcasting progression when level has spellcasting changes', () => {
    // Wizard level 13 has only spell slot progression (no features)
    render(<FeaturesStep classId="Wizard" newLevel={13} />);
    // Should show spellcasting progression
    expect(screen.getByText('Spellcasting')).toBeInTheDocument();
    expect(screen.queryByText('Nothing new at this level')).not.toBeInTheDocument();
  });

  it('shows "Class not found" for invalid classId', () => {
    render(<FeaturesStep classId="Bogus" newLevel={2} />);
    expect(screen.getByText('Class not found')).toBeInTheDocument();
  });
});
