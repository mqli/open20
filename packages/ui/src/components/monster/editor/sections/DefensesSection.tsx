import type { MonsterFormData } from '../MonsterEditor.types';
import { useState } from 'react';
import { Input } from '@/components/base/Input/Input';
import { Select } from '@/components/base/Select/Select';
import { Text } from '@/components/base/Text/Text';
import { Surface } from '@/components/base/Surface/Surface';
import { ABILITY_NAMES, ALL_DAMAGE_TYPES_LIST } from '../MonsterEditor.types';

interface DefensesSectionProps {
  formData: MonsterFormData;
  onChange: (updates: Partial<MonsterFormData>) => void;
  disabled?: boolean;
}

export function DefensesSection({ formData, onChange, disabled }: DefensesSectionProps) {
  const [newSaveAbility, setNewSaveAbility] = useState('');
  const [newSkillName, setNewSkillName] = useState('');

  const handleAddSavingThrow = (ability: string) => {
    if (!ability || ability === '__pick__') return;
    if (!(ability in formData.savingThrows)) {
      onChange({ savingThrows: { ...formData.savingThrows, [ability]: 0 } });
    }
    setNewSaveAbility('');
  };

  const handleRemoveSavingThrow = (ability: string) => {
    const updated = { ...formData.savingThrows };
    delete updated[ability];
    onChange({ savingThrows: updated });
  };

  const handleUpdateSavingThrow = (ability: string, value: number) => {
    onChange({ savingThrows: { ...formData.savingThrows, [ability]: value } });
  };

  const handleAddSkill = (skill: string) => {
    if (!skill.trim()) return;
    if (!(skill in formData.skills)) {
      onChange({ skills: { ...formData.skills, [skill.trim()]: 0 } });
    }
    setNewSkillName('');
  };

  const handleRemoveSkill = (skill: string) => {
    const updated = { ...formData.skills };
    delete updated[skill];
    onChange({ skills: updated });
  };

  const handleUpdateSkill = (skill: string, value: number) => {
    onChange({ skills: { ...formData.skills, [skill]: value } });
  };

  return (
    <Surface variant="default" padding="md" className="space-y-4">
      <Text as="h3" variant="heading" size="lg" className="text-text-primary">
        Defenses
      </Text>

      {/* Saving Throws */}
      <div className="space-y-2">
        <Text as="label" variant="formLabel">
          Saving Throws
        </Text>
        {Object.entries(formData.savingThrows).map(([ability, bonus]) => (
          <div key={ability} className="flex items-center gap-2">
            <span className="w-24 text-sm font-medium">{ability}</span>
            <Input
              type="number"
              value={bonus}
              onChange={(e) => handleUpdateSavingThrow(ability, Number(e.target.value))}
              disabled={disabled}
              className="w-20"
            />
            <button
              type="button"
              onClick={() => handleRemoveSavingThrow(ability)}
              disabled={disabled}
              className="text-text-tertiary hover:text-danger transition-colors text-sm"
            >
              ×
            </button>
          </div>
        ))}
        <Select.Root
          value={newSaveAbility}
          onValueChange={handleAddSavingThrow}
          disabled={disabled}
        >
          <Select.Trigger placeholder="+ Add saving throw" />
          <Select.Content>
            <Select.Item value="__pick__">+ Add saving throw...</Select.Item>
            {ABILITY_NAMES.filter((a) => !(a in formData.savingThrows)).map((ability) => (
              <Select.Item key={ability} value={ability}>
                {ability}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </div>

      {/* Skills */}
      <div className="space-y-2">
        <Text as="label" variant="formLabel">
          Skills
        </Text>
        {Object.entries(formData.skills).map(([skill, bonus]) => (
          <div key={skill} className="flex items-center gap-2">
            <span className="w-32 text-sm font-medium">{skill}</span>
            <Input
              type="number"
              value={bonus}
              onChange={(e) => handleUpdateSkill(skill, Number(e.target.value))}
              disabled={disabled}
              className="w-20"
            />
            <button
              type="button"
              onClick={() => handleRemoveSkill(skill)}
              disabled={disabled}
              className="text-text-tertiary hover:text-danger transition-colors text-sm"
            >
              ×
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <Input
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            placeholder="Skill name (e.g., Perception)"
            disabled={disabled}
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => handleAddSkill(newSkillName)}
            disabled={disabled || !newSkillName.trim()}
            className="text-sm text-primary-500 hover:text-primary-400 transition-colors"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Damage Resistances */}
      <div className="space-y-2">
        <Text as="label" variant="formLabel">
          Damage Resistances
        </Text>
        <div className="flex flex-wrap gap-2">
          {ALL_DAMAGE_TYPES_LIST.map((dt: string) => {
            const selected = formData.resistances.includes(dt as never);
            return (
              <button
                key={dt}
                type="button"
                onClick={() =>
                  onChange({
                    resistances: selected
                      ? formData.resistances.filter((r) => r !== dt)
                      : [...formData.resistances, dt as never],
                  })
                }
                disabled={disabled}
                className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                  selected
                    ? 'bg-blue-100 border-blue-400 text-blue-800'
                    : 'bg-bg-secondary border-border text-text-secondary hover:border-blue-300'
                }`}
              >
                {dt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Damage Vulnerabilities */}
      <div className="space-y-2">
        <Text as="label" variant="formLabel">
          Damage Vulnerabilities
        </Text>
        <div className="flex flex-wrap gap-2">
          {ALL_DAMAGE_TYPES_LIST.map((dt: string) => {
            const selected = formData.vulnerabilities.includes(dt as never);
            return (
              <button
                key={dt}
                type="button"
                onClick={() =>
                  onChange({
                    vulnerabilities: selected
                      ? formData.vulnerabilities.filter((v) => v !== dt)
                      : [...formData.vulnerabilities, dt as never],
                  })
                }
                disabled={disabled}
                className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                  selected
                    ? 'bg-red-100 border-red-400 text-red-800'
                    : 'bg-bg-secondary border-border text-text-secondary hover:border-red-300'
                }`}
              >
                {dt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Damage Immunities */}
      <div className="space-y-2">
        <Text as="label" variant="formLabel">
          Damage Immunities
        </Text>
        <div className="flex flex-wrap gap-2">
          {ALL_DAMAGE_TYPES_LIST.map((dt: string) => {
            const selected = formData.damageImmunities.includes(dt as never);
            return (
              <button
                key={dt}
                type="button"
                onClick={() =>
                  onChange({
                    damageImmunities: selected
                      ? formData.damageImmunities.filter((i) => i !== dt)
                      : [...formData.damageImmunities, dt as never],
                  })
                }
                disabled={disabled}
                className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                  selected
                    ? 'bg-green-100 border-green-400 text-green-800'
                    : 'bg-bg-secondary border-border text-text-secondary hover:border-green-300'
                }`}
              >
                {dt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Condition Immunities */}
      <div className="space-y-2">
        <Text as="label" variant="formLabel">
          Condition Immunities
        </Text>
        <Input
          value={formData.conditionImmunities.join(', ')}
          onChange={(e) =>
            onChange({
              conditionImmunities: e.target.value
                .split(',')
                .map((c) => c.trim())
                .filter(Boolean),
            })
          }
          placeholder="e.g., Charmed, Frightened (comma separated)"
          disabled={disabled}
          className="w-full"
        />
      </div>
    </Surface>
  );
}
