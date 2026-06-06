import { createDataLoader } from 'open20-core';
import { srdContentPack } from '@open20/content-srd';

export const dataLoader = createDataLoader();
dataLoader.registerContentPack(srdContentPack);
