// ContentArea.tsx
// Content area with two layout modes:
// - Desktop (>=1024px): Combat is a permanent, non-collapsible focus panel at the top;
//   the remaining 6 sections are rendered fully-expanded in a two-column grid.
// - Mobile/tablet (<1024px): Combat stays pinned at top; the remaining sections are
//   stacked in a single column with single-open collapse behavior.
// Controlled by expandedSections/onToggleSection from AppShell (mobile only).

import { useState } from 'react';
import {
  Shield,
  Dumbbell,
  ScrollText,
  WandSparkles,
  Package,
  Feather,
  FileText,
  Plus,
  BookOpen,
} from 'lucide-react';
import { isConcentrating, getConcentratingSpellId, calculateConcentrationDC } from 'open20-core';
import type { Currency } from 'open20-core';
import type { DamageType } from 'open20-core';
import type { EquipmentItem } from 'open20-core';
import type { ConditionName } from 'open20-core';
import type { AbilityName } from 'open20-core/types';
import { Surface, Text, Divider, EmptyState, Button, cn } from '@open20/ui';
import type { AppCharacter } from '@/types';
import { HpBar } from '@/components/character/HPManager';
import { AbilityScoresGrid } from '@/components/character/AbilityScores';
import { DeathSavesTracker } from '@/components/character/DeathSavesTracker';
import { CombatStatsBar } from '@/components/character/CombatStats';
import { SkillsList } from '@/components/character/Skills';
import { SpeciesPanel } from '@/components/character/Species';
import { BackgroundPanel } from '@/components/character/Background';
import { FeatList } from '@/components/character/Feats';
import {
  SpellcastingHeader,
  SpellSlotRow,
  PreparedSpellList,
  ConcentrationBanner,
} from '@/components/character/Spellcasting';
import { rollAbility, rollSave, rollSkill } from '@/core/roll-adapter';
import type { RollModifierType } from '@/core/roll-adapter';
import { WeaponAttacksList } from '@/components/character/WeaponAttacks';
import { CurrencyRow } from '@/components/character/Currency';
import { EquipmentList, AddEquipmentDialog } from '@/components/character/Equipment';
import { ConditionsPanel } from '@/components/character/Conditions';
import { DamageDefensesSection } from '@/components/character/DamageDefenses';
import { getSpellName } from '@/core/content-resolver';
import { useCharacterStore } from '@/stores/characterStore';
import { SpellBrowser } from '@/components/character/SpellBrowser';
import type { CollapsibleKey } from './sections';
import { SectionCollapse } from './SectionCollapse';

export interface ContentAreaProps {
  character: AppCharacter;
  /** Collapse state for the 6 collapsible sections (mobile single-open only). */
  expandedSections: Record<CollapsibleKey, boolean>;
  onToggleSection: (key: CollapsibleKey) => void;
  /** Desktop flag — when true, renders two-column fully-expanded layout. */
  isDesktop: boolean;
  modifyHP: (delta: number) => void;
  toggleDeathSave: (kind: 'success' | 'failure', index: number) => void;
  toggleInspiration?: () => void;
  modifyCurrency?: (delta: Partial<Currency>) => void;
  toggleCondition?: (conditionId: ConditionName) => void;
  onToggleEquip?: (itemId: string) => void;
  onRemoveEquipment?: (itemId: string) => void;
  onAddEquipment?: (item: EquipmentItem) => void;
  onToggleDamageDefense?: (
    category: 'resistances' | 'immunities' | 'vulnerabilities',
    damageType: DamageType,
  ) => void;
  className?: string;
}

// ─── Combat Section (internal) ─────────────────────────────

function CombatSection({
  character,
  modifyHP,
  toggleDeathSave,
  toggleInspiration,
  toggleCondition,
  onToggleDamageDefense,
}: Omit<ContentAreaProps, 'expandedSections' | 'onToggleSection' | 'isDesktop' | 'className'>) {
  const concentrating = isConcentrating(character);
  const concentratingSpellId = getConcentratingSpellId(character);
  const lastDamage = useCharacterStore((s) => s.lastDamageForConcentration);

  const spellName = concentratingSpellId ? getSpellName(concentratingSpellId) : null;
  const concentrationDC = lastDamage !== null ? calculateConcentrationDC(lastDamage) : null;

  return (
    <Surface variant="default" padding="sm">
      <div className="flex flex-col gap-3">
        {/* Concentration Banner (T-117) */}
        {concentrating && spellName && (
          <ConcentrationBanner
            spellName={spellName}
            damageAmount={lastDamage}
            concentrationDC={concentrationDC}
            onEndConcentration={() => {
              useCharacterStore.getState().endConcentration();
            }}
            onRollConcentrationSave={() => {
              if (lastDamage !== null) {
                useCharacterStore.getState().makeConcentrationSave(lastDamage);
              }
            }}
          />
        )}

        {/* HP Bar — no Surface wrapper (embedded in merged panel) */}
        <HpBar
          current={character.hitPoints.current}
          max={character.hitPoints.max}
          temporary={character.hitPoints.temporary}
          onAdjust={modifyHP}
          noSurface
        />

        <Divider />

        {/* Combat Stats — full-width single row on desktop, 2×3 on mobile */}
        <CombatStatsBar character={character} onToggleInspiration={toggleInspiration} />

        {/* Secondary: Death Saves | Damage Defenses | Conditions — three columns */}
        <div className="grid gap-3 md:grid-cols-3 items-start">
          <DeathSavesTracker
            successes={character.hitPoints.deathSaves.successes}
            failures={character.hitPoints.deathSaves.failures}
            isStable={character.hitPoints.deathSaves.isStable}
            onToggleSuccess={(i) => toggleDeathSave('success', i)}
            onToggleFailure={(i) => toggleDeathSave('failure', i)}
          />

          {/* Damage Defenses (T-210) */}
          <DamageDefensesSection
            defenses={character.damageDefenses}
            onToggle={onToggleDamageDefense ?? (() => {})}
          />

          {/* Conditions (T-207) — wrapped in Surface to match the other columns */}
          <Surface variant="default" padding="sm">
            <ConditionsPanel
              conditions={character.conditions}
              onToggle={toggleCondition ?? (() => {})}
            />
          </Surface>
        </div>

        {/* Weapon Attacks (T-109/T-110) — full width */}
        <WeaponAttacksList character={character} />
      </div>
    </Surface>
  );
}

// ─── Abilities Section (internal) ──────────────────────────

function AbilitiesSection({ character }: { character: AppCharacter }) {
  return (
    <Surface variant="default" padding="sm">
      <AbilityScoresGrid
        character={character}
        onRollCheck={(ability, rollModifier) => rollAbility(character, ability, rollModifier)}
        onRollSave={(ability: AbilityName, rollModifier: RollModifierType) =>
          rollSave(character, ability, rollModifier)
        }
      />
    </Surface>
  );
}

// ─── Skills Section (internal) ─────────────────────────────

function SkillsSection({ character }: { character: AppCharacter }) {
  return (
    <SkillsList
      character={character}
      onRollSkill={(skill, mod) => rollSkill(character, skill, mod)}
    />
  );
}

// ─── Spells Section (internal) ──────────────────────────

const SPELL_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

function SpellsSection({ character }: { character: AppCharacter }) {
  const { spells } = character;
  const hasSpellcasting = Object.keys(spells.classSpellcasting).length > 0;
  const [browserOpen, setBrowserOpen] = useState(false);

  const slotLevels: Array<{ level: number | 'Cantrip' | 'Pact'; total: number; used: number }> = [];

  // Sum cantrip counts across all spellcasting classes for multiclass
  const totalCantrips = Object.values(spells.classSpellcasting).reduce(
    (sum, data) => sum + (data.maxCantripsKnown ?? 0),
    0,
  );
  slotLevels.push({ level: 'Cantrip', total: totalCantrips, used: 0 });

  for (const lvl of SPELL_LEVELS) {
    const slot = spells.spellSlots[lvl];
    slotLevels.push({
      level: lvl,
      total: slot?.total ?? 0,
      used: slot?.used ?? 0,
    });
  }

  // Pact magic slots (Warlock)
  if (spells.pactMagicSlots) {
    slotLevels.push({
      level: 'Pact',
      total: spells.pactMagicSlots.total,
      used: spells.pactMagicSlots.used,
    });
  }

  if (!hasSpellcasting) {
    return (
      <Surface variant="default" padding="sm">
        <Text variant="bodySm" color="secondary">
          This character does not have spellcasting.
        </Text>
      </Surface>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <SpellcastingHeader character={character} />

      <Surface variant="default" padding="sm">
        <div className="divide-y divide-border">
          {slotLevels.map((slot) => (
            <SpellSlotRow
              key={slot.level}
              level={slot.level}
              total={slot.total}
              used={slot.used}
              onPipClick={
                slot.level === 'Cantrip'
                  ? undefined
                  : (_index, isUsed) => {
                      const lvl = slot.level === 'Pact' ? 'pact' : (slot.level as number);
                      if (isUsed) {
                        useCharacterStore.getState().recoverSpellSlot(lvl);
                      } else {
                        useCharacterStore.getState().consumeSpellSlot(lvl);
                      }
                    }
              }
            />
          ))}
        </div>
      </Surface>

      {/* Prepared spells list (T-116) */}
      <PreparedSpellList
        character={character}
        onCastSpell={(spellId, slotLevel) => {
          useCharacterStore.getState().castSpell(spellId, slotLevel);
        }}
      />

      {/* Manage Spells button */}
      <Button variant="outline" size="sm" className="w-full" onClick={() => setBrowserOpen(true)}>
        <BookOpen className="w-4 h-4 mr-1" />
        Manage Spells
      </Button>

      <SpellBrowser
        character={character}
        open={browserOpen}
        onClose={() => setBrowserOpen(false)}
        onPrepareSpell={(spellId) => useCharacterStore.getState().prepareSpell(spellId)}
        onUnprepareSpell={(spellId) => useCharacterStore.getState().unprepareSpell(spellId)}
        onLearnSpell={(spellId) => useCharacterStore.getState().learnSpell(spellId)}
        onUnlearnSpell={(spellId) => useCharacterStore.getState().unlearnSpell(spellId)}
        onLearnCantrip={(classId, spellId) =>
          useCharacterStore.getState().learnCantrip(classId, spellId)
        }
        onUnlearnCantrip={(classId, spellId) =>
          useCharacterStore.getState().unlearnCantrip(classId, spellId)
        }
      />
    </div>
  );
}

// ─── Features Section (internal) ─────────────────────────

function FeaturesSection({ character }: { character: AppCharacter }) {
  return (
    <div className="flex flex-col gap-2">
      <SpeciesPanel character={character} />
      <BackgroundPanel character={character} />

      {/* Feats (T-113) */}
      <FeatList character={character} />
    </div>
  );
}

// ─── Equipment Section (internal) ──────────────────────────

function EquipmentSection({
  character,
  modifyCurrency,
  onToggleEquip,
  onRemoveEquipment,
  onAddEquipment,
}: {
  character: AppCharacter;
  modifyCurrency?: (delta: Partial<Currency>) => void;
  onToggleEquip?: (itemId: string) => void;
  onRemoveEquipment?: (itemId: string) => void;
  onAddEquipment?: (item: EquipmentItem) => void;
}) {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <CurrencyRow currency={character.currency} onModify={modifyCurrency ?? (() => {})} />
      <EquipmentList
        items={character.equipment}
        onToggleEquip={onToggleEquip ?? (() => {})}
        onRemove={onRemoveEquipment ?? (() => {})}
      />
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="gap-1" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Equipment
        </Button>
      </div>
      <AddEquipmentDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={(item) => {
          onAddEquipment?.(item);
        }}
      />
    </div>
  );
}

// ─── Placeholder Section (internal) ────────────────────────

function PlaceholderSection({ title, description }: { title: string; description: string }) {
  return (
    <Surface
      variant="default"
      padding="sm"
      className="flex min-h-[200px] items-center justify-center"
    >
      <EmptyState title={title} description={description} />
    </Surface>
  );
}

// ─── Section definitions ───────────────────────────────────

interface SectionDefinition {
  key: CollapsibleKey;
  title: string;
  icon: typeof Shield;
}

// The 6 collapsible sections, grouped into two balanced columns for desktop.
// 3 sections per column, balancing tall sections (Skills ~18 rows, Spells) against
// shorter ones (Abilities, Equipment, Features, Notes). Left = character capabilities
// (Abilities + Skills + Features), Right = resources (Spells + Equipment + Notes).
const LEFT_COLUMN: SectionDefinition[] = [
  { key: 'abilities', title: 'Ability Scores', icon: Dumbbell },
  { key: 'skills', title: 'Skills', icon: ScrollText },
  { key: 'features', title: 'Features & Traits', icon: Feather },
];

const RIGHT_COLUMN: SectionDefinition[] = [
  { key: 'spells', title: 'Spellcasting', icon: WandSparkles },
  { key: 'equipment', title: 'Equipment', icon: Package },
  { key: 'notes', title: 'Notes', icon: FileText },
];

// Combat is rendered separately as a permanent focus area (not a collapsible section).
const COMBAT_TITLE = 'Combat';
const COMBAT_ICON = Shield;

// ─── ContentArea ────────────────────────────────────────────

export function ContentArea({
  character,
  expandedSections,
  onToggleSection,
  isDesktop,
  modifyHP,
  toggleDeathSave,
  toggleInspiration,
  modifyCurrency,
  toggleCondition,
  onToggleEquip,
  onRemoveEquipment,
  onAddEquipment,
  onToggleDamageDefense,
  className,
}: ContentAreaProps) {
  const renderSectionContent = (key: CollapsibleKey) => {
    switch (key) {
      case 'abilities':
        return <AbilitiesSection character={character} />;
      case 'skills':
        return <SkillsSection character={character} />;
      case 'spells':
        return <SpellsSection character={character} />;
      case 'equipment':
        return (
          <EquipmentSection
            character={character}
            modifyCurrency={modifyCurrency}
            onToggleEquip={onToggleEquip}
            onRemoveEquipment={onRemoveEquipment}
            onAddEquipment={onAddEquipment}
          />
        );
      case 'features':
        return <FeaturesSection character={character} />;
      case 'notes':
        return (
          <PlaceholderSection
            title="Notes"
            description="Free-form notes for your character will be available in a future update."
          />
        );
    }
  };

  // Combat — permanent focus area, never collapsed.
  const combatSection = (
    <section id="section-combat" aria-labelledby="section-combat-heading">
      <div className="flex items-center gap-2 mb-2">
        <COMBAT_ICON className="h-5 w-5 text-primary-500 shrink-0" aria-hidden="true" />
        <h2
          id="section-combat-heading"
          className="flex-1 text-xs font-bold tracking-[0.2em] text-text-primary uppercase"
        >
          {COMBAT_TITLE}
        </h2>
      </div>
      <CombatSection
        character={character}
        modifyHP={modifyHP}
        toggleDeathSave={toggleDeathSave}
        toggleInspiration={toggleInspiration}
        toggleCondition={toggleCondition}
        onToggleDamageDefense={onToggleDamageDefense}
      />
    </section>
  );

  return (
    <main className={cn('flex-1 overflow-y-auto p-3 md:p-4 lg:p-5', className)}>
      <div className="flex flex-col gap-2">
        {combatSection}

        {isDesktop ? (
          /* Desktop: two-column fully-expanded layout (no collapse). */
          <div className="grid md:grid-cols-2 gap-x-4 gap-y-2 items-start">
            <div className="flex flex-col gap-2">
              {LEFT_COLUMN.map(({ key, title, icon }) => (
                <section key={key} id={`section-${key}`} aria-labelledby={`section-${key}-heading`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon icon={icon} />
                    <SectionHeading id={`section-${key}-heading`} title={title} />
                  </div>
                  {renderSectionContent(key)}
                </section>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              {RIGHT_COLUMN.map(({ key, title, icon }) => (
                <section key={key} id={`section-${key}`} aria-labelledby={`section-${key}-heading`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon icon={icon} />
                    <SectionHeading id={`section-${key}-heading`} title={title} />
                  </div>
                  {renderSectionContent(key)}
                </section>
              ))}
            </div>
          </div>
        ) : (
          /* Mobile/tablet: single column, single-open collapse. */
          [...LEFT_COLUMN, ...RIGHT_COLUMN].map(({ key, title, icon }) => (
            <SectionCollapse
              key={key}
              id={`section-${key}`}
              title={title}
              icon={icon}
              expanded={expandedSections[key]}
              onToggle={() => onToggleSection(key)}
            >
              {renderSectionContent(key)}
            </SectionCollapse>
          ))
        )}
      </div>
    </main>
  );
}

// ─── Section heading helpers (desktop static header) ─────────

function Icon({ icon }: { icon: typeof Shield }) {
  const IconComponent = icon;
  return <IconComponent className="h-5 w-5 text-primary-500 shrink-0" aria-hidden="true" />;
}

function SectionHeading({ id, title }: { id: string; title: string }) {
  return (
    <h2 id={id} className="flex-1 text-xs font-bold tracking-[0.2em] text-text-primary uppercase">
      {title}
    </h2>
  );
}
