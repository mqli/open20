import { test, expect } from '@playwright/test';
import { CharacterPage } from '../pages/CharacterPage';

test.describe('Spell Slots', () => {
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

    // Check that slot pips are visible for levels that have slots
    // (UI only shows levels with total > 0)
    const slotPips = page.getByRole('button', { name: /slot/i });
    const pipCount = await slotPips.count();

    // At least some slots should be visible
    expect(pipCount).toBeGreaterThan(0);
  });

  test('should use a spell slot', async ({ page }) => {
    // Switch to first class tab
    const tabs = page.getByRole('tab');
    await tabs.first().click();

    // Find level 1 slot pips
    const levelText = page.getByText(/level 1/i, { exact: false });
    await expect(levelText).toBeVisible();

    // Get the slot pips for level 1
    // Click the first unused pip to consume a slot
    const pips = page.getByRole('button', { name: /slot/i });
    const firstPip = pips.first();

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
    const pips = page.getByRole('button', { name: /slot/i });
    const firstPip = pips.first();

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
