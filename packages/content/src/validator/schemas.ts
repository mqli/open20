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

// ---- Monster sub-schemas ----

const MonsterSizeSchema = z.enum(['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan']);

const MonsterTypeSchema = z.enum([
  'Aberration',
  'Beast',
  'Celestial',
  'Construct',
  'Dragon',
  'Elemental',
  'Fey',
  'Fiend',
  'Giant',
  'Humanoid',
  'Monstrosity',
  'Ooze',
  'Plant',
  'Undead',
]);

const ArmorClassEntrySchema = z.object({
  value: z.number(),
  type: z.string(),
  condition: z.string().optional(),
});

const HPInfoSchema = z.object({
  value: z.number(),
  formula: z.string().optional(),
});

const SpeedInfoSchema = z.object({
  walk: z.number().optional(),
  burrow: z.number().optional(),
  climb: z.number().optional(),
  fly: z.number().optional(),
  swim: z.number().optional(),
  hover: z.boolean().optional(),
});

const ChallengeRatingInfoSchema = z.object({
  rating: z.union([z.number(), z.enum(['1/8', '1/4', '1/2'])]),
  xp: z.number(),
  lairXp: z.number().optional(),
});

const MonsterFeatureSchema = z.object({
  name: z.string(),
  description: z.string(),
});

const MonsterAttackSchema = z.object({
  name: z.string(),
  toHit: z.number().optional(),
  damageEntries: z.array(DamageEntrySchema).optional(),
  reach: z.number().optional(),
  damageNotation: z
    .object({
      fixedValue: z.number().optional(),
      dieExpression: z.string().optional(),
    })
    .optional(),
});

const MonsterActionSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  attacks: z.array(MonsterAttackSchema).optional(),
  legendary: z.boolean().optional(),
  limitedUsage: z
    .object({
      type: z.enum(['x_per_day', 'recharge', 'recharge_after_rest']),
      uses: z.number().optional(),
      rechargeRange: z.tuple([z.number(), z.number()]).optional(),
      rechargeOn: z.enum(['short_rest', 'long_rest']).optional(),
    })
    .optional(),
});

// ---- MonsterSchema ----

export const MonsterSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    source: z.string().min(1),
    size: MonsterSizeSchema,
    type: MonsterTypeSchema,
    alignment: z.string(),
    descriptiveTags: z.array(z.string()).optional(),
    armorClass: z.array(ArmorClassEntrySchema).min(1),
    hitPoints: HPInfoSchema,
    speed: SpeedInfoSchema,
    abilityScores: z.object({
      STR: z.number(),
      DEX: z.number(),
      CON: z.number(),
      INT: z.number(),
      WIS: z.number(),
      CHA: z.number(),
    }),
    challengeRating: ChallengeRatingInfoSchema,
    traits: z.array(MonsterFeatureSchema).optional(),
    actions: z.array(MonsterActionSchema).optional(),
    reactions: z.array(MonsterFeatureSchema).optional(),
    legendaryActions: z
      .array(
        z.object({
          name: z.string(),
          description: z.string(),
          cost: z.number().optional(),
        }),
      )
      .optional(),
    environments: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    senses: z
      .object({
        darkvision: z.number().optional(),
        blindsight: z.number().optional(),
        tremorsense: z.number().optional(),
        truesight: z.number().optional(),
        passivePerception: z.number(),
      })
      .optional(),
    resistances: z.array(z.string()).optional(),
    vulnerabilities: z.array(z.string()).optional(),
    damageDefenses: z
      .object({
        resistances: z.array(z.string()).optional(),
        immunities: z.array(z.string()).optional(),
        vulnerabilities: z.array(z.string()).optional(),
      })
      .optional(),
    conditionImmunities: z.array(z.string()).optional(),
    spellcasting: z
      .array(
        z.object({
          ability: z.enum(['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']),
          saveDC: z.number(),
          attackBonus: z.number().optional(),
          atWill: z.array(z.string()).optional(),
          daily: z.array(z.object({ spell: z.string(), times: z.number() })).optional(),
        }),
      )
      .optional(),
    skills: z.record(z.string(), z.number()).optional(),
    savingThrows: z.record(z.string(), z.number()).optional(),
  })
  .strict();

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
