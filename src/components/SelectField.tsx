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
      onValueChange={(selection) => onValueChange(selection.value[0] ?? '')}
      required={required}
      name={name}
      autoComplete={autoComplete}
      deselectable={false}
      positioning={{ fitViewport: true, sameWidth: true, placement: 'bottom-start' }}
      id={id}
    >
      <Select.Label className='mb-2 block font-sans text-xs tracking-wider text-stone-500 uppercase [&_span]:text-stone-400 [&_span]:normal-case'>
        {label}
        {required ? ' *' : <span> (optional)</span>}
      </Select.Label>
      <Select.Control>
        <Select.Trigger className='flex w-full items-center justify-between gap-3 border border-stone-300 bg-white px-4 py-3 text-left text-sm text-stone-900 transition-colors outline-none data-focus:border-stone-900 data-open:border-stone-900'>
          <Select.ValueText placeholder={placeholder} className='truncate' />
          <Select.Indicator>
            <ChevronDown className='h-4 w-4 text-stone-400' />
          </Select.Indicator>
        </Select.Trigger>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content className='z-50 max-h-72 overflow-y-auto border border-stone-200 bg-white shadow-lg'>
            {collection.items.map((item) => (
              <Select.Item key={item.value} item={item} className={itemClass}>
                <Select.ItemText>{item.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <Check className='h-4 w-4 text-stone-900' />
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
