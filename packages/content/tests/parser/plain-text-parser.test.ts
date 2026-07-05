import { describe, it, expect } from 'vitest';
import { parsePlainText } from '../../src/parser/plain-text-parser';
import { transformSpell } from '../../src/parser/spell-parser';

// ── 5e Tools Tests ───────────────────────────────────────────

describe('parsePlainText — 5e tools', () => {
  const acidArrow = `Melf's Acid Arrow
PHB'24
p297
Level 2 Evocation
Casting Time: Action
Range: 90 feet
Components: V, S, M (powdered rhubarb leaf)
Duration: Instantaneous
A shimmering green arrow streaks toward a target within range and bursts in a spray of acid. Make a ranged spell attack against the target. On a hit, the target takes 4d4 Acid damage and 2d4 Acid damage at the end of its next turn. On a miss, the arrow splashes the target with acid for half as much of the initial damage only.

Using a Higher-Level Spell Slot. The damage (both initial and later) increases by 1d4 for each spell slot level above 2.

Classes: Wizard
Subclasses: Alchemist Artificer, Arcane Trickster Rogue, Eldritch Knight Fighter
Source: PHB'24, page 297.`;

  it('should parse spell name', () => {
    const result = parsePlainText(acidArrow);
    expect(result.name).toBe("Melf's Acid Arrow");
  });

  it('should parse level and school', () => {
    const result = parsePlainText(acidArrow);
    expect(result.level).toBe(2);
    expect(result.school).toBe('Evocation');
  });

  it('should skip source book and page lines', () => {
    const result = parsePlainText(acidArrow);
    // Name is correctly parsed and level is 2 — source lines were skipped
    expect(result.name).toBe("Melf's Acid Arrow");
    expect(result.level).toBe(2);
  });

  it('should parse Casting Time', () => {
    const result = parsePlainText(acidArrow);
    expect(result.castingTime).toBe('Action');
  });

  it('should parse Range', () => {
    const result = parsePlainText(acidArrow);
    expect(result.range).toBe('90 feet');
  });

  it('should parse Components with material', () => {
    const result = parsePlainText(acidArrow);
    expect(result.components).toBe('V, S, M (powdered rhubarb leaf)');
    expect(result.material).toBe('powdered rhubarb leaf');
  });

  it('should parse Duration', () => {
    const result = parsePlainText(acidArrow);
    expect(result.duration).toBe('Instantaneous');
    expect(result.ritual).toBe(false);
  });

  it('should parse description lines', () => {
    const result = parsePlainText(acidArrow);
    expect(result.descriptionLines.length).toBeGreaterThan(0);
    expect(result.descriptionLines[0]).toContain('A shimmering green arrow');
  });

  it('should parse Using a Higher-Level Spell Slot text', () => {
    const result = parsePlainText(acidArrow);
    expect(result.usingAHigherLevelSpellSlotText).toBeDefined();
    expect(result.usingAHigherLevelSpellSlotText).toContain(
      'damage (both initial and later) increases by 1d4',
    );
  });

  it('should parse classes from Classes line', () => {
    const result = parsePlainText(acidArrow);
    expect(result.classes).toContain('Wizard');
  });

  it('should not include Subclasses or Source data', () => {
    const result = parsePlainText(acidArrow);
    // Subclasses should NOT appear in the description
    const descText = result.descriptionLines.join(' ');
    expect(descText).not.toContain('Subclasses');
    expect(descText).not.toContain('Source');
  });

  it('should parse a cantrip (5e tools format)', () => {
    const fireBolt = `Fire Bolt
Evocation Cantrip
Casting Time: Action
Range: 120 feet
Components: V, S
Duration: Instantaneous
You hurl a mote of fire at a creature or object within range. Make a ranged spell attack. On a hit, the target takes 1d10 Fire damage.

Cantrip Upgrade. The damage increases by 1d10 when you reach levels 5 (2d10), 11 (3d10), and 17 (4d10).

Classes: Sorcerer, Wizard
Source: PHB'24, page 274.`;

    const result = parsePlainText(fireBolt);
    expect(result.name).toBe('Fire Bolt');
    expect(result.level).toBe(0);
    expect(result.school).toBe('Evocation');
    expect(result.cantripUpgradeText).toBeDefined();
    expect(result.cantripUpgradeText).toContain('damage increases by 1d10');
    expect(result.classes).toContain('Sorcerer');
    expect(result.classes).toContain('Wizard');
  });

  it('should parse a spell with concentration', () => {
    const bane = `Bane
Level 1 Enchantment
Casting Time: Action
Range: 30 feet
Components: V, S, M (a drop of blood)
Duration: Concentration, up to 1 minute
You curse up to three creatures. Whenever a target makes an attack roll or saving throw, it must subtract 1d4 from the roll.

Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 1st.

Classes: Bard, Cleric
Source: PHB'24, page 228.`;

    const result = parsePlainText(bane);
    expect(result.name).toBe('Bane');
    expect(result.level).toBe(1);
    expect(result.duration).toBe('Concentration, up to 1 minute');
  });

  it('should parse a spell without source/page metadata lines', () => {
    const minimal = `Magic Missile
Level 1 Evocation
Casting Time: Action
Range: 120 feet
Components: V, S
Duration: Instantaneous
You create three glowing darts of magical force. Each dart deals 1d4+1 Force damage.

Using a Higher-Level Spell Slot. The spell creates one more dart for each spell slot level above 1st.

Classes: Sorcerer, Wizard`;

    const result = parsePlainText(minimal);
    expect(result.name).toBe('Magic Missile');
    expect(result.level).toBe(1);
    expect(result.school).toBe('Evocation');
    expect(result.descriptionLines[0]).toContain('three glowing darts');
  });

  it('should parse a spell with ritual in casting time', () => {
    const detectMagic = `Detect Magic
Level 1 Divination
Casting Time: Action or Ritual
Range: Self
Components: V, S
Duration: Concentration, up to 10 minutes
For the duration, you sense the presence of magical effects within 30 feet of you.

Classes: Bard, Cleric, Druid, Paladin, Ranger, Sorcerer, Wizard`;

    const result = parsePlainText(detectMagic);
    expect(result.ritual).toBe(true);
  });
});

// ── D&D Beyond Tests ─────────────────────────────────────────

describe('parsePlainText — D&D Beyond', () => {
  const acidArrow = `Melf's Acid Arrow
Level
2nd
Casting Time
1 Action
Range/Area
90 ft.
Components
V, S, M *
Duration
Instantaneous
School
Evocation
Attack/Save
 Ranged
Damage/Effect
 Acid (...)

A shimmering green arrow streaks toward a target within range and bursts in a spray of acid. Make a ranged spell attack against the target. On a hit, the target takes 4d4 Acid damage and 2d4 Acid damage at the end of its next turn. On a miss, the arrow splashes the target with acid for half as much of the initial damage only.

Using a Higher-Level Spell Slot. The damage (both initial and later) increases by 1d4 for each spell slot level above 2.

* - (powdered rhubarb leaf)
Spell Tags: Damage

Available For: Wizard (Legacy) Wizard

Player's Handbook, pg. 297
Melf's Acid Arrow`;

  it('should parse spell name', () => {
    const result = parsePlainText(acidArrow);
    expect(result.name).toBe("Melf's Acid Arrow");
  });

  it('should parse level from separate line', () => {
    const result = parsePlainText(acidArrow);
    expect(result.level).toBe(2);
  });

  it('should parse school from separate line', () => {
    const result = parsePlainText(acidArrow);
    expect(result.school).toBe('Evocation');
  });

  it('should parse Casting Time', () => {
    const result = parsePlainText(acidArrow);
    expect(result.castingTime).toBe('1 Action');
  });

  it('should parse Range (stripping /Area suffix)', () => {
    const result = parsePlainText(acidArrow);
    expect(result.range).toBe('90 ft.');
  });

  it('should parse Components', () => {
    const result = parsePlainText(acidArrow);
    expect(result.components).toBe('V, S, M');
  });

  it('should parse Duration', () => {
    const result = parsePlainText(acidArrow);
    expect(result.duration).toBe('Instantaneous');
  });

  it('should extract material from footnote', () => {
    const result = parsePlainText(acidArrow);
    expect(result.material).toBe('powdered rhubarb leaf');
  });

  it('should parse description lines', () => {
    const result = parsePlainText(acidArrow);
    expect(result.descriptionLines.length).toBeGreaterThan(0);
    expect(result.descriptionLines[0]).toContain('shimmering green arrow');
  });

  it('should parse Using a Higher-Level Spell Slot text', () => {
    const result = parsePlainText(acidArrow);
    expect(result.usingAHigherLevelSpellSlotText).toBeDefined();
    expect(result.usingAHigherLevelSpellSlotText).toContain(
      'damage (both initial and later) increases by 1d4',
    );
  });

  it('should parse classes from Available For line', () => {
    const result = parsePlainText(acidArrow);
    expect(result.classes).toContain('Wizard');
    // Should not contain duplicates
    expect(result.classes.filter((c) => c === 'Wizard').length).toBe(1);
  });

  it('should skip Spell Tags and book citation lines', () => {
    const result = parsePlainText(acidArrow);
    const descText = result.descriptionLines.join(' ');
    expect(descText).not.toContain('Spell Tags');
    expect(descText).not.toContain("Player's Handbook");
  });

  it('should not include repeated name in description', () => {
    const result = parsePlainText(acidArrow);
    const descText = result.descriptionLines.join(' ');
    // The trailing "Melf's Acid Arrow" is skipped
    const countInDesc = descText.split("Melf's Acid Arrow").length - 1;
    expect(countInDesc).toBe(0);
  });
});

// ── Roll20 Tests ─────────────────────────────────────────────

describe('parsePlainText — Roll20', () => {
  const acidArrow = `Melf's Acid Arrow
2 Evocation
Casting Time: Action
Range: 90 feet
Components: V S M (powdered rhubarb leaf)
Duration: Instantaneous
Classes: Wizard
A shimmering green arrow streaks toward a target within range and bursts in a spray of acid. Make a ranged spell attack against the target. On a hit, the target takes 4d4 Acid damage and 2d4 Acid damage at the end of its next turn. On a miss, the arrow splashes the target with acid for half as much of the initial damage only.
At Higher Levels: Using a Higher-Level Spell Slot. The damage (both initial and later) increases by 1d4 for each spell slot level above 2.`;

  it('should parse spell name', () => {
    const result = parsePlainText(acidArrow);
    expect(result.name).toBe("Melf's Acid Arrow");
  });

  it('should parse level and school (no "Level" prefix)', () => {
    const result = parsePlainText(acidArrow);
    expect(result.level).toBe(2);
    expect(result.school).toBe('Evocation');
  });

  it('should parse Casting Time', () => {
    const result = parsePlainText(acidArrow);
    expect(result.castingTime).toBe('Action');
  });

  it('should parse Range', () => {
    const result = parsePlainText(acidArrow);
    expect(result.range).toBe('90 feet');
  });

  it('should parse Components (space-separated)', () => {
    const result = parsePlainText(acidArrow);
    expect(result.components).toBe('V S M (powdered rhubarb leaf)');
    expect(result.material).toBe('powdered rhubarb leaf');
  });

  it('should parse Duration', () => {
    const result = parsePlainText(acidArrow);
    expect(result.duration).toBe('Instantaneous');
  });

  it('should parse Classes (before description)', () => {
    const result = parsePlainText(acidArrow);
    expect(result.classes).toContain('Wizard');
  });

  it('should parse description', () => {
    const result = parsePlainText(acidArrow);
    expect(result.descriptionLines.length).toBeGreaterThan(0);
    expect(result.descriptionLines[0]).toContain('shimmering green arrow');
  });

  it('should parse At Higher Levels section', () => {
    const result = parsePlainText(acidArrow);
    expect(result.usingAHigherLevelSpellSlotText).toBeDefined();
    expect(result.usingAHigherLevelSpellSlotText).toContain(
      'damage (both initial and later) increases by 1d4',
    );
  });

  it('should parse a cantrip (Roll20 format)', () => {
    const fireBolt = `Fire Bolt
Evocation Cantrip
Casting Time: Action
Range: 120 feet
Components: V S
Duration: Instantaneous
Classes: Sorcerer, Wizard
You hurl a mote of fire at a creature or object within range. Make a ranged spell attack. On a hit, the target takes 1d10 Fire damage.`;

    const result = parsePlainText(fireBolt);
    expect(result.name).toBe('Fire Bolt');
    expect(result.level).toBe(0);
    expect(result.school).toBe('Evocation');
    expect(result.classes).toContain('Sorcerer');
    expect(result.classes).toContain('Wizard');
    expect(result.descriptionLines[0]).toContain('hurl a mote of fire');
  });
});

// ── 5e Wiki Tests ────────────────────────────────────────────

describe('parsePlainText — 5e wiki', () => {
  const silveryBarbs = `V\`Silvery Barbs

Source: Strixhaven: A Curriculum of Chaos

1st-level Enchantment

Casting Time: 1 reaction, which you take when a creature you can see within 60 feet of yourself succeeds on an attack roll, an ability check, or a saving throw
Range: 60 feet
Components: V
Duration: Instantaneous

You magically distract the triggering creature and turn its momentary uncertainty into encouragement for another creature. The triggering creature must reroll the d20 and use the lower roll.

You can then choose a different creature you can see within range (you can choose yourself). The chosen creature has advantage on the next attack roll, ability check, or saving throw it makes within 1 minute. A creature can be empowered by only one use of this spell at a time.

Spell Lists. Bard, Sorcerer, Wizard`;

  it('should strip component prefix from name line', () => {
    const result = parsePlainText(silveryBarbs);
    expect(result.name).toBe('Silvery Barbs');
  });

  it('should parse ordinal level and school', () => {
    const result = parsePlainText(silveryBarbs);
    expect(result.level).toBe(1);
    expect(result.school).toBe('Enchantment');
  });

  it('should parse Casting Time (reaction with long description)', () => {
    const result = parsePlainText(silveryBarbs);
    expect(result.castingTime).toContain('1 reaction');
    expect(result.castingTime).toContain('60 feet');
  });

  it('should parse Range', () => {
    const result = parsePlainText(silveryBarbs);
    expect(result.range).toBe('60 feet');
  });

  it('should parse Components', () => {
    const result = parsePlainText(silveryBarbs);
    expect(result.components).toBe('V');
  });

  it('should parse Duration', () => {
    const result = parsePlainText(silveryBarbs);
    expect(result.duration).toBe('Instantaneous');
  });

  it('should parse description lines', () => {
    const result = parsePlainText(silveryBarbs);
    expect(result.descriptionLines.length).toBeGreaterThan(0);
    expect(result.descriptionLines[0]).toContain('triggering creature');
    expect(result.descriptionLines[1]).toContain('choose a different creature');
  });

  it('should parse classes from Spell Lists. trailer', () => {
    const result = parsePlainText(silveryBarbs);
    expect(result.classes).toContain('Bard');
    expect(result.classes).toContain('Sorcerer');
    expect(result.classes).toContain('Wizard');
    expect(result.classes.length).toBe(3);
  });

  it('should not include Source or Spell Lists in description', () => {
    const result = parsePlainText(silveryBarbs);
    const descText = result.descriptionLines.join(' ');
    expect(descText).not.toContain('Strixhaven');
    expect(descText).not.toContain('Spell Lists');
  });

  it('should parse a 3rd-level spell', () => {
    const fireball = `V, S, M\`Fireball

Source: Player's Handbook

3rd-level Evocation

Casting Time: 1 action
Range: 150 feet
Components: V, S, M (a tiny ball of bat guano and sulfur)
Duration: Instantaneous

A bright streak flashes from your pointing finger. Each creature in a 20-foot-radius sphere must make a Dexterity saving throw. A target takes 8d6 fire damage on a failed save.

Spell Lists. Sorcerer, Wizard`;

    const result = parsePlainText(fireball);
    expect(result.name).toBe('Fireball');
    expect(result.level).toBe(3);
    expect(result.school).toBe('Evocation');
    expect(result.components).toBe('V, S, M (a tiny ball of bat guano and sulfur)');
    expect(result.material).toBe('a tiny ball of bat guano and sulfur');
    expect(result.classes).toContain('Sorcerer');
    expect(result.classes).toContain('Wizard');
  });

  it('should parse a cantrip', () => {
    const fireBolt = `V, S\`Fire Bolt

Source: Player's Handbook

Evocation Cantrip

Casting Time: 1 action
Range: 120 feet
Components: V, S
Duration: Instantaneous

You hurl a mote of fire at a creature or object. Make a ranged spell attack. On a hit, the target takes 1d10 fire damage.

Spell Lists. Artificer, Sorcerer, Wizard`;

    const result = parsePlainText(fireBolt);
    expect(result.name).toBe('Fire Bolt');
    expect(result.level).toBe(0);
    expect(result.school).toBe('Evocation');
    expect(result.classes).toContain('Artificer');
    expect(result.classes).toContain('Sorcerer');
    expect(result.classes).toContain('Wizard');
  });

  it('should parse a spell with concentration', () => {
    const haste = `V, S, M\`Haste

Source: Player's Handbook

3rd-level Transmutation

Casting Time: 1 action
Range: 30 feet
Components: V, S, M (a shaving of licorice root)
Duration: Concentration, up to 1 minute

Choose a willing creature within range. Until the spell ends, the target's speed is doubled, it gains a +2 bonus to AC.

Spell Lists. Artificer, Sorcerer, Wizard`;

    const result = parsePlainText(haste);
    expect(result.name).toBe('Haste');
    expect(result.level).toBe(3);
    expect(result.school).toBe('Transmutation');
    expect(result.duration).toBe('Concentration, up to 1 minute');
  });
});

// ── Integration with transformSpell ──────────────────────────

describe('parsePlainText + transformSpell integration', () => {
  it('should produce a valid Spell from 5e tools text', () => {
    const text = `Melf's Acid Arrow
Level 2 Evocation
Casting Time: Action
Range: 90 feet
Components: V, S, M (powdered rhubarb leaf)
Duration: Instantaneous
A shimmering green arrow streaks toward a target within range and bursts in a spray of acid. Make a ranged spell attack against the target. On a hit, the target takes 4d4 Acid damage and 2d4 Acid damage at the end of its next turn. On a miss, the arrow splashes the target with acid for half as much of the initial damage only.

Using a Higher-Level Spell Slot. The damage (both initial and later) increases by 1d4 for each spell slot level above 2.

Classes: Wizard`;

    const parsed = parsePlainText(text);
    const spell = transformSpell(parsed);

    expect(spell.id).toBe('melfs-acid-arrow');
    expect(spell.name).toBe("Melf's Acid Arrow");
    expect(spell.level).toBe(2);
    expect(spell.school).toBe('Evocation');
    expect(spell.castingTime).toBe('Action');
    expect(spell.range).toBe('90 feet');
    expect(spell.components).toContain('V');
    expect(spell.components).toContain('S');
    expect(spell.components).toContain('M');
    expect(spell.duration).toBe('Instantaneous');
    expect(spell.attack).toBe(true);
    expect(spell.damage).toBeDefined();
    expect(spell.damage!.entries.length).toBeGreaterThan(0);
    expect(spell.usingAHigherLevelSpellSlot).toBeDefined();
    expect(spell.source).toBe('SRD 5.2');
  });

  it('should produce a valid Spell from D&D Beyond text', () => {
    const text = `Melf's Acid Arrow
Level
2nd
Casting Time
1 Action
Range/Area
90 ft.
Components
V, S, M *
Duration
Instantaneous
School
Evocation

A shimmering green arrow streaks toward a target within range. Make a ranged spell attack against the target. On a hit, the target takes 4d4 Acid damage.

* - (powdered rhubarb leaf)

Available For: Wizard`;

    const parsed = parsePlainText(text);
    const spell = transformSpell(parsed);

    expect(spell.id).toBe('melfs-acid-arrow');
    expect(spell.level).toBe(2);
    expect(spell.school).toBe('Evocation');
    expect(spell.castingTime).toBe('Action');
    expect(spell.range).toBe('90 ft.');
    expect(spell.components).toContain('M');
    expect(spell.attack).toBe(true);
  });

  it('should produce a valid Spell from Roll20 text', () => {
    const text = `Melf's Acid Arrow
2 Evocation
Casting Time: Action
Range: 90 feet
Components: V S M (powdered rhubarb leaf)
Duration: Instantaneous
Classes: Wizard
A shimmering green arrow streaks toward a target within range and bursts in a spray of acid. Make a ranged spell attack against the target. On a hit, the target takes 4d4 Acid damage and 2d4 Acid damage at the end of its next turn. On a miss, the arrow splashes the target with acid for half as much of the initial damage only.
At Higher Levels: Using a Higher-Level Spell Slot. The damage (both initial and later) increases by 1d4 for each spell slot level above 2.`;

    const parsed = parsePlainText(text);
    const spell = transformSpell(parsed);

    expect(spell.id).toBe('melfs-acid-arrow');
    expect(spell.level).toBe(2);
    expect(spell.school).toBe('Evocation');
    expect(spell.castingTime).toBe('Action');
    expect(spell.damage).toBeDefined();
    expect(spell.usingAHigherLevelSpellSlot).toBeDefined();
  });

  it('should produce a valid Spell from 5e wiki text', () => {
    const text = `V\`Silvery Barbs

Source: Strixhaven: A Curriculum of Chaos

1st-level Enchantment

Casting Time: 1 reaction, which you take when a creature you can see within 60 feet of yourself succeeds on an attack roll, an ability check, or a saving throw
Range: 60 feet
Components: V
Duration: Instantaneous

You magically distract the triggering creature and turn its momentary uncertainty into encouragement for another creature. The triggering creature must reroll the d20 and use the lower roll.

Spell Lists. Bard, Sorcerer, Wizard`;

    const parsed = parsePlainText(text);
    const spell = transformSpell(parsed);

    expect(spell.id).toBe('silvery-barbs');
    expect(spell.name).toBe('Silvery Barbs');
    expect(spell.level).toBe(1);
    expect(spell.school).toBe('Enchantment');
    expect(spell.castingTime).toBe('Reaction');
    expect(spell.range).toBe('60 feet');
    expect(spell.components).toContain('V');
    expect(spell.components).not.toContain('S');
    expect(spell.components).not.toContain('M');
    expect(spell.duration).toBe('Instantaneous');
    expect(spell.classes).toContain('Bard');
    expect(spell.classes).toContain('Sorcerer');
    expect(spell.classes).toContain('Wizard');
    expect(spell.source).toBe('SRD 5.2');
  });

  it('should parse and transform a healing spell', () => {
    const text = `Cure Wounds
Level 1 Evocation
Casting Time: Action
Range: Touch
Components: V, S
Duration: Instantaneous
A creature you touch regains 1d8 plus your spellcasting ability modifier hit points.

Using a Higher-Level Spell Slot. The healing increases by 1d8 for each spell slot level above 1st.

Classes: Bard, Cleric, Druid, Paladin, Ranger`;

    const parsed = parsePlainText(text);
    const spell = transformSpell(parsed);

    expect(spell.heal).toBeDefined();
    expect(spell.heal!.dice).toBe('1d8');
    expect(spell.heal!.includeSpellcastingModifier).toBe(true);
    expect(spell.heal!.perSlot).toBe('1d8');
  });
});
