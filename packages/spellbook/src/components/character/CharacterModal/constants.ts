import { dataLoader } from '@/core/data-loader';

// Get dynamic data from open20-core
export const CLASSES = dataLoader.getAllClasses().map(c => ({ 
  id: c.id, 
  name: c.name || c.id 
}));

export const SPECIES = dataLoader.getAllSpecies().map(s => ({ 
  id: s.id, 
  name: s.id // Species doesn't have 'name' property, use id
}));

export const BACKGROUNDS = dataLoader.getAllBackgrounds().map(b => ({ 
  id: b.id, 
  name: b.name 
}));

// Generate unique ID for additional classes
let additionalClassIdCounter = 0;
export const generateAdditionalClassId = () => `additional-class-${++additionalClassIdCounter}`;

// Default ability scores
export const DEFAULT_ABILITIES = {
  Strength: 10,
  Dexterity: 10,
  Constitution: 10,
  Intelligence: 10,
  Wisdom: 10,
  Charisma: 10
};
