import { useState } from 'react';
import { Slider } from '@ark-ui/react/slider';
import { Loader2 } from 'lucide-react';
import { withPriceRange } from '@/lib/utils/products';
import { formatPrice } from '@/lib/utils/format';

interface PriceRangeSliderProps {
  minPrice: number;
  maxPrice: number;
  defaultMin?: number;
  defaultMax?: number;
  basePath?: string;
}

const THUMB_CLASS =
  'h-5 w-5 rounded-full border-2 border-brand-dark bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] outline-none focus-visible:ring-2 focus-visible:ring-brand-dark focus-visible:ring-offset-2 focus-visible:ring-offset-white data-dragging:scale-110';

export function PriceRangeSlider({
  minPrice,
  maxPrice,
  defaultMin,
  defaultMax,
  basePath = '/watches',
}: PriceRangeSliderProps) {
  const [min, setMin] = useState(defaultMin ?? minPrice);
  const [max, setMax] = useState(defaultMax ?? maxPrice);
  const [pending, setPending] = useState<'apply' | 'clear' | null>(null);

  const hasAppliedFilter = defaultMin !== undefined && defaultMax !== undefined;

  const handleValueChange = (details: { value: number[] }) => {
    const [nextMin, nextMax] = details.value;
    if (nextMin === undefined || nextMax === undefined) return;
    setMin(Math.round(nextMin));
    setMax(Math.round(nextMax));
  };

  const handleApply = () => {
    if (pending) return;
    setPending('apply');
    window.location.assign(withPriceRange(window.location.search, { min, max }, basePath));
  };

  const handleClear = () => {
    if (pending) return;
    setPending('clear');
    window.location.assign(withPriceRange(window.location.search, null, basePath));
  };

  const applyDisabled = min === minPrice && max === maxPrice && !hasAppliedFilter;

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex items-center justify-between'>
        <h2 id='price-range-heading' className='text-[11px] font-bold tracking-wider uppercase'>
          Price Range
        </h2>
        <p className='text-[12px] font-medium tabular-nums'>
          <span className='sr-only'>Selected range: </span>
          {formatPrice(min)} – {formatPrice(max)}
        </p>
      </div>

      <Slider.Root
        min={minPrice}
        max={maxPrice}
        step={100}
        value={[min, max]}
        onValueChange={handleValueChange}
        minStepsBetweenThumbs={1}
        className='w-full'
        aria-label={['Minimum price', 'Maximum price']}
      >
        <Slider.Control className='relative flex h-6 w-full items-center'>
          <Slider.Track className='relative h-1 flex-1 rounded-none bg-stone-300'>
            <Slider.Range className='absolute h-full rounded-none bg-black' />
          </Slider.Track>

          <Slider.Thumb index={0} className={THUMB_CLASS} aria-label='Minimum price'>
            <Slider.HiddenInput name='price-min' tabIndex={-1} aria-hidden='true' />
          </Slider.Thumb>

          <Slider.Thumb index={1} className={THUMB_CLASS} aria-label='Maximum price'>
            <Slider.HiddenInput name='price-max' tabIndex={-1} aria-hidden='true' />
          </Slider.Thumb>
        </Slider.Control>
      </Slider.Root>

      <div className='flex gap-2'>
        <button
          type='button'
          onClick={handleApply}
          aria-disabled={pending !== null || applyDisabled}
          className='flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 bg-black text-[11px] font-medium tracking-widest text-white uppercase transition-all hover:bg-stone-800 aria-disabled:cursor-not-allowed aria-disabled:opacity-40'
        >
          {pending === 'apply' && (
            <Loader2 className='h-3.5 w-3.5 animate-spin' aria-hidden='true' />
          )}
          {pending === 'apply' ? 'Filtering…' : 'Apply Filter'}
        </button>
        <button
          type='button'
          onClick={handleClear}
          aria-disabled={pending !== null || !hasAppliedFilter}
          className='flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 border border-stone-300 bg-white text-[11px] font-medium tracking-widest text-stone-600 uppercase transition-all hover:bg-stone-50 hover:text-brand-dark aria-disabled:cursor-not-allowed aria-disabled:opacity-40'
        >
          {pending === 'clear' && (
            <Loader2 className='h-3.5 w-3.5 animate-spin' aria-hidden='true' />
          )}
          {pending === 'clear' ? 'Clearing…' : 'Clear'}
        </button>
      </div>
    </div>
  );
}
