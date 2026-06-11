import { describe, expect, test } from 'vitest';

import * as root from '../../src/index';
import * as character from '../../src/character';
import * as engine from '../../src/engine';
import * as monster from '../../src/monster';
import * as rolls from '../../src/rolls';
import * as spells from '../../src/spells';
import * as storage from '../../src/storage';
import packageJson from '../../package.json';

describe('public API facade', () => {
  test('root facade includes all runtime exports from public modules', () => {
    const moduleExports = [character, engine, monster, rolls, spells, storage];
    const expected = new Set(moduleExports.flatMap((mod) => Object.keys(mod)));

    for (const exportName of expected) {
      expect(root, `Missing root export: ${exportName}`).toHaveProperty(exportName);
    }
  });

  test('package exports include content/io subpath', () => {
    expect(packageJson.exports).toHaveProperty('./content/io', './dist/content/io.js');
  });
});
