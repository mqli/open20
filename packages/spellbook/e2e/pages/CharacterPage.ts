import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page object for character sheet interactions.
 * Desktop: full sheet opens as Dialog via sidebar button.
 * Mobile: character sheet renders inline on the character tab.
 */
export class CharacterPage {
  readonly page: Page;
  sheet: Locator;
  private _isMobile = false;

  constructor(page: Page) {
    this.page = page;
    this.sheet = page.locator('[role="dialog"]');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('domcontentloaded');
    // Determine platform before interacting
    const viewport = this.page.viewportSize();
    this._isMobile = viewport ? viewport.width < 1024 : false;
    await this.page.locator('input.spell-search-input').waitFor({ state: 'visible' });
    await this.openFullSheet();
  }

  async openFullSheet() {
    if (this._isMobile) {
      // Mobile: switch to character tab
      const charTab = this.page.getByTestId('tab-character');
      await charTab.click();
      // Use page body as sheet scope (character content renders inline)
      this.sheet = this.page.locator('body');
      await this.page.waitForTimeout(500);
    } else {
      // Desktop: click "Open character sheet" button
      const btn = this.page.getByText('Open character sheet');
      await btn.click();
      this.sheet = this.page.locator('[role="dialog"]');
      await this.sheet.waitFor({ state: 'visible' });
    }
  }

  get classTab(): Locator {
    return this.sheet.getByRole('tab');
  }

  get characterName(): Locator {
    return this.sheet.locator('h2');
  }

  getClassTab(classId: string): Locator {
    return this.sheet.getByRole('tab', { name: new RegExp(classId, 'i') });
  }

  async switchToClass(classId: string) {
    await this.getClassTab(classId).click();
  }

  getSpellSlotsPips(level: number): Locator {
    return this.sheet
      .getByText(new RegExp(`level ${level}`, 'i'), { exact: false })
      .locator('..')
      .getByRole('button', { name: /slot/i });
  }

  async consumeSpellSlot(level: number) {
    const pips = this.getSpellSlotsPips(level);
    const count = await pips.count();
    for (let i = 0; i < count; i++) {
      const pip = pips.nth(i);
      const isUsed = await pip.getAttribute('data-used');
      if (isUsed !== 'true') {
        await pip.click();
        break;
      }
    }
  }

  async recoverSpellSlot(level: number) {
    const pips = this.getSpellSlotsPips(level);
    const count = await pips.count();
    for (let i = 0; i < count; i++) {
      const pip = pips.nth(i);
      const isUsed = await pip.getAttribute('data-used');
      if (isUsed === 'true') {
        await pip.click();
        break;
      }
    }
  }

  async expectSpellVisible(spellName: string) {
    await expect(this.sheet.getByText(spellName)).toBeVisible();
  }

  async expectSpellNotVisible(spellName: string) {
    await expect(this.sheet.getByText(spellName)).not.toBeVisible();
  }

  async getPreparationProgress(): Promise<string> {
    const progress = this.sheet.getByText(/\d+\s*\/\s*\d+/);
    return (await progress.textContent()) ?? '';
  }

  async expectPreparationCount(prepared: number, max: number) {
    await expect(this.sheet.getByText(`${prepared}/${max}`)).toBeVisible();
  }
}
