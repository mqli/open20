import type { SpellFormData } from '@/components/spell/editor/SpellEditor.types';
import { useState, useEffect } from 'react';
import { Input } from '@/components/Input/Input';
import { Select } from '@/components/Select/Select';
import { Text } from '@/components/Text/Text';
import { Surface } from '@/components/Surface/Surface';
import {
  SPELL_SCHOOLS,
  SPELL_LEVELS,
  DND_CLASSES,
} from '@/components/spell/editor/SpellEditor.types';

interface BasicInfoSectionProps {
  formData: SpellFormData;
  onChange: (updates: Partial<SpellFormData>) => void;
  disabled?: boolean;
}

export function BasicInfoSection({ formData, onChange, disabled }: BasicInfoSectionProps) {
  const [addClassValue, setAddClassValue] = useState('');
  const [selectKey, setSelectKey] = useState(0); // Key to force re-render of select

  // Reset select value when classes change
  useEffect(() => {
    setAddClassValue('');
    setSelectKey((prev) => prev + 1); // Force re-render to clear selection
  }, [formData.classes]);

  const handleAddClass = (value: string) => {
    if (!value || value === '__pick__') return;

    const current = formData.classes || [];
    if (!current.includes(value)) {
      onChange({ classes: [...current, value] });
    }
  };

  return (
    <Surface variant="default" padding="md" className="space-y-4">
      <Text as="h3" variant="heading" size="lg" className="text-text-primary">
        Basic Information
      </Text>

      {/* Name */}
      <div className="space-y-2">
        <Text as="label" variant="formLabel">
          Spell Name *
        </Text>
        <Input
          value={formData.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Enter spell name"
          required
          disabled={disabled}
          className="w-full"
        />
      </div>

      {/* Level & School Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Level */}
        <div className="space-y-2">
          <Text as="label" variant="formLabel">
            Level *
          </Text>
          <Select.Root
            value={formData.level.toString()}
            onValueChange={(value) =>
              onChange({ level: parseInt(value) as SpellFormData['level'] })
            }
            disabled={disabled}
          >
            <Select.Trigger />
            <Select.Content>
              {SPELL_LEVELS.map((level) => (
                <Select.Item key={level} value={level.toString()}>
                  {level === 0 ? 'Cantrip' : `Level ${level}`}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>

        {/* School */}
        <div className="space-y-2">
          <Text as="label" variant="formLabel">
            School *
          </Text>
          <Select.Root
            value={formData.school}
            onValueChange={(value) => onChange({ school: value as SpellFormData['school'] })}
            disabled={disabled}
          >
            <Select.Trigger />
            <Select.Content>
              {SPELL_SCHOOLS.map((school) => (
                <Select.Item key={school} value={school}>
                  {school}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>
      </div>

      {/* Source */}
      <div className="space-y-2">
        <Text as="label" variant="formLabel">
          Source *
        </Text>
        <Input
          value={formData.source}
          onChange={(e) => onChange({ source: e.target.value })}
          placeholder="e.g., PHB, Homebrew"
          required
          disabled={disabled}
          className="w-full"
        />
      </div>

      {/* Classes */}
      <div className="space-y-2">
        <Text as="label" variant="formLabel">
          Available Classes
        </Text>
        <div className="flex flex-wrap gap-2 items-center">
          {formData.classes?.map((className, index) => (
            <div
              key={index}
              className="flex items-center gap-1 px-2 py-1 bg-bg-tertiary rounded-md text-sm"
            >
              <span>{className}</span>
              <button
                type="button"
                onClick={() => {
                  const newClasses = [...(formData.classes || [])];
                  newClasses.splice(index, 1);
                  onChange({ classes: newClasses });
                }}
                disabled={disabled}
                className="text-text-tertiary hover:text-danger transition-colors"
              >
                ×
              </button>
            </div>
          ))}
          <Select.Root
            key={selectKey} // Force re-render when key changes
            value={addClassValue}
            onValueChange={handleAddClass}
            disabled={disabled}
          >
            <Select.Trigger placeholder="+ Add Class" />
            <Select.Content>
              <Select.Item value="__pick__">+ Add Class...</Select.Item>
              {DND_CLASSES.filter((c) => !(formData.classes || []).includes(c)).map((cls) => (
                <Select.Item key={cls} value={cls}>
                  {cls}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>
      </div>
    </Surface>
  );
}
