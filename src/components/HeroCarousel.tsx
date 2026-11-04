import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface HeroSlide {
  id: string;
  image: string;
  title: string;
  link: string;
  alt: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'patek-philippe',
    image: '/images/hero/hero-patek-3940j.jpg',
    title: 'Patek Philippe has always been a legend in the world of watchmaking',
    link: '/shop?category=91',
    alt: 'Patek Philippe Perpetual Calendar 3940J',
  },
  {
    id: 'rolex',
    image: '/images/hero/hero-rolex-1601.jpg',
    title: 'Vintage Rolex timepieces always carry a unique allure',
    link: '/shop?category=85',
    alt: 'Vintage Rolex Datejust 1601',
  },
  {
    id: 'omega',
    image: '/images/hero/hero-omega-speedmaster.jpg',
    title: 'A trusted place where you can find authentic vintage Omega watches',
    link: '/shop?category=79',
    alt: 'Omega Speedmaster Professional',
  },
  {
    id: 'cartier',
    image: '/images/hero/hero-cartier-3170.jpg',
    title: 'Cartier has always left a lasting impression in the hearts of collectors',
    link: '/shop?category=76',
    alt: 'Cartier Tank Vintage Collection',
  },
];

export default function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 30 },
    [Autoplay({ delay: 5500, stopOnInteraction: false })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);
  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative w-full overflow-hidden bg-stone-950 text-white select-none group/hero">
      <div className="overflow-hidden w-full cursor-grab active:cursor-grabbing" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={slide.id}
              className="relative flex-[0_0_100%] min-w-0 h-[480px] sm:h-[580px] lg:h-[660px]"
            >
              <img
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-cover object-center"
                loading={index === 0 ? 'eager' : 'lazy'}
              />

              <div className="absolute inset-0 flex items-center justify-start p-6 sm:p-12 lg:p-20 bg-gradient-to-r from-black/60 via-black/30 to-transparent">
                <div className="max-w-md sm:max-w-lg bg-black/65 backdrop-blur-xs p-6 sm:p-8 border border-white/10 shadow-2xl">
                  <p className="text-base sm:text-xl lg:text-2xl text-stone-100 font-serif leading-relaxed mb-6 font-light">
                    {slide.title}
                  </p>
                  <a
                    href={slide.link}
                    className="inline-block text-xs uppercase tracking-[0.25em] text-white border-b border-white/60 pb-1 hover:border-white hover:text-stone-200 transition-colors"
                  >
                    Learn More &rarr;
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={scrollPrev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition-all opacity-0 group-hover/hero:opacity-100 focus:opacity-100 cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <button
        type="button"
        onClick={scrollNext}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition-all opacity-0 group-hover/hero:opacity-100 focus:opacity-100 cursor-pointer"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-10">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              index === selectedIndex
                ? 'w-7 h-2 bg-white'
                : 'w-2 h-2 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
