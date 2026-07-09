// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CharacterBottomControls } from '@/components/layout/CharacterBottomControls';
import { I18nProvider } from '@open20/ui';
import { enTranslations } from '@/i18n';

const renderWithI18n = (ui: React.ReactElement) => {
  return render(
    <I18nProvider translationsSet={{ en: enTranslations }} initialLocale="en">
      {ui}
    </I18nProvider>,
  );
};

const noop = vi.fn();

describe('CharacterBottomControls', () => {
  it('should display Short Rest and Long Rest buttons', () => {
    renderWithI18n(
      <CharacterBottomControls
        canPrepare={false}
        canLearn={false}
        showPreparedOnly={false}
        showKnownOnly={false}
        onShowPreparedOnlyChange={noop}
        onShowKnownOnlyChange={noop}
        onShortRest={noop}
        onLongRest={noop}
      />,
    );

    expect(screen.getByText('Short')).toBeInTheDocument();
    expect(screen.getByText('Long')).toBeInTheDocument();
  });

  it('should call onShortRest when Short Rest button is clicked', () => {
    const onShortRest = vi.fn();

    renderWithI18n(
      <CharacterBottomControls
        canPrepare={false}
        canLearn={false}
        showPreparedOnly={false}
        showKnownOnly={false}
        onShowPreparedOnlyChange={noop}
        onShowKnownOnlyChange={noop}
        onShortRest={onShortRest}
        onLongRest={noop}
      />,
    );

    fireEvent.click(screen.getByText('Short'));
    expect(onShortRest).toHaveBeenCalledTimes(1);
  });

  it('should call onLongRest when Long Rest button is clicked', () => {
    const onLongRest = vi.fn();

    renderWithI18n(
      <CharacterBottomControls
        canPrepare={false}
        canLearn={false}
        showPreparedOnly={false}
        showKnownOnly={false}
        onShowPreparedOnlyChange={noop}
        onShowKnownOnlyChange={noop}
        onShortRest={noop}
        onLongRest={onLongRest}
      />,
    );

    fireEvent.click(screen.getByText('Long'));
    expect(onLongRest).toHaveBeenCalledTimes(1);
  });

  it('should show prepared toggle when canPrepare is true', () => {
    renderWithI18n(
      <CharacterBottomControls
        canPrepare
        canLearn={false}
        showPreparedOnly={false}
        showKnownOnly={false}
        onShowPreparedOnlyChange={noop}
        onShowKnownOnlyChange={noop}
        onShortRest={noop}
        onLongRest={noop}
      />,
    );

    expect(screen.getByText('Prepared')).toBeInTheDocument();
    expect(screen.queryByText('Known')).not.toBeInTheDocument();
  });

  it('should show known toggle when canLearn is true', () => {
    renderWithI18n(
      <CharacterBottomControls
        canPrepare={false}
        canLearn
        showPreparedOnly={false}
        showKnownOnly={false}
        onShowPreparedOnlyChange={noop}
        onShowKnownOnlyChange={noop}
        onShortRest={noop}
        onLongRest={noop}
      />,
    );

    expect(screen.getByText('Known')).toBeInTheDocument();
    expect(screen.queryByText('Prepared')).not.toBeInTheDocument();
  });

  it('should call onShowPreparedOnlyChange when prepared toggle is clicked', () => {
    const onToggle = vi.fn();

    renderWithI18n(
      <CharacterBottomControls
        canPrepare
        canLearn={false}
        showPreparedOnly={false}
        showKnownOnly={false}
        onShowPreparedOnlyChange={onToggle}
        onShowKnownOnlyChange={noop}
        onShortRest={noop}
        onLongRest={noop}
      />,
    );

    fireEvent.click(screen.getByText('Prepared'));
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('should have data-testid on root element', () => {
    renderWithI18n(
      <CharacterBottomControls
        canPrepare={false}
        canLearn={false}
        showPreparedOnly={false}
        showKnownOnly={false}
        onShowPreparedOnlyChange={noop}
        onShowKnownOnlyChange={noop}
        onShortRest={noop}
        onLongRest={noop}
      />,
    );

    expect(screen.getByTestId('character-bottom-controls')).toBeInTheDocument();
  });
});
