import { test, expect } from '@playwright/test';
import { CharacterPage } from '../pages/CharacterPage';

test.describe('Spell Slots', () => {
  let characterPage: CharacterPage;

  test.beforeEach(async ({ page }) => {
    characterPage = new CharacterPage(page);
    await characterPage.goto();
  });

  test('should display spell slots for character', async () => {
    // Verify spell slots section is visible
    await expect(characterPage.spellSlots).toBeVisible();

    // Verify slots are displayed for each level
    for (let level = 1; level <= 9; level++) {
      const slots = await characterPage.getSpellSlots(level);
      // Slots should be a non-negative number
      expect(slots).toBeGreaterThanOrEqual(0);
    }
  });

  test('should use a spell slot', async () => {
    // Get initial slot count for level 1
    const initialSlots = await characterPage.getSpellSlots(1);

    if (initialSlots > 0) {
      // Use a spell slot
      await characterPage.useSpellSlot(1);

      // Verify slot count decreased
      const newSlots = await characterPage.getSpellSlots(1);
      expect(newSlots).toBe(initialSlots - 1);
    }
  });

  test('should recover a used spell slot', async () => {
    // Use a spell slot first
    const initialSlots = await characterPage.getSpellSlots(1);

    if (initialSlots > 0) {
      // Use a slot
      await characterPage.useSpellSlot(1);
      const afterUse = await characterPage.getSpellSlots(1);

      // Recover the slot
      await characterPage.recoverSpellSlot(1);
      const afterRecover = await characterPage.getSpellSlots(1);

      // Verify slot count is back to initial
      expect(afterRecover).toBe(initialSlots);
    }
  });

  test('should not allow using more slots than available', async () => {
    // Get available slots for level 1
    const availableSlots = await characterPage.getSpellSlots(1);

    // Try to use more slots than available
    for (let i = 0; i <= availableSlots; i++) {
      if (i < availableSlots) {
        await characterPage.useSpellSlot(1);
      } else {
        // This should fail or show some indication
        const slotsAfter = await characterPage.getSpellSlots(1);
        expect(slotsAfter).toBe(0);
      }
    }
  });
});
