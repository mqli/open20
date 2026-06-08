# Writing E2E Tests Guide

This guide explains how to write E2E tests for open20 packages using Playwright.

## Test Structure

### Directory Organization

```
e2e/
├── fixtures/         # Test fixtures (shared setup/teardown)
├── pages/            # Page Object Models (POM)
└── specs/            # Test specifications
    ├── feature1.spec.ts
    └── feature2.spec.ts
```

### File Naming

- Test files: `*.spec.ts` (e.g., `spell-search.spec.ts`)
- Page objects: `*.ts` (e.g., `SpellLibraryPage.ts`)
- Fixtures: `*.fixture.ts` (e.g., `auth.fixture.ts`)

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Test logic
    await page.getByRole('button', { name: 'Click Me' }).click();
    await expect(page.getByText('Result')).toBeVisible();
  });

  test.afterEach(async ({ page }) => {
    // Cleanup after each test
  });
});
```

### Using Page Objects

```typescript
import { test, expect } from '@playwright/test';
import { SpellLibraryPage } from '../pages/SpellLibraryPage';

test.describe('Spell Library', () => {
  let spellLibrary: SpellLibraryPage;

  test.beforeEach(async ({ page }) => {
    spellLibrary = new SpellLibraryPage(page);
    await spellLibrary.goto();
  });

  test('should search spells', async () => {
    await spellLibrary.searchSpell('Fireball');
    await spellLibrary.expectSpellVisible('Fireball');
  });
});
```

## Best Practices

### 1. Use Semantic Locators

Prefer semantic locators over CSS selectors:

```typescript
// ✅ Good - semantic and robust
await page.getByRole('button', { name: 'Submit' });
await page.getByText('Welcome, User');
await page.getByLabel('Email');

// ❌ Avoid - brittle
await page.locator('.submit-btn');
await page.locator('#welcome-message');
```

### 2. Use Page Object Model (POM)

Encapsulate page interactions in page objects:

```typescript
// pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async login(username: string, password: string) {
    await this.page.getByLabel('Username').fill(username);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();
  }
}
```

### 3. Wait for Elements Properly

```typescript
// ✅ Good - explicit waiting
await expect(page.getByText('Success')).toBeVisible();
await page.waitForLoadState('networkidle');

// ❌ Avoid - arbitrary timeouts
await page.waitForTimeout(5000);
```

### 4. Keep Tests Independent

Each test should:

- Set up its own data
- Not depend on other tests
- Clean up after itself

```typescript
test.describe('Spell Preparation', () => {
  test.beforeEach(async ({ page }) => {
    // Each test starts fresh
    await resetTestData();
    await page.goto('/spells');
  });

  test('should prepare spell', async ({ page }) => {
    // Test logic
  });
});
```

### 5. Use Fixtures for Shared Setup

```typescript
// fixtures/test.fixture.ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  // Shared setup
  page: async ({ page }, use) => {
    await page.goto('/');
    await use(page);
  },
});
```

## Common Patterns

### Form Submission

```typescript
test('should submit form', async ({ page }) => {
  await page.getByLabel('Name').fill('John');
  await page.getByLabel('Email').fill('john@example.com');
  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page.getByText('Success')).toBeVisible();
});
```

### Navigation

```typescript
test('should navigate to page', async ({ page }) => {
  await page.getByRole('link', { name: 'Spells' }).click();
  await expect(page).toHaveURL('/spells');
});
```

### Assertions

```typescript
// Visibility
await expect(page.getByText('Welcome')).toBeVisible();
await expect(page.getByText('Hidden')).not.toBeVisible();

// Text content
await expect(page.getByText('Welcome')).toHaveText('Welcome, User');

// URL
await expect(page).toHaveURL('/dashboard');

// Count
await expect(page.getByRole('listitem')).toHaveCount(5);
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

### Use `pause()` for Debugging

```typescript
test('debugging example', async ({ page }) => {
  await page.pause(); // Opens Playwright Inspector
  // ... rest of test
});
```

## Next Steps

- Read `best-practices.md` for more testing patterns
- Check existing tests in `e2e/specs/` for examples
- Run `pnpm run test:e2e:ui` to explore tests interactively
