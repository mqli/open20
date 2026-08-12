import { test, expect } from '@playwright/test';

test.describe('character persistence', () => {
  test('character survives page refresh', async ({ page }) => {
    page.on('console', (msg) => {
      console.log('[BROWSER ' + msg.type() + '] ' + msg.text());
    });

    // Initial load
    console.log('\n=== INITIAL LOAD ===');
    await page.goto('/');
    await page.waitForSelector('[aria-label="Loading character sheet"]', {
      state: 'hidden',
      timeout: 15000,
    });
    await expect(page.getByText('No Character Yet')).toBeVisible({ timeout: 5000 });

    // Open wizard
    console.log('\n=== CREATE CHARACTER ===');
    await page.getByRole('button', { name: 'Create Character' }).click();
    await page.waitForSelector('div[role="dialog"]', { timeout: 5000 });

    const dialog = page.locator('div[role="dialog"]');

    // Basics step
    await dialog.getByRole('textbox', { name: /name/i }).fill('DebugHero');
    await page.waitForTimeout(300);
    await dialog.locator('button:has-text("Human")').first().click();
    await dialog.locator('button:has-text("Acolyte")').first().click();
    await page.waitForTimeout(300);
    await dialog.getByRole('button', { name: 'Next' }).click();

    // Class step
    await page.waitForTimeout(500);
    await dialog.locator('button:has-text("Cleric")').first().click();
    await page.waitForTimeout(300);
    await dialog.getByRole('button', { name: 'Next' }).click();

    // Ability Scores step
    await page.waitForTimeout(500);
    await dialog.getByRole('button', { name: 'Create Character' }).click();
    await page.waitForTimeout(1000);

    // Verify before refresh
    console.log('\n=== BEFORE REFRESH ===');
    const before = await page.evaluate(() => ({
      chars: localStorage.getItem('open20-character-sheet-characters'),
      active: localStorage.getItem('open20-character-sheet-active-character'),
    }));
    console.log('localStorage chars:', !!before.chars);
    console.log('localStorage activeId:', before.active);
    console.log('UI empty:', await page.getByText('No Character Yet').isVisible());
    console.log('UI name:', await page.getByText('DebugHero').isVisible());

    // Refresh
    console.log('\n=== REFRESH ===');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[aria-label="Loading character sheet"]', {
      state: 'hidden',
      timeout: 15000,
    });
    await page.waitForTimeout(500);

    // Verify after refresh
    console.log('\n=== AFTER REFRESH ===');
    const after = await page.evaluate(() => ({
      chars: localStorage.getItem('open20-character-sheet-characters'),
      active: localStorage.getItem('open20-character-sheet-active-character'),
    }));
    console.log('localStorage chars:', !!after.chars);
    console.log('localStorage activeId:', after.active);
    console.log('UI empty:', await page.getByText('No Character Yet').isVisible());
    console.log('UI name:', await page.getByText('DebugHero').isVisible());

    expect(after.chars).toBeTruthy();
    expect(after.active).toBeTruthy();
    await expect(page.getByText('No Character Yet')).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByText('DebugHero')).toBeVisible({ timeout: 5000 });
  });
});
