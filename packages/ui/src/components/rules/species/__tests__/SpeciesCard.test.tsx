import type { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider } from '@/i18n';
import { SpeciesCard } from '..';

function renderWithProviders(ui: ReactNode) {
  return render(<I18nProvider>{ui}</I18nProvider>);
}

const sampleSpecies = {
  id: 'Dwarf',
  source: '2024 PHB',
  description: 'Dwarves are sturdy and resilient.',
  size: 'Medium' as const,
  speed: 25,
  languages: ['Common', 'Dwarvish'],
  abilityBonuses: { Constitution: 2 },
  baseTraits: [
    { name: 'Darkvision', description: 'See in dark.' },
    { name: 'Dwarven Resilience', description: 'Advantage on poison saves.' },
  ],
  subtypes: [
    {
      id: 'hill-dwarf',
      name: 'Hill Dwarf',
      description: 'Tough and resilient.',
      traits: [{ name: 'Dwarven Toughness', description: '+1 hp per level.' }],
    },
  ],
  darkvision: 60,
};

describe('SpeciesCard', () => {
  it('renders species name', () => {
    renderWithProviders(<SpeciesCard species={sampleSpecies} />);
    expect(screen.getByText('Dwarf')).toBeInTheDocument();
  });

  it('renders species description when showDescription is true', () => {
    renderWithProviders(<SpeciesCard species={sampleSpecies} showDescription={true} />);
    expect(screen.getByText('Dwarves are sturdy and resilient.')).toBeInTheDocument();
  });

  it('does not render description when showDescription is false', () => {
    renderWithProviders(<SpeciesCard species={sampleSpecies} showDescription={false} />);
    expect(screen.queryByText('Dwarves are sturdy and resilient.')).not.toBeInTheDocument();
  });

  it('renders size badge', () => {
    renderWithProviders(<SpeciesCard species={sampleSpecies} />);
    // Size badge now shows translated text
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('renders speed', () => {
    renderWithProviders(<SpeciesCard species={sampleSpecies} />);
    expect(screen.getByText('25 ft.')).toBeInTheDocument();
  });

  it('renders languages', () => {
    renderWithProviders(<SpeciesCard species={sampleSpecies} />);
    expect(screen.getByText('Common, Dwarvish')).toBeInTheDocument();
  });

  it('renders ability bonuses', () => {
    renderWithProviders(<SpeciesCard species={sampleSpecies} />);
    expect(screen.getByText(/\+2 CON/)).toBeInTheDocument();
  });

  it('renders darkvision when provided', () => {
    renderWithProviders(<SpeciesCard species={sampleSpecies} />);
    expect(screen.getByText('60 ft.')).toBeInTheDocument();
  });

  it('renders base traits', () => {
    renderWithProviders(<SpeciesCard species={sampleSpecies} />);
    const darkvisionElements = screen.getAllByText('Darkvision');
    expect(darkvisionElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Dwarven Resilience')).toBeInTheDocument();
  });

  it('renders subtypes when provided', () => {
    renderWithProviders(<SpeciesCard species={sampleSpecies} />);
    expect(screen.getByText('Hill Dwarf')).toBeInTheDocument();
    expect(screen.getByText('Dwarven Toughness')).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    const handleClick = vi.fn();
    renderWithProviders(<SpeciesCard species={sampleSpecies} onClick={handleClick} />);
    fireEvent.click(screen.getByText('Dwarf'));
    expect(handleClick).toHaveBeenCalledWith(sampleSpecies);
  });

  it('does not call onClick when not provided', () => {
    renderWithProviders(<SpeciesCard species={sampleSpecies} />);
    const card = screen.getByText('Dwarf').closest('[class*="cursor"]');
    expect(card).toBeNull();
  });

  it('renders in compact mode without description and traits', () => {
    renderWithProviders(<SpeciesCard species={sampleSpecies} density="compact" />);
    expect(screen.queryByText('Dwarves are sturdy and resilient.')).not.toBeInTheDocument();
  });

  it('does not render traits when showTraits is false', () => {
    renderWithProviders(<SpeciesCard species={sampleSpecies} showTraits={false} />);
    expect(screen.queryByText('Base Traits')).not.toBeInTheDocument();
  });
});
