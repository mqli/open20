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
  Charisma: 10,
};
