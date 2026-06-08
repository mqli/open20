import { Page, Locator, expect } from '@playwright/test';

/**
 * Page object for Character page
 * Encapsulates interactions with the character sheet UI
 *
 * Actual UI structure:
 * - Character bar button with title "Open character sheet" (translated)
 * - Character sheet opens as Dialog or Sheet
 * - Tabs for each spellcasting class
 * - Per-class: stats, preparation progress, cantrips, spells by level with SlotPips
 */
export class CharacterPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to the character page (open character sheet)
   */
  async goto() {
    // Click on character bar button to open sheet
    await this.page.getByTestId('character-button').click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get the character name heading
   */
  get characterName(): Locator {
    return this.page.locator('h2');
  }

  /**
   * Get a class tab by class ID
   */
  getClassTab(classId: string): Locator {
    return this.page.getByRole('tab', { name: new RegExp(classId, 'i') });
  }

  /**
   * Switch to a specific class tab
   */
  async switchToClass(classId: string) {
    await this.getClassTab(classId).click();
  }

  /**
   * Get spell slots pips for a specific level in the current class tab
   */
  getSpellSlotsPips(level: number): Locator {
    // Find the section with the level label, then get the SlotPips
    return this.page
      .getByText(new RegExp(`level ${level}`, 'i'), { exact: false })
      .locator('..')
      .getByRole('button', { name: /slot/i });
  }

  /**
   * Click a spell slot pip to consume it
   */
  async consumeSpellSlot(level: number) {
    // Find the first unused pip and click it
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

  /**
   * Click a spell slot pip to recover it
   */
  async recoverSpellSlot(level: number) {
    // Find the first used pip and click it
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

  /**
   * Check if a spell is visible in the character sheet
   */
  async expectSpellVisible(spellName: string) {
    await expect(this.page.getByText(spellName)).toBeVisible();
  }

  /**
   * Check if a spell is not visible in the character sheet
   */
  async expectSpellNotVisible(spellName: string) {
    await expect(this.page.getByText(spellName)).not.toBeVisible();
  }

  /**
   * Get the preparation progress text (e.g., "3/7")
   */
  async getPreparationProgress(): Promise<string> {
    const progress = this.page.getByText(/\d+\s*\/\s*\d+/);
    return (await progress.textContent()) ?? '';
  }

  /**
   * Check if preparation progress shows expected count
   */
  async expectPreparationCount(prepared: number, max: number) {
    await expect(this.page.getByText(`${prepared}/${max}`)).toBeVisible();
  }
}
