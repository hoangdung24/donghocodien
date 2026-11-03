import React, { useState, useEffect } from 'react';
import { Slider } from '@ark-ui/react/slider';

interface PriceRangeSliderProps {
  minPrice: number;
  maxPrice: number;
  onFilter: (min: number, max: number) => void;
  defaultMin?: number;
  defaultMax?: number;
}

export function PriceRangeSlider({ minPrice, maxPrice, onFilter, defaultMin, defaultMax }: PriceRangeSliderProps) {
  const [min, setMin] = useState(defaultMin ?? minPrice);
  const [max, setMax] = useState(defaultMax ?? maxPrice);
  const [isDragging, setIsDragging] = useState(false);
  const [focusedThumb, setFocusedThumb] = useState<0 | 1 | null>(null);

  const handleValueChange = (value: number[]) => {
    const [newMin, newMax] = value;
    setMin(Math.round(newMin));
    setMax(Math.round(newMax));
    setIsDragging(true);
  };

  const handleValueChangeEnd = (value: number[]) => {
    const [newMin, newMax] = value;
    setMin(Math.round(newMin));
    setMax(Math.round(newMax));
    onFilter(Math.round(newMin), Math.round(newMax));
    setIsDragging(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const roundToStep = (val: number) => Math.round(val / 100) * 100;

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || minPrice;
    const clamped = Math.max(minPrice, Math.min(roundToStep(val), max - 100));
    setMin(clamped);
    onFilter(clamped, max);
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || maxPrice;
    const clamped = Math.min(maxPrice, Math.max(roundToStep(val), min + 100));
    setMax(clamped);
    onFilter(min, clamped);
  };

  const handleBlur = () => onFilter(min, max);

  const handleReset = () => {
    setMin(minPrice);
    setMax(maxPrice);
    onFilter(minPrice, maxPrice);
  };

  const trackWidth = maxPrice - minPrice;
  const minPercent = ((min - minPrice) / trackWidth) * 100;
  const maxPercent = ((max - minPrice) / trackWidth) * 100;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider font-bold text-black">Price Range</span>
        <span className="text-[12px] font-medium text-black tabular-nums">
          {formatPrice(min)} – {formatPrice(max)}
        </span>
      </div>

      <Slider.Root
        min={minPrice}
        max={maxPrice}
        step={100}
        value={[min, max]}
        onValueChange={handleValueChange}
        onValueChangeEnd={handleValueChangeEnd}
        minStepsBetweenThumbs={1}
        className="w-full"
        dir="ltr"
      >
        <Slider.Control className="relative h-6">
          <Slider.Track className="relative h-1 bg-stone-200 rounded-none">
            <Slider.Range
              className="absolute h-full bg-black rounded-none transition-all duration-100"
              style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
            />
          </Slider.Track>

          <Slider.Thumb
            index={0}
            className={`relative w-4 h-4 bg-white border-2 border-black rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-all duration-200 ${
              focusedThumb === 0 ? 'ring-2 ring-black ring-offset-2 ring-offset-white scale-110' : ''
            } ${isDragging ? 'scale-110' : ''}`}
            onFocus={() => setFocusedThumb(0)}
            onBlur={() => setFocusedThumb(null)}
          >
            <Slider.HiddenInput name="price-min" />
          </Slider.Thumb>

          <Slider.Thumb
            index={1}
            className={`relative w-4 h-4 bg-white border-2 border-black rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-all duration-200 ${
              focusedThumb === 1 ? 'ring-2 ring-black ring-offset-2 ring-offset-white scale-110' : ''
            } ${isDragging ? 'scale-110' : ''}`}
            onFocus={() => setFocusedThumb(1)}
            onBlur={() => setFocusedThumb(null)}
          >
            <Slider.HiddenInput name="price-max" />
          </Slider.Thumb>
        </Slider.Control>
      </Slider.Root>

      <div className="flex items-center gap-3">
        <input
          type="number"
          value={min}
          onChange={handleMinInputChange}
          onBlur={handleBlur}
          className="flex-1 h-9 text-[12px] text-black border border-stone-300 bg-white px-3 text-center focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all placeholder:text-stone-400"
          min={minPrice}
          max={max - 100}
          step={100}
          placeholder={formatPrice(minPrice)}
        />
        <span className="text-[11px] text-stone-400 uppercase tracking-wider font-medium shrink-0">to</span>
        <input
          type="number"
          value={max}
          onChange={handleMaxInputChange}
          onBlur={handleBlur}
          className="flex-1 h-9 text-[12px] text-black border border-stone-300 bg-white px-3 text-center focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all placeholder:text-stone-400"
          min={min + 100}
          max={maxPrice}
          step={100}
          placeholder={formatPrice(maxPrice)}
        />
      </div>

      <button
        onClick={handleReset}
        disabled={min === minPrice && max === maxPrice}
        className="w-full h-9 text-[11px] uppercase tracking-widest font-medium border border-stone-300 bg-white text-stone-600 hover:bg-stone-50 hover:text-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Clear Filter
      </button>
    </div>
  );
}