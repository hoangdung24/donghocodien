import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '../lib/schema/product';
import { formatUSD, calculateDiscountPercentage } from '../lib/utils/format';
import { formatApproxPrice } from '../lib/utils/currency';
import { useApproxDisplay } from '../lib/hooks/useApproxDisplay';
import { cleanTitle } from '../lib/utils/text';

interface ProductCarouselProps {
  products: readonly Product[];
}

export function ProductCarousel({ products }: ProductCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
  });

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const approx = useApproxDisplay();

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
          {products.map((product) => {
            const primaryImage = product.images[0]?.src || '/images/logo.png';
            const secondaryImage = product.images[1]?.src;
            const price = product.prices.price;
            const regularPrice = product.prices.regular_price || price;
            const numPrice = parseFloat(price) || 0;
            const numRegularPrice = parseFloat(regularPrice) || numPrice;
            const discountPct = product.on_sale
              ? calculateDiscountPercentage(numRegularPrice, numPrice)
              : 0;
            const title = cleanTitle(product.name);
            const brandCategory = product.categories.find((c) =>
              [
                'Omega',
                'Rolex',
                'Cartier',
                'Patek Philippe',
                'Universal Geneve',
                'Seiko',
                'Eterna',
                'Tavannes',
                'Edox',
              ].includes(c.name)
            )?.name;

            return (
              <div
                key={product.id}
                className='min-w-0 flex-[0_0_80%] pl-4 sm:flex-[0_0_50%] sm:pl-6 lg:flex-[0_0_33.333%]'
              >
                <article className='group/card flex h-full flex-col bg-white text-center transition-all duration-300 sm:text-left'>
                  <a
                    href={`/product/${product.slug}`}
                    className='relative block aspect-4/5 w-full overflow-hidden bg-stone-100'
                    title={title}
                  >
                    <img
                      src={primaryImage}
                      alt={title}
                      className={`h-full w-full object-cover transition-opacity duration-500 ease-in-out ${
                        secondaryImage
                          ? 'group-hover/card:opacity-0'
                          : 'group-hover/card:scale-105 transition-transform'
                      }`}
                      loading='lazy'
                    />

                    {secondaryImage && (
                      <img
                        src={secondaryImage}
                        alt={`${title} alternate view`}
                        className='absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 ease-in-out group-hover/card:opacity-100'
                        loading='lazy'
                      />
                    )}

                    {product.on_sale && (
                      <div className='absolute top-3 left-3 z-10'>
                        <span className='bg-red-700 px-2.5 py-0.5 font-sans text-[10px] font-medium tracking-widest text-white uppercase shadow-xs'>
                          {discountPct > 0 ? `-${discountPct}%` : 'Sale'}
                        </span>
                      </div>
                    )}
                  </a>

                  <div className='flex flex-1 flex-col px-2 pt-4 pb-2 text-center'>
                    {brandCategory && (
                      <p className='mb-1 text-[10px] tracking-[0.2em] text-stone-400 uppercase'>
                        {brandCategory}
                      </p>
                    )}

                    <h3 className='mb-2 line-clamp-2 text-xs leading-relaxed font-normal tracking-wider text-black uppercase sm:text-sm'>
                      <a
                        href={`/product/${product.slug}`}
                        className='transition-colors hover:text-stone-500'
                      >
                        {title}
                      </a>
                    </h3>

                    <div className='mt-auto flex flex-col items-center justify-center pt-2 font-serif'>
                      <div className='flex items-baseline justify-center gap-2'>
                        {product.on_sale && numRegularPrice > numPrice && (
                          <span className='text-xs text-stone-400 line-through'>
                            {formatUSD(regularPrice)}
                          </span>
                        )}
                        <span className='text-sm font-semibold text-black sm:text-base'>
                          {formatUSD(price)}
                        </span>
                      </div>
                      {approx && (
                        <span className='approximate-vnd' data-usd-price={price}>
                          {formatApproxPrice(price, approx.currency, approx.rates)}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </div>

      <button
        type='button'
        onClick={scrollPrev}
        disabled={prevBtnDisabled}
        aria-label='Previous products'
        className={`absolute top-1/2 -left-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-800 shadow-md transition-all sm:-left-5 sm:h-11 sm:w-11 ${
          prevBtnDisabled
            ? 'opacity-0 pointer-events-none'
            : 'hover:bg-black hover:text-white hover:border-black cursor-pointer'
        }`}
      >
        <ChevronLeft className='h-4 w-4 sm:h-5 sm:w-5' />
      </button>

      <button
        type='button'
        onClick={scrollNext}
        disabled={nextBtnDisabled}
        aria-label='Next products'
        className={`absolute top-1/2 -right-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-800 shadow-md transition-all sm:-right-5 sm:h-11 sm:w-11 ${
          nextBtnDisabled
            ? 'opacity-0 pointer-events-none'
            : 'hover:bg-black hover:text-white hover:border-black cursor-pointer'
        }`}
      >
        <ChevronRight className='h-4 w-4 sm:h-5 sm:w-5' />
      </button>
    </div>
  );
}

export default ProductCarousel;
