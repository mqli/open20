#!/usr/bin/env node
import { Project } from 'ts-morph';

const project = new Project({
  tsConfigFilePath: 'packages/ui/tsconfig.json',
});

const UI_SRC = '/Users/martin.l/hobby/open20/packages/ui/src';
let fixed = 0;

const sourceFiles = project.getSourceFiles('packages/ui/src/**/*.{ts,tsx}');

for (const sourceFile of sourceFiles) {
  const imports = sourceFile.getImportDeclarations();

  for (const imp of imports) {
    const moduleSpecifier = imp.getModuleSpecifierValue();

    // Only fix relative imports going up (../)
    if (!moduleSpecifier.startsWith('..')) continue;

    // Resolve the actual file path
    const resolved = imp.getModuleSpecifierSourceFile();
    if (!resolved) continue;

    const resolvedPath = resolved.getFilePath();

    // Only alias imports within ui/src
    if (!resolvedPath.startsWith(UI_SRC)) continue;

    // Compute alias: @open20/ui/<relative-path-from-src>
    let alias = '@open20/ui/' + resolvedPath.replace(UI_SRC + '/', '');

    // Remove .ts/.tsx/.js/.jsx extension
    alias = alias.replace(/\.(ts|tsx|js|jsx)$/, '');

    // If it resolves to index.ts, point to the folder
    if (alias.endsWith('/index')) {
      alias = alias.replace(/\/index$/, '');
    }

    imp.setModuleSpecifier(alias);
    fixed++;
  }
}

project.saveSync();
console.log(`✓ Fixed ${fixed} relative imports to aliases`);
