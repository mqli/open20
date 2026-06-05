// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DiceRollOverlay } from '../DiceRollOverlay';
import { useRollStore } from '@/stores/roll-store';

// Mock the roll store
vi.mock('@/stores/roll-store', () => ({
  useRollStore: vi.fn(),
}));

describe('DiceRollOverlay', () => {
  const mockLatestRoll = {
    id: 'roll-1',
    total: 21,
    expression: 'd20(15) + 6',
    label: 'Spell Attack Roll',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when there is no latest roll', () => {
    (useRollStore as any).mockReturnValue({ latestRoll: null });

    const { container } = render(<DiceRollOverlay />);

    expect(container.firstChild).toBeNull();
  });

  it('should render when there is a latest roll', () => {
    (useRollStore as any).mockReturnValue({ latestRoll: mockLatestRoll });

    render(<DiceRollOverlay />);

    expect(screen.getByText('21')).toBeInTheDocument();
    expect(screen.getByText('d20(15) + 6')).toBeInTheDocument();
    expect(screen.getByText('Spell Attack Roll')).toBeInTheDocument();
  });

  it('should display roll label', () => {
    (useRollStore as any).mockReturnValue({ latestRoll: mockLatestRoll });

    render(<DiceRollOverlay />);

    expect(screen.getByText('Spell Attack Roll')).toBeInTheDocument();
  });

  it('should display roll total', () => {
    (useRollStore as any).mockReturnValue({ latestRoll: { ...mockLatestRoll, total: 15 } });

    render(<DiceRollOverlay />);

    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('should display roll expression', () => {
    (useRollStore as any).mockReturnValue({
      latestRoll: { ...mockLatestRoll, expression: '3d6(4, 6, 2) + 3' },
    });

    render(<DiceRollOverlay />);

    expect(screen.getByText('3d6(4, 6, 2) + 3')).toBeInTheDocument();
  });

  it('should use default label when label is not provided', () => {
    (useRollStore as any).mockReturnValue({
      latestRoll: { ...mockLatestRoll, label: undefined },
    });

    render(<DiceRollOverlay />);

    expect(screen.getByText('Roll Result')).toBeInTheDocument();
  });

  it('should render dismiss button', () => {
    (useRollStore as any).mockReturnValue({ latestRoll: mockLatestRoll });

    render(<DiceRollOverlay />);

    // The X icon button should be present
    const dismissButton = screen.getByRole('button');
    expect(dismissButton).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    (useRollStore as any).mockReturnValue({ latestRoll: mockLatestRoll });

    render(<DiceRollOverlay />);

    // Check for role="status" for accessibility
    const overlay = screen.getByRole('status');
    expect(overlay).toBeInTheDocument();
  });
});
