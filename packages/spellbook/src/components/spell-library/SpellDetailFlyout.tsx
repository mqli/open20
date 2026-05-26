import { Activity, ArrowLeft, BookMarked, ChevronDown, Sparkles, Star, Swords, X } from 'lucide-react';
import {
  rollDiceExpression,
  defaultRandom,
} from 'open20-core';
import { useSpellStore } from '@/stores/spell-store';
import { useCharacterStore } from '@/stores/character-store';
import { useRollStore } from '@/stores/roll-store';
import { useSpellCapabilities } from '@/hooks/useSpellCapabilities';
import {
  Badge,
  Button,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconButton,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetRoot,
  SpellCard as SpellCardUI,
} from '@open20/ui';
import { characterService } from '@/core/character-service';

import { renderInlineMarkdown } from '@/utils/inline-markdown';

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

export function SpellDetailFlyout() {
  const { selectedSpell, isDetailOpen, closeDetail } = useSpellStore();
  const {
    activeCharacter,
    prepareSpell, unprepareSpell,
    prepareSpellForClass, unprepareSpellForClass,
    learnSpell, unlearnSpell,
    learnCantrip, unlearnCantrip,
    startConcentration, endConcentration,
    castSpell,
  } = useCharacterStore();
  const { addRoll } = useRollStore();

  const caps = useSpellCapabilities(selectedSpell);

  if (!selectedSpell) return null;

  const {
    isKnown,
    isPrepared,
    isCantripKnown,
    isConcentratingOnThis,
    showCantripButton,
    showLearnButton,
    showPrepareButton,
    matchingClassIds,
    preparedClassIds,
    alwaysPreparedClassIds,
    cantripKnownClassIds,
    canCast,
    spellAttackBonus,
  } = caps;

  const surfaceVariant = isConcentratingOnThis
    ? 'warning'
    : isPrepared
    ? 'selected'
    : (isKnown || isCantripKnown)
    ? 'info'
    : 'default';

  // Handlers
  const handleLearnToggle = () => isKnown ? unlearnSpell(selectedSpell.id) : learnSpell(selectedSpell.id);
  const handleConcentrationToggle = () => isConcentratingOnThis ? endConcentration() : startConcentration(selectedSpell.id);

  const handleAttackRoll = () => {
    if (!activeCharacter) {
      const result = rollDiceExpression(defaultRandom, '1d20 + 0');
      addRoll({ label: 'Attack', expression: '1d20 + 0', total: result.total });
      return;
    }
    const result = characterService.rollSpellAttack(activeCharacter, selectedSpell.name);
    addRoll({
      label: 'Spell Attack',
      expression: `d20 (${result.rawRoll}) + ${result.bonus}`,
      total: result.total
    });
  };

  const handleDamageRoll = (index: number, label: string) => {
    if (!activeCharacter) return;
    const result = characterService.rollSpellDamage(activeCharacter, selectedSpell.id, index);
    const diceExpr = result.entries.map(e => `${e.results.join('+')} (${e.type})`).join(' + ');
    const modExpr = result.modifiers.length > 0 ? ` + ${result.modifiers.reduce((s, m) => s + m.value, 0)}` : '';
    addRoll({ label, expression: `${diceExpr}${modExpr}`, total: result.total });
  };

  return (
    <SheetRoot open={isDetailOpen} onOpenChange={(open) => !open && closeDetail()}>
      <SheetContent side="right">
        <SheetHeader>
          <Button
            variant="ghost"
            size="sm"
            onClick={closeDetail}
            className="p-2 hover:bg-bg-tertiary rounded-md md:hidden"
          >
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </Button>
          
          <div className="w-12 h-1.5 bg-border rounded-full mx-auto md:hidden absolute left-1/2 -translate-x-1/2 top-2" />

          <SheetClose asChild>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-bg-tertiary rounded-md relative right-0 top-0"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </Button>
          </SheetClose>
        </SheetHeader>

        <SheetBody>
          <div className="mb-6">
            <SpellCardUI
              spell={selectedSpell}
              showDescription
              surfaceVariant={surfaceVariant}
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
                  {selectedSpell.concentration && activeCharacter && (
                    <IconButton
                      variant="warning"
                      active={isConcentratingOnThis}
                      title={isConcentratingOnThis ? 'End Concentration' : 'Start Concentration'}
                      onClick={handleConcentrationToggle}
                    >
                      <Activity className={`w-3.5 h-3.5 ${isConcentratingOnThis ? 'animate-pulse' : ''}`} />
                    </IconButton>
                  )}

                  {showCantripButton && (
                    matchingClassIds.length > 1 ? (
                      <ClassActionDropdown
                        matchingClassIds={matchingClassIds}
                        activeClassIds={cantripKnownClassIds}
                        label="Cantrip"
                        onToggle={(classId) => {
                          if (cantripKnownClassIds.includes(classId)) {
                            unlearnCantrip(classId, selectedSpell.id);
                          } else {
                            learnCantrip(classId, selectedSpell.id);
                          }
                        }}
                      />
                    ) : (
                      <IconButton
                        variant="info"
                        active={isCantripKnown}
                        onClick={() => {
                          const classId = matchingClassIds[0];
                          if (!classId) return;
                          if (isCantripKnown) {
                            unlearnCantrip(classId, selectedSpell.id);
                          } else {
                            learnCantrip(classId, selectedSpell.id);
                          }
                        }}
                        title={isCantripKnown ? 'Unlearn Cantrip' : 'Learn Cantrip'}
                      >
                        <BookMarked className="w-3.5 h-3.5" />
                      </IconButton>
                    )
                  )}

                  {showLearnButton && (
                    <IconButton
                      variant="info"
                      active={isKnown}
                      onClick={handleLearnToggle}
                      title={isKnown ? 'Unlearn Spell' : 'Learn Spell'}
                    >
                      <BookMarked className="w-3.5 h-3.5" />
                    </IconButton>
                  )}

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
                            unprepareSpellForClass(classId, selectedSpell.id);
                          } else {
                            prepareSpellForClass(classId, selectedSpell.id);
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
                        onClick={() => {
                          const classId = matchingClassIds[0];
                          if (isPrepared) {
                            if (classId && alwaysPreparedClassIds.includes(classId)) return;
                            const preparedClassId = preparedClassIds[0] ?? classId;
                            if (preparedClassId) {
                              unprepareSpellForClass(preparedClassId, selectedSpell.id);
                            } else {
                              unprepareSpell(selectedSpell.id);
                            }
                          } else {
                            if (classId) {
                              prepareSpellForClass(classId, selectedSpell.id);
                            } else {
                              prepareSpell(selectedSpell.id);
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

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => castSpell(selectedSpell.id, selectedSpell.level)}
                    disabled={!canCast}
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Cast
                  </Button>

                  {selectedSpell.attack && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleAttackRoll}
                    >
                      <Swords className="w-3.5 h-3.5 mr-1.5" />
                      Attack {spellAttackBonus >= 0 ? `+${spellAttackBonus}` : spellAttackBonus}
                    </Button>
                  )}

                  {selectedSpell.damage?.entries.map((entry, index) => (
                    <Button
                      key={`${entry.dice}-${entry.type}-${index}`}
                      variant="outline"
                      size="sm"
                      onClick={() => handleDamageRoll(index, `${entry.type} Damage`)}
                    >
                      {entry.dice} {entry.type}
                    </Button>
                  ))}
                </>
              )}
            />
          </div>
        </SheetBody>
      </SheetContent>
    </SheetRoot>
  );
}
