import { type Page, type Locator, expect } from '@playwright/test';

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
    // On mobile, level tabs are inside the filter drawer Sheet
    const viewport = this.page.viewportSize();
    if (viewport && viewport.width < 1024) {
      await this.page.getByTestId('filter-trigger').click();
      await this.page.getByRole('heading', { name: 'Filters' }).waitFor({ state: 'visible' });
    }
    await this.page.locator(`.${cls}`).click();
    await this.page.waitForTimeout(300);
  }

  async viewSpell(spellName: string) {
    await this.page.getByText(spellName, { exact: true }).first().click();
  }

  async closeFlyout() {
    // Escape works for both Dialog and Sheet overlays
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);
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
