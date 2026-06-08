import { test, expect } from '@playwright/test';
import { SpellLibraryPage } from '../pages/SpellLibraryPage';
import { CharacterPage } from '../pages/CharacterPage';

test.describe('Spell Preparation', () => {
  let spellLibrary: SpellLibraryPage;
  let characterPage: CharacterPage;

  test.beforeEach(async ({ page }) => {
    spellLibrary = new SpellLibraryPage(page);
    characterPage = new CharacterPage(page);
  });

  test('should prepare a spell from spell library', async ({ page }) => {
    // Go to spell library
    await spellLibrary.goto();

    // Search for a spell
    await spellLibrary.searchSpell('Magic Missile');

    // Click on the spell to view details
    await spellLibrary.viewSpell('Magic Missile');

    // Click prepare button in the detail flyout
    await page.getByRole('button', { name: /prepare spell/i }).click();

    // Verify the button now shows "Unprepare Spell" (spell is prepared)
    await expect(page.getByRole('button', { name: /unprepare spell/i })).toBeVisible();
  });

  test('should unprepare a spell from spell detail', async ({ page }) => {
    // Go to spell library
    await spellLibrary.goto();

    // Search for a prepared spell (assuming Magic Missile was prepared in previous test)
    await spellLibrary.searchSpell('Magic Missile');

    // Click on the spell to view details
    await spellLibrary.viewSpell('Magic Missile');

    // If the spell is prepared, unprepare it
    const unprepareButton = page.getByRole('button', { name: /unprepare spell/i });
    if (await unprepareButton.isVisible()) {
      await unprepareButton.click();

      // Verify the button now shows "Prepare Spell"
      await expect(page.getByRole('button', { name: /prepare spell/i })).toBeVisible();
    }
  });

  test('should show prepared spells in character sheet', async ({ page }) => {
    // Go to spell library and prepare a spell
    await spellLibrary.goto();
    await spellLibrary.searchSpell('Shield');
    await spellLibrary.viewSpell('Shield');

    // Prepare the spell if not already prepared
    const prepareButton = page.getByRole('button', { name: /prepare spell/i });
    if (await prepareButton.isVisible()) {
      await prepareButton.click();
    }

    // Close the flyout
    await page.getByRole('button', { name: /close/i }).click();

    // Go to character page
    await characterPage.goto();

    // Switch to the class tab that has the spell prepared
    // (Assuming the first class tab)
    const classTab = page.getByRole('tab').first();
    await classTab.click();

    // Verify the prepared spell is visible
    await characterPage.expectSpellVisible('Shield');
  });
});
