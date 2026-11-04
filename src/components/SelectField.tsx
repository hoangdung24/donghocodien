import { useMemo } from 'react';
import { Select, createListCollection } from '@ark-ui/react/select';
import { Portal } from '@ark-ui/react/portal';
import { Check, ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  options: SelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  name?: string;
  autoComplete?: string;
  id?: string;
}

const itemClass =
  'flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-stone-900 cursor-pointer outline-none data-[highlighted]:bg-stone-100 data-[state=checked]:font-medium';

export function SelectField({
  label,
  options,
  value,
  onValueChange,
  placeholder = 'Select an option…',
  required,
  name,
  autoComplete,
  id,
}: SelectFieldProps) {
  const collection = useMemo(() => createListCollection({ items: options }), [options]);

  return (
    <Select.Root
      collection={collection}
      value={[value]}
      onValueChange={(e) => onValueChange(e.value[0] ?? '')}
      required={required}
      name={name}
      autoComplete={autoComplete}
      deselectable={false}
      positioning={{ fitViewport: true, sameWidth: true, placement: 'bottom-start' }}
      id={id}
    >
      <Select.Label className="block text-xs uppercase tracking-wider text-stone-500 mb-2 font-sans [&_span]:normal-case [&_span]:text-stone-400">
        {label}
        {required ? (
          ' *'
        ) : (
          <span> (optional)</span>
        )}
      </Select.Label>
      <Select.Control>
        <Select.Trigger className="w-full px-4 py-3 border border-stone-300 bg-white text-stone-900 text-sm transition-colors text-left flex items-center justify-between gap-3 outline-none data-[focus]:border-stone-900 data-[open]:border-stone-900">
          <Select.ValueText placeholder={placeholder} className="truncate" />
          <Select.Indicator>
            <ChevronDown className="w-4 h-4 text-stone-400" />
          </Select.Indicator>
        </Select.Trigger>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content className="bg-white border border-stone-200 shadow-lg max-h-72 overflow-y-auto z-50">
            {collection.items.map((item) => (
              <Select.Item key={item.value} item={item} className={itemClass}>
                <Select.ItemText>{item.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <Check className="w-4 h-4 text-stone-900" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
      <Select.HiddenSelect />
    </Select.Root>
  );
}
