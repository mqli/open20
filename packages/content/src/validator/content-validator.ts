import type { EditableContentPack } from '../types/content-pack';
import { SpellSchema, MonsterSchema, SpeciesSchema, BackgroundSchema, FeatSchema } from './schemas';

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
   * Validate a single species against SpeciesSchema.
   * Returns ValidationResult with errors array (empty if valid).
   */
  validateSpecies(species: unknown): ValidationResult {
    const result = SpeciesSchema.safeParse(species);
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
   * Validate a single background against BackgroundSchema.
   * Returns ValidationResult with errors array (empty if valid).
   */
  validateBackground(background: unknown): ValidationResult {
    const result = BackgroundSchema.safeParse(background);
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
   * Validate a single feat against FeatSchema.
   * Returns ValidationResult with errors array (empty if valid).
   */
  validateFeat(feat: unknown): ValidationResult {
    const result = FeatSchema.safeParse(feat);
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
   * Validates all content arrays. Returns ValidationReport with per-type results.
   */
  validatePack(pack: EditableContentPack): ValidationReport {
    const results: Record<string, ValidationResult> = {};
    let allValid = true;

    const validateArray = (
      key: string,
      items: unknown[],
      validator: (item: unknown) => ValidationResult,
    ) => {
      if (items.length > 0) {
        const errors: ValidationError[] = [];
        items.forEach((item, index) => {
          const result = validator(item);
          if (!result.valid) {
            result.errors.forEach((e) => {
              errors.push({
                ...e,
                path: `${key}[${index}].${e.path}`,
              });
            });
          }
        });
        const typeResult: ValidationResult = {
          valid: errors.length === 0,
          errors,
        };
        results[key] = typeResult;
        if (!typeResult.valid) {
          allValid = false;
        }
      } else {
        results[key] = { valid: true, errors: [] };
      }
    };

    validateArray('spells', pack.spells ?? [], (item) => this.validateSpell(item));
    validateArray('monsters', pack.monsters ?? [], (item) => this.validateMonster(item));
    validateArray('species', pack.species ?? [], (item) => this.validateSpecies(item));
    validateArray('backgrounds', pack.backgrounds ?? [], (item) => this.validateBackground(item));
    validateArray('feats', pack.feats ?? [], (item) => this.validateFeat(item));

    return { valid: allValid, results };
  }
}
