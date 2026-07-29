import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SkillRow } from '../SkillRow';
import type { SkillRowProps } from '../SkillRow';
import { makeCharacter } from '@/test/fixtures';
import { getSkillBonus } from 'open20-core';
import { SKILL_ABILITY_MAP } from 'open20-core/types';
import type { SkillName } from 'open20-core/types';

function makeProps(
  skill: SkillName = 'Arcana',
  overrides: Partial<SkillRowProps> = {},
): SkillRowProps {
  const char = makeCharacter();
  const entry = char.skills[skill]!;
  const bonus = getSkillBonus(
    char.abilityScores,
    entry,
    SKILL_ABILITY_MAP[skill],
    char.combatStats.proficiencyBonus,
  );
  return {
    skill,
    bonus,
    skillEntry: entry,
    onRoll: vi.fn(),
    ...overrides,
  };
}

const noop = () => {};

describe('SkillRow', () => {
  // --- proficiency icon rendering ---

  it('renders Circle icon (empty) for non-proficient skill', () => {
    const char = makeCharacter();
    // A Wizard is not proficient in Athletics by default
    const entry = char.skills['Athletics']!;
    const { container } = render(
      <SkillRow
        skill="Athletics"
        bonus={0} // made-up for this test
        skillEntry={entry}
        onRoll={noop}
      />,
    );
    // The proficiency icon is next to the name — query by data attribute or icon class
    const profIcons = container.querySelectorAll('svg.lucide-circle.text-text-secondary');
    expect(profIcons.length).toBe(1);
  });

  it('renders CircleDot icon (filled) for proficient skill', () => {
    const { container } = render(
      <SkillRow
        skill="Arcana"
        bonus={5}
        skillEntry={{ proficient: true, expertise: false }}
        onRoll={noop}
      />,
    );
    // CircleDot icon with primary-600 color per NFR-01
    const profIcons = container.querySelectorAll('svg.lucide-circle-dot.text-primary-600');
    expect(profIcons.length).toBe(1);
  });

  it('renders Star icon for expertise skill', () => {
    const { container } = render(
      <SkillRow
        skill="Arcana"
        bonus={8}
        skillEntry={{ proficient: true, expertise: true }}
        onRoll={noop}
      />,
    );
    // Star icon with warning color per NFR-01
    const profIcons = container.querySelectorAll('svg.lucide-star.text-warning');
    expect(profIcons.length).toBe(1);
  });

  // --- bonus display ---

  it('renders positive bonus with + sign', () => {
    render(<SkillRow {...makeProps('Arcana')} />);
    expect(screen.getByText(/^\+/)).toBeInTheDocument();
  });

  it('renders negative bonus with minus sign', () => {
    const char = makeCharacter({ abilityScores: { Strength: 8 } });
    const skill: SkillName = 'Athletics';
    const entry = { proficient: false, expertise: false };
    const bonus = getSkillBonus(
      char.abilityScores,
      entry,
      'Strength',
      char.combatStats.proficiencyBonus,
    );
    render(<SkillRow skill={skill} bonus={bonus} skillEntry={entry} onRoll={noop} />);
    // Bonus is −1 (minus sign)
    expect(screen.getByText('−1')).toBeInTheDocument();
  });

  it('renders zero bonus as +0', () => {
    render(
      <SkillRow
        skill="Stealth"
        bonus={0}
        skillEntry={{ proficient: false, expertise: false }}
        onRoll={noop}
      />,
    );
    expect(screen.getByText('+0')).toBeInTheDocument();
  });

  // --- roll interaction ---

  it('calls onRoll with skill name and "none" modifier on dice button click', () => {
    const onRoll = vi.fn();
    const props = makeProps('Perception');
    render(<SkillRow {...props} onRoll={onRoll} />);
    fireEvent.click(screen.getByLabelText('Roll Perception'));
    expect(onRoll).toHaveBeenCalledWith('Perception', 'none');
  });

  it('renders roll button with correct aria-label', () => {
    render(<SkillRow {...makeProps('Stealth')} />);
    expect(screen.getByLabelText('Roll Stealth')).toBeInTheDocument();
  });

  // --- skill name renders ---

  it('renders skill name', () => {
    render(<SkillRow {...makeProps('Insight')} />);
    expect(screen.getByText('Insight')).toBeInTheDocument();
  });
});
