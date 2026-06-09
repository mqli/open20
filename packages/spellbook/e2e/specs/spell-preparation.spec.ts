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

  test('should prepare a spell from spell library', async ({ page }) => {
    await spellLibrary.goto();
    await spellLibrary.searchSpell('Magic Missile');
    await spellLibrary.viewSpell('Magic Missile');

    const prepareButton = page.locator('[role="dialog"] .prepare-spell-button');
    await prepareButton.waitFor({ state: 'visible' });
    await prepareButton.click();

    await expect(prepareButton).toHaveAttribute('title', /unprepare spell/i);
  });

  test('should unprepare a spell from spell detail', async ({ page }) => {
    await spellLibrary.goto();
    await spellLibrary.searchSpell('Magic Missile');
    await spellLibrary.viewSpell('Magic Missile');

    const prepareButton = page.locator('[role="dialog"] .prepare-spell-button');
    await prepareButton.waitFor({ state: 'visible' });

    // Ensure it is prepared first
    if (!/unprepare/i.test((await prepareButton.getAttribute('title')) ?? '')) {
      await prepareButton.click();
    }

    await prepareButton.click();

    await expect(prepareButton).toHaveAttribute('title', /prepare spell/i);
  });

  test('should show prepared spells in character sheet', async ({ page }) => {
    await spellLibrary.goto();
    await spellLibrary.searchSpell('Shield');
    await spellLibrary.viewSpell('Shield');

    const prepareButton = page.locator('[role="dialog"] .prepare-spell-button');
    await prepareButton.waitFor({ state: 'visible' });
    if (!/unprepare/i.test((await prepareButton.getAttribute('title')) ?? '')) {
      await prepareButton.click();
    }

    await page.getByRole('button', { name: /close spell details/i }).click();

    await characterPage.goto();

    const sheet = characterPage.sheet;
    await sheet.getByRole('tab').first().click();
    await expect(sheet.getByText('Shield', { exact: true })).toBeVisible();
  });
});
