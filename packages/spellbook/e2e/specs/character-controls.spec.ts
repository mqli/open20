import { test, expect } from '@playwright/test';
import { SpellLibraryPage } from '../pages/SpellLibraryPage';
import { CharacterPage } from '../pages/CharacterPage';
import { TEST_WIZARD, STORAGE_KEY, ACTIVE_CHARACTER_KEY } from '../fixtures/test-character';

test.describe('Character Bottom Controls', () => {
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

  test.describe('Prepared Filter Toggle (desktop only)', () => {
    test('should filter to only prepared spells when toggled on', async ({ page }) => {
      // Skip mobile — on mobile the toggle is on a different tab
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 1024) {
        test.skip();
        return;
      }

      await spellLibrary.goto();

      const initialCount = await spellLibrary.spellCards.count();
      expect(initialCount).toBeGreaterThan(100);

      // Click Prepared toggle in character panel sidebar
      const panel = page.getByTestId('character-panel');
      await panel.locator('.prepared-toggle').click();
      await page.waitForTimeout(300);

      // Only "Shield" is prepared → 1 spell card showing
      const filteredCount = await spellLibrary.spellCards.count();
      expect(filteredCount).toBeLessThan(initialCount);
      expect(filteredCount).toBe(1);
      // Use spell-card scoped selector to avoid strict mode with character panel text
      await expect(page.locator('.spell-card').filter({ hasText: 'Shield' })).toBeVisible();
    });

    test('should show all spells when prepared toggle is turned off', async ({ page }) => {
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 1024) {
        test.skip();
        return;
      }

      await spellLibrary.goto();

      const panel = page.getByTestId('character-panel');
      const preparedToggle = panel.locator('.prepared-toggle');

      await preparedToggle.click();
      await page.waitForTimeout(200);
      await preparedToggle.click();
      await page.waitForTimeout(300);

      const count = await spellLibrary.spellCards.count();
      expect(count).toBeGreaterThan(100);
    });
  });

  test.describe('Mobile', () => {
    test('should display bottom controls on mobile character tab', async ({ page }) => {
      const viewport = page.viewportSize();
      if (!viewport || viewport.width >= 1024) {
        test.skip();
        return;
      }

      await characterPage.goto();

      const content = page.getByTestId('character-content');
      const controls = content.getByTestId('character-bottom-controls');
      await expect(controls).toBeVisible();

      await expect(controls.getByRole('button', { name: /^Short$/ })).toBeVisible();
      await expect(controls.getByRole('button', { name: /^Long$/ })).toBeVisible();
    });
  });
});
