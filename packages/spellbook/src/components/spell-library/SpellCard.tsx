import type { Spell } from 'open20-core';
import { useSpellStore } from '@/stores/spell-store';
import { useCharacterStore } from '@/stores/character-store';
import {
  Badge,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconButton,
  SpellCard as SpellCardUI,
} from '@open20/ui';
import { spellService } from '@/core/spell-service';
import { getCasterType } from '@/core/character-service';
import { BookMarked, Star, ChevronDown } from 'lucide-react';

interface SpellCardProps {
  spell: Spell;
}

interface ConcentrationCondition {
  id: string;
  source?: string;
}

/**
 * Reusable dropdown for multi-class spell actions (learn cantrip / prepare spell)
 */
function ClassActionDropdown({
  matchingClassIds,
  activeClassIds,
  label,
  onToggle,
  variant = 'info',
  active = false,
}: {
  matchingClassIds: string[];
  activeClassIds: string[];
  label: string;
  onToggle: (classId: string) => void;
  variant?: 'info' | 'primary';
  active?: boolean;
}) {
  const hasActive = activeClassIds.length > 0;
  const hasInactive = matchingClassIds.some(id => !activeClassIds.includes(id));

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger asChild>
        <IconButton
          variant={variant}
          active={active}
          title={hasActive ? `Manage ${label}` : `Add ${label}`}
        >
          {variant === 'info' ? (
            <BookMarked className="w-3.5 h-3.5" />
          ) : (
            <Star className={`w-3.5 h-3.5 ${active ? 'fill-current' : ''}`} />
          )}
          <ChevronDown className="w-2.5 h-2.5 ml-0.5" />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40">
        {hasActive && (
          <>
            <DropdownMenuLabel>{label} for</DropdownMenuLabel>
            {activeClassIds.map(classId => (
              <DropdownMenuItem
                key={`remove-${classId}`}
                onSelect={() => onToggle(classId)}
              >
                <span className="flex-1">{classId}</span>
                <span className="text-text-tertiary text-xs ml-2">
                  {label === 'Cantrip' ? 'Unlearn' : 'Unprepare'}
                </span>
              </DropdownMenuItem>
            ))}
            {hasInactive && <DropdownMenuSeparator />}
          </>
        )}
        {hasInactive && (
          <>
            {!hasActive && <DropdownMenuLabel>Add {label} for</DropdownMenuLabel>}
            {matchingClassIds
              .filter(classId => !activeClassIds.includes(classId))
              .map(classId => (
                <DropdownMenuItem
                  key={`add-${classId}`}
                  onSelect={() => onToggle(classId)}
                >
                  <span className="flex-1">{classId}</span>
                  <span className="text-text-tertiary text-xs ml-2">
                    {label === 'Cantrip' ? 'Learn' : 'Prepare'}
                  </span>
                </DropdownMenuItem>
              ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
}

export function SpellCard({ spell }: SpellCardProps) {
  const { selectSpell } = useSpellStore();
  const {
    activeCharacter,
    learnSpell, unlearnSpell,
    learnCantrip, unlearnCantrip,
    prepareSpell, unprepareSpell,
    prepareSpellForClass, unprepareSpellForClass,
  } = useCharacterStore();

  // Get ALL matching classIds for this spell (for multiclass)
  const matchingClassIds = activeCharacter
    ? (activeCharacter.classes?.map(c => c.classId) ?? [])
        .filter(id => spell.classes?.includes(id) ?? false)
    : [];

  // Get classes that have this spell prepared
  const preparedClassIds = matchingClassIds.filter(classId => {
    const classData = activeCharacter?.spells.classSpellcasting[classId];
    return classData?.preparedSpells.includes(spell.id) ?? false;
  });

  // Get classes that have this cantrip known
  const cantripKnownClassIds = spell.level === 0
    ? matchingClassIds.filter(classId => {
        const classData = activeCharacter?.spells.classSpellcasting[classId];
        return classData?.knownCantrips.includes(spell.id) ?? false;
      })
    : [];

  const isKnown = activeCharacter ? spellService.isSpellKnown(activeCharacter, spell.id) : false;
  const isPrepared = preparedClassIds.length > 0;
  const isCantripKnown = cantripKnownClassIds.length > 0;
  const isConcentratingOnThis = activeCharacter?.conditions.some(
    c => c.id === 'Concentrating' && (c as ConcentrationCondition).source === spell.id
  ) ?? false;

  // A spell is "actionable" if there's an active character whose class includes it
  const isClassSpell = activeCharacter
    ? spellService.isSpellForCharacter(activeCharacter, spell)
    : false;

  // Show Learn/Prepare buttons based on character's caster type
  const casterType = activeCharacter
    ? getCasterType(activeCharacter)
    : { canLearn: false, canPrepare: false, isSpellbookCaster: false };

  const surfaceVariant = isConcentratingOnThis
    ? 'warning'
    : isPrepared
    ? 'selected'
    : (isKnown || isCantripKnown)
    ? 'info'
    : 'default';

  return (
    <SpellCardUI
      spell={spell}
      surfaceVariant={surfaceVariant}
      onClick={() => selectSpell(spell)}
      showDescription={false}
      glow={isPrepared}
      renderBadges={() => (
        <>
          {(isKnown || isCantripKnown) && !isPrepared && (
            <Badge variant="info" size="sm">Known</Badge>
          )}
          {isPrepared && (
            <Badge variant="primary" size="sm">Prepared</Badge>
          )}
        </>
      )}
      renderActions={() => (
        <>
          {/* Learn toggle — cantrips for all casters, regular spells only for "learn" casters */}
          {isClassSpell && (spell.level === 0 || casterType.canLearn) && (
            spell.level === 0 ? (
              /* Cantrip */
              matchingClassIds.length > 1 ? (
                <ClassActionDropdown
                  matchingClassIds={matchingClassIds}
                  activeClassIds={cantripKnownClassIds}
                  label="Cantrip"
                  onToggle={(classId) => {
                    if (cantripKnownClassIds.includes(classId)) {
                      unlearnCantrip(classId, spell.id);
                    } else {
                      learnCantrip(classId, spell.id);
                    }
                  }}
                />
              ) : (
                <IconButton
                  variant="info"
                  active={isCantripKnown}
                  onClick={(e) => {
                    e.stopPropagation();
                    const classId = matchingClassIds[0];
                    if (!classId) return;
                    if (isCantripKnown) {
                      unlearnCantrip(classId, spell.id);
                    } else {
                      learnCantrip(classId, spell.id);
                    }
                  }}
                  title={isCantripKnown ? 'Unlearn Cantrip' : 'Learn Cantrip'}
                >
                  <BookMarked className="w-3.5 h-3.5" />
                </IconButton>
              )
            ) : (
              /* Regular spell - simple toggle */
              <IconButton
                variant="info"
                active={isKnown}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isKnown) {
                    unlearnSpell(spell.id);
                  } else {
                    learnSpell(spell.id);
                  }
                }}
                title={isKnown ? 'Unlearn Spell' : 'Learn Spell'}
              >
                <BookMarked className="w-3.5 h-3.5" />
              </IconButton>
            )
          )}

          {/* Prepare toggle — only for casters who prepare spells (not cantrips) */}
          {isClassSpell && casterType.canPrepare && spell.level > 0 && (
            matchingClassIds.length > 1 ? (
              <ClassActionDropdown
                matchingClassIds={matchingClassIds}
                activeClassIds={preparedClassIds}
                label="Spell"
                onToggle={(classId) => {
                  if (preparedClassIds.includes(classId)) {
                    unprepareSpellForClass(classId, spell.id);
                  } else {
                    prepareSpellForClass(classId, spell.id);
                  }
                }}
                variant="primary"
                active={isPrepared}
              />
            ) : (
              <IconButton
                variant="primary"
                active={isPrepared}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isPrepared) {
                    unprepareSpell(spell.id);
                  } else {
                    prepareSpell(spell.id);
                  }
                }}
                title={isPrepared ? 'Unprepare Spell' : 'Prepare Spell'}
              >
                <Star className={`w-3.5 h-3.5 ${isPrepared ? 'fill-current' : ''}`} />
              </IconButton>
            )
          )}
        </>
      )}
    />
  );
}
