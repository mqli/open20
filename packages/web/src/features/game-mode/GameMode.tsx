import { useState } from 'react';
import { useCharacter, useLocale } from '@/hooks';
import { CombatStats, HPDisplay, ResourceTracker, SpellSlotTracker, ConditionBar, WeaponList, SkillChips, ConditionPicker } from '@/components';
import { Button } from '@/components/ui';
import { HPModifyPanel } from './HPModifyPanel';
import { ShortRestDialog } from './ShortRestDialog';
import { LongRestDialog } from './LongRestDialog';
import { Settings, Swords } from 'lucide-react';
import type { Resource } from '@/types/open20-core';

export function GameMode() {
  const { t } = useLocale();
  const {
    character,
    hitPoints,
    combatStats,
    resources,
    conditions,
    spells,
    skills,
    abilityScores,
    proficiencyBonus,
    useResource,
    recoverResource,
    castSpell,
    recoverSpellSlot,
    toggleCondition,
    doShortRest,
    doLongRest,
  } = useCharacter();

  const [showHP, setShowHP] = useState(false);
  const [showShortRest, setShowShortRest] = useState(false);
  const [showLongRest, setShowLongRest] = useState(false);
  const [showConditionPicker, setShowConditionPicker] = useState(false);

  if (!character || !hitPoints || !combatStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[--color-text-secondary]">{t('common.loading')}</p>
      </div>
    );
  }

  const classInfo = character.classes[0];
  const attacks = combatStats.attacks || [];

  const handleSkillClick = (_skillName: string, modifier: number) => {
    const mod = modifier >= 0 ? `+${modifier}` : `${modifier}`;
    const roll = `1d20${mod}`;
    navigator.clipboard.writeText(roll);
  };

  return (
    <div className="min-h-screen bg-[--color-bg-primary] text-[--color-text-primary]">
      {/* Header */}
      <header className="border-b border-[--color-border] sticky top-0 z-10 bg-[--color-bg-primary] w-full">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[--color-bg-elevated] flex items-center justify-center shrink-0">
                <Swords className="w-5 h-5 text-[--color-accent-gold]" />
              </div>
              <div className="min-w-0">
                <h1 className="font-semibold truncate">{character.name}</h1>
                <p className="text-sm text-[--color-text-secondary] truncate">
                  {character.species} {classInfo?.classId} {classInfo?.level}
                </p>
              </div>
            </div>
            <a href="/settings" className="shrink-0">
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6 w-full pb-8">
        {/* Combat Stats */}
        <section>
          <CombatStats combatStats={combatStats} />
        </section>

        {/* HP */}
        <section>
          <HPDisplay hitPoints={hitPoints} onTap={() => setShowHP(true)} />
        </section>

        {/* Weapons */}
        {attacks.length > 0 && (
          <WeaponList
            attacks={attacks}
            onAttack={(attack) => {
              const mod = attack.attackBonus >= 0 ? `+${attack.attackBonus}` : `${attack.attackBonus}`;
              navigator.clipboard.writeText(`1d20${mod}`);
            }}
          />
        )}

        {/* Skills */}
        {skills && abilityScores && (
          <SkillChips
            skills={skills}
            abilityScores={abilityScores}
            proficiencyBonus={proficiencyBonus}
            onSkillClick={handleSkillClick}
          />
        )}

        {/* Resources */}
        {resources && resources.length > 0 && (
          <section className="w-full bg-[--color-bg-surface] rounded-lg p-4 border border-[--color-border]">
            <h2 className="text-sm font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-2">
              {t('gameMode.resources')}
            </h2>
            {resources.map((resource: Resource) => (
              <ResourceTracker
                key={resource.id}
                resource={resource}
                onUse={() => useResource(resource.id)}
                onRecover={() => recoverResource(resource.id)}
              />
            ))}
          </section>
        )}

        {/* Spell Slots */}
        {spells?.slots && Object.keys(spells.slots).length > 0 && (
          <section className="w-full bg-[--color-bg-surface] rounded-lg p-4 border border-[--color-border]">
            <h2 className="text-sm font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-2">
              {t('gameMode.spellSlots')}
            </h2>
            <SpellSlotTracker
              slots={spells.slots}
              onConsume={castSpell}
              onRecover={recoverSpellSlot}
            />
          </section>
        )}

        {/* Conditions */}
        <section className="w-full bg-[--color-bg-surface] rounded-lg p-4 border border-[--color-border]">
          <h2 className="text-sm font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-2">
            {t('gameMode.conditions')}
          </h2>
          <ConditionBar
            conditions={conditions || []}
            onToggle={toggleCondition}
            onAdd={() => setShowConditionPicker(true)}
          />
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-2 gap-3">
          <Button onClick={() => setShowShortRest(true)} className="w-full">
            {t('gameMode.shortRest')}
          </Button>
          <Button onClick={() => setShowLongRest(true)} className="w-full">
            {t('gameMode.longRest')}
          </Button>
        </section>
      </main>

      {/* Dialogs */}
      <HPModifyPanel open={showHP} onOpenChange={setShowHP} />
      <ShortRestDialog open={showShortRest} onOpenChange={setShowShortRest} onConfirm={doShortRest} />
      <LongRestDialog open={showLongRest} onOpenChange={setShowLongRest} onConfirm={doLongRest} />
      <ConditionPicker
        open={showConditionPicker}
        onOpenChange={setShowConditionPicker}
        activeConditions={(conditions || []).map((c) => c.name)}
        onToggle={toggleCondition}
      />
    </div>
  );
}
