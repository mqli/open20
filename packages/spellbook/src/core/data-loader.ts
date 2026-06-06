import { createDataLoader } from 'open20-core';

export const dataLoader = createDataLoader();

let initialized = false;
let initPromise: Promise<void> | null = null;

export async function initDataLoader(): Promise<void> {
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const { srdContentPack } = await import('@open20/content-srd');
    dataLoader.registerContentPack(srdContentPack);
    initialized = true;
  })();

  return initPromise;
}

export function isDataLoaderReady(): boolean {
  return initialized;
}
