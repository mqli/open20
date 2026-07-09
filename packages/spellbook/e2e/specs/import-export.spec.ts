import { test, expect } from '@playwright/test';
import { ImportExportPage } from '../pages/ImportExportPage';
import { TEST_WIZARD, STORAGE_KEY, ACTIVE_CHARACTER_KEY } from '../fixtures/test-character';
import {
  EXPORTED_CHARACTER_BUNDLE,
  INVALID_JSON_CONTENT,
  createUploadFile,
} from '../fixtures/test-character-export';

test.describe('Character Import/Export', () => {
  let ie: ImportExportPage;

  // ───────────────────────────────────────────────────────────
  // 1. Export — seed character, click menu, verify download
  // ───────────────────────────────────────────────────────────

  test('exports active character as a JSON file', async ({ page }) => {
    await page.addInitScript(
      ({ storageKey, activeKey, character }) => {
        localStorage.setItem(storageKey, JSON.stringify([character]));
        localStorage.setItem(activeKey, character.id);
      },
      { storageKey: STORAGE_KEY, activeKey: ACTIVE_CHARACTER_KEY, character: TEST_WIZARD },
    );

    ie = new ImportExportPage(page);
    await ie.goto();
    await ie.openMoreMenu();

    const download = await ie.clickExportCharacter();

    expect(download.suggestedFilename()).toMatch(/open20-character-test-wizard.*\.json/);

    // Verify content structure
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(chunk as Buffer);
    const parsed = JSON.parse(Buffer.concat(chunks).toString('utf-8'));

    expect(parsed.schemaVersion).toBeDefined();
    expect(parsed.character).toBeDefined();
    expect(parsed.character.name).toBe('Test Wizard');
    expect(parsed.meta.exportedFrom).toBe('open20-spellbook');
  });

  // ───────────────────────────────────────────────────────────
  // 2. Import — upload CharacterBundle, preview, confirm, verify result
  // ───────────────────────────────────────────────────────────

  test('imports a character with custom spells and subclasses', async ({ page }) => {
    ie = new ImportExportPage(page);
    await ie.goto();
    await ie.openMoreMenu();
    await ie.clickImportCharacter();
    await ie.waitForImportDialog();
    await ie.expectDropZoneVisible();

    // Upload a valid CharacterBundle
    const file = createUploadFile(
      JSON.stringify(EXPORTED_CHARACTER_BUNDLE),
      'exported-cleric.json',
    );
    await ie.uploadFile(file);

    // Preview shows character info
    await ie.expectPreviewName('Exported Cleric');
    await ie.expectSpellCount(1);
    await ie.expectSubclassCount(1);

    // Confirm import
    await ie.clickImport();

    // Result shows success
    await ie.expectImportSuccess();
  });

  // ───────────────────────────────────────────────────────────
  // 3. Error — upload invalid file, verify error message
  // ───────────────────────────────────────────────────────────

  test('shows error when uploading invalid file', async ({ page }) => {
    ie = new ImportExportPage(page);
    await ie.goto();
    await ie.openMoreMenu();
    await ie.clickImportCharacter();
    await ie.waitForImportDialog();

    const file = createUploadFile(INVALID_JSON_CONTENT, 'bad-file.json');
    await ie.uploadFile(file);

    await ie.expectImportError();
  });
});
