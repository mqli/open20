import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkillsList } from '../SkillsList';
import { makeCharacter } from '@/test/fixtures';

describe('SkillsList', () => {
  it('renders all 18 skill names', () => {
    const char = makeCharacter();
    const onRollSkill = vi.fn();
    render(<SkillsList character={char} onRollSkill={onRollSkill} />);

    // Check a few skills from different abilities
    expect(screen.getByText('Athletics')).toBeInTheDocument();
    expect(screen.getByText('Stealth')).toBeInTheDocument();
    expect(screen.getByText('Arcana')).toBeInTheDocument();
    expect(screen.getByText('Insight')).toBeInTheDocument();
    expect(screen.getByText('Perception')).toBeInTheDocument();
    expect(screen.getByText('Deception')).toBeInTheDocument();
  });

  it('renders skill bonuses from character', () => {
    const char = makeCharacter();
    const onRollSkill = vi.fn();
    render(<SkillsList character={char} onRollSkill={onRollSkill} />);

    // Wizard: INT 16 (+3) + PB +3 with Arcana proficiency → +6
    // Multiple skills may have the same bonus; just verify bonuses are rendered
    const bonuses = screen.getAllByText(/^[+−]\d+$/);
    expect(bonuses.length).toBe(18); // all 18 skills have a bonus
  });

  it('uses two-column grid layout on desktop', () => {
    const char = makeCharacter();
    const onRollSkill = vi.fn();
    const { container } = render(<SkillsList character={char} onRollSkill={onRollSkill} />);

    const grid = container.querySelector('.grid');
    expect(grid?.className).toContain('grid-cols-1');
    expect(grid?.className).toContain('md:grid-cols-2');
  });

  it('calls onRollSkill when a skill is rolled', () => {
    const char = makeCharacter();
    const onRollSkill = vi.fn();
    render(<SkillsList character={char} onRollSkill={onRollSkill} />);

    // Click the Arcana roll button
    const arcanaButton = screen.getByLabelText('Roll Arcana');
    arcanaButton.click();
    expect(onRollSkill).toHaveBeenCalledWith('Arcana', 'none');
  });

  it('shows proficiency icons correctly for a wizard', () => {
    const char = makeCharacter();
    const { container } = render(<SkillsList character={char} onRollSkill={vi.fn()} />);

    // Wizard has Arcana proficiency → CircleDot
    const circleDots = container.querySelectorAll('.lucide-circle-dot');
    expect(circleDots.length).toBeGreaterThan(0);

    // Wizard has non-proficient skills → Circle
    const circles = container.querySelectorAll('.lucide-circle');
    expect(circles.length).toBeGreaterThan(0);
  });
});
