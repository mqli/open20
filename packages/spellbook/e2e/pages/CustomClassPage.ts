import { Page, Locator } from '@playwright/test';

export class CustomClassPage {
  readonly page: Page;

  // ── Top-level ──
  readonly moreBtn: Locator;
  readonly manageBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    // The MoreHorizontal button in the toolbar
    this.moreBtn = page.getByTestId('toolbar-more-btn');
    this.manageBtn = page.getByRole('menuitem', { name: 'Manage Custom Classes' });
  }

  // ── Navigation ──

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('domcontentloaded');
    // Wait for spell library to load
    await this.page.locator('.spell-card').first().waitFor({ state: 'visible' });
  }

  async openClassModal() {
    await this.moreBtn.click();
    await this.manageBtn.waitFor({ state: 'visible' });
    await this.manageBtn.click();
    await this.page.waitForTimeout(300);
  }

  // ── Modal-level locators ──

  getDialog(): Locator {
    return this.page.getByRole('dialog');
  }

  // ── List view ──

  getCreateButton(): Locator {
    return this.getDialog().getByRole('button', { name: 'Create Custom Class' });
  }

  getEmptyText(): Locator {
    return this.getDialog().getByText(/No custom classes yet/i);
  }

  /** Get a custom class row by class name. */
  getClassRow(className: string): Locator {
    return this.getDialog().locator('.border').filter({ hasText: className }).first();
  }

  /** Click the "+" button on a specific class row to add a subclass. */
  async clickAddSubclassOnRow(className: string) {
    const row = this.getClassRow(className);
    // "+" button is the first ghost button in the row actions area
    await row.getByRole('button').first().click();
    await this.page.waitForTimeout(200);
  }

  /** Click the pencil (edit) button on a class row. */
  async clickEditClass(className: string) {
    const row = this.getClassRow(className);
    await row.getByRole('button').nth(1).click();
    await this.page.waitForTimeout(200);
  }

  /** Click the trash (delete) button on a class row. */
  async clickDeleteFromList(className: string) {
    const row = this.getClassRow(className);
    await row.getByRole('button').last().click();
  }

  // ── SRD section ──

  getSrdSection(): Locator {
    return this.getDialog().locator('text=SRD Classes');
  }

  /** Get an SRD class row by class name. */
  getSrdClassRow(className: string): Locator {
    return this.getDialog().locator('.border-dashed').filter({ hasText: className }).first();
  }

  // ── Form (create / edit) ──

  getClassNameInput(): Locator {
    return this.getDialog().getByPlaceholder('e.g. Shadow Mage');
  }

  getSubclassNameInput(): Locator {
    return this.getDialog().getByPlaceholder('e.g. Shadow Domain');
  }

  getSaveButton(): Locator {
    return this.getDialog().getByRole('button', { name: 'Save' });
  }

  getCancelButton(): Locator {
    return this.getDialog().getByRole('button', { name: 'Cancel' });
  }

  getDeleteButton(): Locator {
    return this.getDialog().getByRole('button', { name: 'Delete' });
  }

  getBackButton(): Locator {
    return this.getDialog().getByTestId('class-modal-back-btn');
  }

  /** Fill the class name in the form. */
  async fillClassName(name: string) {
    await this.getClassNameInput().fill(name);
  }

  /** Select a spellcasting ability from the select dropdown. */
  async selectSpellcastingAbility(ability: string) {
    // Click the select trigger labeled "Spellcasting Ability"
    const label = this.getDialog().getByText('Spellcasting Ability', { exact: true });
    const selectTrigger = label.locator('..').locator('button');
    await selectTrigger.click();
    await this.page.waitForTimeout(100);
    // Select the option
    await this.page.getByRole('option', { name: ability }).click();
    await this.page.waitForTimeout(100);
  }

  /** Select a slot preset. */
  async selectSlotPreset(preset: string) {
    const label = this.getDialog().getByText('Spell Slot Progression', { exact: true });
    const selectTrigger = label.locator('..').locator('button');
    await selectTrigger.click();
    await this.page.waitForTimeout(100);
    await this.page.getByRole('option', { name: preset }).click();
    await this.page.waitForTimeout(100);
  }

  /** Click Save to save the class. */
  async clickSave() {
    await this.getSaveButton().click();
    await this.page.waitForTimeout(300);
  }

  /** Click Delete from the form (in edit mode). */
  async clickDeleteFromForm() {
    await this.getDeleteButton().click();
  }

  /** Click the back arrow to return to list view. */
  async clickBackToList() {
    await this.getBackButton().click();
    await this.page.waitForTimeout(200);
  }

  /** Click Create New button to enter form. Falls through if form is already shown (auto-open on empty state). */
  async clickCreateNew() {
    const btn = this.getCreateButton();
    const count = await btn.count();
    if (count > 0) {
      await btn.click();
      await this.page.waitForTimeout(200);
    }
    // When no classes exist, modal auto-opens create form — no button to click.
  }

  // ── Add-subclass view (condensed form) ──

  /** Fill the subclass name in the add-subclass form. */
  async fillSubclassName(name: string) {
    await this.getSubclassNameInput().fill(name);
  }

  /** Click the Add button in the add-subclass form. */
  async clickAddSubclassSubmit() {
    await this.getDialog().getByRole('button', { name: 'Add' }).click();
    await this.page.waitForTimeout(300);
  }

  // ── Form subclasses (in create/edit form) ──

  /** Add a subclass in the create/edit form. */
  async addSubclassInForm(name: string) {
    const formInput = this.getDialog().getByPlaceholder('e.g. Shadow Domain');
    await formInput.fill(name);
    await this.getDialog().getByRole('button', { name: 'Add' }).last().click();
    await this.page.waitForTimeout(200);
  }

  // ── Helpers ──

  /** Accept the browser confirm dialog. */
  async acceptConfirm() {
    this.page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
  }

  /** Get the subclass count text for a class row. */
  getSubclassCountText(classRow: Locator): Locator {
    return classRow.locator('text=/\\d+ (subclass|subclasses|SRD only)/i');
  }
}
