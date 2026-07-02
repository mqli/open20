import { useMemo } from 'react';
import {
  Surface,
  Text,
  Switch,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
} from '@open20/ui';
import { useTranslation } from '@/i18n';
import { getAllSpells } from '@/core/content-resolver';
import type { FeatFormEntry } from './types';

const MAGIC_INITIATE_CLASSES = [
  { id: 'Cleric', label: 'Cleric' },
  { id: 'Druid', label: 'Druid' },
  { id: 'Wizard', label: 'Wizard' },
] as const;

interface MagicInitiateSectionProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  feat: FeatFormEntry;
  onUpdate: (updates: Partial<FeatFormEntry>) => void;
}

export function MagicInitiateSection({
  enabled,
  onToggle,
  feat,
  onUpdate,
}: MagicInitiateSectionProps) {
  const t = useTranslation();
  const allSpells = useMemo(() => getAllSpells(), []);

  const getCantrips = (classId: string) =>
    allSpells.filter((s) => s.level === 0 && s.classes?.includes(classId));

  const getLevel1Spells = (classId: string) =>
    allSpells.filter((s) => s.level === 1 && s.classes?.includes(classId));

  return (
    <div className="space-y-4">
      {/* Toggle row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Text variant="labelSm" weight="black" className="tracking-[0.2em]">
            {t('feats')}
          </Text>
          <Text variant="bodySm" className="text-text-secondary">
            {t('magicInitiate')}
          </Text>
        </div>
        <Switch checked={enabled} onCheckedChange={onToggle} data-testid="magic-initiate-switch" />
      </div>

      {/* Expanded form */}
      {enabled && (
        <Surface variant="default" className="p-4 space-y-4">
          <Text variant="bodySm" className="text-text-secondary">
            {t('magicInitiateDesc')}
          </Text>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Class source selector */}
            <div>
              <Text as="label" variant="formLabel">
                {t('featClassSource')}
              </Text>
              <SelectRoot
                value={feat.classId}
                onValueChange={(value) =>
                  onUpdate({ classId: value, cantrips: [], level1Spell: '' })
                }
              >
                <SelectTrigger data-testid="mi-class-source" />
                <SelectContent>
                  {MAGIC_INITIATE_CLASSES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </div>

            {/* Level 1 spell selector */}
            <div>
              <Text as="label" variant="formLabel">
                {t('selectLevel1Spell')}
              </Text>
              <SelectRoot
                value={feat.level1Spell}
                onValueChange={(value) => onUpdate({ level1Spell: value })}
              >
                <SelectTrigger data-testid="mi-level1-select" />
                <SelectContent>
                  {getLevel1Spells(feat.classId).map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </div>
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
                    key={`cantrip-${index}`}
                    value={feat.cantrips[index] ?? ''}
                    onValueChange={(value) => {
                      const updated = [...feat.cantrips];
                      updated[index] = value;
                      const unique = updated
                        .filter(Boolean)
                        .filter((v, i, a) => a.indexOf(v) === i);
                      onUpdate({ cantrips: unique });
                    }}
                  >
                    <SelectTrigger
                      data-testid={`mi-cantrip-${index}`}
                      placeholder={`${t('cantrip')} ${index + 1}`}
                    />
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
        </Surface>
      )}
    </div>
  );
}
