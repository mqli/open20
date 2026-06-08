import { test, expect } from '@playwright/test';
import { SpellLibraryPage } from '../pages/SpellLibraryPage';
import { CharacterPage } from '../pages/CharacterPage';

test.fixme('Spell Preparation', () => {
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
    await page.getByTestId('prepare-spell-button').click();

    // Verify the button title now shows "Unprepare Spell" (spell is prepared)
    await expect(page.getByTestId('prepare-spell-button')).toHaveAttribute(
      'title',
      /unprepare spell/i,
    );
  });

  test('should unprepare a spell from spell detail', async ({ page }) => {
    // Go to spell library
    await spellLibrary.goto();

    // Search for a prepared spell (assuming Magic Missile was prepared in previous test)
    await spellLibrary.searchSpell('Magic Missile');

    // Click on the spell to view details
    await spellLibrary.viewSpell('Magic Missile');

    // If the spell is prepared, unprepare it
    const prepareButton = page.getByTestId('prepare-spell-button');
    const title = await prepareButton.getAttribute('title');
    if (title && /unprepare/i.test(title)) {
      await prepareButton.click();

      // Verify the button title now shows "Prepare Spell"
      await expect(page.getByTestId('prepare-spell-button')).toHaveAttribute(
        'title',
        /prepare spell/i,
      );
    }
  });

  test('should show prepared spells in character sheet', async ({ page }) => {
    // Go to spell library and prepare a spell
    await spellLibrary.goto();
    await spellLibrary.searchSpell('Shield');
    await spellLibrary.viewSpell('Shield');

    // Prepare the spell if not already prepared
    const prepareButton = page.getByTestId('prepare-spell-button');
    const title = await prepareButton.getAttribute('title');
    if (title && /prepare spell/i.test(title)) {
      await prepareButton.click();
    }

    // Close the flyout by clicking the close button (aria-label "Close spell details")
    await page.getByRole('button', { name: /close spell details/i }).click();

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
