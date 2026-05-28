import type { SpellFormData } from '@/components/spell/editor/SpellEditor.types';
import { Input } from '@/components/Input/Input';
import { Select } from '@/components/Select/Select';
import { Text } from '@/components/Text/Text';
import { Surface } from '@/components/Surface/Surface';
import { Button } from '@/components/Button/Button';
import { useArrayField } from '@/hooks/useArrayField';

interface CantripUpgradeSectionProps {
  formData: SpellFormData;
  onChange: (updates: Partial<SpellFormData>) => void;
  disabled?: boolean;
}

export function CantripUpgradeSection({
  formData,
  onChange,
  disabled,
}: CantripUpgradeSectionProps) {
  // Only show for cantrips (level 0)
  if (formData.level !== 0) return null;

  const upgradeField = useArrayField(formData.cantripUpgrade || []);

  const handleUpgradeChange = () => {
    onChange({
      cantripUpgrade: upgradeField.items.length > 0 ? upgradeField.items : undefined,
    });
  };

  const addUpgradeEntry = () => {
    const lastLevel =
      upgradeField.items.length > 0
        ? upgradeField.items[upgradeField.items.length - 1].atCharacterLevel
        : 5;
    const nextLevel = lastLevel === 5 ? 11 : lastLevel === 11 ? 17 : 5;

    upgradeField.addItem({
      atCharacterLevel: nextLevel as 5 | 11 | 17,
      damage: [{ dice: '', type: '' }],
    });
    handleUpgradeChange();
  };

  const updateUpgradeEntry = (
    index: number,
    updates: Partial<{ atCharacterLevel: 5 | 11 | 17; damage?: { dice: string; type: string }[] }>,
  ) => {
    upgradeField.updateItem(index, (item) => ({ ...item, ...updates }));
    handleUpgradeChange();
  };

  const updateUpgradeDamage = (
    entryIndex: number,
    damageIndex: number,
    field: 'dice' | 'type',
    value: string,
  ) => {
    upgradeField.updateItem(entryIndex, (entry) => {
      const damage = [...(entry.damage || [])];
      damage[damageIndex] = { ...damage[damageIndex], [field]: value };
      return { ...entry, damage };
    });
    handleUpgradeChange();
  };

  const addUpgradeDamageEntry = (entryIndex: number) => {
    upgradeField.updateItem(entryIndex, (entry) => ({
      ...entry,
      damage: [...(entry.damage || []), { dice: '', type: '' }],
    }));
    handleUpgradeChange();
  };

  const removeUpgradeEntry = (index: number) => {
    upgradeField.removeItem(index);
    handleUpgradeChange();
  };

  const removeUpgradeDamageEntry = (entryIndex: number, damageIndex: number) => {
    upgradeField.updateItem(entryIndex, (entry) => {
      const damage = (entry.damage || []).filter((_, i) => i !== damageIndex);
      return { ...entry, damage };
    });
    handleUpgradeChange();
  };

  return (
    <Surface variant="default" padding="md" className="space-y-4">
      <Text as="h3" variant="heading" size="lg" className="text-text-primary">
        Cantrip Upgrade
      </Text>

      {/* Upgrade Text (for non-damage upgrades like Eldritch Blast) */}
      <div className="space-y-2">
        <Text as="label" variant="formLabel">
          Upgrade Text (optional)
        </Text>
        <Input
          value={formData.cantripUpgradeText || ''}
          onChange={(e) => onChange({ cantripUpgradeText: e.target.value || undefined })}
          placeholder="e.g., The beam blasts multiple targets"
          disabled={disabled}
          className="w-full"
        />
      </div>

      {/* Upgrade Entries */}
      <div className="space-y-2">
        <Text as="label" variant="formLabel">
          Damage Upgrades
        </Text>
        {(formData.cantripUpgrade || []).map((entry, index) => (
          <div key={index} className="space-y-2 p-3 bg-bg-tertiary rounded-md">
            <div className="flex items-center justify-between">
              <Select.Root
                value={entry.atCharacterLevel.toString()}
                onValueChange={(value) =>
                  updateUpgradeEntry(index, { atCharacterLevel: parseInt(value) as 5 | 11 | 17 })
                }
                disabled={disabled}
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="5">Level 5</Select.Item>
                  <Select.Item value="11">Level 11</Select.Item>
                  <Select.Item value="17">Level 17</Select.Item>
                </Select.Content>
              </Select.Root>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeUpgradeEntry(index)}
                disabled={disabled}
                className="text-danger hover:bg-danger/10"
              >
                ×
              </Button>
            </div>

            {/* Damage entries for this upgrade level */}
            {(entry.damage || []).map((dmg, dmgIndex) => (
              <div key={dmgIndex} className="flex gap-2 items-start ml-4">
                <Input
                  value={dmg.dice || ''}
                  onChange={(e) => updateUpgradeDamage(index, dmgIndex, 'dice', e.target.value)}
                  placeholder="e.g., 1d10"
                  disabled={disabled}
                  className="w-32"
                />
                <Input
                  value={dmg.type || ''}
                  onChange={(e) => updateUpgradeDamage(index, dmgIndex, 'type', e.target.value)}
                  placeholder="Damage type"
                  disabled={disabled}
                  className="flex-1"
                />
                {(entry.damage || []).length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUpgradeDamageEntry(index, dmgIndex)}
                    disabled={disabled}
                    className="text-danger hover:bg-danger/10"
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => addUpgradeDamageEntry(index)}
              disabled={disabled}
              className="text-primary-600 dark:text-primary-400 ml-4"
            >
              + Add Damage Entry
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addUpgradeEntry}
          disabled={disabled}
          className="text-primary-600 dark:text-primary-400"
        >
          + Add Upgrade Level
        </Button>
      </div>
    </Surface>
  );
}
