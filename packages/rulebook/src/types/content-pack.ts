import type { ContentPack, ContentPackMeta } from 'open20-core';

/**
 * Rulebook's editable content pack type.
 * Extends core's ContentPack with additional meta fields.
 * Runtime edit state is NOT stored here — see EditState.
 */
export interface EditableContentPack extends ContentPack {
  meta: ContentPackMeta & {
    description?: string;
    homepage?: string;
    dependencies?: string[]; // IDs of other content packs this depends on
  };
}
