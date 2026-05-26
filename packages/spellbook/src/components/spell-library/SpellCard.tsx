import type { Spell } from 'open20-core';
import { useSpellStore } from '@/stores/spell-store';
import { useCharacterStore } from '@/stores/character-store';
import { useSpellCapabilities } from '@/hooks/useSpellCapabilities';
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
import { BookMarked, Star, ChevronDown } from 'lucide-react';
import { renderInlineMarkdown } from '@/utils/inline-markdown';

interface SpellCardProps {
  spell: Spell;
}

/**
 * Reusable dropdown for multi-class spell actions (learn cantrip / prepare spell)
 */
function ClassActionDropdown({
  matchingClassIds,
  activeClassIds,
  disabledActiveClassIds = [],
  label,
  onToggle,
  variant = 'info',
  active = false,
}: {
  matchingClassIds: string[];
  activeClassIds: string[];
  disabledActiveClassIds?: string[];
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
                disabled={disabledActiveClassIds.includes(classId)}
                onSelect={() => onToggle(classId)}
              >
                <span className="flex-1">{classId}</span>
                <span className="text-text-tertiary text-xs ml-2">
                  {disabledActiveClassIds.includes(classId)
                    ? 'Always'
                    : label === 'Cantrip'
                    ? 'Unlearn'
                    : 'Unprepare'}
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
    learnSpell, unlearnSpell,
    learnCantrip, unlearnCantrip,
    prepareSpell, unprepareSpell,
    prepareSpellForClass, unprepareSpellForClass,
  } = useCharacterStore();

  const caps = useSpellCapabilities(spell);
  const {
    isKnown, isPrepared, isCantripKnown, isConcentratingOnThis,
    showCantripButton, showLearnButton, showPrepareButton,
    matchingClassIds, preparedClassIds, alwaysPreparedClassIds, cantripKnownClassIds,
  } = caps;

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
      renderDescription={renderInlineMarkdown}
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
          {/* Cantrip learn/unlearn */}
          {showCantripButton && (
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
          )}

          {/* Regular spell learn/unlearn (spellbook casters only) */}
          {showLearnButton && (
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
          )}

          {/* Prepare toggle — only for casters who prepare spells (not cantrips) */}
          {showPrepareButton && (
            matchingClassIds.length > 1 ? (
              <ClassActionDropdown
                matchingClassIds={matchingClassIds}
                activeClassIds={preparedClassIds}
                disabledActiveClassIds={alwaysPreparedClassIds}
                label="Spell"
                onToggle={(classId) => {
                  if (alwaysPreparedClassIds.includes(classId)) return;
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
                disabled={
                  matchingClassIds.length === 1
                    && alwaysPreparedClassIds.includes(matchingClassIds[0] ?? '')
                }
                onClick={(e) => {
                  e.stopPropagation();
                  const classId = matchingClassIds[0];
                  if (isPrepared) {
                    if (classId && alwaysPreparedClassIds.includes(classId)) return;
                    const preparedClassId = preparedClassIds[0] ?? classId;
                    if (preparedClassId) {
                      unprepareSpellForClass(preparedClassId, spell.id);
                    } else {
                      unprepareSpell(spell.id);
                    }
                  } else {
                    if (classId) {
                      prepareSpellForClass(classId, spell.id);
                    } else {
                      prepareSpell(spell.id);
                    }
                  }
                }}
                title={
                  matchingClassIds.length === 1 && alwaysPreparedClassIds.includes(matchingClassIds[0] ?? '')
                    ? 'Always Prepared'
                    : isPrepared
                    ? 'Unprepare Spell'
                    : 'Prepare Spell'
                }
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
