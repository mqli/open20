#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const uiSrcDir = path.join(rootDir, 'packages/ui/src');
const baseDir = path.join(uiSrcDir, 'components/base');

console.log('🔧 Fixing base component imports...\n');

// Base components that were moved
const baseComponents = [
  'Badge',
  'Button',
  'CardSurface',
  'Dialog',
  'Divider',
  'DropdownMenu',
  'EmptyState',
  'FilterChip',
  'IconButton',
  'Input',
  'SectionHeader',
  'Select',
  'Sheet',
  'Slider',
  'SlotPips',
  'Surface',
  'Switch',
  'Tabs',
  'Text',
  'ThemeToggle',
  'Toggle',
  'Tooltip',
  'icons',
];

let fixedFiles = 0;

// Fix 1: Update index.ts files in base/* - remove incorrect './base/' prefix
console.log('📝 Fix 1: Fixing index.ts barrel exports in base/components...');
for (const component of baseComponents) {
  const indexPath = path.join(baseDir, component, 'index.ts');

  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf-8');
    let modified = false;

    // Fix: './base/Component' → './Component'
    for (const comp of baseComponents) {
      const incorrectPattern = `from './base/${comp}'`;
      const correctPattern = `from './${comp}'`;

      if (content.includes(incorrectPattern)) {
        content = content.split(incorrectPattern).join(correctPattern);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(indexPath, content, 'utf-8');
      console.log(`   ✅ Fixed: base/${component}/index.ts`);
      fixedFiles++;
    }
  }
}

// Fix 2: Update @/components/X imports to @/components/base/X in base/* components
console.log('\n📝 Fix 2: Updating @/components/X imports to @/components/base/X...\n');

function fixComponentImports(dir) {
  const files = fs.readdirSync(dir);
  let count = 0;

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      count += fixComponentImports(fullPath);
    } else if (/\.(ts|tsx)$/.test(file)) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      let modified = false;

      // Replace @/components/X with @/components/base/X for base components
      for (const comp of baseComponents) {
        const oldImport = `@/components/${comp}`;
        const newImport = `@/components/base/${comp}`;

        if (content.includes(oldImport) && !content.includes(newImport)) {
          content = content.split(oldImport).join(newImport);
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log(`   ✅ Fixed: ${path.relative(rootDir, fullPath)}`);
        count++;
        fixedFiles++;
      }
    }
  }

  return count;
}

fixComponentImports(baseDir);

// Fix 3: Update domain components (spell/, rules/) imports
console.log('\n📝 Fix 3: Updating domain components imports...\n');

const componentsDir = path.join(uiSrcDir, 'components');
const domainDirs = ['spell', 'rules'];

for (const domain of domainDirs) {
  const domainPath = path.join(componentsDir, domain);
  if (fs.existsSync(domainPath)) {
    fixComponentImports(domainPath);
  }
}

console.log(`\n✨ Fixed ${fixedFiles} files total!`);
console.log('\n📋 Next: Run pnpm build to verify changes\n');
