import type { MonsterFormData } from '../MonsterEditor.types';
import type { MonsterSize, MonsterType } from 'open20-core/types';
import { MONSTER_SIZES, MONSTER_TYPES } from '../MonsterEditor.types';
import { Input } from '@/components/base/Input/Input';
import { Select } from '@/components/base/Select/Select';
import { Text } from '@/components/base/Text/Text';
import { Surface } from '@/components/base/Surface/Surface';

interface BasicInfoSectionProps {
  formData: MonsterFormData;
  onChange: (updates: Partial<MonsterFormData>) => void;
  disabled?: boolean;
}

export function BasicInfoSection({ formData, onChange, disabled }: BasicInfoSectionProps) {
  return (
    <Surface variant="default" padding="md" className="space-y-4">
      <Text as="h3" variant="heading" size="lg" className="text-text-primary">
        Basic Information
      </Text>

      {/* Name & ID row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Text as="label" variant="formLabel">
            Name *
          </Text>
          <Input
            value={formData.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Monster name"
            required
            disabled={disabled}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Text as="label" variant="formLabel">
            ID *
          </Text>
          <Input
            value={formData.id}
            onChange={(e) => onChange({ id: e.target.value })}
            placeholder="unique-monster-id"
            required
            disabled={disabled}
            className="w-full"
          />
        </div>
      </div>

      {/* Size & Type row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Text as="label" variant="formLabel">
            Size *
          </Text>
          <Select.Root
            value={formData.size}
            onValueChange={(value) => onChange({ size: value as MonsterSize })}
            disabled={disabled}
          >
            <Select.Trigger />
            <Select.Content>
              {MONSTER_SIZES.map((size) => (
                <Select.Item key={size} value={size}>
                  {size}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>
        <div className="space-y-2">
          <Text as="label" variant="formLabel">
            Type *
          </Text>
          <Select.Root
            value={formData.type}
            onValueChange={(value) => onChange({ type: value as MonsterType })}
            disabled={disabled}
          >
            <Select.Trigger />
            <Select.Content>
              {MONSTER_TYPES.map((type) => (
                <Select.Item key={type} value={type}>
                  {type}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>
      </div>

      {/* Alignment & Source row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Text as="label" variant="formLabel">
            Alignment
          </Text>
          <Input
            value={formData.alignment}
            onChange={(e) => onChange({ alignment: e.target.value })}
            placeholder="e.g., Chaotic Evil"
            disabled={disabled}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Text as="label" variant="formLabel">
            Source
          </Text>
          <Input
            value={formData.source}
            onChange={(e) => onChange({ source: e.target.value })}
            placeholder="e.g., Monster Manual, Homebrew"
            disabled={disabled}
            className="w-full"
          />
        </div>
      </div>

      {/* Descriptive Tags */}
      <div className="space-y-2">
        <Text as="label" variant="formLabel">
          Descriptive Tags
        </Text>
        <Input
          value={formData.descriptiveTags.join(', ')}
          onChange={(e) =>
            onChange({
              descriptiveTags: e.target.value
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
            })
          }
          placeholder="e.g., Chromatic, Shapechanger (comma separated)"
          disabled={disabled}
          className="w-full"
        />
      </div>
    </Surface>
  );
}
