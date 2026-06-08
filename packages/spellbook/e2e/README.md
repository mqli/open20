# Spellbook E2E Tests

This directory contains end-to-end tests for the spellbook application.

## Documentation

**Read before writing tests:**

- **Writing Tests**: [`.agents/e2e/writing-tests.md`](../../.agents/e2e/writing-tests.md)
- **Best Practices**: [`.agents/e2e/best-practices.md`](../../.agents/e2e/best-practices.md)
- **Playwright Setup**: [`.agents/e2e/playwright-setup.md`](../../.agents/e2e/playwright-setup.md)

## Directory Structure

```
e2e/
├── fixtures/         # Test fixtures
├── pages/            # Page Object Models
│   ├── SpellLibraryPage.ts
│   └── CharacterPage.ts
└── specs/            # Test specifications
    ├── spell-search.spec.ts
    ├── spell-preparation.spec.ts
    └── spell-slots.spec.ts
```

## Running Tests

```bash
# Run all E2E tests
pnpm run test:e2e

# Run with UI (great for development)
pnpm run test:e2e:ui

# Debug tests
pnpm run test:e2e:debug

# View test report
pnpm run test:e2e:report
```

## Configuration

Playwright configuration is in `playwright.config.ts` (root of spellbook package).

Uses shared config from `@open20/config/playwright`.

## Adding New Tests

1. Create a new `.spec.ts` file in `specs/`
2. Use page objects from `pages/` directory
3. Follow patterns in existing tests
4. Run `pnpm run test:e2e:ui` to verify

## CI/CD

E2E tests run automatically in CI:

- After build step
- Before deployment
- Results uploaded as artifacts on failure
