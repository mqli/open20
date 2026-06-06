#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const uiSrcDir = path.join(rootDir, 'packages/ui/src');
const componentsDir = path.join(uiSrcDir, 'components');
const baseDir = path.join(componentsDir, 'base');

// Base components to move
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

// Domain-specific components to keep at root
const domainComponents = ['spell', 'rules'];

console.log('🚀 Starting base components migration...\n');

// Step 1: Create base/ directory
console.log('📁 Step 1: Creating base/ directory...');
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
  console.log('   ✅ Created:', baseDir);
} else {
  console.log('   ⚠️  base/ directory already exists');
}

// Step 2: Move base components
console.log('\n📦 Step 2: Moving base components to base/...');
const movedComponents = [];

for (const component of baseComponents) {
  const srcPath = path.join(componentsDir, component);
  const destPath = path.join(baseDir, component);

  if (fs.existsSync(srcPath)) {
    if (!fs.existsSync(destPath)) {
      fs.renameSync(srcPath, destPath);
      movedComponents.push(component);
      console.log(`   ✅ Moved: ${component}/`);
    } else {
      console.log(`   ⚠️  Skipped: ${component}/ (already exists in base/)`);
    }
  } else {
    console.log(`   ❌ Not found: ${component}/`);
  }
}

console.log(`\n   Total moved: ${movedComponents.length} components`);

// Step 3: Update import paths in all TypeScript/TSX files
console.log('\n🔄 Step 3: Updating import paths...');

function updateImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // Pattern 1: Update imports from '../components/X' to '../components/base/X' or './base/X'
  for (const component of baseComponents) {
    // Match various relative path patterns
    const patterns = [
      new RegExp(`from ['"](\\.{1,2}/.*?)/components/${component}(['"])`, 'g'),
      new RegExp(`import ['"](\\.{1,2}/.*?)/components/${component}(['"])`, 'g'),
    ];

    for (const pattern of patterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, `from '$1/components/base/${component}$2`);
        modified = true;
      }
    }
  }

  // Pattern 2: Update barrel exports in index.ts files
  const barrelPattern = /export\s+(?:type\s+)?(?:\*\s+from|{[^}]+}\s+from)\s+['"]\.\/([^'"]+)['"]/g;
  let match;
  while ((match = barrelPattern.exec(content)) !== null) {
    const importedModule = match[1];
    if (baseComponents.includes(importedModule) && !match[0].includes('base/')) {
      const newImport = match[0].replace(`'./${importedModule}'`, `'./base/${importedModule}'`);
      content = content.replace(match[0], newImport);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  }
  return false;
}

// Update all TS/TSX files in packages/ui/src
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  let updatedFiles = 0;

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      updatedFiles += walkDir(fullPath);
    } else if (/\.(ts|tsx)$/.test(file)) {
      if (updateImportsInFile(fullPath)) {
        console.log(`   ✅ Updated: ${path.relative(rootDir, fullPath)}`);
        updatedFiles++;
      }
    }
  }

  return updatedFiles;
}

const updatedCount = walkDir(uiSrcDir);
console.log(`\n   Total files updated: ${updatedCount}`);

// Step 4: Update src/index.ts barrel exports
console.log('\n📝 Step 4: Updating src/index.ts barrel exports...');
const indexPath = path.join(uiSrcDir, 'index.ts');

if (fs.existsSync(indexPath)) {
  let indexContent = fs.readFileSync(indexPath, 'utf-8');
  let modified = false;

  for (const component of baseComponents) {
    const oldPath = `./components/${component}/`;
    const newPath = `./components/base/${component}/`;

    if (indexContent.includes(oldPath)) {
      indexContent = indexContent.replace(new RegExp(escapeRegExp(oldPath), 'g'), newPath);
      modified = true;
      console.log(`   ✅ Updated: ${component}/ path in index.ts`);
    }
  }

  if (modified) {
    fs.writeFileSync(indexPath, indexContent, 'utf-8');
    console.log('\n   ✅ src/index.ts updated successfully');
  } else {
    console.log('\n   ⚠️  No changes needed in src/index.ts');
  }
}

// Step 5: Update AGENTS.md documentation
console.log('\n📚 Step 5: Updating AGENTS.md documentation...');
const agentsPath = path.join(rootDir, 'packages/ui/AGENTS.md');

if (fs.existsSync(agentsPath)) {
  let agentsContent = fs.readFileSync(agentsPath, 'utf-8');

  // Update directory structure in AGENTS.md
  const oldStructure = /└── components\/[\s\S]*?└── \.\.\.\s*\|/;
  const newStructure = `└── components/
│   ├── base/                    # Base UI components
│   │   ├── Badge/
│   │   ├── Button/
│   │   ├── CardSurface/
│   │   ├── Dialog/
│   │   ├── Divider/
│   │   ├── DropdownMenu/
│   │   ├── EmptyState/
│   │   ├── FilterChip/
│   │   ├── IconButton/
│   │   ├── Input/
│   │   ├── SectionHeader/
│   │   ├── Select/
│   │   ├── Sheet/
│   │   ├── Slider/
│   │   ├── SlotPips/
│   │   ├── Surface/
│   │   ├── Switch/
│   │   ├── Tabs/
│   │   ├── Text/
│   │   ├── ThemeToggle/
│   │   ├── Toggle/
│   │   ├── Tooltip/
│   │   └── icons/
│   ├── spell/                   # Spell-specific components
│   └── rules/                   # Rules-specific components`;

  if (agentsContent.includes('└── components/')) {
    console.log('   ✅ AGENTS.md structure documentation needs manual review');
  }
}

console.log('\n✨ Migration script completed!');
console.log('\n📋 Next steps:');
console.log('   1. Review the changes');
console.log('   2. Run: pnpm build');
console.log('   3. Run: pnpm typecheck');
console.log('   4. Run: pnpm lint');
console.log('   5. Run: pnpm test');
console.log('   6. Commit the changes\n');

// Helper function to escape regex special characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
