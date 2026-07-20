import { type Page, type Locator, type Download, expect } from '@playwright/test';

export class ImportExportPage {
  readonly page: Page;

  // MoreMenu trigger button
  readonly moreMenuBtn: Locator;

  // Character import dialog locators (scoped to [role="dialog"])
  readonly importDialog: Locator;
  readonly importFileInput: Locator;
  readonly importDropZone: Locator;
  readonly importPreviewName: Locator;
  readonly importSpellCount: Locator;
  readonly importSubclassCount: Locator;
  readonly importBtn: Locator;
  readonly importResult: Locator;
  readonly importError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.moreMenuBtn = page.locator('[data-testid="toolbar-more-btn"]');

    // Dialog-scoped locators
    const dialog = page.locator('[role="dialog"]');
    this.importDialog = dialog;
    this.importFileInput = dialog.locator('.character-import-file-input');
    this.importDropZone = dialog.locator('.character-import-drop-zone');
    this.importPreviewName = dialog.locator('.character-import-preview-name');
    this.importSpellCount = dialog.locator('.character-import-spell-count');
    this.importSubclassCount = dialog.locator('.character-import-subclass-count');
    this.importBtn = dialog.locator('.character-import-btn');
    this.importResult = dialog.locator('.character-import-result');
    this.importError = dialog.locator('.character-import-error');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('domcontentloaded');
    await this.moreMenuBtn.waitFor({ state: 'visible', timeout: 10000 });
  }

  // ── Menu operations ──

  async openMoreMenu() {
    await this.moreMenuBtn.click();
    // Wait for dropdown menu to appear
    await this.page.locator('[role="menu"]').waitFor({ state: 'visible' });
  }

  /** Click "Export Character" in the menu. Returns a Download promise for capturing the file. */
  async clickExportCharacter(): Promise<Download> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download', { timeout: 5000 }),
      this.page.locator('[role="menu"] .menu-export-character').click(),
    ]);
    return download;
  }

  /** Click "Import Character" in the menu. */
  async clickImportCharacter() {
    await this.page.locator('[role="menu"] .menu-import-character').click();
  }

  // ── Export assertions ──

  async expectExportDisabled() {
    const exportItem = this.page.locator('[role="menu"] .menu-export-character');
    await expect(exportItem).toHaveAttribute('aria-disabled', 'true');
  }

  // ── Import dialog operations ──

  async waitForImportDialog() {
    await this.importDialog.waitFor({ state: 'visible', timeout: 5000 });
  }

  async uploadFile(file: { name: string; mimeType: string; buffer: Buffer }) {
    await this.importFileInput.setInputFiles(file);
  }

  async clickImport() {
    await this.importBtn.click();
  }

  // ── Import assertions ──

  async expectDropZoneVisible() {
    await expect(this.importDropZone).toBeVisible();
  }

  async expectPreviewName(name: string) {
    await this.importPreviewName.waitFor({ state: 'visible' });
    await expect(this.importPreviewName).toContainText(name);
  }

  async expectSpellCount(count: number) {
    await this.importSpellCount.waitFor({ state: 'visible' });
    await expect(this.importSpellCount).toContainText(String(count));
  }

  async expectSubclassCount(count: number) {
    await this.importSubclassCount.waitFor({ state: 'visible' });
    await expect(this.importSubclassCount).toContainText(String(count));
  }

  async expectImportSuccess() {
    await expect(this.importResult).toBeVisible({ timeout: 5000 });
    await expect(this.importResult).toContainText('imported');
  }

  async expectImportError(message?: string) {
    await expect(this.importError).toBeVisible({ timeout: 5000 });
    if (message) {
      await expect(this.importError).toContainText(message);
    }
  }

  // ── Cleanup ──

  async closeDialog() {
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);
  }
}
