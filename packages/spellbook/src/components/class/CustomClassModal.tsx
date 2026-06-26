import { useState, useCallback, useMemo } from 'react';
import {
  DialogRoot,
  DialogContent,
  DialogTitle,
  DialogClose,
  Button,
  Text,
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  Input,
  Badge,
  Surface,
  Divider,
} from '@open20/ui';
import { X, Plus, Trash2, Sparkles } from 'lucide-react';
import type { Class, Subclass, Spellcasting, AbilityName } from 'open20-core';
import { useCustomClassStore, type CustomClassEntry } from '@/stores/customClassStore';
import { useTranslation } from '@/i18n';
import { getPreset, type SlotProgressionPreset } from '@/core/slot-presets';

const ABILITIES: AbilityName[] = [
  'Strength',
  'Dexterity',
  'Constitution',
  'Intelligence',
  'Wisdom',
  'Charisma',
];

/** Generate an id-friendly slug from a display name. */
function toSlug(name: string): string {
  return name
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .toLowerCase();
}

/** Build a minimal Class object from form state. */
function buildClass(
  name: string,
  preset: SlotProgressionPreset,
  ability: AbilityName,
  knownSource: 'class_list' | 'spellbook',
  preparationTiming: 'long_rest' | 'level_up',
): Class {
  const classId = toSlug(name) || 'custom';
  const spellcasting: Spellcasting = preset.spellcasting.pactMagic
    ? {
        ability,
        knownSource,
        preparationTiming,
        changesPerPreparation: 'all',
        pactMagic: true,
        pactMagicSlots: preset.spellcasting.pactMagicSlots,
      }
    : {
        ability,
        knownSource,
        preparationTiming,
        changesPerPreparation: 'all',
      };

  const featuresByLevel = Array.from({ length: 20 }, (_, i) => {
    const lvl = i + 1;
    return {
      level: lvl,
      cantripsKnown: preset.cantripsByLevel[lvl] ?? 0,
      preparedSpells: preset.preparedByLevel[lvl] ?? 0,
      features: [],
    };
  });

  return {
    id: classId,
    name,
    source: 'Homebrew',
    hitDie: 'd8',
    savingThrowProficiencies: [],
    armorTraining: [],
    weaponProficiencies: [],
    weaponMastery: false,
    featuresByLevel,
    spellcasting,
    spellSlotsByLevel: preset.spellSlotsByLevel as Readonly<Record<number, ReadonlyArray<number>>>,
  };
}

/** Build a Subclass from form data. */
function buildSubclass(
  name: string,
  parentClassId: string,
  alwaysPrepared: { level: number; spells: string[] }[],
): Subclass {
  const id = toSlug(`${parentClassId}-${name}`) || 'custom-sub';
  return {
    id,
    parentClass: parentClassId,
    grantedAtLevel: 1,
    featuresByLevel: [],
    alwaysPreparedSpells:
      alwaysPrepared.length > 0
        ? alwaysPrepared.map((e) => ({ level: e.level, spells: e.spells as readonly string[] }))
        : undefined,
    source: 'Homebrew',
  };
}

// ── Inner form component (keyed to avoid setState-in-effect) ─

interface CustomClassFormInnerProps {
  editingEntry?: CustomClassEntry | null;
  compact?: boolean;
  onSave: (entry: CustomClassEntry) => void;
  onDelete: (classId: string) => void;
  onDismiss: () => void;
}

function CustomClassFormInner({
  editingEntry,
  compact,
  onSave,
  onDelete,
  onDismiss,
}: CustomClassFormInnerProps) {
  const t = useTranslation();
  const isEditing = !!editingEntry;

  // Compute initial values from editingEntry
  const initName = editingEntry?.class.name ?? '';
  const initAbility: AbilityName = editingEntry?.class.spellcasting?.ability ?? 'Intelligence';
  const initKnownSource: 'class_list' | 'spellbook' =
    editingEntry?.class.spellcasting?.knownSource ?? 'class_list';
  const initPrepTiming: 'long_rest' | 'level_up' =
    editingEntry?.class.spellcasting?.preparationTiming ?? 'long_rest';
  const initPresetId = editingEntry?.class.spellcasting?.pactMagic
    ? 'pact-magic'
    : editingEntry?.class.spellcasting
      ? 'full-caster'
      : 'full-caster';
  const initSubclasses =
    editingEntry?.subclasses.map((s) => ({
      id: s.id,
      name: s.id,
      alwaysPrepared:
        s.alwaysPreparedSpells?.map((e) => ({ level: e.level, spells: [...e.spells] })) ?? [],
    })) ?? [];

  const [name, setName] = useState(initName);
  const [presetId, setPresetId] = useState(initPresetId);
  const [ability, setAbility] = useState<AbilityName>(initAbility);
  const [knownSource, setKnownSource] = useState<'class_list' | 'spellbook'>(initKnownSource);
  const [preparationTiming, setPreparationTiming] = useState<'long_rest' | 'level_up'>(
    initPrepTiming,
  );
  const [subclasses, setSubclasses] =
    useState<
      Array<{ id: string; name: string; alwaysPrepared: { level: number; spells: string[] }[] }>
    >(initSubclasses);
  const [newSubclassName, setNewSubclassName] = useState('');

  const preset = useMemo(() => getPreset(presetId), [presetId]);

  const handleSave = useCallback(() => {
    if (!name.trim() || !preset) return;

    const cls = buildClass(name.trim(), preset, ability, knownSource, preparationTiming);
    const subs = subclasses.map((s) => buildSubclass(s.name || s.id, cls.id, s.alwaysPrepared));
    onSave({ class: cls, subclasses: subs });
  }, [name, preset, ability, knownSource, preparationTiming, subclasses, onSave]);

  const handleDelete = useCallback(() => {
    if (!editingEntry) return;
    if (!window.confirm(t('deleteConfirmCustomClass'))) return;
    onDelete(editingEntry.class.id);
  }, [editingEntry, onDelete, t]);

  const addSubclass = useCallback(() => {
    const trimmed = newSubclassName.trim();
    if (!trimmed) return;
    setSubclasses((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: trimmed, alwaysPrepared: [] },
    ]);
    setNewSubclassName('');
  }, [newSubclassName]);

  const removeSubclass = useCallback((id: string) => {
    setSubclasses((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const addAlwaysPreparedLevel = useCallback((subId: string, level: number, spellsStr: string) => {
    const spells = spellsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (spells.length === 0) return;
    setSubclasses((prev) =>
      prev.map((s) => {
        if (s.id !== subId) return s;
        return {
          ...s,
          alwaysPrepared: [...s.alwaysPrepared, { level, spells }],
        };
      }),
    );
  }, []);

  const removeAlwaysPreparedLevel = useCallback((subId: string, level: number) => {
    setSubclasses((prev) =>
      prev.map((s) => {
        if (s.id !== subId) return s;
        return {
          ...s,
          alwaysPrepared: s.alwaysPrepared.filter((e) => e.level !== level),
        };
      }),
    );
  }, []);

  const canSave = name.trim().length > 0 && !!preset;

  const content = (
    <div className="space-y-4">
      {/* Class Name */}
      <div>
        <Text as="label" variant="formLabel">
          {t('className')}
        </Text>
        <Input
          value={name}
          onChange={(e) => setName((e.target as HTMLInputElement).value)}
          placeholder={t('classNamePlaceholder')}
        />
      </div>

      {/* Spellcasting Ability */}
      <div>
        <Text as="label" variant="formLabel">
          {t('spellcastingAbility')}
        </Text>
        <SelectRoot value={ability} onValueChange={(v) => setAbility(v as AbilityName)}>
          <SelectTrigger />
          <SelectContent>
            {ABILITIES.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </div>

      {/* Slot Preset */}
      <div>
        <Text as="label" variant="formLabel">
          {t('slotPreset')}
        </Text>
        <SelectRoot value={presetId} onValueChange={setPresetId}>
          <SelectTrigger />
          <SelectContent>
            <SelectItem value="full-caster">{t('slotPresetFullCaster')}</SelectItem>
            <SelectItem value="half-caster">{t('slotPresetHalfCaster')}</SelectItem>
            <SelectItem value="pact-magic">{t('slotPresetPactMagic')}</SelectItem>
          </SelectContent>
        </SelectRoot>
      </div>

      {/* Known Source */}
      <div>
        <Text as="label" variant="formLabel">
          {t('knownSource')}
        </Text>
        <SelectRoot
          value={knownSource}
          onValueChange={(v) => setKnownSource(v as 'class_list' | 'spellbook')}
        >
          <SelectTrigger />
          <SelectContent>
            <SelectItem value="class_list">{t('knownSourceClassList')}</SelectItem>
            <SelectItem value="spellbook">{t('knownSourceSpellbook')}</SelectItem>
          </SelectContent>
        </SelectRoot>
      </div>

      {/* Preparation Timing */}
      <div>
        <Text as="label" variant="formLabel">
          {t('preparationTiming')}
        </Text>
        <SelectRoot
          value={preparationTiming}
          onValueChange={(v) => setPreparationTiming(v as 'long_rest' | 'level_up')}
        >
          <SelectTrigger />
          <SelectContent>
            <SelectItem value="long_rest">{t('preparationTimingLongRest')}</SelectItem>
            <SelectItem value="level_up">{t('preparationTimingLevelUp')}</SelectItem>
          </SelectContent>
        </SelectRoot>
      </div>

      <Divider />
      <Text variant="label">{t('customClassTitle')}</Text>

      {/* Subclasses */}
      <div className="space-y-3">
        {subclasses.map((sub) => (
          <Surface key={sub.id} variant="default" padding="sm" className="border">
            <div className="flex items-center justify-between mb-2">
              <Text weight="bold" size="sm">
                {sub.name}
              </Text>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-1 text-destructive"
                onClick={() => removeSubclass(sub.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
            {/* Always Prepared Spells */}
            <div className="space-y-1 ml-1">
              {sub.alwaysPrepared.map((entry) => (
                <div key={entry.level} className="flex items-center gap-1">
                  <Badge variant="info" size="xs" className="shrink-0">
                    Lv{entry.level}
                  </Badge>
                  <Text variant="caption" className="flex-1 truncate">
                    {entry.spells.join(', ')}
                  </Text>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 px-0.5"
                    onClick={() => removeAlwaysPreparedLevel(sub.id, entry.level)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              <AddAlwaysPreparedRow
                onAdd={(level, spells) => addAlwaysPreparedLevel(sub.id, level, spells)}
              />
            </div>
          </Surface>
        ))}

        {/* Add subclass row */}
        <div className="flex items-center gap-2">
          <Input
            value={newSubclassName}
            onChange={(e) => setNewSubclassName((e.target as HTMLInputElement).value)}
            placeholder={t('subclassNamePlaceholder')}
            className="flex-1 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') addSubclass();
            }}
          />
          <Button variant="secondary" size="sm" onClick={addSubclass}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            {t('add')}
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <div>
          {isEditing && (
            <Button variant="danger" size="sm" onClick={handleDelete}>
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              {t('deleteCustomClass')}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            {t('cancel')}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={!canSave}>
            {t('saveSpell')}
          </Button>
        </div>
      </div>
    </div>
  );

  if (compact) {
    return <>{content}</>;
  }

  return content;
}

// ── Outer modal wrapper (forces remount via key when form resets) ─

interface CustomClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If set, pre-populate the form for editing. */
  editingEntry?: CustomClassEntry | null;
  /** Compact render (for use in dropdown flyout, no full dialog). */
  compact?: boolean;
}

export function CustomClassModal({
  open,
  onOpenChange,
  editingEntry,
  compact,
}: CustomClassModalProps) {
  const { saveClass, deleteClass } = useCustomClassStore();
  const t = useTranslation();
  const isEditing = !!editingEntry;

  // Key forces full remount when modal opens or editing target changes,
  // avoiding setState-in-effect lint issues.
  const formKey = open ? (editingEntry?.class.id ?? 'new') : 'closed';

  const handleSave = useCallback(
    (entry: CustomClassEntry) => {
      saveClass(entry);
      onOpenChange(false);
    },
    [saveClass, onOpenChange],
  );

  const handleDelete = useCallback(
    (classId: string) => {
      deleteClass(classId);
      onOpenChange(false);
    },
    [deleteClass, onOpenChange],
  );

  if (compact) {
    return (
      <CustomClassFormInner
        key={formKey}
        editingEntry={editingEntry}
        compact
        onSave={handleSave}
        onDelete={handleDelete}
        onDismiss={() => onOpenChange(false)}
      />
    );
  }

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <div className="flex justify-between items-center mb-4">
          <DialogTitle>
            <Sparkles className="w-4 h-4 mr-1 inline" />
            {isEditing ? t('editCustomClass') : t('createCustomClass')}
          </DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="sm" className="p-1">
              <X className="w-4 h-4" />
            </Button>
          </DialogClose>
        </div>
        <CustomClassFormInner
          key={formKey}
          editingEntry={editingEntry}
          onSave={handleSave}
          onDelete={handleDelete}
          onDismiss={() => onOpenChange(false)}
        />
      </DialogContent>
    </DialogRoot>
  );
}

// ── Inline helper: add always-prepared spell entry ──────────

function AddAlwaysPreparedRow({ onAdd }: { onAdd: (level: number, spells: string) => void }) {
  const [level, setLevel] = useState('3');
  const [spells, setSpells] = useState('');

  const handleAdd = () => {
    const lvl = parseInt(level, 10);
    if (isNaN(lvl) || lvl < 1 || !spells.trim()) return;
    onAdd(lvl, spells.trim());
    setSpells('');
  };

  return (
    <div className="flex items-center gap-1 mt-1">
      <input
        type="number"
        className="w-12 px-1 py-0.5 text-xs border rounded bg-bg-secondary text-text-primary"
        value={level}
        onChange={(e) => setLevel((e.target as HTMLInputElement).value)}
        min={1}
        max={20}
      />
      <input
        type="text"
        className="flex-1 px-1.5 py-0.5 text-xs border rounded bg-bg-secondary text-text-primary"
        placeholder="spell-id, spell-id"
        value={spells}
        onChange={(e) => setSpells((e.target as HTMLInputElement).value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleAdd();
        }}
      />
      <Button variant="ghost" size="sm" className="h-5 px-1 shrink-0" onClick={handleAdd}>
        <Plus className="w-3 h-3" />
      </Button>
    </div>
  );
}
