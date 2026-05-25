import { ArrowLeft, X } from 'lucide-react';
import {
  rollDiceExpression,
  defaultRandom,
} from 'open20-core';
import { useSpellStore } from '@/stores/spell-store';
import { useCharacterStore } from '@/stores/character-store';
import { useRollStore } from '@/stores/roll-store';
import { Button, SheetBody, SheetClose, SheetContent, SheetHeader, SheetRoot } from '@open20/ui';
import { characterService } from '@/core/character-service';
import { spellService } from '@/core/spell-service';

// Sub-components
import { SpellHeader } from './details/SpellHeader';
import { SpellStatsGrid } from './details/SpellStatsGrid';
import { SpellActionPanel } from './details/SpellActionPanel';
import { SpellContent } from './details/SpellContent';

interface ConcentrationCondition {
  id: string;
  source?: string;
}

export function SpellDetailFlyout() {
  const { selectedSpell, isDetailOpen, closeDetail } = useSpellStore();
  const { 
    activeCharacter, 
    prepareSpell, unprepareSpell, 
    learnSpell, unlearnSpell, 
    startConcentration, endConcentration,
    castSpell,
  } = useCharacterStore();
  const { addRoll } = useRollStore();

  if (!selectedSpell) return null;

  // Derived state
  const isKnown = activeCharacter ? spellService.isSpellKnown(activeCharacter, selectedSpell.id) : false;
  const isPrepared = activeCharacter ? spellService.isSpellPrepared(activeCharacter, selectedSpell.id) : false;
  const isClassSpell = activeCharacter
    ? spellService.isSpellForCharacter(activeCharacter, selectedSpell)
    : false;
  const isConcentratingOnThis = activeCharacter?.conditions.some(
    c => c.id === 'Concentrating' && (c as ConcentrationCondition).source === selectedSpell.id
  ) ?? false;

  // Calculate prepared count and max prepared for the spell's class
  let preparedCount = 0;
  let maxPrepared = 0;
  if (activeCharacter) {
    const classSpellcasting = activeCharacter.spells.classSpellcasting;
    // Find the class this spell belongs to
    const spellClasses = selectedSpell.classes ?? [];
    const matchingClassId = Object.keys(classSpellcasting).find(cls => 
      spellClasses.includes(cls)
    );
    if (matchingClassId && classSpellcasting[matchingClassId]) {
      const classData = classSpellcasting[matchingClassId];
      preparedCount = (classData.preparedSpells?.length ?? 0) + (classData.alwaysPreparedSpells?.length ?? 0);
      maxPrepared = classData.maxPrepared ?? 0;
    }
  }

  // Handlers
  const handleLearnToggle = () => isKnown ? unlearnSpell(selectedSpell.id) : learnSpell(selectedSpell.id);
  const handlePrepareToggle = () => isPrepared ? unprepareSpell(selectedSpell.id) : prepareSpell(selectedSpell.id);
  const handleConcentrationToggle = () => isConcentratingOnThis ? endConcentration() : startConcentration(selectedSpell.id);

  const handleRoll = (expression: string, label: string) => {
    const result = rollDiceExpression(defaultRandom, expression);
    addRoll({ label, expression, total: result.total });
  };

  const handleAttackRoll = () => {
    if (!activeCharacter) {
      handleRoll(`1d20 + 0`, 'Attack');
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

          <SpellHeader 
            spell={selectedSpell}
            character={activeCharacter}
            isKnown={isKnown}
            isPrepared={isPrepared}
            isClassSpell={isClassSpell}
            isConcentratingOnThis={isConcentratingOnThis}
            onLearnToggle={handleLearnToggle}
            onPrepareToggle={handlePrepareToggle}
            onConcentrationToggle={handleConcentrationToggle}
          />

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
          <SpellContent spell={selectedSpell} />
          
          <div className="my-8">
            <SpellStatsGrid spell={selectedSpell} />
          </div>

          <SpellActionPanel 
            spell={selectedSpell}
            character={activeCharacter}
            isKnown={isKnown}
            isPrepared={isPrepared}
            preparedCount={preparedCount}
            maxPrepared={maxPrepared}
            onCast={() => castSpell(selectedSpell.id, selectedSpell.level)}
            onAttackRoll={handleAttackRoll}
            onDamageRoll={handleDamageRoll}
            onPrepareToggle={handlePrepareToggle}
          />
        </SheetBody>
      </SheetContent>
    </SheetRoot>
  );
}
