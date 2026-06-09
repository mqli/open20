#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { parseGlossaryMarkdown } from './parse_srd_glossary_generation.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const markdownPath = resolve(projectRoot, 'src', 'markdown', 'srd-5.2-glossary.md');
const outputPath = resolve(projectRoot, 'data', 'glossary.json');

function main(): void {
  console.log(`Reading ${markdownPath}...`);
  const content = readFileSync(markdownPath, 'utf-8');
  const glossary = parseGlossaryMarkdown(content);

  writeFileSync(outputPath, `${JSON.stringify(glossary, null, 2)}\n`, 'utf-8');

  const tagged = glossary.entries.filter((entry) => entry.tag).length;
  const withTables = glossary.entries.filter((entry) => entry.tables?.length).length;
  const withSeeAlso = glossary.entries.filter((entry) => entry.seeAlso?.length).length;

  console.log(`Parsed ${glossary.entries.length} glossary entries -> ${outputPath}`);
  console.log(`Abbreviations: ${glossary.abbreviations.length}`);
  console.log(`Tagged entries: ${tagged}`);
  console.log(`Entries with tables: ${withTables}`);
  console.log(`Entries with see-also links: ${withSeeAlso}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
