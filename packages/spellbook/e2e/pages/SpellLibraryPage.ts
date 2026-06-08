import { Page, Locator, expect } from '@playwright/test';

/**
 * Page object for Spell Library page
 * Encapsulates interactions with the spell library UI
 *
 * Actual UI structure:
 * - Search input (searchbox role)
 * - "Known" and "Prepared" toggle buttons
 * - Level tabs (buttons for each level)
 * - Filter chips (shown when filters are active)
 * - Spell cards in a grid
 */
export class SpellLibraryPage {
  readonly page: Page;

  // Locators
  readonly searchInput: Locator;
  readonly spellCards: Locator;
  readonly preparedToggle: Locator;
  readonly knownToggle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByRole('searchbox', { name: /search/i });
    this.spellCards = page.getByRole('article').or(page.locator('.spell-card'));
    this.preparedToggle = page.getByRole('button', { name: /prepared/i });
    this.knownToggle = page.getByRole('button', { name: /known/i });
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
   * Toggle the "Prepared" filter
   */
  async togglePreparedFilter() {
    await this.preparedToggle.click();
  }

  /**
   * Toggle the "Known" filter
   */
  async toggleKnownFilter() {
    await this.knownToggle.click();
  }

  /**
   * Click on a level tab
   */
  async filterByLevel(level: number) {
    await this.page.getByRole('button', { name: new RegExp(`level ${level}`, 'i') }).click();
  }

  /**
   * Click on a spell card to view details
   */
  async viewSpell(spellName: string) {
    await this.page.getByText(spellName).first().click();
  }

  /**
   * Close the spell detail flyout
   */
  async closeFlyout() {
    const closeButton = this.page.getByRole('button', { name: /close/i });
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
  }

  /**
   * Get the number of spells displayed
   */
  async getSpellCount(): Promise<number> {
    return await this.spellCards.count();
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
