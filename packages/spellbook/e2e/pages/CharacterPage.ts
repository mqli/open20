import { Page, Locator, expect } from '@playwright/test';

/**
 * Page object for Character page
 * Encapsulates interactions with the character sheet UI
 */
export class CharacterPage {
  readonly page: Page;

  // Locators
  readonly characterName: Locator;
  readonly level: Locator;
  readonly spellSlots: Locator;
  readonly preparedSpells: Locator;
  readonly availableSpells: Locator;

  constructor(page: Page) {
    this.page = page;
    this.characterName = page.getByRole('heading', { name: /character/i });
    this.level = page.getByText(/level/i);
    this.spellSlots = page.getByRole('region', { name: /spell slots/i });
    this.preparedSpells = page.getByRole('list', { name: /prepared spells/i });
    this.availableSpells = page.getByRole('list', { name: /available spells/i });
  }

  /**
   * Navigate to the character page
   */
  async goto() {
    await this.page.goto('/character');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get the number of available spell slots for a level
   */
  async getSpellSlots(level: number): Promise<number> {
    const slotText = await this.spellSlots
      .getByText(new RegExp(`level ${level}`, 'i'))
      .textContent();
    // Parse the slot count from text (e.g., "3 / 4")
    const match = slotText?.match(/(\d+)\s*\/\s*(\d+)/);
    return match ? parseInt(match[2]) : 0;
  }

  /**
   * Use a spell slot of a specific level
   */
  async useSpellSlot(level: number) {
    await this.spellSlots
      .getByRole('button', { name: new RegExp(`use level ${level} slot`, 'i') })
      .click();
  }

  /**
   * Recover a spell slot of a specific level
   */
  async recoverSpellSlot(level: number) {
    await this.spellSlots
      .getByRole('button', { name: new RegExp(`recover level ${level} slot`, 'i') })
      .click();
  }

  /**
   * Prepare a spell (add to prepared spells)
   */
  async prepareSpell(spellName: string) {
    await this.availableSpells
      .getByText(spellName)
      .getByRole('button', { name: /prepare/i })
      .click();
  }

  /**
   * Unprepare a spell (remove from prepared spells)
   */
  async unprepareSpell(spellName: string) {
    await this.preparedSpells
      .getByText(spellName)
      .getByRole('button', { name: /unprepare/i })
      .click();
  }

  /**
   * Get the number of prepared spells
   */
  async getPreparedSpellCount(): Promise<number> {
    return await this.preparedSpells.getByRole('listitem').count();
  }

  /**
   * Assert that a spell is prepared
   */
  async expectSpellPrepared(spellName: string) {
    await expect(this.preparedSpells.getByText(spellName)).toBeVisible();
  }

  /**
   * Assert that a spell is not prepared
   */
  async expectSpellNotPrepared(spellName: string) {
    await expect(this.preparedSpells.getByText(spellName)).not.toBeVisible();
  }
}
