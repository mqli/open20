import { type Page, type Locator } from '@playwright/test';

/**
 * Page object for the character creation/edit modal.
 * Uses Playwright built-in selectors (placeholder, role, text).
 *
 * Supports both desktop and mobile layouts via the `isMobile` parameter.
 * Form interactions are identical (same Dialog modal); only navigation
 * and result verification differ between platforms.
 */
export class CharacterSetupPage {
  readonly page: Page;
  readonly isMobile: boolean;

  constructor(page: Page, isMobile = false) {
    this.page = page;
    this.isMobile = isMobile;
  }

  // ── Helpers ──

  private async safeClick(locator: Locator) {
    await locator.click();
  }

  private async forceClick(locator: Locator) {
    await locator.click({ force: true });
  }

  private async fillInput(locator: Locator, text: string) {
    await locator.fill(text);
  }

  /**
   * Returns the CharacterSelector trigger button.
   * Identified by the chevron-down icon unique to the dropdown trigger
   * (MobileTabBar also has a User icon, but not a ChevronDown).
   */
  private getCharacterSelectorTrigger(): Locator {
    return this.page
      .getByRole('button')
      .filter({ has: this.page.locator('.lucide-chevron-down') })
      .first();
  }

  // ── Dialog / Panel ──

  getDialog(): Locator {
    return this.page.getByRole('dialog');
  }

  getCharacterPanel(): Locator {
    return this.page.getByTestId('character-panel');
  }

  // ── Navigation ──

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.locator('.spell-card').first().waitFor({ state: 'visible' });
  }

  async openCreateModal() {
    // On mobile, CharacterSelector lives in the character tab
    await this.switchToCharacterTab();

    await this.getCharacterSelectorTrigger().click();
    await this.page.waitForTimeout(300);

    await this.page.getByRole('menuitem', { name: /Add character|添加角色/i }).click();
    await this.getDialog().waitFor({ state: 'visible' });
    await this.getDialog()
      .getByPlaceholder(/e\.g\. Melf|例如：/)
      .waitFor({ state: 'visible' });
  }

  async openEditModal(characterName: string) {
    // On mobile, CharacterSelector lives in the character tab
    await this.switchToCharacterTab();

    await this.getCharacterSelectorTrigger().click();
    await this.page.waitForTimeout(300);

    const menuItem = this.page.getByRole('menuitem').filter({ hasText: characterName }).first();
    await this.safeClick(menuItem.getByRole('button'));
    await this.getDialog().waitFor({ state: 'visible' });
    await this.getDialog()
      .getByPlaceholder(/e\.g\. Melf|例如：/)
      .waitFor({ state: 'visible' });
  }

  // ── Form interactions (dialog-scoped) ──

  private form(): Locator {
    return this.getDialog();
  }

  async fillName(name: string) {
    await this.fillInput(this.form().getByPlaceholder(/e\.g\. Melf|例如：/), name);
  }

  private async selectByLabel(labelRegex: RegExp, optionName: string) {
    const label = this.form().locator('label').filter({ hasText: labelRegex }).first();
    const trigger = label.locator('..').locator('button[role="combobox"]').first();
    await this.forceClick(trigger);
    await this.page.waitForTimeout(300);
    await this.page.getByRole('option', { name: optionName }).click({ force: true });
  }

  async selectClass(className: string) {
    await this.selectByLabel(/^Class$|^职业$/, className);
  }

  async setLevel(level: number) {
    await this.fillInput(this.form().locator('input[type="number"]').first(), String(level));
  }

  async selectSpecies(species: string) {
    await this.selectByLabel(/^Species$|^种族$/, species);
  }

  async selectBackground(background: string) {
    await this.selectByLabel(/^Background$|^背景$/, background);
  }

  // Ability inputs are positioned after the level input (nth 1-6)
  private static ABILITY_ORDER: Record<string, number> = {
    strength: 0,
    dexterity: 1,
    constitution: 2,
    intelligence: 3,
    wisdom: 4,
    charisma: 5,
  };

  async setAbility(abilityName: string, value: number) {
    // Scope to Ability Scores section — avoids confusion with class/additional
    // level inputs that appear before ability inputs in DOM order.
    const section = this.form()
      .getByText(/Ability Scores|属性值/i)
      .locator('..');
    const inputs = section.locator('input[type="number"]');
    const idx = CharacterSetupPage.ABILITY_ORDER[abilityName.toLowerCase()];
    if (idx === undefined) throw new Error(`Unknown ability: ${abilityName}`);
    await this.fillInput(inputs.nth(idx), String(value));
  }

  async clickAddClass() {
    await this.safeClick(this.form().getByRole('button', { name: /Add Class|添加兼职|追加/i }));
    await this.page.waitForTimeout(500);
  }

  async selectAdditionalClass(className: string) {
    const addSection = this.form()
      .locator('div')
      .filter({ hasText: /Multiclass|兼职/i })
      .first();
    await this.forceClick(addSection.locator('button[role="combobox"]').first());
    await this.page.waitForTimeout(300);
    await this.page.getByRole('option', { name: className }).first().click({ force: true });
  }

  async setAdditionalLevel(level: number) {
    await this.fillInput(this.form().locator('input[type="number"]').last(), String(level));
  }

  async submit() {
    // Match "Summon Hero" (create) or "Save Changes" (edit)
    await this.safeClick(
      this.form().getByRole('button', { name: /Summon Hero|Save Changes|召唤英雄|保存/i }),
    );
  }

  // ── Mobile tab navigation ──

  /**
   * On mobile, the character sheet is hidden behind a tab.
   * Call this after submit() to switch to the Character tab before verifying results.
   * On desktop this is a no-op (character panel is always visible in the sidebar).
   */
  async switchToCharacterTab() {
    if (!this.isMobile) return;
    await this.safeClick(this.page.getByTestId('tab-character'));
    await this.page.waitForTimeout(300);
  }

  /**
   * On mobile, switches back to the Spells tab (e.g. to verify spell list).
   * On desktop this is a no-op.
   */
  async switchToSpellsTab() {
    if (!this.isMobile) return;
    await this.safeClick(this.page.getByTestId('tab-spells'));
    await this.page.waitForTimeout(300);
  }

  // ── Verification ──

  /**
   * Returns the platform-appropriate container for character content.
   * Desktop: sidebar character-panel. Mobile: character-content tab.
   */
  private getCharacterContent(): Locator {
    return this.isMobile
      ? this.page.getByTestId('character-content')
      : this.page.getByTestId('character-panel');
  }

  async expectCharacterInPanel(name: string) {
    await this.getCharacterContent()
      .getByText(name, { exact: false })
      .first()
      .waitFor({ state: 'visible' });
  }

  async expectTextInPanel(text: string | RegExp) {
    await this.getCharacterContent().getByText(text).first().waitFor({ state: 'visible' });
  }
}
