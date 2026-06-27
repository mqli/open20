import { useState, useCallback, useMemo } from 'react';
import {
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
import { X, Plus, Trash2 } from 'lucide-react';
import type { AbilityName } from 'open20-core';
import type { CustomClassEntry } from '@/stores/customClassStore';
import { useTranslation } from '@/i18n';
import { getPreset } from '@/core/slot-presets';
import { ABILITIES, buildClass, buildSubclass } from './builders';
import { AddAlwaysPreparedRow } from './AddAlwaysPreparedRow';

// ── Inner form component (keyed to avoid setState-in-effect) ─

export interface CustomClassFormInnerProps {
  editingEntry?: CustomClassEntry | null;
  compact?: boolean;
  onSave: (entry: CustomClassEntry) => void;
  onDelete: (classId: string) => void;
  onDismiss: () => void;
}

export function CustomClassFormInner({
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
    const subs = subclasses.map((s) => buildSubclass(s.id, cls.id, s.alwaysPrepared));
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
    // Guard against duplicate subclass names
    if (subclasses.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return;
    setSubclasses((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: trimmed, alwaysPrepared: [] },
    ]);
    setNewSubclassName('');
  }, [newSubclassName, subclasses]);

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
