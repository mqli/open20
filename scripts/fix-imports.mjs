#!/usr/bin/env node
import { Project } from 'ts-morph';

// Revert @open20/ui/* internal imports back to relative paths
// The @open20/ui/* tsconfig path alias only works within the ui package's own tsc,
// but breaks when other packages (like spellbook) build with project references.

const project = new Project({ tsConfigFilePath: 'packages/ui/tsconfig.json' });
const sourceFiles = project.getSourceFiles('packages/ui/src/**/*.{ts,tsx}');

let fixed = 0;

for (const sourceFile of sourceFiles) {
  const imports = sourceFile.getImportDeclarations();
  const sourceFilePath = sourceFile.getFilePath();

  for (const imp of imports) {
    const moduleSpecifier = imp.getModuleSpecifierValue();

    // Only fix @open20/ui/ deep imports (not the barrel @open20/ui)
    if (!moduleSpecifier.startsWith('@open20/ui/')) continue;

    // Resolve the target file
    const resolved = imp.getModuleSpecifierSourceFile();
    if (!resolved) continue;

    const resolvedPath = resolved.getFilePath();
    const srcRoot = process.cwd() + '/packages/ui/src';

    if (!resolvedPath.startsWith(srcRoot)) continue;

    // Compute relative path from source file to target
    const sourceDir = sourceFilePath.substring(0, sourceFilePath.lastIndexOf('/'));
    const targetRel = resolvedPath.replace(srcRoot + '/', '');

    // Calculate relative path
    const sourceParts = sourceDir.replace(srcRoot + '/', '').split('/');
    const targetParts = targetRel.split('/');

    // Remove common prefix
    let i = 0;
    while (
      i < sourceParts.length - 1 &&
      i < targetParts.length &&
      sourceParts[i] === targetParts[i]
    ) {
      i++;
    }

    const upParts =
      sourceParts.slice(i, -1).length > 0
        ? Array(sourceParts.slice(i, -1).length).fill('..').join('/')
        : '.';
    const downParts = targetParts.slice(i).join('/');

    let relativePath = downParts ? `${upParts}/${downParts}` : upParts;

    // Remove .ts/.tsx extension
    relativePath = relativePath.replace(/\.(ts|tsx)$/, '');
    // index files -> directory
    if (relativePath.endsWith('/index')) {
      relativePath = relativePath.replace(/\/index$/, '');
    }

    imp.setModuleSpecifier(relativePath);
    fixed++;
  }
}

project.saveSync();
console.log(`✓ Reverted ${fixed} @open20/ui/* imports back to relative paths`);
