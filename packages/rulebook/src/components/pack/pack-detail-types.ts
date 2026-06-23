import type { LucideIcon } from 'lucide-react';
import { BookOpen, Skull, User, ScrollText, Award, Swords, Shield, Backpack } from 'lucide-react';
import type {
  ContentPack,
  Spell,
  Monster,
  Species,
  Background,
  Feat,
  Weapon,
  Armor,
  Gear,
} from 'open20-core';

export type ContentTypeKey =
  | 'spells'
  | 'monsters'
  | 'species'
  | 'backgrounds'
  | 'feats'
  | 'weapons'
  | 'armors'
  | 'gears';

export interface ContentTypeMeta {
  tabKey: ContentTypeKey;
  label: string;
  icon: LucideIcon;
  routeSegment: string;
  searchPlaceholder: string;
  addButtonLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyEmoji: string;
}

export const CONTENT_TYPES: readonly ContentTypeMeta[] = [
  {
    tabKey: 'spells',
    label: 'Spells',
    icon: BookOpen,
    routeSegment: 'spell',
    searchPlaceholder: 'Search...',
    addButtonLabel: '+ Add Spell',
    emptyTitle: 'No spells yet',
    emptyDescription: 'Add spells to this content pack.',
    emptyEmoji: '📖',
  },
  {
    tabKey: 'monsters',
    label: 'Monsters',
    icon: Skull,
    routeSegment: 'monster',
    searchPlaceholder: 'Search monsters...',
    addButtonLabel: '+ Add Monster',
    emptyTitle: 'No monsters yet',
    emptyDescription: 'Add creatures, NPCs, and monsters to this content pack.',
    emptyEmoji: '👹',
  },
  {
    tabKey: 'species',
    label: 'Species',
    icon: User,
    routeSegment: 'species',
    searchPlaceholder: 'Search species...',
    addButtonLabel: '+ Add Species',
    emptyTitle: 'No species yet',
    emptyDescription: 'Add playable species and races to this content pack.',
    emptyEmoji: '🧝',
  },
  {
    tabKey: 'backgrounds',
    label: 'Backgrounds',
    icon: ScrollText,
    routeSegment: 'background',
    searchPlaceholder: 'Search backgrounds...',
    addButtonLabel: '+ Add Background',
    emptyTitle: 'No backgrounds yet',
    emptyDescription: 'Add character backgrounds to this content pack.',
    emptyEmoji: '📜',
  },
  {
    tabKey: 'feats',
    label: 'Feats',
    icon: Award,
    routeSegment: 'feat',
    searchPlaceholder: 'Search feats...',
    addButtonLabel: '+ Add Feat',
    emptyTitle: 'No feats yet',
    emptyDescription: 'Add feats and talents to this content pack.',
    emptyEmoji: '🏆',
  },
  {
    tabKey: 'weapons',
    label: 'Weapons',
    icon: Swords,
    routeSegment: 'weapon',
    searchPlaceholder: 'Search weapons...',
    addButtonLabel: '+ Add Weapon',
    emptyTitle: 'No weapons yet',
    emptyDescription: 'Add weapons to this content pack.',
    emptyEmoji: '⚔️',
  },
  {
    tabKey: 'armors',
    label: 'Armors',
    icon: Shield,
    routeSegment: 'armor',
    searchPlaceholder: 'Search armors...',
    addButtonLabel: '+ Add Armor',
    emptyTitle: 'No armors yet',
    emptyDescription: 'Add armors and shields to this content pack.',
    emptyEmoji: '🛡️',
  },
  {
    tabKey: 'gears',
    label: 'Gears',
    icon: Backpack,
    routeSegment: 'gear',
    searchPlaceholder: 'Search gears...',
    addButtonLabel: '+ Add Gear',
    emptyTitle: 'No gear yet',
    emptyDescription: 'Add gear and equipment to this content pack.',
    emptyEmoji: '🎒',
  },
];

export function getContentItems(
  pack: ContentPack | null,
  type: ContentTypeKey,
): Spell[] | Monster[] | Species[] | Background[] | Feat[] | Weapon[] | Armor[] | Gear[] {
  if (!pack) return [];
  return (
    (pack[type] as
      | Spell[]
      | Monster[]
      | Species[]
      | Background[]
      | Feat[]
      | Weapon[]
      | Armor[]
      | Gear[]) ?? []
  );
}

export function getContentCounts(
  pack: ContentPack | null,
): Record<ContentTypeKey, number> & { total: number } {
  const counts: Record<string, number> = {};
  let total = 0;
  for (const ct of CONTENT_TYPES) {
    const count = (pack?.[ct.tabKey] as unknown[])?.length ?? 0;
    counts[ct.tabKey] = count;
    total += count;
  }
  return { ...counts, total } as Record<ContentTypeKey, number> & { total: number };
}

export interface ContentSectionData {
  meta: ContentTypeMeta;
  items: Record<string, unknown>[];
}

/** Build section data from filtered arrays matching CONTENT_TYPES order */
export function buildSections(
  filteredArrays: Map<ContentTypeMeta, Record<string, unknown>[]>,
): ContentSectionData[] {
  return CONTENT_TYPES.map((meta) => ({
    meta,
    items: filteredArrays.get(meta) ?? [],
  }));
}
