#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import type { Class } from '../src/types/class';
import {
  CLASS_MARKDOWN_FILE_ORDER,
} from './parse_srd_class_markdown_shared';
import {
  generateClassesFromDocuments,
  mergeClasses,
  updateLookupTables,
  type LookupTables,
} from './parse_srd_class_generation';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const classesDir = resolve(projectRoot, 'requirements', '02-character-creation', 'classes');
const classesOutputPath = resolve(projectRoot, 'static', 'srd', 'classes.json');
const spellsPath = resolve(projectRoot, 'static', 'srd', 'spells.json');
const lookupTablesPath = resolve(projectRoot, 'static', 'srd', 'lookup-tables.json');

function listClassMarkdownFiles(): string[] {
  return CLASS_MARKDOWN_FILE_ORDER.map(name => resolve(classesDir, name));
}

function main(): void {
  const spellList = JSON.parse(readFileSync(spellsPath, 'utf-8')) as Array<{ id: string; name: string }>;
  const classDocs = listClassMarkdownFiles().map(path => ({ content: readFileSync(path, 'utf-8') }));
  const { classes: generatedClasses, spellSlotsUpdates } = generateClassesFromDocuments(classDocs, spellList);

  const existingClasses = existsSync(classesOutputPath)
    ? (JSON.parse(readFileSync(classesOutputPath, 'utf-8')) as Class[])
    : [];
  const mergedClasses = mergeClasses(existingClasses, generatedClasses);
  writeFileSync(classesOutputPath, `${JSON.stringify(mergedClasses, null, 2)}\n`, 'utf-8');

  const existingLookup = JSON.parse(readFileSync(lookupTablesPath, 'utf-8')) as LookupTables;
  const updatedLookup = updateLookupTables(existingLookup, spellSlotsUpdates);
  writeFileSync(lookupTablesPath, `${JSON.stringify(updatedLookup, null, 2)}\n`, 'utf-8');

  console.log(`Generated ${generatedClasses.length} classes -> ${classesOutputPath}`);
  console.log(`Updated lookup tables -> ${lookupTablesPath}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
