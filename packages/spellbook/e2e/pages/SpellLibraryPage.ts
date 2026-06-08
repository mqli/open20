import { Page, Locator, expect } from '@playwright/test';

/**
 * Page object for Spell Library page
 * Encapsulates interactions with the spell library UI
 *
 * Uses data-testid attributes for reliable element selection
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
    // Search input has data-testid="search-input"
    this.searchInput = page.getByTestId('search-input');
    // Spell cards have data-testid="spell-card"
    this.spellCards = page.getByTestId('spell-card');
    // "Prepared" toggle button has data-testid="prepared-toggle"
    this.preparedToggle = page.getByTestId('prepared-toggle');
    // "Known" toggle button has data-testid="known-toggle"
    this.knownToggle = page.getByTestId('known-toggle');
  }

  /**
   * Navigate to the spell library page
   */
  async goto() {
    await this.page.goto('/spells');
    await this.page.waitForLoadState('networkidle');
    // Wait for search input to be visible
    await this.searchInput.waitFor({ state: 'visible' });
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
  async filterByLevel(level: number | null) {
    const testId = level === null ? 'level-tab-all' : `level-tab-${level}`;
    await this.page.getByTestId(testId).click();
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
    const closeButton = this.page.getByRole('button', { name: /close spell details/i });
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

  /**
   * Assert that empty state is visible
   */
  async expectEmptyStateVisible() {
    await expect(this.page.getByTestId('empty-state')).toBeVisible();
  }
}
