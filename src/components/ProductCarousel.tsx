import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '../lib/schema/product';
import { formatUSD, calculateDiscountPercentage } from '../lib/utils/format';
import { formatApproxPrice } from '../lib/utils/currency';
import { useApproxDisplay } from '../lib/hooks/useApproxDisplay';

interface ProductCarouselProps {
  products: Product[];
}

function cleanTitle(title: string) {
  return title
    .replace(/&#8216;/g, '‘')
    .replace(/&#8217;/g, '’')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8211;/g, '–')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&');
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
    <div className="relative group/carousel">
      <div className="overflow-hidden px-1" ref={emblaRef}>
        <div className="flex -ml-4 sm:-ml-6 py-2 touch-pan-y">
          {products.map((product) => {
            const primaryImage = product.images[0]?.src || '/images/logo.png';
            const secondaryImage = product.images[1]?.src;
            const price = product.prices.price;
            const regularPrice = product.prices.regular_price || price;
            const numPrice = parseFloat(price) || 0;
            const numRegularPrice = parseFloat(regularPrice) || numPrice;
            const discountPct = product.on_sale ? calculateDiscountPercentage(numRegularPrice, numPrice) : 0;
            const title = cleanTitle(product.name);
            const brandCategory = product.categories.find(
              (c) => ['Omega', 'Rolex', 'Cartier', 'Patek Philippe', 'Universal Geneve', 'Seiko', 'Eterna', 'Tavannes', 'Edox'].includes(c.name)
            )?.name;

            return (
              <div
                key={product.id}
                className="flex-[0_0_80%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-4 sm:pl-6"
              >
                <article className="group/card flex flex-col h-full bg-white text-center sm:text-left transition-all duration-300">
                  <a
                    href={`/product/${product.slug}`}
                    className="relative block aspect-[4/5] w-full overflow-hidden bg-stone-100"
                    title={title}
                  >
                    <img
                      src={primaryImage}
                      alt={title}
                      className={`h-full w-full object-cover transition-opacity duration-500 ease-in-out ${
                        secondaryImage ? 'group-hover/card:opacity-0' : 'group-hover/card:scale-105 transition-transform'
                      }`}
                      loading="lazy"
                    />

                    {secondaryImage && (
                      <img
                        src={secondaryImage}
                        alt={`${title} alternate view`}
                        className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 ease-in-out group-hover/card:opacity-100"
                        loading="lazy"
                      />
                    )}

                    {product.on_sale && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="bg-red-700 text-white text-[10px] uppercase font-sans tracking-widest px-2.5 py-0.5 font-medium shadow-xs">
                          {discountPct > 0 ? `-${discountPct}%` : 'Sale'}
                        </span>
                      </div>
                    )}
                  </a>

                  <div className="flex flex-col flex-1 pt-4 pb-2 text-center px-2">
                    {brandCategory && (
                      <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-1">
                        {brandCategory}
                      </p>
                    )}

                    <h3 className="text-xs sm:text-sm text-black uppercase tracking-wider line-clamp-2 leading-relaxed mb-2 font-normal">
                      <a
                        href={`/product/${product.slug}`}
                        className="hover:text-stone-500 transition-colors"
                      >
                        {title}
                      </a>
                    </h3>

                    <div className="mt-auto flex flex-col items-center justify-center pt-2 font-serif">
                      <div className="flex items-baseline justify-center gap-2">
                        {product.on_sale && numRegularPrice > numPrice && (
                          <span className="text-xs text-stone-400 line-through">
                            {formatUSD(regularPrice)}
                          </span>
                        )}
                        <span className="text-sm sm:text-base font-semibold text-black">
                          {formatUSD(price)}
                        </span>
                      </div>
                      {approx && (
                        <span className="text-[10px] sm:text-[11px] text-stone-400 font-sans tracking-tight mt-0.5 approximate-vnd" data-usd-price={price}>
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
        type="button"
        onClick={scrollPrev}
        disabled={prevBtnDisabled}
        aria-label="Previous products"
        className={`absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white border border-stone-200 shadow-md flex items-center justify-center text-stone-800 transition-all ${
          prevBtnDisabled
            ? 'opacity-0 pointer-events-none'
            : 'hover:bg-black hover:text-white hover:border-black cursor-pointer'
        }`}
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <button
        type="button"
        onClick={scrollNext}
        disabled={nextBtnDisabled}
        aria-label="Next products"
        className={`absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white border border-stone-200 shadow-md flex items-center justify-center text-stone-800 transition-all ${
          nextBtnDisabled
            ? 'opacity-0 pointer-events-none'
            : 'hover:bg-black hover:text-white hover:border-black cursor-pointer'
        }`}
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );
}

export default ProductCarousel;
