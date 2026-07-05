// @open20/content/parser/plain-text-parser
// Parses plain text spell data copied from 5e tools, D&D Beyond, Roll20, and 5e wiki.
// Auto-detects source format and outputs ParsedSpell for use with transformSpell().

import type { ParsedSpell } from './spell-parser';
import { detectFormat } from './plain-text/detect';
import { parse5eTools } from './plain-text/parse-5etools';
import { parseDndBeyond } from './plain-text/parse-dndbeyond';
import { parseRoll20 } from './plain-text/parse-roll20';
import { parse5eWiki } from './plain-text/parse-5ewiki';

const PARSERS = {
  '5etools': parse5eTools,
  dndbeyond: parseDndBeyond,
  roll20: parseRoll20,
  '5ewiki': parse5eWiki,
} as const;

const DEFAULTS: ParsedSpell = {
  name: '',
  level: 1,
  school: 'Unknown',
  classes: [],
  castingTime: 'Action',
  range: 'Self',
  components: '',
  duration: 'Instantaneous',
  ritual: false,
  descriptionLines: [],
};

/**
 * Parse a plain text spell description into a `ParsedSpell` object.
 * Auto-detects source format (5e tools, D&D Beyond, Roll20, or 5e wiki).
 *
 * The returned `ParsedSpell` can be passed directly to `transformSpell()`
 * to produce a full `Spell` object.
 */
export function parsePlainText(text: string): ParsedSpell {
  const lines = text.split('\n').map((l) => l.trimEnd());
  const format = detectFormat(lines);
  const partial = PARSERS[format](lines);
  return { ...DEFAULTS, ...partial };
}
