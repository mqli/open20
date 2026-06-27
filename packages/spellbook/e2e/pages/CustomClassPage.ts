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
    await this.moreBtn.click({ force: true });
    await this.manageBtn.waitFor({ state: 'visible' });
    await this.manageBtn.click({ force: true, noWaitAfter: true });
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
    await row.getByRole('button').first().click({ force: true });
    await this.getDialog().getByTestId('subclass-name-input').waitFor({ state: 'visible' });
  }

  /** Click the pencil (edit) button on a class row. */
  async clickEditClass(className: string) {
    const row = this.getClassRow(className);
    await row.getByRole('button').nth(1).click({ force: true });
    await this.getDialog().getByTestId('class-name-input').waitFor({ state: 'visible' });
  }

  /** Click the trash (delete) button on a class row. */
  async clickDeleteFromList(className: string) {
    const row = this.getClassRow(className);
    await row.getByRole('button').last().click({ force: true });
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

  /**
   * Fill a React controlled input by setting the native value and dispatching
   * synthetic input/change events. Scrolls into view first for mobile where the
   * input may be below the fold in a tall dialog.
   */
  private async fillInput(locator: Locator, text: string) {
    await locator.scrollIntoViewIfNeeded();
    await locator.waitFor({ state: 'attached' });
    await locator.evaluate((el, value) => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      )?.set;
      nativeSetter?.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, text);
  }

  /** Fill the class name in the form. */
  async fillClassName(name: string) {
    await this.fillInput(this.getClassNameInput(), name);
  }

  /** Select a spellcasting ability from the select dropdown. */
  async selectSpellcastingAbility(ability: string) {
    await this.getDialog().getByTestId('select-spellcasting-ability').click({ force: true });
    await this.page.getByRole('option', { name: ability }).waitFor({ state: 'visible' });
    await this.page
      .getByRole('option', { name: ability })
      .click({ force: true, noWaitAfter: true });
  }

  /** Select a slot preset. */
  async selectSlotPreset(preset: string) {
    await this.getDialog().getByTestId('select-slot-preset').click({ force: true });
    await this.page.getByRole('option', { name: preset }).waitFor({ state: 'visible' });
    await this.page.getByRole('option', { name: preset }).click({ force: true, noWaitAfter: true });
  }

  /** Click Save. */
  async clickSave() {
    await this.getSaveButton().click({ force: true, noWaitAfter: true });
  }

  /** Click Delete from the form (in edit mode). */
  async clickDeleteFromForm() {
    await this.getDeleteButton().click({ force: true });
  }

  /** Click the back arrow to return to list view. */
  async clickBackToList() {
    await this.getBackButton().click({ force: true, noWaitAfter: true });
  }

  /** Click Create New to enter the create form. No-op if form is auto-shown (empty state). */
  async clickCreateNew() {
    const btn = this.getCreateButton();
    if ((await btn.count()) > 0) {
      await btn.click({ force: true });
      await this.getClassNameInput().waitFor({ state: 'visible' });
    }
  }

  // ── Add-subclass view (condensed form) ──

  /** Fill the subclass name in the add-subclass form. */
  async fillSubclassName(name: string) {
    await this.fillInput(this.getSubclassNameInput(), name);
  }

  /** Click the Add button in the add-subclass condensed form. */
  async clickAddSubclassSubmit() {
    await this.getDialog()
      .getByTestId('add-subclass-submit')
      .click({ force: true, noWaitAfter: true });
  }

  // ── Form subclasses (in create/edit form) ──

  /** Add a subclass in the create/edit form. */
  async addSubclassInForm(name: string) {
    await this.fillInput(this.getSubclassNameInput(), name);
    await this.getDialog().getByTestId('add-subclass-btn').click({ force: true });
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
