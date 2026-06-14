# Task A: Package Scaffold & Monorepo Integration

**Phase**: 1 (MVP) | **Priority**: P0 | **Must complete BEFORE all other tasks**

## Objective

Create the `@open20/rulebook` package skeleton and wire it into the open20 monorepo.

## Dependencies

- **None** (first task)

## Files to Create

```
packages/rulebook/
├── package.json          # @open20/rulebook
├── tsconfig.json
├── eslint.config.js
├── src/
│   └── index.ts         # Empty barrel export (placeholder)
└── tests/
    └── .gitkeep
```

## Package.json Specification

```json
{
  "name": "@open20/rulebook",
  "version": "0.1.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./types": "./src/types/index.ts",
    "./editor": "./src/editor/index.ts",
    "./validator": "./src/validator/index.ts",
    "./io": "./src/io/index.ts",
    "./storage": "./src/storage/index.ts",
    "./manager": "./src/manager/index.ts",
    "./browser": "./src/browser/index.ts"
  },
  "files": ["src", "LICENSE"],
  "scripts": {
    "build": "echo 'headless package — no build step'",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src/ tests/",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "open20-core": "workspace:*",
    "zod": "catalog:"
  },
  "devDependencies": {
    "@open20/config": "workspace:*",
    "typescript": "catalog:",
    "vitest": "catalog:",
    "eslint": "catalog:"
  }
}
```

## tsconfig.json Specification

```json
{
  "extends": "@open20/config/tsconfig/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

## eslint.config.js Specification

```js
import config from '@open20/config/eslint';

export default [
  ...config,
  {
    ignores: ['dist/'],
  },
];
```

## Integration Steps

1. **Update `pnpm-workspace.yaml`** — no changes needed (workspace covers `packages/*`)

2. **Update `turbo.json`** — add rulebook to build pipeline:

   ```json
   // In tasks.build.dependsOn, verify "^build" is already present (it is — rulebook depends on core via workspace:*)
   ```

3. **Root `pnpm install`** — run to link workspace deps

4. **Verify**:
   ```bash
   pnpm --filter @open20/rulebook test     # should run 0 tests (vitest finds none)
   pnpm --filter @open20/rulebook typecheck # should pass (empty src/)
   pnpm --filter @open20/rulebook lint      # should pass
   ```

## Acceptance Criteria

- [ ] `package.json` has correct name, deps, and exports map
- [ ] `tsconfig.json` extends `@open20/config/tsconfig/base.json`
- [ ] `pnpm install` from root succeeds (rulebook linked as workspace package)
- [ ] `pnpm --filter @open20/rulebook typecheck` passes
- [ ] `pnpm --filter @open20/rulebook lint` passes
- [ ] `src/index.ts` exports nothing (empty barrel for now)

## Key Constraints

- Zero UI dependencies (headless package)
- Must use `open20-core` via `workspace:*`
- Must use catalog versions for zod, vitest, typescript
- `build` is a no-op (headless TS exported directly)
