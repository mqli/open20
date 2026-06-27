import { Page, Locator } from '@playwright/test';

export class CustomClassPage {
  readonly page: Page;

  // ── Top-level ──
  readonly moreBtn: Locator;
  readonly manageBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.moreBtn = page.getByTestId('toolbar-more-btn');
    this.manageBtn = page.getByRole('menuitem', { name: 'Manage Custom Classes' });
  }

  // ── Navigation ──

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.locator('.spell-card').first().waitFor({ state: 'visible' });
  }

  async openClassModal() {
    await this.moreBtn.click();
    await this.manageBtn.waitFor({ state: 'visible' });
    await this.manageBtn.click();
    // Wait for the dialog to appear
    await this.getDialog().waitFor({ state: 'visible' });
  }

  // ── Modal-level locators ──

  getDialog(): Locator {
    return this.page.getByRole('dialog');
  }

  // ── List view ──

  getCreateButton(): Locator {
    return this.getDialog().getByTestId('create-custom-class-btn');
  }

  getEmptyText(): Locator {
    return this.getDialog().getByText(/No custom classes yet/i);
  }

  /** Get a custom class row by class name text. */
  getClassRow(className: string): Locator {
    return this.getDialog().locator('.border').filter({ hasText: className }).first();
  }

  /** Click the "+" button on a specific class row to add a subclass. */
  async clickAddSubclassOnRow(className: string) {
    const row = this.getClassRow(className);
    // The "+" button is the first ghost button in the row
    await row.getByRole('button').first().click();
    await this.page.waitForTimeout(300);
  }

  /** Click the pencil (edit) button on a class row. */
  async clickEditClass(className: string) {
    const row = this.getClassRow(className);
    await row.getByRole('button').nth(1).click();
    await this.page.waitForTimeout(300);
  }

  /** Click the trash (delete) button on a class row. */
  async clickDeleteFromList(className: string) {
    const row = this.getClassRow(className);
    await row.getByRole('button').last().click();
  }

  // ── SRD section ──

  getSrdSection(): Locator {
    return this.getDialog().getByText('SRD Classes');
  }

  /** Get an SRD class row by class name. */
  getSrdClassRow(className: string): Locator {
    return this.getDialog().locator('.border-dashed').filter({ hasText: className }).first();
  }

  // ── Form (create / edit) ──

  getClassNameInput(): Locator {
    return this.getDialog().getByTestId('class-name-input');
  }

  getSubclassNameInput(): Locator {
    return this.getDialog().getByTestId('subclass-name-input');
  }

  getSaveButton(): Locator {
    return this.getDialog().getByTestId('class-save-btn');
  }

  getCancelButton(): Locator {
    return this.getDialog().getByTestId('class-cancel-btn');
  }

  getDeleteButton(): Locator {
    return this.getDialog().getByTestId('class-delete-btn');
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
    await this.getDialog().getByTestId('select-spellcasting-ability').click();
    await this.page.waitForTimeout(100);
    await this.page.getByRole('option', { name: ability }).click();
    await this.page.waitForTimeout(100);
  }

  /** Select a slot preset. */
  async selectSlotPreset(preset: string) {
    await this.getDialog().getByTestId('select-slot-preset').click();
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

  /** Click Create New to enter the create form. No-op if form is auto-shown (empty state). */
  async clickCreateNew() {
    const btn = this.getCreateButton();
    if ((await btn.count()) > 0) {
      await btn.click();
      await this.page.waitForTimeout(200);
    }
  }

  // ── Add-subclass view (condensed form) ──

  /** Fill the subclass name in the add-subclass form. */
  async fillSubclassName(name: string) {
    await this.getSubclassNameInput().fill(name);
  }

  /** Click the Add button in the add-subclass condensed form. */
  async clickAddSubclassSubmit() {
    await this.getDialog().getByTestId('add-subclass-submit').click();
    await this.page.waitForTimeout(300);
  }

  // ── Form subclasses (in create/edit form) ──

  /** Add a subclass in the create/edit form. */
  async addSubclassInForm(name: string) {
    await this.getSubclassNameInput().fill(name);
    await this.getDialog().getByTestId('add-subclass-btn').click();
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
