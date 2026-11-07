import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product, ProductCategory } from '@/lib/schema/product';
import { WatchCard } from '@/components/WatchCard';

interface ProductCarouselProps {
  products: readonly Product[];
  categories?: ProductCategory[];
}

export function ProductCarousel({ products, categories }: ProductCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
  });

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className='group/carousel relative'>
      <div className='overflow-hidden px-1' ref={emblaRef}>
        <div className='-ml-4 flex touch-pan-y py-2 sm:-ml-6'>
          {products.map((product) => (
            <div
              key={product.id}
              className='min-w-0 flex-[0_0_80%] pl-4 sm:flex-[0_0_50%] sm:pl-6 lg:flex-[0_0_25%]'
            >
              <WatchCard product={product} categories={categories} />
            </div>
          ))}
        </div>
      </div>

      <button
        type='button'
        onClick={scrollPrev}
        disabled={prevBtnDisabled}
        aria-label='Previous products'
        className={`absolute top-1/2 -left-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-stone-800 shadow-md transition-all sm:-left-5 sm:h-11 sm:w-11 ${
          prevBtnDisabled
            ? 'pointer-events-none opacity-0'
            : 'cursor-pointer hover:bg-brand-dark hover:text-white'
        }`}
      >
        <ChevronLeft className='h-4 w-4 sm:h-5 sm:w-5' />
      </button>

      <button
        type='button'
        onClick={scrollNext}
        disabled={nextBtnDisabled}
        aria-label='Next products'
        className={`absolute top-1/2 -right-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-stone-800 shadow-md transition-all sm:-right-5 sm:h-11 sm:w-11 ${
          nextBtnDisabled
            ? 'pointer-events-none opacity-0'
            : 'cursor-pointer hover:bg-brand-dark hover:text-white'
        }`}
      >
        <ChevronRight className='h-4 w-4 sm:h-5 sm:w-5' />
      </button>
    </div>
  );
}

export default ProductCarousel;
