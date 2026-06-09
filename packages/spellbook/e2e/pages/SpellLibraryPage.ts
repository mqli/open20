import { Page, Locator, expect } from '@playwright/test';

export class SpellLibraryPage {
  readonly page: Page;

  readonly searchInput: Locator;
  readonly spellCards: Locator;
  readonly preparedToggle: Locator;
  readonly knownToggle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('input.spell-search-input');
    this.spellCards = page.locator('.spell-card');
    this.preparedToggle = page.locator('.prepared-toggle');
    this.knownToggle = page.locator('.known-toggle');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('domcontentloaded');
    await this.searchInput.waitFor({ state: 'visible' });
    await this.spellCards.first().waitFor({ state: 'visible' });
  }

  async searchSpell(spellName: string) {
    await this.searchInput.fill(spellName);
    await this.page.waitForTimeout(500);
  }

  async clearSearch() {
    await this.searchInput.clear();
    await this.page.waitForTimeout(500);
  }

  async togglePreparedFilter() {
    await this.preparedToggle.click();
  }

  async toggleKnownFilter() {
    await this.knownToggle.click();
  }

  async filterByLevel(level: number | null) {
    const cls = level === null ? 'level-tab-all' : `level-tab-${level}`;
    await this.page.locator(`.${cls}`).click();
  }

  async viewSpell(spellName: string) {
    await this.page.getByText(spellName, { exact: true }).first().click();
  }

  async closeFlyout() {
    const closeButton = this.page.getByRole('button', { name: /close spell details/i });
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
  }

  async getSpellCount(): Promise<number> {
    return await this.spellCards.count();
  }

  async expectSpellVisible(spellName: string) {
    await expect(this.page.getByText(spellName, { exact: true })).toBeVisible();
  }

  async expectSpellNotVisible(spellName: string) {
    await expect(this.page.getByText(spellName, { exact: true })).not.toBeVisible();
  }

  async expectEmptyStateVisible() {
    await expect(this.page.locator('.empty-state')).toBeVisible();
  }
}
