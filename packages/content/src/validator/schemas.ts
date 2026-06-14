import { z } from 'zod';

// ---- Atomic schemas ----

const SpellSchoolSchema = z.enum([
  'Abjuration',
  'Conjuration',
  'Divination',
  'Enchantment',
  'Evocation',
  'Illusion',
  'Necromancy',
  'Transmutation',
]);

const SpellLevelSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
  z.literal(8),
  z.literal(9),
]);

const SpellComponentSchema = z.enum(['V', 'S', 'M']);

// DamageEntry: matches core's DamageEntry shape
const DamageEntrySchema = z.object({
  dice: z.string(),
  type: z.string(),
  bonus: z.number().optional(),
  includeSpellcastingModifier: z.boolean().optional(),
});

// SpellDamage: matches core's SpellDamage shape
const SpellDamageSchema = z.object({
  entries: z.array(DamageEntrySchema),
  additional: z.array(DamageEntrySchema).optional(),
  perSlot: z.array(DamageEntrySchema).optional(),
  includeSpellcastingModifier: z.boolean().optional(),
});

// SpellHeal: matches core's SpellHeal shape
const SpellHealSchema = z.object({
  dice: z.string(),
  perSlot: z.string().optional(),
  includeSpellcastingModifier: z.boolean().optional(),
});

// CantripUpgradeEntry: matches core's CantripUpgradeEntry shape
const CantripUpgradeEntrySchema = z.object({
  atCharacterLevel: z.union([z.literal(5), z.literal(11), z.literal(17)]),
  damage: z.array(DamageEntrySchema).optional(),
});

// ---- SpellSchema ----

export const SpellSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    level: SpellLevelSchema,
    school: SpellSchoolSchema,
    castingTime: z.string().min(1),
    range: z.string().min(1),
    components: z.array(SpellComponentSchema).min(1),
    duration: z.string().min(1),
    concentration: z.boolean(),
    ritual: z.boolean(),
    description: z.array(z.string()).min(1),
    source: z.string().min(1),
    classes: z.array(z.string()).optional(),
    cantripUpgrade: z.array(CantripUpgradeEntrySchema).optional(),
    cantripUpgradeText: z.string().optional(),
    usingAHigherLevelSpellSlot: z.array(z.string()).optional(),
    damage: SpellDamageSchema.optional(),
    heal: SpellHealSchema.optional(),
    save: z.string().optional(),
    attack: z.boolean().optional(),
  })
  .strict();
