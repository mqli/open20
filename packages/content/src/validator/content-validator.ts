import type { EditableContentPack } from '../types/content-pack';
import { SpellSchema, MonsterSchema } from './schemas';

export interface ValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationReport {
  valid: boolean;
  results: Record<string, ValidationResult>;
}

export class ContentValidator {
  /**
   * Validate a single spell against SpellSchema.
   * Returns ValidationResult with errors array (empty if valid).
   */
  validateSpell(spell: unknown): ValidationResult {
    const result = SpellSchema.safeParse(spell);
    if (result.success) {
      return { valid: true, errors: [] };
    }
    const errors: ValidationError[] = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
      severity: 'error' as const,
    }));
    return { valid: false, errors };
  }

  /**
   * Validate a single monster against MonsterSchema.
   * Returns ValidationResult with errors array (empty if valid).
   */
  validateMonster(monster: unknown): ValidationResult {
    const result = MonsterSchema.safeParse(monster);
    if (result.success) {
      return { valid: true, errors: [] };
    }
    const errors: ValidationError[] = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
      severity: 'error' as const,
    }));
    return { valid: false, errors };
  }

  /**
   * Batch-validate an entire content pack.
   * Validates spells and monsters arrays. Returns ValidationReport with per-type results.
   */
  validatePack(pack: EditableContentPack): ValidationReport {
    const results: Record<string, ValidationResult> = {};
    let allValid = true;

    // Validate spells
    const spells = pack.spells ?? [];
    if (spells.length > 0) {
      const errors: ValidationError[] = [];
      spells.forEach((spell, index) => {
        const result = this.validateSpell(spell);
        if (!result.valid) {
          result.errors.forEach((e) => {
            errors.push({
              ...e,
              path: `spells[${index}].${e.path}`,
            });
          });
        }
      });
      const spellResult: ValidationResult = {
        valid: errors.length === 0,
        errors,
      };
      results['spells'] = spellResult;
      if (!spellResult.valid) {
        allValid = false;
      }
    } else {
      results['spells'] = { valid: true, errors: [] };
    }

    // Validate monsters
    const monsters = pack.monsters ?? [];
    if (monsters.length > 0) {
      const errors: ValidationError[] = [];
      monsters.forEach((monster, index) => {
        const result = this.validateMonster(monster);
        if (!result.valid) {
          result.errors.forEach((e) => {
            errors.push({
              ...e,
              path: `monsters[${index}].${e.path}`,
            });
          });
        }
      });
      const monsterResult: ValidationResult = {
        valid: errors.length === 0,
        errors,
      };
      results['monsters'] = monsterResult;
      if (!monsterResult.valid) {
        allValid = false;
      }
    } else {
      results['monsters'] = { valid: true, errors: [] };
    }

    return { valid: allValid, results };
  }
}
