# Testing Guide

This document outlines the testing conventions and practices for the open20 monorepo.

## Test Structure

### Directory Organization

Each package follows its own test structure based on its needs:

- **core**: Uses `tests/` directory with domain-based organization

  ```
  packages/core/tests/
  ├── character/
  ├── engine/
  ├── monster/
  └── integration/
  ```

- **spellbook**: Uses co-located `__tests__/` directories for component tests

  ```
  packages/spellbook/src/components/SpellCard/
  ├── SpellCard.tsx
  └── __tests__/
      └── SpellCard.test.tsx
  ```

- **ui**: Uses `tests/` directory for component tests
  ```
  packages/ui/tests/
  ├── setup.ts
  └── components/
  ```

## Running Tests

### All Packages

```bash
pnpm test          # Run all tests across packages
pnpm test:watch    # Watch mode for all packages
```

### Individual Packages

```bash
# Core package
cd packages/core
pnpm test              # Run tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # Generate coverage report

# Spellbook package
cd packages/spellbook
pnpm test              # Run tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # Generate coverage report

# UI package
cd packages/ui
pnpm test              # Run tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # Generate coverage report
```

## Writing Tests

### Test File Naming

- Use `.test.ts` or `.test.tsx` extension
- Place tests in appropriate directory based on package convention
- Name test files after the module/component they test

### Test Structure Example

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../myModule';

describe('myFunction', () => {
  it('should return expected result', () => {
    const result = myFunction(input);
    expect(result).toBe(expectedOutput);
  });

  it('should handle edge cases', () => {
    // Test edge cases
  });
});
```

### Component Testing

For React components, use React Testing Library:

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## Test Utilities

Shared test utilities are available in `@open20/config/vitest/utils`:

```typescript
import { setupLocalStorageMock, createTestCharacter, waitFor } from '@open20/config/vitest/utils';

// Setup localStorage mock
setupLocalStorageMock();

// Create test character
const character = createTestCharacter({ level: 5 });

// Wait for async operations
await waitFor(100);
```

## Coverage Requirements

Each package has specific coverage thresholds:

- **core**: 80% lines, 75% branches, 80% functions, 80% statements
- **spellbook**: 75% lines, 70% branches, 75% functions, 75% statements
- **ui**: 70% lines, 65% branches, 70% functions, 70% statements

Coverage reports are generated in:

- Text output in terminal
- JSON summary for CI
- HTML report in `coverage/` directory

## Best Practices

1. **Write tests for public APIs**: Focus on testing the interface, not implementation details
2. **Use descriptive test names**: Make it clear what behavior is being tested
3. **Test edge cases**: Include boundary conditions and error scenarios
4. **Keep tests isolated**: Each test should be independent and not rely on other tests
5. **Use fixtures**: Create reusable test data in the `fixtures/` directory
6. **Mock external dependencies**: Use mocks for API calls, localStorage, etc.

## Integration Tests

Integration tests should be placed in package-specific `integration/` directories:

```
packages/core/tests/integration/
├── character-creation-flow.test.ts
└── spell-resolution.test.ts
```

For cross-package integration tests, consider creating a dedicated e2e test package.

## Continuous Integration

Tests run automatically on:

- Every pull request
- Before merging to main branch
- As part of the release process

Ensure all tests pass before submitting PRs.
