// content-srd/src/index.ts
// Exports the SRD 5.2 content pack for Open20

import type { ContentPack } from 'open20-core/content';

// Import all SRD JSON data files
import metaJson from '../data/meta.json' with { type: 'json' };
import speciesJson from '../data/species.json' with { type: 'json' };
import backgroundsJson from '../data/backgrounds.json' with { type: 'json' };
import classesJson from '../data/classes.json' with { type: 'json' };
import subclassesJson from '../data/subclasses.json' with { type: 'json' };
import featsJson from '../data/feats.json' with { type: 'json' };
import weaponsJson from '../data/weapons.json' with { type: 'json' };
import armorJson from '../data/armor.json' with { type: 'json' };
import gearJson from '../data/gear.json' with { type: 'json' };
import spellsJson from '../data/spells.json' with { type: 'json' };
import monstersJson from '../data/monsters.json' with { type: 'json' };

// Build and export the SRD content pack
export const srdContentPack: ContentPack = {
  meta: metaJson as unknown as ContentPack['meta'],
  species: speciesJson as unknown as ContentPack['species'],
  backgrounds: backgroundsJson as unknown as ContentPack['backgrounds'],
  classes: classesJson as unknown as ContentPack['classes'],
  subclasses: subclassesJson as unknown as ContentPack['subclasses'],
  feats: featsJson as unknown as ContentPack['feats'],
  weapons: weaponsJson as unknown as ContentPack['weapons'],
  armor: armorJson as unknown as ContentPack['armor'],
  gear: gearJson as unknown as ContentPack['gear'],
  spells: spellsJson as unknown as ContentPack['spells'],
  monsters: monstersJson as unknown as ContentPack['monsters'],
};
