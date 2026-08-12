import { test, expect } from '@playwright/test';

test.describe('character persistence', () => {
  test('character survives page refresh', async ({ page }) => {
    // Open the app
    await page.goto('/');
    await page.waitForSelector('[aria-label="Loading character sheet"]', {
      state: 'hidden',
      timeout: 15000,
    });
    await expect(page.getByText('No Character Yet')).toBeVisible({ timeout: 5000 });

    // Create a character through the wizard
    await page.getByRole('button', { name: 'Create Character' }).click();
    await page.waitForSelector('div[role="dialog"]', { timeout: 5000 });
    const dialog = page.locator('div[role="dialog"]');

    // Basics step
    await dialog.getByRole('textbox', { name: /name/i }).fill('DebugHero');
    await page.waitForTimeout(300);
    await dialog.locator('button:has-text("Human")').first().click();
    await dialog.locator('button:has-text("Acolyte")').first().click();
    await page.waitForTimeout(300);
    await expect(dialog.getByRole('button', { name: 'Next' })).toBeEnabled({ timeout: 5000 });
    await dialog.getByRole('button', { name: 'Next' }).click();

    // Class step
    await page.waitForTimeout(500);
    await dialog.locator('button:has-text("Cleric")').first().click();
    await page.waitForTimeout(300);
    await expect(dialog.getByRole('button', { name: 'Next' })).toBeEnabled({ timeout: 5000 });
    await dialog.getByRole('button', { name: 'Next' }).click();

    // Ability Scores step
    await page.waitForTimeout(500);
    const createBtn = dialog.getByRole('button', { name: 'Create Character' });
    await expect(createBtn).toBeEnabled({ timeout: 5000 });
    await createBtn.click();
    await page.waitForTimeout(1000);

    // Verify character is visible (not empty state)
    await expect(page.getByText('No Character Yet')).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByText('DebugHero')).toBeVisible({ timeout: 5000 });

    // Verify localStorage has the character data
    const beforeChars = await page.evaluate(function () {
      return localStorage.getItem('open20-character-sheet-characters');
    });
    expect(beforeChars).toBeTruthy();
    const parsed = JSON.parse(beforeChars!);
    const beforeIds = Object.keys(parsed);
    expect(beforeIds.length).toBe(1);
    expect(parsed[beforeIds[0]].name).toBe('DebugHero');

    // Verify active ID is stored
    const activeId = await page.evaluate(function () {
      return localStorage.getItem('open20-character-sheet-active-character');
    });
    expect(activeId).toBe(beforeIds[0]);

    // Refresh the page
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[aria-label="Loading character sheet"]', {
      state: 'hidden',
      timeout: 15000,
    });
    await page.waitForTimeout(500);

    // Character should still be visible
    await expect(page.getByText('No Character Yet')).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByText('DebugHero')).toBeVisible({ timeout: 5000 });

    // localStorage should still have the character
    const afterChars = await page.evaluate(function () {
      return localStorage.getItem('open20-character-sheet-characters');
    });
    expect(afterChars).toBeTruthy();
    const afterParsed = JSON.parse(afterChars!);
    const afterIds = Object.keys(afterParsed);
    expect(afterIds.length).toBe(1);
    expect(afterParsed[afterIds[0]].name).toBe('DebugHero');

    // Active ID should be preserved
    const afterActiveId = await page.evaluate(function () {
      return localStorage.getItem('open20-character-sheet-active-character');
    });
    expect(afterActiveId).toBe(afterIds[0]);
  });
});
