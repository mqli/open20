import { Page, Locator, expect } from '@playwright/test';

export class MobileSpellbookPage {
  readonly page: Page;

  readonly searchInput: Locator;
  readonly spellCards: Locator;
  readonly filterTrigger: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('input.spell-search-input');
    this.spellCards = page.locator('.spell-card');
    this.filterTrigger = page.getByTestId('filter-trigger');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('domcontentloaded');
    await this.searchInput.waitFor({ state: 'visible' });
    await this.spellCards.first().waitFor({ state: 'visible' });
  }

  /** The bottom tab bar spells button */
  getSpellsTab(): Locator {
    return this.page.getByTestId('tab-spells');
  }

  /** The bottom tab bar character button */
  getCharacterTab(): Locator {
    return this.page.getByTestId('tab-character');
  }

  async switchToCharacterTab() {
    await this.getCharacterTab().click();
    await this.page.waitForTimeout(300);
  }

  async switchToSpellsTab() {
    await this.getSpellsTab().click();
    await expect(this.searchInput).toBeVisible();
  }

  async openFilterDrawer() {
    await this.filterTrigger.click();
    await expect(this.page.getByRole('heading', { name: 'Filters' })).toBeVisible();
  }

  async searchSpell(spellName: string) {
    await this.searchInput.fill(spellName);
    await this.page.waitForTimeout(500);
  }

  async getSpellCount(): Promise<number> {
    return await this.spellCards.count();
  }
}
