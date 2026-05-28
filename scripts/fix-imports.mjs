#!/usr/bin/env node
import { Project } from 'ts-morph';

const PACKAGES = [
  { name: '@open20/core', tsconfig: 'packages/core/tsconfig.json', src: 'packages/core/src' },
  { name: '@open20/ui', tsconfig: 'packages/ui/tsconfig.json', src: 'packages/ui/src' },
  {
    name: '@open20/spellbook',
    tsconfig: 'packages/spellbook/tsconfig.app.json',
    src: 'packages/spellbook/src',
  },
  { name: '@open20/config', tsconfig: 'packages/config/tsconfig.json', src: 'packages/config' },
];

let totalFixed = 0;

for (const pkg of PACKAGES) {
  const project = new Project({ tsConfigFilePath: pkg.tsconfig });
  const sourceFiles = project.getSourceFiles(`${pkg.src}/**/*.{ts,tsx,js,mjs}`);
  let fixed = 0;

  for (const sourceFile of sourceFiles) {
    const imports = sourceFile.getImportDeclarations();

    for (const imp of imports) {
      const moduleSpecifier = imp.getModuleSpecifierValue();
      if (!moduleSpecifier.startsWith('..')) continue;

      const resolved = imp.getModuleSpecifierSourceFile();
      if (!resolved) continue;

      const resolvedPath = resolved.getFilePath();
      const pkgSrc = process.cwd() + '/' + pkg.src;

      if (!resolvedPath.startsWith(pkgSrc)) continue;

      let alias = pkg.name + '/' + resolvedPath.replace(pkgSrc + '/', '');
      alias = alias.replace(/\.(ts|tsx|js|jsx|mjs)$/, '');
      if (alias.endsWith('/index')) alias = alias.replace(/\/index$/, '');

      imp.setModuleSpecifier(alias);
      fixed++;
    }
  }

  project.saveSync();
  console.log(`✓ ${pkg.name}: fixed ${fixed} imports`);
  totalFixed += fixed;
}

console.log(`\n✓ Total fixed: ${totalFixed} imports`);
