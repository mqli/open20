# Writing E2E Tests Guide

This guide explains how to write E2E tests for open20 packages using Playwright.

## Test Structure

### Directory Organization

```
e2e/
├── fixtures/         # Shared test data (characters, etc.)
├── pages/            # Page Object Models (POM)
└── specs/            # Test specifications
    ├── feature1.spec.ts
    └── feature2.spec.ts
```

### File Naming

- Test files: `*.spec.ts` (e.g., `spell-search.spec.ts`)
- Page objects: `*.ts` (e.g., `SpellLibraryPage.ts`)
- Data fixtures: `*.ts` (e.g., `test-character.ts`)

## Selector Strategy

**The most important rule for this project:** `data-testid` attributes are stripped by Vite in production builds. Playwright tests run against `vite preview`, so `getByTestId()` will never find anything.

### Use CSS Classes

Add a stable class directly in the component's `className`:

```tsx
// SpellbookControls.tsx
<IconButton className="prepare-spell-button" ... />
```

```typescript
// test
await page.locator('.prepare-spell-button').click();
```

### Semantic Locators Are Fine for ARIA Elements

```typescript
// ✅ Fine — tabs and roles are stable
await sheet.getByRole('tab').first().click();
await page.getByRole('button', { name: /close spell details/i }).click();

// ✅ Fine — exact text match avoids substring collisions
await page.getByText('Magic Missile', { exact: true }).first().click();
```

### Avoid Substring Traps with getByText

Always use `{ exact: true }` when text appears as part of longer strings elsewhere on the page:

```typescript
// ❌ Matches both "Fireball" and "Delayed Blast Fireball" → strict mode error
await page.getByText('Fireball').click();

// ✅ Exact match only
await page.getByText('Fireball', { exact: true }).first().click();
```

## Navigation

This app is a SPA with a single route. Always navigate to `/`:

```typescript
await page.goto('/');
```

**Never use** `waitForLoadState('networkidle')` — the app makes background requests after DOM load that prevent the idle state from being reached. Instead, wait for a specific element:

```typescript
// ✅ Correct pattern
await page.waitForLoadState('domcontentloaded');
await page.locator('.spell-search-input').waitFor({ state: 'visible' });
await page.locator('.spell-card').first().waitFor({ state: 'visible' });
```

## Seeding Test Data (localStorage)

For character-dependent tests, inject localStorage before the page loads using `page.addInitScript()`. This runs before page scripts so the app starts with your data already present.

```typescript
import { TEST_WIZARD, STORAGE_KEY, ACTIVE_CHARACTER_KEY } from '../fixtures/test-character';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    ({ storageKey, activeKey, character }) => {
      localStorage.setItem(storageKey, JSON.stringify([character]));
      localStorage.setItem(activeKey, character.id);
    },
    { storageKey: STORAGE_KEY, activeKey: ACTIVE_CHARACTER_KEY, character: TEST_WIZARD },
  );
  // goto() must come AFTER addInitScript
  await spellLibrary.goto();
});
```

### Character Fixture Requirements

The `recompute()` function runs on every character loaded from storage. For Wizard (spellbook caster), it preserves `knownSpells` and `preparedSpells` from the existing data — but the structure must be correct:

- `classId` must match the SRD ID exactly: `'Wizard'` (not `'wizard'`)
- Ability score keys must be full names: `'Intelligence'` (not `'int'`)
- `spellcastingAbility` must be full name: `'Intelligence'`
- `knownSpells` determines which spells a Wizard can prepare — the spell must be in `knownSpells` before it can appear in `preparedSpells`
- Start `preparedSpells: []` for tests that test the prepare flow from scratch

See `e2e/fixtures/test-character.ts` for the canonical reference.

## Working with Dialogs

Radix UI Dialog and Sheet both render with `role="dialog"`. The spellbook has a backdrop at `z-40` that intercepts pointer events for elements outside the open dialog.

**Always scope locators to the dialog:**

```typescript
export class CharacterPage {
  readonly sheet: Locator;

  constructor(page: Page) {
    this.sheet = page.locator('[role="dialog"]');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.locator('.character-button').waitFor({ state: 'visible' });
    await this.page.locator('.character-button').click();
    await this.sheet.waitFor({ state: 'visible' });
  }
}
```

When two dialogs could be open simultaneously (spell detail flyout + character sheet), qualify the selector:

```typescript
const prepareButton = page.locator('[role="dialog"] .prepare-spell-button');
```

## Interaction Patterns

### Slot Pips (aria-checked)

Slot pips use an index-based `aria-checked` convention. Clicking any available pip consumes the **last** available slot (not the clicked one). Test by counting `[aria-checked="false"]` before and after, not by checking a specific pip's state:

```typescript
const availableBefore = await sheet.locator('.slot-pip[aria-checked="false"]').count();
await sheet.locator('.slot-pip[aria-checked="false"]').first().click();
const availableAfter = await sheet.locator('.slot-pip[aria-checked="false"]').count();
expect(availableAfter).toBe(availableBefore - 1);
```

### Prepare/Unprepare Spells

Always check the button's current state before asserting a post-click outcome. Do not assume a spell starts unprepared:

```typescript
const prepareButton = page.locator('[role="dialog"] .prepare-spell-button');
await prepareButton.waitFor({ state: 'visible' });
await prepareButton.click();
// Title will be "Prepare Spell" or "Unprepare Spell" depending on current state
await expect(prepareButton).toHaveAttribute('title', /unprepare spell/i);
```

For tests that need a spell to be in a specific state before proceeding:

```typescript
if (!/unprepare/i.test((await prepareButton.getAttribute('title')) ?? '')) {
  await prepareButton.click(); // ensure it is prepared first
}
```

## Writing Page Objects

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class SpellLibraryPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly spellCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('input.spell-search-input');
    this.spellCards = page.locator('.spell-card');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('domcontentloaded');
    await this.searchInput.waitFor({ state: 'visible' });
    await this.spellCards.first().waitFor({ state: 'visible' });
  }

  async searchSpell(spellName: string) {
    await this.searchInput.fill(spellName);
    await this.page.waitForTimeout(500); // debounce
  }

  async viewSpell(spellName: string) {
    await this.page.getByText(spellName, { exact: true }).first().click();
  }
}
```

## Common Assertions

```typescript
// Visibility
await expect(page.getByText('Welcome')).toBeVisible();
await expect(page.locator('.empty-state')).toBeVisible();

// Attribute value
await expect(button).toHaveAttribute('title', /unprepare spell/i);

// Count
await expect(page.locator('.spell-card')).toHaveCount(5);
const count = await page.locator('.spell-card').count();
expect(count).toBeGreaterThan(0);
```

## Debugging Tests

### Run in UI Mode

```bash
pnpm run test:e2e:ui
```

### Debug a Specific Test

```bash
pnpm run test:e2e:debug -- spell-search.spec.ts
```

### Use pause() for Debugging

```typescript
test('debugging example', async ({ page }) => {
  await page.pause(); // Opens Playwright Inspector
});
```

## Next Steps

- Read `best-practices.md` for more patterns and rules
- Check existing tests in `e2e/specs/` for working examples
- Run `pnpm run test:e2e:ui` to explore tests interactively
