import { test, expect } from '@playwright/test';
import { SpellLibraryPage } from '../pages/SpellLibraryPage';
import { CharacterPage } from '../pages/CharacterPage';
import { TEST_WIZARD, STORAGE_KEY, ACTIVE_CHARACTER_KEY } from '../fixtures/test-character';

test.describe('Spell Preparation', () => {
  let spellLibrary: SpellLibraryPage;
  let characterPage: CharacterPage;

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(
      ({ storageKey, activeKey, character }) => {
        localStorage.setItem(storageKey, JSON.stringify([character]));
        localStorage.setItem(activeKey, character.id);
      },
      { storageKey: STORAGE_KEY, activeKey: ACTIVE_CHARACTER_KEY, character: TEST_WIZARD },
    );
    spellLibrary = new SpellLibraryPage(page);
    characterPage = new CharacterPage(page);
  });

  test('should show prepared spells in character sheet', async () => {
    await spellLibrary.goto();
    await spellLibrary.searchSpell('Shield');
    await spellLibrary.viewSpell('Shield');

    const prepareButton = spellLibrary.page.locator('.prepare-spell-button').last();
    await prepareButton.waitFor({ state: 'visible' });
    if (!/unprepare/i.test((await prepareButton.getAttribute('title')) ?? '')) {
      await prepareButton.click();
    }

    await spellLibrary.closeFlyout();

    await characterPage.goto();

    await characterPage.classTab.first().click();
    await expect(characterPage.sheet.getByText('Shield', { exact: true })).toBeVisible();
  });
});
