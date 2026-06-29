import { test, expect } from '@playwright/test';
import { CharacterSetupPage } from '../pages/CharacterSetupPage';
import { TEST_WIZARD, STORAGE_KEY, ACTIVE_CHARACTER_KEY } from '../fixtures/test-character';

test.describe('Character Creation', () => {
  let setup: CharacterSetupPage;

  test.beforeEach(async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name === 'mobile';
    setup = new CharacterSetupPage(page, isMobile);
  });

  test('should create a basic character', async () => {
    await setup.goto();
    await setup.openCreateModal();

    await setup.fillName('Gandalf');
    await setup.selectClass('Wizard');
    await setup.setLevel(5);
    await setup.selectSpecies('Human');
    await setup.selectBackground('Sage');

    await setup.setAbility('Strength', 8);
    await setup.setAbility('Dexterity', 14);
    await setup.setAbility('Constitution', 14);
    await setup.setAbility('Intelligence', 17);
    await setup.setAbility('Wisdom', 12);
    await setup.setAbility('Charisma', 10);

    await setup.submit();
    await setup.switchToCharacterTab();

    await setup.expectCharacterInPanel('Gandalf');
    await setup.expectTextInPanel(/Wizard/);
  });

  test('should create a multiclass character', async () => {
    await setup.goto();
    await setup.openCreateModal();

    await setup.fillName('Eldritch Knight');
    await setup.selectClass('Fighter');
    await setup.setLevel(5);
    await setup.selectSpecies('Human');
    await setup.selectBackground('Soldier');

    await setup.clickAddClass();
    await setup.selectAdditionalClass('Wizard');
    await setup.setAdditionalLevel(2);

    await setup.setAbility('Strength', 16);
    await setup.setAbility('Dexterity', 12);
    await setup.setAbility('Constitution', 14);
    await setup.setAbility('Intelligence', 14);
    await setup.setAbility('Wisdom', 10);
    await setup.setAbility('Charisma', 8);

    await setup.submit();
    await setup.switchToCharacterTab();

    await setup.expectCharacterInPanel('Eldritch Knight');
    await setup.expectTextInPanel(/Fighter/);
    await setup.expectTextInPanel(/Wizard/);
  });

  test('should edit an existing character', async ({ page }) => {
    await page.addInitScript(
      ({ storageKey, activeKey, character }) => {
        localStorage.setItem(storageKey, JSON.stringify([character]));
        localStorage.setItem(activeKey, character.id);
      },
      { storageKey: STORAGE_KEY, activeKey: ACTIVE_CHARACTER_KEY, character: TEST_WIZARD },
    );

    await setup.goto();
    await setup.switchToCharacterTab();
    await setup.expectCharacterInPanel(TEST_WIZARD.name);
    // On mobile, switch back to Spells tab to access CharacterSelector in header
    await setup.switchToSpellsTab();
    await setup.openEditModal(TEST_WIZARD.name);

    await setup.fillName('Merlin the Wise');
    await setup.setAbility('Intelligence', 18);
    await setup.submit();
    await setup.switchToCharacterTab();

    await setup.expectCharacterInPanel('Merlin the Wise');
    await expect(page.getByText(TEST_WIZARD.name)).not.toBeVisible();
  });
});
