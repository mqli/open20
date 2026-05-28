#!/usr/bin/env node
import { Project } from 'ts-morph';

// Rewrite UI package-local aliases back to relative imports.
// `tsc` preserves path aliases in emitted JS, which breaks consumers when UI
// is consumed via built dist artifacts.

const project = new Project({ tsConfigFilePath: 'packages/ui/tsconfig.json' });
const sourceFiles = project.getSourceFiles('packages/ui/src/**/*.{ts,tsx}');

let fixed = 0;

for (const sourceFile of sourceFiles) {
  const imports = sourceFile.getImportDeclarations();
  const sourceFilePath = sourceFile.getFilePath();

  for (const imp of imports) {
    const moduleSpecifier = imp.getModuleSpecifierValue();

    // Only rewrite package-local aliases.
    if (!(moduleSpecifier === '@' || moduleSpecifier.startsWith('@/'))) continue;

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
