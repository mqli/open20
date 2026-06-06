#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { generateSpellsFromMarkdown, mergeSpells } from './parse_srd_spell_generation.ts';

type Spell = ReturnType<typeof generateSpellsFromMarkdown>[number];

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const markdownPath = resolve(
  projectRoot,
  'requirements',
  '05-spell-management',
  'srd-5.2-spell-list.md',
);
const outputPath = resolve(projectRoot, 'static', 'srd', 'spells.json');

function main(): void {
  console.log(`Reading ${markdownPath}...`);
  const content = readFileSync(markdownPath, 'utf-8');
  const generated = generateSpellsFromMarkdown(content);
  console.log(`Parsed ${generated.length} spells from markdown`);

  let existing: Spell[] = [];
  if (existsSync(outputPath)) {
    existing = JSON.parse(readFileSync(outputPath, 'utf-8')) as Spell[];
    console.log(`Loaded ${existing.length} existing spells`);
  }

  const allSpells = mergeSpells(existing, generated);
  writeFileSync(outputPath, `${JSON.stringify(allSpells, null, 2)}\n`, 'utf-8');
  console.log(`Saved ${allSpells.length} spells to ${outputPath}`);

  const withCantrip = allSpells.filter((s) => s.cantripUpgrade).length;
  const withHigherLevel = allSpells.filter((s) => s.usingAHigherLevelSpellSlot).length;
  console.log(`Spells with cantripUpgrade: ${withCantrip}`);
  console.log(`Spells with usingAHigherLevelSpellSlot: ${withHigherLevel}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
