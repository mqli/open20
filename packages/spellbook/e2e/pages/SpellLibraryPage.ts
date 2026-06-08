import { Page, Locator, expect } from '@playwright/test';

/**
 * Page object for Spell Library page
 * Encapsulates interactions with the spell library UI
 */
export class SpellLibraryPage {
  readonly page: Page;

  // Locators
  readonly searchInput: Locator;
  readonly spellList: Locator;
  readonly spellCards: Locator;
  readonly filterButton: Locator;
  readonly levelFilter: Locator;
  readonly schoolFilter: Locator;
  readonly preparationToggle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByRole('searchbox', { name: /search/i });
    this.spellList = page.getByRole('list', { name: /spell/i });
    this.spellCards = page.getByRole('listitem');
    this.filterButton = page.getByRole('button', { name: /filter/i });
    this.levelFilter = page.getByRole('combobox', { name: /level/i });
    this.schoolFilter = page.getByRole('combobox', { name: /school/i });
    this.preparationToggle = page.getByRole('switch', { name: /preparation/i });
  }

  /**
   * Navigate to the spell library page
   */
  async goto() {
    await this.page.goto('/spells');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Search for a spell by name
   */
  async searchSpell(spellName: string) {
    await this.searchInput.fill(spellName);
    await this.page.waitForTimeout(500); // Wait for debounce
  }

  /**
   * Clear the search input
   */
  async clearSearch() {
    await this.searchInput.clear();
    await this.page.waitForTimeout(500);
  }

  /**
   * Filter spells by level
   */
  async filterByLevel(level: string) {
    await this.filterButton.click();
    await this.levelFilter.selectOption(level);
  }

  /**
   * Filter spells by school
   */
  async filterBySchool(school: string) {
    await this.filterButton.click();
    await this.schoolFilter.selectOption(school);
  }

  /**
   * Toggle preparation mode
   */
  async togglePreparationMode() {
    await this.preparationToggle.click();
  }

  /**
   * Get the number of spells displayed
   */
  async getSpellCount(): Promise<number> {
    return await this.spellCards.count();
  }

  /**
   * Click on a spell card to view details
   */
  async viewSpell(spellName: string) {
    await this.page.getByText(spellName).first().click();
  }

  /**
   * Assert that a spell is visible in the list
   */
  async expectSpellVisible(spellName: string) {
    await expect(this.page.getByText(spellName)).toBeVisible();
  }

  /**
   * Assert that a spell is not visible in the list
   */
  async expectSpellNotVisible(spellName: string) {
    await expect(this.page.getByText(spellName)).not.toBeVisible();
  }
}
