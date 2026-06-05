// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConcentrationToggle } from '../ConcentrationToggle';

// Mock the translations
vi.mock('@/i18n', () => ({
  useTranslation: () => (key: string) => key,
}));

// Mock the UI components
vi.mock('@open20/ui', async () => {
  const actual = await vi.importActual('@open20/ui');
  return {
    ...(actual as object),
    ConcentrationIcon: ({ size, className }: any) => (
      <svg
        data-testid="concentration-icon"
        width={size === 'xs' ? 16 : 20}
        height={size === 'xs' ? 16 : 20}
        className={className}
      />
    ),
    Button: ({ children, onClick, variant, title, className }: any) => (
      <button
        onClick={onClick}
        title={title}
        data-testid="button"
        data-variant={variant}
        className={className}
      >
        {children}
      </button>
    ),
  };
});

describe('ConcentrationToggle', () => {
  const defaultProps = {
    isConcentrating: false,
    isIconStyle: false,
    onToggle: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with correct title when not concentrating', () => {
    render(<ConcentrationToggle {...defaultProps} />);

    const button = screen.getByTitle('startConcentration');
    expect(button).toBeInTheDocument();
  });

  it('should render with correct title when concentrating', () => {
    render(<ConcentrationToggle {...defaultProps} isConcentrating={true} />);

    const button = screen.getByTitle('endConcentration');
    expect(button).toBeInTheDocument();
  });

  it('should call onToggle when clicked', () => {
    const onToggle = vi.fn();
    render(<ConcentrationToggle {...defaultProps} onToggle={onToggle} />);

    const button = screen.getByTestId('button');
    fireEvent.click(button);

    expect(onToggle).toHaveBeenCalled();
  });

  it('should show "concentrate" text when not in icon style', () => {
    render(<ConcentrationToggle {...defaultProps} />);

    expect(screen.getByText('concentrate')).toBeInTheDocument();
  });

  it('should show "stop" text when concentrating and not in icon style', () => {
    render(<ConcentrationToggle {...defaultProps} isConcentrating={true} isIconStyle={false} />);

    expect(screen.getByText('stop')).toBeInTheDocument();
  });

  it('should not show text when in icon style', () => {
    render(<ConcentrationToggle {...defaultProps} isIconStyle={true} />);

    expect(screen.queryByText('concentrate')).not.toBeInTheDocument();
  });

  it('should apply warning variant when concentrating', () => {
    render(<ConcentrationToggle {...defaultProps} isConcentrating={true} />);

    const button = screen.getByTestId('button');
    expect(button).toHaveAttribute('data-variant', 'warning');
  });

  it('should apply ghost variant when not concentrating', () => {
    render(<ConcentrationToggle {...defaultProps} isConcentrating={false} />);

    const button = screen.getByTestId('button');
    expect(button).toHaveAttribute('data-variant', 'ghost');
  });

  it('should render ConcentrationIcon', () => {
    render(<ConcentrationToggle {...defaultProps} />);

    expect(screen.getByTestId('concentration-icon')).toBeInTheDocument();
  });

  it('should apply animate-pulse class when concentrating and not in icon style', () => {
    const { container: _container } = render(
      <ConcentrationToggle {...defaultProps} isConcentrating={true} isIconStyle={false} />,
    );

    // The animate-pulse class is on the ConcentrationIcon (svg), not the button
    const icon = screen.getByTestId('concentration-icon');
    expect(icon).toHaveClass('animate-pulse');
  });

  it('should not apply animate-pulse class when in icon style', () => {
    const { container: _container } = render(
      <ConcentrationToggle {...defaultProps} isConcentrating={true} isIconStyle={true} />,
    );

    const icon = screen.getByTestId('concentration-icon');
    expect(icon).not.toHaveClass('animate-pulse');
  });
});
