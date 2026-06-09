import { test, expect } from '@playwright/test';
import { CharacterPage } from '../pages/CharacterPage';
import { TEST_WIZARD, STORAGE_KEY, ACTIVE_CHARACTER_KEY } from '../fixtures/test-character';

test.describe('Spell Slots', () => {
  let characterPage: CharacterPage;

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(
      ({ storageKey, activeKey, character }) => {
        localStorage.setItem(storageKey, JSON.stringify([character]));
        localStorage.setItem(activeKey, character.id);
      },
      { storageKey: STORAGE_KEY, activeKey: ACTIVE_CHARACTER_KEY, character: TEST_WIZARD },
    );
    characterPage = new CharacterPage(page);
    await characterPage.goto();
  });

  test('should display spell slots for character', async () => {
    const sheet = characterPage.sheet;
    const tabs = sheet.getByRole('tab');
    expect(await tabs.count()).toBeGreaterThan(0);

    await tabs.first().click();

    await expect(sheet.locator('.slot-pips').first()).toBeVisible();

    const pipCount = await sheet.locator('.slot-pip').count();
    expect(pipCount).toBeGreaterThan(0);
  });

  test('should use a spell slot', async () => {
    const sheet = characterPage.sheet;
    await sheet.getByRole('tab').first().click();

    const availableBefore = await sheet.locator('.slot-pip[aria-checked="false"]').count();
    expect(availableBefore).toBeGreaterThan(0);

    // Click any available pip — consumes one slot (last pip flips to used)
    await sheet.locator('.slot-pip[aria-checked="false"]').first().click();

    const availableAfter = await sheet.locator('.slot-pip[aria-checked="false"]').count();
    expect(availableAfter).toBe(availableBefore - 1);
  });

  test('should recover a used spell slot', async () => {
    const sheet = characterPage.sheet;
    await sheet.getByRole('tab').first().click();

    // Consume one slot first
    await sheet.locator('.slot-pip[aria-checked="false"]').first().click();
    const availableAfterConsume = await sheet.locator('.slot-pip[aria-checked="false"]').count();

    // Click a used pip to recover it
    await sheet.locator('.slot-pip[aria-checked="true"]').first().click();

    const availableAfterRecover = await sheet.locator('.slot-pip[aria-checked="false"]').count();
    expect(availableAfterRecover).toBe(availableAfterConsume + 1);
  });
});
