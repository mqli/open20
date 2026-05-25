# D&D Spellbook App Product Requirements Document (PRD)

**Document Version**: v1.0  
**Date**: 2026-05-10  
**Product Owner**: [TBD]  
**Status**: Draft

---

## 1. Problem Statement (Why)

### Core Problems
D&D (Dungeons & Dragons) players face the following pain points when managing spells:
1. **High Rules Complexity**: The spell system involves complex mechanics like spell slots, components, concentration, and preparation rules that are difficult for beginners to master
2. **Inefficient Manual Tracking**: Players need to manually track spell slot consumption, prepared spells, and concentration status, which is prone to errors
3. **Difficulty Looking Up Information**: Players need to quickly find spell information (range, components, duration, etc.), but paper or PDF lookup is inefficient
4. **Multi-Class Rules Differences**: Different classes (Wizard, Cleric, Druid, etc.) have different spell preparation rules that are easily confused

### User Value
- **Quick Lookup**: Search spell information in seconds, with support for filtering by name, level, school, and class
- **Smart Management**: Automatically track spell slots, concentration status, and prepared spells, reducing manual calculations
- **Rules Assistance**: Built-in D&D 5e rules engine that automatically validates spell casting legality
- **Offline Available**: Supports offline access, suitable for tabletop gaming scenarios (no network environment)

---

## 2. Target Users

| User Role | Description | Core Needs |
|-----------|-------------|------------|
| **Spellcasting Players** | Players who play classes like Wizard, Cleric, Druid | Manage spellbook, prepare spells, track spell slots |
| **Dungeon Master (DM)** | Game host who needs to quickly look up spell information | Quick spell rule lookup, NPC spell management |
| **New Players** | Players new to D&D | Learn spell rules, simplified operation interface |
| **Experienced Players** | Familiar with rules, pursue efficiency | Keyboard shortcuts, batch operations, custom tags |

---

## 3. User Stories

### Priority P0 (Core Features)
1. **As a** spellcasting player, **I want to** browse all D&D 5e spell list, **so that** I can quickly find the spells I want to use
2. **As a** spellcasting player, **I want to** prepare spells for my character (select prepared spell list), **so that** I comply with D&D rules requirements
3. **As a** spellcasting player, **I want to** track my spell slot consumption and recovery, **so that** I know exactly which spells I can still cast in the game
4. **As a** spellcasting player, **I want to** view detailed spell information (casting time, range, components, duration, etc.), **so that** I correctly understand the spell effects

### Priority P1 (Important Features)
5. **As a** spellcasting player, **I want to** mark concentration status (Concentration), **so that** I can track whether I am maintaining a spell that requires concentration
6. **As a** spellcasting player, **I want to** filter spells by class, level, and school, **so that** I can quickly find spells that match my character's capabilities
7. **As a** spellcasting player, **I want to** roll spell attack checks, **so that** I can determine if the spell hits the target
8. **As a** spellcasting player, **I want to** roll spell damage dice, **so that** I can calculate the damage caused by the spell
9. **As a** Dungeon Master, **I want to** quickly search for spells, **so that** I can instantly answer player questions during the game

### Priority P2 (Enhanced Features)
10. **As a** spellcasting player, **I want to** create multiple character profiles, **so that** I can manage different characters' spellbooks
11. **As a** player, **I want to** bookmark frequently used spells, **so that** I can quickly access them
12. **As an** experienced player, **I want to** use keyboard shortcuts, **so that** I can improve operation efficiency during the game

---

## 4. Functional Requirements

### 4.1 Spell Database
| ID | Requirement Description | Priority |
|---|------------------------|----------|
| FR-001 | Built-in D&D 5e SRD (System Reference Document) open license spell data | P0 |
| FR-002 | Each spell contains the following fields: name, level (0-9), school, casting time, range, components (V/S/M), duration, description, class list, whether attack roll is required, damage dice, damage type | P0 |
| FR-003 | Support offline storage of spell data (local database) | P0 |
| FR-004 | Support spell search (real-time search by name) | P0 |
| FR-005 | Support multi-dimensional filtering: class, level, school, casting time, whether concentration is required, whether it has ritual tag | P1 |

### 4.2 Character & Spell Management
| ID | Requirement Description | Priority |
|---|------------------------|----------|
| FR-006 | Support creating character profiles (name, class, level, spellcasting ability, proficiency bonus) | P0 |
| FR-007 | Automatically calculate available spell slots based on character class and level (Spell Slots) | P0 |
| FR-008 | Support spell preparation (Prepare Spells) feature, automatically limit preparation quantity according to class rules (refer to Spell Preparation by Class table) | P0 |
| FR-009 | Support marking "Always-Prepared" spells, which don't count against preparation quantity limits | P1 |
| FR-010 | Support spell slot consumption and recovery operations (click to consume/Long Rest to recover) | P0 |
| FR-011 | Support concentration status marking (on/off), and highlight the spell currently being concentrated on | P1 |

### 4.3 Spell Detail Display
| ID | Requirement Description | Priority |
|---|------------------------|----------|
| FR-012 | Spell detail page displays complete information: name, level, school, casting time, range, components, duration, description text | P0 |
| FR-013 | Component detail display: Verbal (V), Somatic (S), Material (M), material components show specific requirements | P0 |
| FR-014 | Display spell DC calculation: Spell save DC = 8 + spellcasting ability modifier + proficiency bonus | P1 |
| FR-015 | Display spell attack bonus: Spell attack modifier = spellcasting ability modifier + proficiency bonus | P1 |
| FR-016 | Support spell attack roll (automatically calculate attack bonus and roll d20) | P1 |
| FR-017 | Support spell damage dice rolling (automatically calculate damage dice according to spell description) | P1 |
| FR-018 | Support rule term tooltip in spell description (e.g., "See rules glossary") | P2 |

### 4.4 User Experience
| ID | Requirement Description | Priority |
|---|------------------------|----------|
| FR-019 | Support dark/light theme switching (suitable for different desktop environments) | P1 |
| FR-020 | Support bookmark function (quick access to frequently used spells) | P2 |
| FR-021 | Support exporting character spellbook as PDF or text | P2 |
| FR-022 | Support keyboard shortcut operations (e.g., spacebar to consume spell slot, R key for Long Rest recovery) | P2 |

### 4.5 Rules Engine (Smart Assistance)
| ID | Requirement Description | Priority |
|---|------------------------|----------|
| FR-023 | Automatically validate: Ensure spell slots are available before consumption and provide visual warnings if attempting to cast without slots | P1 |
| FR-024 | Automatically calculate: Spell level when using higher-level spell slots | P1 |
| FR-025 | Prompt ritual casting (Ritual) option: Doesn't consume spell slot but requires additional 10 minutes | P2 |
| FR-026 | Support custom house rules toggle (e.g., allow concentrating on multiple spells) | P2 |

---

## 5. Non-goals

The following features are **explicitly NOT included** in this version:

1. **No support for** multi-player online synchronization (e.g., real-time sharing of spellbook with teammates)
2. **No support for** combat tracker (Initiative Tracker) functionality
3. **No support for** spell animations or 3D effect displays
4. **No support for** non-SRD spells (only supports open license spells in D&D 5e SRD, does not include spells that require paid licensing)
5. **No support for** creating and sharing homebrew spells (consider for future versions)
6. **No support for** other TRPG systems besides D&D 5e (e.g., Pathfinder, Call of Cthulhu, etc.)
7. **No support for** custom notes feature (no note-adding functionality for each spell)
8. **No provision of** rules consulting services (e.g., rules dispute arbitration, which falls under DM judgment)

---

## 6. Appendix

### References
- D&D 5e Player's Handbook (PHB) - Spell Chapter
- D&D 5e System Reference Document (SRD) - Open license spell data
- Reference file: `C:/Users/mqli/Desktop/dnd/spell.md`

### Related Documents
- User Research Synthesis Report (To be completed)
- Technical Architecture Design Document (To be completed)
- UI/UX Design Draft (To be completed)

---

**Change Log**

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| v1.0 | 2026-05-10 | Initial version created | 产品通 |

---

**Approval Signatures**

- Product Owner: [  ]
- Technical Lead: [  ]
- Design Lead: [  ]
- CEO/GM: [  ]
