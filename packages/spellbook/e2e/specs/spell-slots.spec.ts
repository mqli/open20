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
    const slotsArea = characterPage.sheet.locator('.slot-pips').first();

    await expect(slotsArea).toBeVisible();

    const pipCount = await slotsArea.locator('.slot-pip').count();
    expect(pipCount).toBeGreaterThan(0);
  });

  test('should use a spell slot', async () => {
    const slotsArea = characterPage.sheet.locator('.slot-pips').first();
    const availablePips = slotsArea.getByRole('button', { name: 'Available slot' });

    const availableBefore = await availablePips.count();
    expect(availableBefore).toBeGreaterThan(0);

    await availablePips.first().click();

    const availableAfter = await availablePips.count();
    expect(availableAfter).toBe(availableBefore - 1);
  });

  test('should recover a used spell slot', async () => {
    const slotsArea = characterPage.sheet.locator('.slot-pips').first();
    const availablePips = slotsArea.getByRole('button', { name: 'Available slot' });
    const usedPips = slotsArea.getByRole('button', { name: 'Used slot' });

    await availablePips.first().click();
    const availableAfterConsume = await availablePips.count();

    await usedPips.first().click();

    const availableAfterRecover = await availablePips.count();
    expect(availableAfterRecover).toBe(availableAfterConsume + 1);
  });
});
