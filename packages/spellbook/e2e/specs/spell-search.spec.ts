import { test, expect } from '@playwright/test';
import { SpellLibraryPage } from '../pages/SpellLibraryPage';

test.describe('Spell Search', () => {
  let spellLibrary: SpellLibraryPage;

  test.beforeEach(async ({ page }) => {
    spellLibrary = new SpellLibraryPage(page);
    await spellLibrary.goto();
  });

  test('should display spell list on page load', async () => {
    // Wait for spells to load
    await expect(spellLibrary.searchInput).toBeVisible();

    // Verify that spells are displayed (check for spell cards)
    const count = await spellLibrary.getSpellCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter spells by search term', async () => {
    // Search for a specific spell
    await spellLibrary.searchSpell('Fireball');

    // Verify filtered results
    await spellLibrary.expectSpellVisible('Fireball');

    // Clear search
    await spellLibrary.clearSearch();

    // Verify more spells are visible again
    const countAfterClear = await spellLibrary.getSpellCount();
    expect(countAfterClear).toBeGreaterThan(1);
  });

  test('should show no results for non-existent spell', async () => {
    // Search for a spell that doesn't exist
    await spellLibrary.searchSpell('NonExistentSpell12345');

    // Verify no results message or empty state
    const count = await spellLibrary.getSpellCount();
    expect(count).toBe(0);

    // Verify empty state message is shown
    await spellLibrary.expectEmptyStateVisible();
  });

  test('should filter spells by level', async () => {
    // Get initial count
    const initialCount = await spellLibrary.getSpellCount();

    // Filter by level 1 (click on level 1 tab)
    await spellLibrary.filterByLevel(1);

    // Verify filtered results
    const filteredCount = await spellLibrary.getSpellCount();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
    expect(filteredCount).toBeGreaterThan(0);
  });
});
