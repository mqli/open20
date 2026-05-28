import type { SpellFormData } from '@open20/ui/components/spell/editor/SpellEditor.types';
import { Input } from '@open20/ui/components/Input/Input';
import { Select } from '@open20/ui/components/Select/Select';
import { Switch } from '@open20/ui/components/Switch/Switch';
import { Text } from '@open20/ui/components/Text/Text';
import { Surface } from '@open20/ui/components/Surface/Surface';
import { CASTING_TIMES, SPELL_COMPONENTS } from '@open20/ui/components/spell/editor/SpellEditor.types';
import { cn } from '@open20/ui/lib/cn';

interface CastingInfoSectionProps {
  formData: SpellFormData;
  onChange: (updates: Partial<SpellFormData>) => void;
  disabled?: boolean;
}

export function CastingInfoSection({ formData, onChange, disabled }: CastingInfoSectionProps) {
  const toggleComponent = (component: string) => {
    const current = formData.components as string[];
    const next = current.includes(component)
      ? current.filter((c) => c !== component)
      : [...current, component];
    onChange({ components: next as SpellFormData['components'] });
  };

  return (
    <Surface variant="default" padding="md" className="space-y-4">
      <Text as="h3" variant="heading" size="lg" className="text-text-primary">
        Casting Information
      </Text>

      {/* Casting Time */}
      <div className="space-y-2">
        <Text as="label" variant="formLabel">
          Casting Time *
        </Text>
        <Select.Root
          value={formData.castingTime}
          onValueChange={(value) => onChange({ castingTime: value as SpellFormData['castingTime'] })}
          disabled={disabled}
        >
          <Select.Trigger />
          <Select.Content>
            {CASTING_TIMES.map((time) => (
              <Select.Item key={time} value={time}>
                {time}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </div>

      {/* Range */}
      <div className="space-y-2">
        <Text as="label" variant="formLabel">
          Range *
        </Text>
        <Input
          value={formData.range}
          onChange={(e) => onChange({ range: e.target.value })}
          placeholder="e.g., 60 feet, Self, Touch"
          required
          disabled={disabled}
          className="w-full"
        />
      </div>

      {/* Components */}
      <div className="space-y-2">
        <Text as="label" variant="formLabel">
          Components *
        </Text>
        <div className="flex gap-2">
          {SPELL_COMPONENTS.map((component) => (
            <button
              key={component}
              type="button"
              onClick={() => toggleComponent(component)}
              disabled={disabled}
              className={cn(
                'px-3 py-2 rounded-md border text-sm font-medium transition-colors',
                formData.components.includes(component)
                  ? 'bg-primary-600 text-white border-primary-700'
                  : 'bg-bg-tertiary text-text-secondary border-border hover:bg-border',
              )}
            >
              {component}
              {component === 'V' && ' (Verbal)'}
              {component === 'S' && ' (Somatic)'}
              {component === 'M' && ' (Material)'}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="space-y-2">
        <Text as="label" variant="formLabel">
          Duration *
        </Text>
        <Input
          value={formData.duration}
          onChange={(e) => onChange({ duration: e.target.value })}
          placeholder="e.g., Instantaneous, 1 minute, Concentration"
          required
          disabled={disabled}
          className="w-full"
        />
      </div>

      {/* Concentration & Ritual Toggles */}
      <div className="flex gap-6 pt-2">
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.concentration}
            onCheckedChange={(checked) => onChange({ concentration: checked })}
            disabled={disabled}
          />
          <Text as="label" variant="bodySm">
            Concentration
          </Text>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={formData.ritual}
            onCheckedChange={(checked) => onChange({ ritual: checked })}
            disabled={disabled}
          />
          <Text as="label" variant="bodySm">
            Ritual
          </Text>
        </div>
      </div>
    </Surface>
  );
}
