// query/monsters.ts
// Monster lookup helpers.
// All functions take a ContentPack (the merged pack), NOT DataLoader.

import type { ContentPack } from 'open20-core/content';
import type { Monster, MonsterFilter, ChallengeRating, MonsterType } from 'open20-core';
import type { DamageType } from 'open20-core';

/** Find a monster by ID. */
export function findMonster(id: string, pack: ContentPack): Monster | undefined {
  return pack.monsters?.find((m) => m.id === id);
}

/**
 * Search monsters matching a filter.
 * Filter fields are ALL optional; omitted fields are not filtered.
 */
export function searchMonsters(filter: MonsterFilter, pack: ContentPack): Monster[] {
  const monsters = pack.monsters ?? [];
  return monsters.filter((m) => {
    if (filter.name) {
      if (!m.name.toLowerCase().includes(filter.name.toLowerCase())) return false;
    }
    if (filter.size && filter.size.length > 0) {
      if (!filter.size.includes(m.size)) return false;
    }
    if (filter.type && filter.type.length > 0) {
      if (!filter.type.includes(m.type)) return false;
    }
    if (filter.minCR !== undefined) {
      if (numericCR(m.challengeRating.rating) < numericCR(filter.minCR)) return false;
    }
    if (filter.maxCR !== undefined) {
      if (numericCR(m.challengeRating.rating) > numericCR(filter.maxCR)) return false;
    }
    if (filter.environment && filter.environment.length > 0) {
      if (!m.environments?.some((e: string) => filter.environment!.includes(e))) return false;
    }
    if (filter.source && filter.source.length > 0) {
      if (!filter.source.includes(m.source)) return false;
    }
    if (filter.damageResistances && filter.damageResistances.length > 0) {
      const resistances = m.resistances ?? m.damageDefenses?.resistances ?? [];
      if (!resistances.some((r: DamageType) => filter.damageResistances!.includes(r))) return false;
    }
    if (filter.damageImmunities && filter.damageImmunities.length > 0) {
      const immunities = m.damageDefenses?.immunities ?? [];
      if (!immunities.some((i: DamageType) => filter.damageImmunities!.includes(i))) return false;
    }
    if (filter.damageVulnerabilities && filter.damageVulnerabilities.length > 0) {
      const vulnerabilities = m.vulnerabilities ?? m.damageDefenses?.vulnerabilities ?? [];
      if (!vulnerabilities.some((v: DamageType) => filter.damageVulnerabilities!.includes(v)))
        return false;
    }
    if (filter.conditionImmunities && filter.conditionImmunities.length > 0) {
      if (!m.conditionImmunities?.some((c: string) => filter.conditionImmunities!.includes(c)))
        return false;
    }
    return true;
  });
}

/** Helper: convert ChallengeRating to a number for comparison. */
function numericCR(cr: ChallengeRating): number {
  if (cr === '1/8') return 0.125;
  if (cr === '1/4') return 0.25;
  if (cr === '1/2') return 0.5;
  return cr as number;
}

/** Get all monsters from a pack. */
export function getMonsters(pack: ContentPack): Monster[] {
  return pack.monsters ?? [];
}

/** Get all monsters matching a challenge rating. */
export function getMonstersByCR(cr: ChallengeRating, pack: ContentPack): Monster[] {
  return pack.monsters?.filter((m) => m.challengeRating.rating === cr) ?? [];
}

/** Get all monsters of a given type. */
export function getMonstersByType(type: MonsterType, pack: ContentPack): Monster[] {
  return pack.monsters?.filter((m) => m.type === type) ?? [];
}

/** Get all monsters matching a source tag. */
export function getMonstersBySource(source: string, pack: ContentPack): Monster[] {
  return pack.monsters?.filter((m) => m.source === source) ?? [];
}

/** Get all legendary monsters (have legendaryActions). */
export function getLegendaryMonsters(pack: ContentPack): Monster[] {
  return pack.monsters?.filter((m) => m.legendaryActions && m.legendaryActions.length > 0) ?? [];
}
