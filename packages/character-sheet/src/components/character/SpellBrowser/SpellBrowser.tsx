// SpellBrowser.tsx
// Searchable dialog to browse the full spell list and manage spells for a character.
// Uses useSpellCapabilities from @open20/ui for button visibility logic.

import { useState, useMemo, useCallback } from 'react';
import { Search, Sparkles } from 'lucide-react';
import type { Spell, SpellLevel, SpellSchool } from 'open20-core';
import { SPELL_SCHOOLS } from 'open20-core';
import { Text, Button, Badge, Input, Dialog, Divider, EmptyState } from '@open20/ui';
import { useSpellCapabilities } from '@open20/ui';
import type { SpellCapabilities } from '@open20/ui';
import type { AppCharacter } from '@/types';
import { searchSpells, getClassName } from '@/core/content-resolver';
import { resolveDeps } from '@/core/content-resolver';

export interface SpellBrowserProps {
  character: AppCharacter;
  open: boolean;
  onClose: () => void;
  onPrepareSpell: (spellId: string) => void;
  onUnprepareSpell: (spellId: string) => void;
  onLearnSpell: (spellId: string) => void;
  onUnlearnSpell: (spellId: string) => void;
  onLearnCantrip: (classId: string, spellId: string) => void;
  onUnlearnCantrip: (classId: string, spellId: string) => void;
}

function schoolAbbr(school: SpellSchool): string {
  const map: Record<SpellSchool, string> = {
    Abjuration: 'Abj',
    Conjuration: 'Con',
    Divination: 'Div',
    Enchantment: 'Enc',
    Evocation: 'Evo',
    Illusion: 'Ill',
    Necromancy: 'Nec',
    Transmutation: 'Trs',
  };
  return map[school] ?? school.slice(0, 3);
}

export function SpellBrowser({
  character,
  open,
  onClose,
  onPrepareSpell,
  onUnprepareSpell,
  onLearnSpell,
  onUnlearnSpell,
  onLearnCantrip,
  onUnlearnCantrip,
}: SpellBrowserProps) {
  const [query, setQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<SpellLevel | 'all'>('all');
  const [filterSchool, setFilterSchool] = useState<SpellSchool | 'all'>('all');

  const deps = useMemo(() => resolveDeps(character), [character]);

  // Search with current filters
  const results = useMemo(() => {
    const filters: Parameters<typeof searchSpells>[0] = {};
    if (query.trim()) filters.name = query.trim();
    if (filterLevel !== 'all') filters.level = [filterLevel];
    if (filterSchool !== 'all') filters.school = [filterSchool];

    let all = searchSpells(filters);

    // Sort: cantrips first, then by level, then alphabetically
    all = [...all].sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return a.name.localeCompare(b.name);
    });

    return all;
  }, [query, filterLevel, filterSchool]);

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Content size="xl">
        <Dialog.Header>
          <div className="flex items-center justify-between">
            <Dialog.Title>Spell Browser</Dialog.Title>
            <Dialog.Close />
          </div>
          <Dialog.Description>
            Browse spells and add them to your character's spellbook.
          </Dialog.Description>
        </Dialog.Header>

        {/* Search + Filters */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search spells by name..."
              className="pl-9"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {/* Level filter */}
            <select
              className="rounded-md border border-border bg-bg-primary px-2 py-1.5 text-sm"
              value={filterLevel === 'all' ? 'all' : String(filterLevel)}
              onChange={(e) =>
                setFilterLevel(
                  e.target.value === 'all' ? 'all' : (Number(e.target.value) as SpellLevel),
                )
              }
            >
              <option value="all">All Levels</option>
              <option value="0">Cantrip</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl === 1 ? '1st' : lvl === 2 ? '2nd' : lvl === 3 ? '3rd' : `${lvl}th`} Level
                </option>
              ))}
            </select>

            {/* School filter */}
            <select
              className="rounded-md border border-border bg-bg-primary px-2 py-1.5 text-sm"
              value={filterSchool}
              onChange={(e) => setFilterSchool(e.target.value as SpellSchool | 'all')}
            >
              <option value="all">All Schools</option>
              {SPELL_SCHOOLS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Clear filters */}
            {(query || filterLevel !== 'all' || filterSchool !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQuery('');
                  setFilterLevel('all');
                  setFilterSchool('all');
                }}
              >
                Clear
              </Button>
            )}

            <Text variant="bodySm" color="secondary" className="ml-auto self-center">
              {results.length} spells
            </Text>
          </div>
        </div>

        <Divider className="mb-2" />

        {/* Results list */}
        {results.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="w-8 h-8" />}
            title="No spells found"
            description="Try adjusting your search or filters."
          />
        ) : (
          <div className="max-h-[50vh] overflow-y-auto divide-y divide-border">
            {results.map((spell) => (
              <SpellBrowserRow
                key={spell.id}
                spell={spell}
                character={character}
                deps={deps}
                onPrepareSpell={onPrepareSpell}
                onUnprepareSpell={onUnprepareSpell}
                onLearnSpell={onLearnSpell}
                onUnlearnSpell={onUnlearnSpell}
                onLearnCantrip={onLearnCantrip}
                onUnlearnCantrip={onUnlearnCantrip}
              />
            ))}
          </div>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}

// ── Per-spell row with action buttons ─────────────────────

interface SpellBrowserRowProps {
  spell: Spell;
  character: AppCharacter;
  deps: Parameters<typeof useSpellCapabilities>[2];
  onPrepareSpell: (spellId: string) => void;
  onUnprepareSpell: (spellId: string) => void;
  onLearnSpell: (spellId: string) => void;
  onUnlearnSpell: (spellId: string) => void;
  onLearnCantrip: (classId: string, spellId: string) => void;
  onUnlearnCantrip: (classId: string, spellId: string) => void;
}

function SpellBrowserRow({
  spell,
  character,
  deps,
  onPrepareSpell,
  onUnprepareSpell,
  onLearnSpell,
  onUnlearnSpell,
  onLearnCantrip,
  onUnlearnCantrip,
}: SpellBrowserRowProps) {
  const caps = useSpellCapabilities(spell, character, deps);

  const handlePrepareToggle = useCallback(() => {
    if (caps.isPrepared) {
      onUnprepareSpell(spell.id);
    } else {
      onPrepareSpell(spell.id);
    }
  }, [caps.isPrepared, spell.id, onPrepareSpell, onUnprepareSpell]);

  const handleLearnToggle = useCallback(() => {
    if (caps.isKnown) {
      onUnlearnSpell(spell.id);
    } else {
      onLearnSpell(spell.id);
    }
  }, [caps.isKnown, spell.id, onLearnSpell, onUnlearnSpell]);

  const handleCantripToggle = useCallback(
    (classId: string) => {
      if (caps.cantripKnownClassIds.includes(classId)) {
        onUnlearnCantrip(classId, spell.id);
      } else {
        onLearnCantrip(classId, spell.id);
      }
    },
    [caps.cantripKnownClassIds, spell.id, onLearnCantrip, onUnlearnCantrip],
  );

  return (
    <div className="flex items-center gap-3 py-2 px-1 hover:bg-bg-tertiary/50 rounded transition-colors">
      {/* Spell info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Text variant="bodySm" weight="medium" className="truncate">
            {spell.name}
          </Text>
          <Badge variant={spell.level === 0 ? 'info' : 'secondary'} size="sm">
            {spell.level === 0 ? 'Cantrip' : `Lv${spell.level}`}
          </Badge>
          <Text variant="caption" color="secondary">
            {schoolAbbr(spell.school)}
          </Text>
          {spell.ritual && (
            <Text variant="caption" color="secondary">
              Ritual
            </Text>
          )}
          {spell.concentration && (
            <Text variant="caption" color="secondary">
              Conc.
            </Text>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Cantrip button */}
        {caps.showCantripButton && <CantripButton caps={caps} onToggle={handleCantripToggle} />}

        {/* Learn button */}
        {caps.showLearnButton && (
          <Button
            variant={caps.isKnown ? 'primary' : 'outline'}
            size="sm"
            onClick={handleLearnToggle}
          >
            {caps.isKnown ? 'Forget' : 'Learn'}
          </Button>
        )}

        {/* Prepare button */}
        {caps.showPrepareButton && (
          <Button
            variant={caps.isPrepared ? 'primary' : 'outline'}
            size="sm"
            onClick={handlePrepareToggle}
            disabled={caps.alwaysPreparedClassIds.length > 0}
          >
            {caps.alwaysPreparedClassIds.length > 0
              ? 'Always'
              : caps.isPrepared
                ? 'Unprepare'
                : 'Prepare'}
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Cantrip multiclass-aware button ───────────────────────

interface CantripButtonProps {
  caps: SpellCapabilities;
  onToggle: (classId: string) => void;
}

function CantripButton({ caps, onToggle }: CantripButtonProps) {
  const classIds = caps.accessibleClassIds;

  // Single class: simple toggle
  if (classIds.length <= 1) {
    const classId = classIds[0];
    const isKnown = classId ? caps.cantripKnownClassIds.includes(classId) : false;
    return (
      <Button
        variant={isKnown ? 'primary' : 'outline'}
        size="sm"
        onClick={() => classId && onToggle(classId)}
      >
        {isKnown ? 'Remove' : 'Learn'}
      </Button>
    );
  }

  // Multi-class: show per-class buttons
  return (
    <div className="flex items-center gap-1">
      <Text variant="caption" color="secondary">
        Cantrip
      </Text>
      {classIds.map((classId) => {
        const isKnown = caps.cantripKnownClassIds.includes(classId);
        const className = getClassName(classId);
        return (
          <Button
            key={classId}
            variant={isKnown ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onToggle(classId)}
          >
            {isKnown ? `-${className}` : `+${className}`}
          </Button>
        );
      })}
    </div>
  );
}
