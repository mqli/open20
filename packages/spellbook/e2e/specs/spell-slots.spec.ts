import { test, expect } from '@playwright/test';
import { CharacterPage } from '../pages/CharacterPage';

test.fixme('Spell Slots', () => {
  let characterPage: CharacterPage;

  test.beforeEach(async ({ page }) => {
    characterPage = new CharacterPage(page);
    await characterPage.goto();
  });

  test('should display spell slots for character', async ({ page }) => {
    // Wait for character sheet to load
    await page.waitForLoadState('networkidle');

    // Check that at least one class tab exists
    const tabs = page.getByRole('tab');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThan(0);

    // Switch to first class tab
    await tabs.first().click();

    // Check that slot pips are visible
    // (UI only shows levels with total > 0)
    const slotPips = page.getByTestId('slot-pips');
    await expect(slotPips).toBeVisible();

    // At least some slots should be visible
    const pips = page.getByTestId(/^slot-pip-\d+$/);
    const pipCount = await pips.count();
    expect(pipCount).toBeGreaterThan(0);
  });

  test('should use a spell slot', async ({ page }) => {
    // Switch to first class tab
    const tabs = page.getByRole('tab');
    await tabs.first().click();

    // Get the first slot pip
    const firstPip = page.getByTestId('slot-pip-0');

    // Get initial state (check if pip is used or not)
    const initialAriaChecked = await firstPip.getAttribute('aria-checked');

    // Click to toggle
    await firstPip.click();

    // Verify state changed
    const newAriaChecked = await firstPip.getAttribute('aria-checked');
    expect(newAriaChecked).not.toBe(initialAriaChecked);
  });

  test('should recover a used spell slot', async ({ page }) => {
    // Switch to first class tab
    const tabs = page.getByRole('tab');
    await tabs.first().click();

    // Click a pip to use a slot (if not already used)
    const firstPip = page.getByTestId('slot-pip-0');

    // Make sure it's used
    const isChecked = await firstPip.getAttribute('aria-checked');
    if (isChecked === 'false') {
      await firstPip.click();
    }

    // Now recover it
    await firstPip.click();

    // Verify it's recovered
    const newChecked = await firstPip.getAttribute('aria-checked');
    expect(newChecked).toBe('false');
  });
});
