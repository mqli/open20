import type { Character } from 'open20-core';

/**
 * App-level character: core `Character` has no identity field, so the app
 * attaches a stable `id` used as the localStorage key and selector key.
 */
export type AppCharacter = Character & { id: string };
