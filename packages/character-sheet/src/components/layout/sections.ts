// sections.ts
// Shared section key types and constants. Extracted from Sidebar.tsx so that
// value exports (COLLAPSIBLE_SECTIONS) don't trigger react-refresh warnings when
// co-located with React components.

export type SectionKey =
  | 'combat'
  | 'abilities'
  | 'skills'
  | 'spells'
  | 'equipment'
  | 'features'
  | 'notes';

/** Sections that participate in mobile single-open collapse. `combat` is excluded:
 * it is a permanent, non-collapsible focus area rendered above the fold. */
export type CollapsibleKey = Exclude<SectionKey, 'combat'>;

export const COLLAPSIBLE_SECTIONS: readonly CollapsibleKey[] = [
  'abilities',
  'skills',
  'spells',
  'equipment',
  'features',
  'notes',
];
