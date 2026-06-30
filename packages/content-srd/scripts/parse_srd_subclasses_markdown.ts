#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import type { Subclass } from 'open20-core';
import { CLASS_MARKDOWN_FILE_ORDER } from './parse_srd_class_markdown_shared';
import { generateSubclassesFromDocuments, mergeSubclasses } from './parse_srd_class_generation';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const classesDir = resolve(projectRoot, 'src', 'markdown', 'classes');
const spellsPath = resolve(projectRoot, 'data', 'spells.json');
const subclassesOutputPath = resolve(projectRoot, 'data', 'subclasses.json');

function listClassMarkdownFiles(): string[] {
  return CLASS_MARKDOWN_FILE_ORDER.map((name) => resolve(classesDir, name));
}

function main(): void {
  const spells = JSON.parse(readFileSync(spellsPath, 'utf-8')) as Array<{
    id: string;
    name: string;
  }>;
  const classDocs = listClassMarkdownFiles().map((path) => ({
    content: readFileSync(path, 'utf-8'),
  }));
  const generatedSubclasses = generateSubclassesFromDocuments(classDocs, spells);

  const existingSubclasses = existsSync(subclassesOutputPath)
    ? (JSON.parse(readFileSync(subclassesOutputPath, 'utf-8')) as Subclass[])
    : [];
  const merged = mergeSubclasses(existingSubclasses, generatedSubclasses);
  writeFileSync(subclassesOutputPath, `${JSON.stringify(merged, null, 2)}\n`, 'utf-8');
  console.log(`Generated ${generatedSubclasses.length} subclasses -> ${subclassesOutputPath}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
