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

  // ── Helpers ──

  /**
   * Click with extended timeout for mobile.
   * Removes explicit scrollIntoViewIfNeeded — locator.click() scrolls internally,
   * and radix portals (Dialog/DropdownMenu) are position:fixed so scrolling
   * is unnecessary and can cause "waiting for element to be stable" hangs.
   */
  private async safeClick(locator: Locator) {
    await locator.click({ timeout: 10000 });
  }

  /**
   * Dispatch a click event directly on the element.
   * Use for radix Select triggers where Playwright's coordinate-based click
   * can hang on mobile emulation inside dialogs.
   * Removes scrollIntoViewIfNeeded — the trigger is inside a fixed-position Dialog.
   */
  private async dispatchClick(locator: Locator) {
    await locator.waitFor({ state: 'attached', timeout: 5000 });
    await locator.dispatchEvent('click');
  }

  /**
   * Fill a React controlled input by setting the native value and dispatching
   * synthetic input/change events.
   */
  private async fillInput(locator: Locator, text: string) {
    await locator.waitFor({ state: 'attached', timeout: 5000 });
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

  // ── Navigation ──

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.locator('.spell-card').first().waitFor({ state: 'visible' });
  }

  async openClassModal() {
    await this.safeClick(this.moreBtn);
    // Let DropdownMenu.Content animate in (animate-in fade-in-80)
    await this.page.waitForTimeout(400);
    await this.manageBtn.waitFor({ state: 'visible', timeout: 10000 });
    await this.safeClick(this.manageBtn);
    await this.getDialog().waitFor({ state: 'visible', timeout: 10000 });
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
    const btn = this.getClassRow(className).getByRole('button').first();
    await this.safeClick(btn);
    await this.getDialog().getByTestId('subclass-name-input').waitFor({ state: 'visible' });
  }

  /** Click the pencil (edit) button on a class row. */
  async clickEditClass(className: string) {
    const btn = this.getClassRow(className).getByRole('button').nth(1);
    await this.safeClick(btn);
    await this.getDialog().getByTestId('class-name-input').waitFor({ state: 'visible' });
  }

  /** Click the trash (delete) button on a class row. */
  async clickDeleteFromList(className: string) {
    const btn = this.getClassRow(className).getByRole('button').last();
    await this.safeClick(btn);
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
    await this.fillInput(this.getClassNameInput(), name);
  }

  /** Select a spellcasting ability from the select dropdown. */
  async selectSpellcastingAbility(ability: string) {
    // dispatchEvent: bypasses Playwright's coordinate click which hangs on mobile SelectTrigger
    await this.dispatchClick(this.getDialog().getByTestId('select-spellcasting-ability'));
    // Let SelectContent animate in (animate-in fade-in-80 + portal render)
    await this.page.waitForTimeout(400);
    await this.page.getByRole('option', { name: ability }).click({ timeout: 10000, force: true });
  }

  /** Select a slot preset. */
  async selectSlotPreset(preset: string) {
    await this.dispatchClick(this.getDialog().getByTestId('select-slot-preset'));
    await this.page.waitForTimeout(400);
    await this.page.getByRole('option', { name: preset }).click({ timeout: 10000, force: true });
  }

  /** Click Save. */
  async clickSave() {
    await this.safeClick(this.getSaveButton());
  }

  /** Click Delete from the form (in edit mode). */
  async clickDeleteFromForm() {
    await this.safeClick(this.getDeleteButton());
  }

  /** Click the back arrow to return to list view. */
  async clickBackToList() {
    await this.safeClick(this.getBackButton());
  }

  /** Click Create New to enter the create form. No-op if form is auto-shown (empty state). */
  async clickCreateNew() {
    const btn = this.getCreateButton();
    if ((await btn.count()) > 0) {
      await this.safeClick(btn);
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
    await this.safeClick(this.getDialog().getByTestId('add-subclass-submit'));
  }

  // ── Form subclasses (in create/edit form) ──

  /** Add a subclass in the create/edit form. */
  async addSubclassInForm(name: string) {
    await this.fillInput(this.getSubclassNameInput(), name);
    await this.safeClick(this.getDialog().getByTestId('add-subclass-btn'));
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
