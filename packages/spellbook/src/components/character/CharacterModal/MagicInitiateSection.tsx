import { useMemo } from 'react';
import {
  Button,
  Surface,
  Text,
  Badge,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
} from '@open20/ui';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { getAllSpells } from '@/core/content-resolver';
import type { FeatFormEntry } from './types';

const MAGIC_INITIATE_CLASSES = [
  { id: 'Cleric', label: 'Cleric' },
  { id: 'Druid', label: 'Druid' },
  { id: 'Wizard', label: 'Wizard' },
] as const;

interface MagicInitiateSectionProps {
  feats: FeatFormEntry[];
  onAdd: () => void;
  onRemove: (key: string) => void;
  onUpdate: (key: string, updates: Partial<FeatFormEntry>) => void;
}

export function MagicInitiateSection({
  feats,
  onAdd,
  onRemove,
  onUpdate,
}: MagicInitiateSectionProps) {
  const t = useTranslation();
  const allSpells = useMemo(() => getAllSpells(), []);

  const getCantrips = (classId: string) =>
    allSpells.filter((s) => s.level === 0 && s.classes?.includes(classId));

  const getLevel1Spells = (classId: string) =>
    allSpells.filter((s) => s.level === 1 && s.classes?.includes(classId));

  if (feats.length === 0) {
    return (
      <div className="pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <Text as="label" variant="labelSm" weight="black" className="tracking-[0.2em]">
            {t('feats')}
          </Text>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onAdd}
            className="h-7 text-[9px]"
          >
            <Plus className="w-3 h-3 mr-1" />
            {t('addMagicInitiate')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 space-y-4">
      <div className="flex items-center justify-between">
        <Text as="label" variant="labelSm" weight="black" className="tracking-[0.2em]">
          {t('feats')}
        </Text>
        <Button type="button" variant="ghost" size="sm" onClick={onAdd} className="h-7 text-[9px]">
          <Plus className="w-3 h-3 mr-1" />
          {t('addMagicInitiate')}
        </Button>
      </div>

      {feats.map((feat) => (
        <Surface key={feat.key} variant="default" className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">
                {t('magicInitiate')}
              </Badge>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemove(feat.key)}
              className="h-7 text-[9px] text-destructive hover:text-destructive"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              {t('removeMagicInitiate')}
            </Button>
          </div>

          <Text variant="bodySm" className="text-text-secondary">
            {t('magicInitiateDesc')}
          </Text>

          {/* Class source selector */}
          <div>
            <Text as="label" variant="formLabel">
              {t('featClassSource')}
            </Text>
            <SelectRoot
              value={feat.classId}
              onValueChange={(value) =>
                onUpdate(feat.key, { classId: value, cantrips: [], level1Spell: '' })
              }
            >
              <SelectTrigger />
              <SelectContent>
                {MAGIC_INITIATE_CLASSES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </div>

          {/* Cantrip selectors */}
          <div>
            <Text as="label" variant="formLabel">
              {t('selectCantrips')}
            </Text>
            <div className="grid grid-cols-2 gap-3">
              {[0, 1].map((index) => {
                const cantrips = getCantrips(feat.classId);
                return (
                  <SelectRoot
                    key={`${feat.key}-cantrip-${index}`}
                    value={feat.cantrips[index] ?? ''}
                    onValueChange={(value) => {
                      const updated = [...feat.cantrips];
                      updated[index] = value;
                      // Only keep unique values
                      const unique = updated
                        .filter(Boolean)
                        .filter((v, i, a) => a.indexOf(v) === i);
                      onUpdate(feat.key, { cantrips: unique });
                    }}
                  >
                    <SelectTrigger placeholder={`${t('cantrip')} ${index + 1}`} />
                    <SelectContent>
                      {cantrips.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                );
              })}
            </div>
          </div>

          {/* Level 1 spell selector */}
          <div>
            <Text as="label" variant="formLabel">
              {t('selectLevel1Spell')}
            </Text>
            <SelectRoot
              value={feat.level1Spell}
              onValueChange={(value) => onUpdate(feat.key, { level1Spell: value })}
            >
              <SelectTrigger />
              <SelectContent>
                {getLevel1Spells(feat.classId).map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </div>
        </Surface>
      ))}
    </div>
  );
}
