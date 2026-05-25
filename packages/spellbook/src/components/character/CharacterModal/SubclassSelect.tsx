import { useMemo } from 'react';
import { SelectContent, SelectItem, SelectRoot, SelectTrigger, Text } from '@open20/ui';
import { dataLoader } from '@/core/data-loader';

interface SubclassSelectProps {
  classId: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function SubclassSelect({ 
  classId, 
  value, 
  onChange,
  label 
}: SubclassSelectProps) {
  const subclasses = useMemo(() => 
    dataLoader.getSubclassesForClass(classId),
    [classId]
  );
  
  if (subclasses.length === 0) return null;
  
  // Radix Select doesn't allow empty string as item value
  // Use a sentinel value and convert to/from it
  const selectValue = value || '_none';
  
  return (
    <div>
      <Text as="label" variant="labelSm" weight="black" className="block tracking-[0.2em] mb-2">
        {label || 'Subclass'}
      </Text>
      <SelectRoot 
        value={selectValue} 
        onValueChange={(val) => onChange(val === '_none' ? '' : val)}
      >
        <SelectTrigger />
        <SelectContent>
          <SelectItem value="_none">None</SelectItem>
          {subclasses.map((sub) => (
            <SelectItem key={sub.id} value={sub.id}>
              {sub.id} {/* Subclass doesn't have 'name' property, use id */}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
    </div>
  );
}
