import { test, expect } from '@playwright/test';
import { MobileSpellbookPage } from '../../pages/MobileSpellbookPage';
import { TEST_WIZARD, STORAGE_KEY, ACTIVE_CHARACTER_KEY } from '../../fixtures/test-character';

test.describe('Mobile Layout', () => {
  let mobile: MobileSpellbookPage;

  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'desktop', 'Mobile layout tests are mobile-only');
    // Seed a test character so the character tab has content
    await page.addInitScript(
      ({ storageKey, activeKey, character }) => {
        localStorage.setItem(storageKey, JSON.stringify([character]));
        localStorage.setItem(activeKey, character.id);
      },
      { storageKey: STORAGE_KEY, activeKey: ACTIVE_CHARACTER_KEY, character: TEST_WIZARD },
    );
    mobile = new MobileSpellbookPage(page);
    await mobile.goto();
  });

  test('should show tab bar with spells and character tabs', async () => {
    await expect(mobile.getSpellsTab()).toBeVisible();
    await expect(mobile.getCharacterTab()).toBeVisible();
  });

  test('should switch to character tab and show character sheet', async () => {
    await mobile.switchToCharacterTab();
    // Character sheet should render with the character name as h2 heading
    await expect(mobile.page.getByRole('heading', { level: 2, name: 'Test Wizard' })).toBeVisible();
  });

  test('should switch back to spells tab', async () => {
    await mobile.switchToCharacterTab();
    await mobile.switchToSpellsTab();

    const count = await mobile.getSpellCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should open filter drawer on filter icon click', async () => {
    await mobile.openFilterDrawer();
    await expect(mobile.page.getByRole('heading', { name: 'Filters' })).toBeVisible();
  });

  test('should show search bar in header', async () => {
    await expect(mobile.searchInput).toBeVisible();
    await expect(mobile.searchInput).toHaveAttribute('placeholder', /search/i);
  });

  test('should filter spells by search on mobile', async () => {
    await mobile.searchSpell('Fireball');
    const count = await mobile.getSpellCount();
    expect(count).toBeGreaterThanOrEqual(1);

    await mobile.page.getByText('Fireball', { exact: true }).first().waitFor({ state: 'visible' });
  });
});
