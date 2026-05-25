import type { Spell } from 'open20-core';
import { useSpellStore } from '@/stores/spell-store';
import { useCharacterStore } from '@/stores/character-store';
import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/IconButton';
import { Surface } from '@/components/ui/Surface';
import { Text } from '@/components/ui/Text';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { spellService } from '@/core/spell-service';
import { getCasterType } from '@/core/character-service';
import { Sparkles, BookMarked, Star, ChevronDown } from 'lucide-react';

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
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
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
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="w-40">
        {hasActive && (
          <>
            <DropdownMenu.Label>{label} for</DropdownMenu.Label>
            {activeClassIds.map(classId => (
              <DropdownMenu.Item
                key={`remove-${classId}`}
                onSelect={() => onToggle(classId)}
              >
                <span className="flex-1">{classId}</span>
                <span className="text-text-tertiary text-xs ml-2">
                  {label === 'Cantrip' ? 'Unlearn' : 'Unprepare'}
                </span>
              </DropdownMenu.Item>
            ))}
            {hasInactive && <DropdownMenu.Separator />}
          </>
        )}
        {hasInactive && (
          <>
            {!hasActive && <DropdownMenu.Label>Add {label} for</DropdownMenu.Label>}
            {matchingClassIds
              .filter(classId => !activeClassIds.includes(classId))
              .map(classId => (
                <DropdownMenu.Item
                  key={`add-${classId}`}
                  onSelect={() => onToggle(classId)}
                >
                  <span className="flex-1">{classId}</span>
                  <span className="text-text-tertiary text-xs ml-2">
                    {label === 'Cantrip' ? 'Learn' : 'Prepare'}
                  </span>
                </DropdownMenu.Item>
              ))}
          </>
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
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
    <Surface
      variant={surfaceVariant}
      padding="md"
      onClick={() => selectSpell(spell)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') selectSpell(spell); }}
      className={`w-full text-left relative overflow-hidden ${
        !isConcentratingOnThis && !isPrepared && !isKnown && !isCantripKnown
          ? 'cursor-pointer hover:shadow-md hover:border-primary-300'
          : ''
      }`}
    >
      {/* Background glow for prepared */}
      {isPrepared && (
        <div className="absolute -top-1 -right-1 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
          <Sparkles className="w-12 h-12 text-primary-500" />
        </div>
      )}

      <div className="flex justify-between items-start mb-2">
        <Text as="h3" variant="heading" className="group-hover:text-primary-600 transition-colors leading-tight pr-8">
          {spell.name}
        </Text>
        <div className="flex gap-1">
          {spell.ritual && <Badge variant="info" size="sm">R</Badge>}
          {spell.concentration && <Badge variant="warning" size="sm">C</Badge>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant={spell.level === 0 ? 'secondary' : 'primary'} size="sm" className="font-black">
          {spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`}
        </Badge>
        <Text variant="labelSm">{spell.school}</Text>
        {(isKnown || isCantripKnown) && !isPrepared && (
          <Badge variant="info" size="sm">Known</Badge>
        )}
        {isPrepared && (
          <Badge variant="primary" size="sm">Prepared</Badge>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto">
        <Text variant="caption">
          {spell.castingTime} • <span className="uppercase opacity-70">{spell.source}</span>
        </Text>

        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
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
        </div>
      </div>
    </Surface>
  );
}
