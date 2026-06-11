# @open20/content-srd

SRD 5.2 content pack for Open20.

## Usage

```typescript
import { srdContentPack } from '@open20/content-srd';
import { createDataLoader } from 'open20-core';

const loader = createDataLoader();
loader.registerContentPack(srdContentPack);
```

## Data

All data files are in `data/` directory:

- `meta.json` - Content pack metadata
- `species.json` - Species (races)
- `backgrounds.json` - Backgrounds
- `classes.json` - Classes
- `subclasses.json` - Subclasses
- `feats.json` - Feats
- `weapons.json` - Weapons
- `armors.json` - Armor
- `gear.json` - Gear items
- `spells.json` - Spells
- `monsters.json` - Monsters
