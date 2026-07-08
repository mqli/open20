// spells/upcast.ts
// Pure helpers for spell upcast scaling (damage/heal dice display and rolls).

import type { Spell, SpellLevel } from '@/types/spell';

/** Combine base dice with per-slot scaling when die sides match. */
export function scaleDiceForUpcast(
  baseDice: string,
  perSlotDice: string,
  levelsAboveBase: number,
): string {
  if (levelsAboveBase <= 0) return baseDice;

  const baseMatch = baseDice.match(/(\d+)d(\d+)/);
  const slotMatch = perSlotDice.match(/(\d+)d(\d+)/);
  if (baseMatch && slotMatch && baseMatch[2] === slotMatch[2]) {
    const baseCount = parseInt(baseMatch[1]!, 10);
    const slotCount = parseInt(slotMatch[1]!, 10);
    return `${baseCount + slotCount * levelsAboveBase}d${baseMatch[2]}`;
  }

  return baseDice;
}

/** Damage entries scaled for the chosen slot level (first entry only). */
export function getScaledDamageEntries(
  spell: Spell,
  slotLevel: SpellLevel,
  characterLevel?: number,
): readonly { readonly dice: string; readonly type?: string }[] {
  // Handle cantrip damage scaling by character level
  if (spell.level === 0 && characterLevel !== undefined && spell.cantripUpgrade) {
    let bestEntries: readonly { readonly dice: string; readonly type?: string }[] =
      spell.damage?.entries ?? [];

    for (const upgrade of spell.cantripUpgrade) {
      if (upgrade.atCharacterLevel <= characterLevel && upgrade.damage) {
        bestEntries = upgrade.damage;
      }
    }

    return bestEntries;
  }

  const entries = spell.damage?.entries ?? [];
  const perSlot = spell.damage?.perSlot;
  if (!perSlot || perSlot.length === 0 || slotLevel <= spell.level) return entries;

  const levelsAboveBase = slotLevel - spell.level;
  const perSlotDice = perSlot[0]!.dice;

  return entries.map((entry, index) => {
    if (index !== 0) return entry;
    return {
      ...entry,
      dice: scaleDiceForUpcast(entry.dice, perSlotDice, levelsAboveBase),
    };
  });
}

/** Heal dice scaled for the chosen slot level. */
export function getScaledHealDice(spell: Spell, slotLevel: SpellLevel): string | undefined {
  const baseDice = spell.heal?.dice;
  const perSlot = spell.heal?.perSlot;
  if (!baseDice) return undefined;
  if (!perSlot || slotLevel <= spell.level) return baseDice;

  const levelsAboveBase = slotLevel - spell.level;
  return scaleDiceForUpcast(baseDice, perSlot, levelsAboveBase);
}
