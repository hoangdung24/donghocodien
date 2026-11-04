import { useState } from 'react';
import { Slider } from '@ark-ui/react/slider';
import { Loader2 } from 'lucide-react';
import { withPriceRange } from '../lib/utils/products';

interface PriceRangeSliderProps {
  minPrice: number;
  maxPrice: number;
  defaultMin?: number;
  defaultMax?: number;
}

export function PriceRangeSlider({
  minPrice,
  maxPrice,
  defaultMin,
  defaultMax,
}: PriceRangeSliderProps) {
  const [min, setMin] = useState(defaultMin ?? minPrice);
  const [max, setMax] = useState(defaultMax ?? maxPrice);
  const [pending, setPending] = useState<'apply' | 'clear' | null>(null);

  const hasAppliedFilter = defaultMin !== undefined && defaultMax !== undefined;

  const handleValueChange = (details: { value: number[] }) => {
    const [newMin, newMax] = details.value;
    if (newMin === undefined || newMax === undefined) return;
    setMin(Math.round(newMin));
    setMax(Math.round(newMax));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleApply = () => {
    if (pending) return;
    setPending('apply');
    window.location.assign(withPriceRange(window.location.search, { min, max }));
  };

  const handleClear = () => {
    if (pending) return;
    setPending('clear');
    window.location.assign(withPriceRange(window.location.search, null));
  };

  return (
    <div className='space-y-5'>
      <div className='flex items-center justify-between'>
        <span className='text-[11px] font-bold tracking-wider text-black uppercase'>
          Price Range
        </span>
        <span className='text-[12px] font-medium text-black tabular-nums'>
          {formatPrice(min)} – {formatPrice(max)}
        </span>
      </div>

      <Slider.Root
        min={minPrice}
        max={maxPrice}
        step={100}
        value={[min, max]}
        onValueChange={handleValueChange}
        minStepsBetweenThumbs={1}
        className='w-full'
      >
        <Slider.Control className='relative flex h-6 w-full items-center'>
          <Slider.Track className='relative h-1 flex-1 rounded-none bg-stone-200'>
            <Slider.Range className='absolute h-full rounded-none bg-black' />
          </Slider.Track>

          <Slider.Thumb
            index={0}
            className='h-4 w-4 rounded-full border-2 border-black bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] outline-none data-dragging:scale-110 data-focus:ring-2 data-focus:ring-black data-focus:ring-offset-2 data-focus:ring-offset-white'
          >
            <Slider.HiddenInput name='price-min' />
          </Slider.Thumb>

          <Slider.Thumb
            index={1}
            className='h-4 w-4 rounded-full border-2 border-black bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] outline-none data-dragging:scale-110 data-focus:ring-2 data-focus:ring-black data-focus:ring-offset-2 data-focus:ring-offset-white'
          >
            <Slider.HiddenInput name='price-max' />
          </Slider.Thumb>
        </Slider.Control>
      </Slider.Root>

      <div className='flex gap-2'>
        <button
          onClick={handleApply}
          disabled={pending !== null || (min === minPrice && max === maxPrice && !hasAppliedFilter)}
          className='flex h-9 flex-1 cursor-pointer items-center justify-center gap-2 bg-black text-[11px] font-medium tracking-widest text-white uppercase transition-all hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-40'
        >
          {pending === 'apply' && <Loader2 className='h-3.5 w-3.5 animate-spin' />}
          {pending === 'apply' ? 'Filtering...' : 'Apply Filter'}
        </button>
        <button
          onClick={handleClear}
          disabled={pending !== null || !hasAppliedFilter}
          className='flex h-9 flex-1 cursor-pointer items-center justify-center gap-2 border border-stone-300 bg-white text-[11px] font-medium tracking-widest text-stone-600 uppercase transition-all hover:bg-stone-50 hover:text-black disabled:cursor-not-allowed disabled:opacity-40'
        >
          {pending === 'clear' && <Loader2 className='h-3.5 w-3.5 animate-spin' />}
          {pending === 'clear' ? 'Clearing...' : 'Clear'}
        </button>
      </div>
    </div>
  );
}
