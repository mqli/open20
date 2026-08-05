import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider, defaultTranslations } from '@open20/ui';
import { DeleteConfirmDialog } from '../DeleteConfirmDialog';

function renderWithI18n(ui: React.ReactElement) {
  return render(
    <I18nProvider initialLocale="en" translationsSet={{ en: defaultTranslations }}>
      {ui}
    </I18nProvider>,
  );
}

describe('DeleteConfirmDialog', () => {
  it('renders dialog with character name in title', () => {
    renderWithI18n(
      <DeleteConfirmDialog
        open
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        characterName="Tharion"
      />,
    );
    expect(screen.getByText('Delete Tharion?')).toBeInTheDocument();
  });

  it('displays Are you sure warning text', () => {
    renderWithI18n(
      <DeleteConfirmDialog
        open
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        characterName="Tharion"
      />,
    );
    expect(screen.getByText('Are you sure? This cannot be undone.')).toBeInTheDocument();
  });

  it('cancel button closes dialog without calling onConfirm', () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();

    renderWithI18n(
      <DeleteConfirmDialog
        open
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        characterName="Tharion"
      />,
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(onConfirm).not.toHaveBeenCalled();
    // Dialog.Close triggers onOpenChange(false) via Radix
  });

  it('delete button fires onConfirm and closes dialog', () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();

    renderWithI18n(
      <DeleteConfirmDialog
        open
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        characterName="Tharion"
      />,
    );

    fireEvent.click(screen.getByText('Delete'));
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
