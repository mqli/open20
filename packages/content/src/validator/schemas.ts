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

// ---- Species sub-schemas ----

const SpeciesSizeSchema = z.enum(['Small', 'Medium']);

const SpeciesGrantSchema = z.object({
  skillProficiencies: z.array(z.string()).optional(),
  toolProficiencies: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  armorTraining: z.array(z.string()).optional(),
  speedBonus: z.number().optional(),
  hpPerLevel: z.number().optional(),
  damageResistances: z.array(z.string()).optional(),
  damageImmunities: z.array(z.string()).optional(),
  damageVulnerabilities: z.array(z.string()).optional(),
});

const SpeciesTraitSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  grants: SpeciesGrantSchema.optional(),
});

const SpeciesSubtypeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  traits: z.array(SpeciesTraitSchema),
});

// ---- Background sub-schemas ----

const GearSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    quantity: z.number().optional(),
  })
  .passthrough(); // Allow extra fields from Gear type

// ---- Feat sub-schemas ----

const FeatCategorySchema = z.enum(['Origin', 'General', 'Fighting Style', 'Epic Boon']);

const FeatPrerequisiteSchema = z.object({
  ability: z.record(z.string(), z.number()).optional(),
  level: z.number().optional(),
  classId: z.string().optional(),
  subclassId: z.string().optional(),
  species: z.string().optional(),
  feature: z.string().optional(),
});

const FeatAbilityBonusChoiceSchema = z.object({
  options: z.array(z.string()),
  valuePerChoice: z.number(),
  count: z.number(),
});

const FeatProficiencyChoiceSchema = z.object({
  options: z.array(z.string()),
  count: z.number(),
});

const FeatSpellChoiceSchema = z.object({
  id: z.string().min(1),
  classOptions: z.array(z.string()),
  spellLevel: z.number(),
  count: z.number(),
  alwaysPrepared: z.boolean().optional(),
  oncePerLongRest: z.boolean().optional(),
});

const FeatAttackBonusSchema = z.object({
  ranged: z.number().optional(),
  melee: z.number().optional(),
  weaponProperties: z.array(z.string()).optional(),
});

const FeatACBonusSchema = z.object({
  lightArmor: z.number().optional(),
  mediumArmor: z.number().optional(),
  heavyArmor: z.number().optional(),
  whileWearing: z.array(z.string()).optional(),
});

const FeatGrantSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('abilityBonus'), bonus: z.record(z.string(), z.number()) }),
  z.object({ type: z.literal('abilityBonusChoice'), choice: FeatAbilityBonusChoiceSchema }),
  z.object({ type: z.literal('skillProficiencies'), skills: z.array(z.string()) }),
  z.object({ type: z.literal('skillProficiencyChoice'), choice: FeatProficiencyChoiceSchema }),
  z.object({ type: z.literal('toolProficiencies'), tools: z.array(z.string()) }),
  z.object({ type: z.literal('toolProficiencyChoice'), choice: FeatProficiencyChoiceSchema }),
  z.object({ type: z.literal('languages'), languages: z.array(z.string()) }),
  z.object({ type: z.literal('armorTraining'), armors: z.array(z.string()) }),
  z.object({ type: z.literal('weaponMastery'), weapons: z.array(z.string()) }),
  z.object({ type: z.literal('attackBonus'), bonus: FeatAttackBonusSchema }),
  z.object({ type: z.literal('acBonus'), bonus: FeatACBonusSchema }),
  z.object({ type: z.literal('specialAbilities'), abilities: z.array(z.string()) }),
  z.object({ type: z.literal('spellChoices'), choices: z.array(FeatSpellChoiceSchema) }),
]);

// ---- SpeciesSchema ----

export const SpeciesSchema = z
  .object({
    id: z.string().min(1),
    source: z.string().min(1),
    description: z.string(),
    size: SpeciesSizeSchema,
    speed: z.number(),
    languages: z.array(z.string()),
    abilityBonuses: z.record(z.string(), z.number()),
    baseTraits: z.array(SpeciesTraitSchema),
    subtypes: z.array(SpeciesSubtypeSchema).optional(),
    darkvision: z.number().optional(),
  })
  .strict();

// ---- BackgroundSchema ----

export const BackgroundSchema = z
  .object({
    id: z.string().min(1),
    source: z.string().min(1),
    name: z.string().optional(),
    description: z.string().optional(),
    skillProficiencies: z.array(z.string()),
    toolProficiencies: z.array(z.string()),
    languages: z.array(z.string()),
    originFeatId: z.string().min(1),
    startingEquipment: z.array(GearSchema).optional(),
    startingGold: z.number(),
  })
  .strict();

// ---- FeatSchema ----

export const FeatSchema = z
  .object({
    id: z.string().min(1),
    source: z.string().min(1),
    name: z.string().optional(),
    description: z.string(),
    category: FeatCategorySchema,
    prerequisites: FeatPrerequisiteSchema.optional(),
    grants: z.array(FeatGrantSchema).optional(),
    repeatable: z.boolean().optional(),
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
