import { test, expect } from '@playwright/test';
import { CustomClassPage } from '../pages/CustomClassPage';
import { CUSTOM_CLASSES_KEY, SEED_CUSTOM_CLASSES } from '../fixtures/test-custom-class';

test.describe('Custom Class Management', () => {
  let customClassPage: CustomClassPage;

  test.beforeEach(async ({ page }) => {
    customClassPage = new CustomClassPage(page);
  });

  // ── Modal open ──

  test('should open class modal from dropdown menu', async () => {
    await customClassPage.goto();
    await customClassPage.openClassModal();

    await expect(customClassPage.getDialog()).toBeVisible();
    await expect(customClassPage.getDialog().getByText('Manage Custom Classes')).toBeVisible();
  });

  // ── Create custom class ──

  test('should create a custom class with subclasses', async () => {
    await customClassPage.goto();
    await customClassPage.openClassModal();

    // Click "Create Custom Class"
    await customClassPage.clickCreateNew();

    // Fill in the form
    await customClassPage.fillClassName('Shadow Mage');
    await customClassPage.selectSpellcastingAbility('Charisma');
    await customClassPage.selectSlotPreset('Full Caster');

    // Add a subclass
    await customClassPage.addSubclassInForm('Shadow Domain');

    // Save
    await customClassPage.clickSave();

    // Should return to list view with the new class
    await expect(customClassPage.getClassRow('Shadow Mage')).toBeVisible();
    await expect(customClassPage.getClassRow('Shadow Mage').getByText('1 subclass')).toBeVisible();
  });

  // ── Edit custom class ──

  test('should edit an existing custom class', async ({ page }) => {
    // Seed a custom class
    await page.addInitScript(
      ({ key, data }) => {
        localStorage.setItem(key, JSON.stringify(data));
      },
      { key: CUSTOM_CLASSES_KEY, data: SEED_CUSTOM_CLASSES },
    );

    await customClassPage.goto();
    await customClassPage.openClassModal();

    // Click edit on "My Wizard"
    await customClassPage.clickEditClass('My Wizard');

    // Change the name
    await customClassPage.fillClassName('Arcane Scholar');

    // Save
    await customClassPage.clickSave();

    // Wait for list view to update
    await customClassPage.page.waitForTimeout(500);

    // Verify new name in list
    await expect(customClassPage.getClassRow('Arcane Scholar')).toBeVisible({ timeout: 10000 });
    await expect(customClassPage.getClassRow('My Wizard')).not.toBeVisible({ timeout: 10000 });
  });

  // ── Delete custom class ──

  test('should delete a custom class', async ({ page }) => {
    await page.addInitScript(
      ({ key, data }) => {
        localStorage.setItem(key, JSON.stringify(data));
      },
      { key: CUSTOM_CLASSES_KEY, data: SEED_CUSTOM_CLASSES },
    );

    await customClassPage.goto();
    await customClassPage.openClassModal();

    // Expect the class to be there
    await expect(customClassPage.getClassRow('My Wizard')).toBeVisible();

    // Click delete
    await customClassPage.acceptConfirm();
    await customClassPage.clickDeleteFromList('My Wizard');

    // Wait for the delete to complete
    await customClassPage.page.waitForTimeout(500);

    // Should show empty state
    await expect(customClassPage.getEmptyText()).toBeVisible();
  });

  // ── Add subclass to existing custom class ──

  test('should add subclass to existing custom class from list view', async ({ page }) => {
    await page.addInitScript(
      ({ key, data }) => {
        localStorage.setItem(key, JSON.stringify(data));
      },
      { key: CUSTOM_CLASSES_KEY, data: SEED_CUSTOM_CLASSES },
    );

    await customClassPage.goto();
    await customClassPage.openClassModal();

    // Click "+" on "My Wizard"
    await customClassPage.clickAddSubclassOnRow('My Wizard');

    // Fill in subclass name
    await customClassPage.fillSubclassName('Illusion Domain');

    // Click Add
    await customClassPage.clickAddSubclassSubmit();

    // Should return to list view with updated count
    await expect(customClassPage.getClassRow('My Wizard')).toBeVisible();
    await expect(customClassPage.getDialog().getByText('2 subclasses')).toBeVisible();
  });

  // ── Add standalone subclass to SRD class ──

  test('should add standalone subclass to SRD class', async () => {
    await customClassPage.goto();
    await customClassPage.openClassModal();

    // Click "+" on SRD Wizard row
    await customClassPage.clickAddSubclassOnRow('Wizard');

    // Fill subclass name
    await customClassPage.fillSubclassName('War Magic');

    // Click Add
    await customClassPage.clickAddSubclassSubmit();

    // Should return to list view
    await customClassPage.page.waitForTimeout(500);

    // The SRD Wizard row should now show "1 custom subclass"
    const wizardRow = customClassPage.getSrdClassRow('Wizard');
    await expect(wizardRow.getByText(/1 custom subclass/i)).toBeVisible();
  });

  // ── Persistence: custom class ──

  test('should persist custom class after page reload', async ({ page }) => {
    // First, create a class
    await customClassPage.goto();
    await customClassPage.openClassModal();
    await customClassPage.clickCreateNew();
    await customClassPage.fillClassName('Persistent Mage');
    await customClassPage.clickSave();

    // Verify it's there
    await expect(customClassPage.getClassRow('Persistent Mage')).toBeVisible();

    // Reload the page
    await page.reload({ timeout: 15000 });
    await page.waitForLoadState('domcontentloaded');
    await page.locator('.spell-card').first().waitFor({ state: 'visible', timeout: 10000 });

    // Open modal again
    await customClassPage.openClassModal();

    // Should still be there
    await expect(customClassPage.getClassRow('Persistent Mage')).toBeVisible({ timeout: 10000 });
  });

  // ── Persistence: standalone subclass ──

  test('should persist standalone subclass after page reload', async ({ page }) => {
    // Create a standalone subclass
    await customClassPage.goto();
    await customClassPage.openClassModal();
    await customClassPage.clickAddSubclassOnRow('Wizard');
    await customClassPage.fillSubclassName('Bladesinging');
    await customClassPage.clickAddSubclassSubmit();

    await customClassPage.page.waitForTimeout(500);

    // Verify it appears
    const wizardRow = customClassPage.getSrdClassRow('Wizard');
    await expect(wizardRow.getByText(/1 custom subclass/i)).toBeVisible();

    // Reload
    await page.reload({ timeout: 15000 });
    await page.waitForLoadState('domcontentloaded');
    await page.locator('.spell-card').first().waitFor({ state: 'visible', timeout: 10000 });
    await customClassPage.openClassModal();

    // Should still be there
    const wizardRowAfter = customClassPage.getSrdClassRow('Wizard');
    await expect(wizardRowAfter.getByText(/1 custom subclass/i)).toBeVisible({ timeout: 5000 });
  });
});
