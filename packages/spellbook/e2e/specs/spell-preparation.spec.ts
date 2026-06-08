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

    // Enable preparation mode
    await spellLibrary.togglePreparationMode();

    // Search for a spell
    await spellLibrary.searchSpell('Magic Missile');

    // Prepare the spell
    await spellLibrary.viewSpell('Magic Missile');
    await page.getByRole('button', { name: /prepare/i }).click();

    // Go to character page
    await characterPage.goto();

    // Verify spell is prepared
    await characterPage.expectSpellPrepared('Magic Missile');
  });

  test('should unprepare a spell from character sheet', async ({ page }) => {
    // Go to character page
    await characterPage.goto();

    // Check initial prepared spell count
    const initialCount = await characterPage.getPreparedSpellCount();

    if (initialCount > 0) {
      // Get first prepared spell name
      const firstSpell = await characterPage.preparedSpells
        .getByRole('listitem')
        .first()
        .textContent();

      // Unprepare it
      if (firstSpell) {
        await characterPage.unprepareSpell(firstSpell);

        // Verify count decreased
        const newCount = await characterPage.getPreparedSpellCount();
        expect(newCount).toBe(initialCount - 1);
      }
    }
  });

  test('should show prepared spells in character sheet', async ({ page }) => {
    // Go to spell library
    await spellLibrary.goto();

    // Enable preparation mode and prepare a spell
    await spellLibrary.togglePreparationMode();
    await spellLibrary.searchSpell('Shield');
    await spellLibrary.viewSpell('Shield');
    await page.getByRole('button', { name: /prepare/i }).click();

    // Go to character page
    await characterPage.goto();

    // Verify the spell appears in prepared spells
    await characterPage.expectSpellPrepared('Shield');
  });
});
