import type { SpellFormData } from '../SpellEditor.types';
import { Input } from '../../../Input/Input';
import { Select } from '../../../Select/Select';
import { Text } from '../../../Text/Text';
import { Surface } from '../../../Surface/Surface';
import { SPELL_SCHOOLS, SPELL_LEVELS } from '../SpellEditor.types';

interface BasicInfoSectionProps {
  formData: SpellFormData;
  onChange: (updates: Partial<SpellFormData>) => void;
  disabled?: boolean;
}

export function BasicInfoSection({ formData, onChange, disabled }: BasicInfoSectionProps) {
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
            onValueChange={(value) => onChange({ level: parseInt(value) as SpellFormData['level'] })}
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
        <div className="flex flex-wrap gap-2">
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
          <button
            type="button"
            onClick={() => {
              const newClass = prompt('Enter class name:');
              if (newClass && newClass.trim()) {
                onChange({
                  classes: [...(formData.classes || []), newClass.trim()],
                });
              }
            }}
            disabled={disabled}
            className="px-2 py-1 border border-dashed border-border rounded-md text-sm text-text-tertiary hover:text-text-primary hover:border-text-tertiary transition-colors"
          >
            + Add Class
          </button>
        </div>
      </div>
    </Surface>
  );
}
