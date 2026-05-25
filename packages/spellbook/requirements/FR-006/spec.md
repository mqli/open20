# FR-006: Character Profile Creation

**Priority**: P0  
**Status**: 📋 Planned  
**Assigned To**: -  
**Depends On**: FR-001 (spell data for class spell lists)  

---

## 1. Description

Support creating character profiles with name, class, level, spellcasting ability, and proficiency bonus. Auto-calculate derived stats.

**Source**: PRD.md → FR-006

---

## 2. User Stories

**As a** spellcasting player,  
**I want to** create a character profile with my class and level,  
**so that** I can manage my spell slots and prepared spells.

---

## 3. Acceptance Criteria

### Character Creation Form
- [ ] Input field for character name (required)
- [ ] Class selection grid (8 classes: Bard, Cleric, Druid, Paladin, Ranger, Sorcerer, Warlock, Wizard)
- [ ] Level input (stepper, 1-20)
- [ ] Spellcasting ability auto-filled based on class
- [ ] Proficiency bonus auto-calculated from level
- [ ] Preview section showing derived stats (Spell Save DC, Attack Bonus, Spell Slots)

### Validation
- [ ] Name is required (show error if empty)
- [ ] Level must be 1-20
- [ ] Ability scores must be valid (if manually entered)
- [ ] Show validation errors below fields

### Auto-Calculation (Preview)
- [ ] Proficiency bonus: `ceil(1 + level / 4)`
- [ ] Spell Save DC: `8 + proficiency + spellcasting ability modifier`
- [ ] Spell Attack Bonus: `proficiency + spellcasting ability modifier`
- [ ] Spell slots: Auto-calculated from class and level

### Persistence
- [ ] Save character to localStorage on creation
- [ ] Redirect to Character Sheet after creation
- [ ] Show success message

---

## 4. UI Components Affected

| Component | Changes |
|-----------|----------|
| `CharacterSetup.tsx` | New component - character creation form |
| `ClassSelector.tsx` | New component - class selection grid |
| `AbilityScoreInput.tsx` | New component - ability score inputs |
| `character-store.ts` | Add `createCharacter` action |

---

## 5. Technical Specification

### 5.1 Component: CharacterSetup

```typescript
// src/components/character-setup/CharacterSetup.tsx
import { useState } from 'react';
import { useCharacterStore } from '../../stores/character-store';
import { ClassSelector } from './ClassSelector';
import { AbilityScoreInput } from './AbilityScoreInput';

export function CharacterSetup() {
  const { createCharacter } = useCharacterStore();
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [level, setLevel] = useState(1);
  const [abilityScores, setAbilityScores] = useState({
    str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10
  });
  const [errors, setErrors] = useState<string[]>([]);

  // Auto-calculate spellcasting ability based on class
  const spellcastingAbility = getSpellcastingAbility(selectedClass);

  // Preview calculations
  const proficiencyBonus = Math.ceil(1 + level / 4);
  const abilityMod = Math.floor((abilityScores[spellcastingAbility] - 10) / 2);
  const spellSaveDC = 8 + proficiencyBonus + abilityMod;
  const spellAttackBonus = proficiencyBonus + abilityMod;

  const handleSubmit = () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const character = CharacterService.createCharacter({
      name,
      class: selectedClass,
      level,
      abilityScores,
    });

    createCharacter(character);
    // Redirect to character sheet
  };

  return (
    <div className="character-setup max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-medium mb-6">Create Character</h1>

      {/* Name input */}
      <div className="mb-4">
        <label>Character Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded-lg"
        />
      </div>

      {/* Class selector */}
      <ClassSelector
        selected={selectedClass}
        onSelect={setSelectedClass}
      />

      {/* Level input */}
      <div className="mb-4">
        <label>Level</label>
        <input
          type="number"
          min={1}
          max={20}
          value={level}
          onChange={(e) => setLevel(parseInt(e.target.value))}
          className="w-full p-2 border rounded-lg"
        />
      </div>

      {/* Ability scores */}
      <AbilityScoreInput
        scores={abilityScores}
        onChange={setAbilityScores}
        spellcastingAbility={spellcastingAbility}
      />

      {/* Preview */}
      <div className="preview bg-gray-100 p-4 rounded-lg mb-4">
        <h3>Preview</h3>
        <p>Spell Save DC: {spellSaveDC}</p>
        <p>Spell Attack: +{spellAttackBonus}</p>
        <p>Proficiency Bonus: +{proficiencyBonus}</p>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="errors text-red-600">
          {errors.map((err, i) => <p key={i}>{err}</p>)}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={() => window.history.back()}>Cancel</button>
        <button onClick={handleSubmit}>Create Character</button>
      </div>
    </div>
  );
}
```

### 5.2 Helper: getSpellcastingAbility

```typescript
// src/utils/helpers.ts
export function getSpellcastingAbility(className: string): string {
  const abilityMap: Record<string, string> = {
    'Wizard': 'int',
    'Artificer': 'int',
    'Cleric': 'wis',
    'Druid': 'wis',
    'Bard': 'cha',
    'Paladin': 'cha',
    'Sorcerer': 'cha',
    'Warlock': 'cha',
    'Ranger': 'wis',
  };

  return abilityMap[className] || 'int';
}
```

### 5.3 Store Action: createCharacter

```typescript
// In character-store.ts
createCharacter: (params: CreateCharacterParams) => {
  const { characters } = get();
  
  const character = CharacterService.createCharacter(params);
  const updated = [...characters, character];
  
  set({ 
    characters: updated,
    activeCharacter: character
  });
  
  StorageService.saveCharacter(character);
}
```

---

## 6. open20-core API Usage

```typescript
// src/core/character-service.ts
import { createCharacter } from 'open20-core';

static createCharacter(params: CreateCharacterParams): Character {
  return createCharacter(params);
}
```

---

## 7. Design Mockup

```
┌─────────────────────────────────┐
│ Create Character                │
├─────────────────────────────────┤
│ Character Name                  │
│ [________________________]     │
│                                │
│ Class                          │
│ [Bard] [Cleric] [Druid]     │  <- ClassSelector
│ [Paladin] [Ranger] [Sorc]   │
│ [Warlock] [Wizard]            │
│                                │
│ Level: [5]  (stepper +/-)    │
│                                │
│ Ability Scores:                │
│ STR [10] DEX [10] CON [10] │  <- AbilityScoreInput
│ INT [10] WIS [10] CHA [10] │
│                                │
│ Preview:                       │
│ Spell Save DC: 15             │
│ Spell Attack: +7              │
│ Spell Slots: L1: 4, L2: 3   │
│                                │
│              [Cancel] [Create] │
└─────────────────────────────────┘
```

---

## 8. Edge Cases

| Case | Expected Behavior |
|------|-------------------|
| Empty name | Show "Name is required" error |
| Level < 1 or > 20 | Clamp to 1-20 range |
| No class selected | Disable Create button, show helper text |
| Duplicate character name | Allow (add suffix or warn) |

---

**Last Updated**: 2026-05-10  
**Updated By**: Tech Lead
