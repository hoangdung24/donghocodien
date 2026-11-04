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
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 }, [
    Autoplay({ delay: 5500, stopOnInteraction: false }),
  ]);
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
    <div className='group/hero relative w-full overflow-hidden bg-stone-950 text-white select-none'>
      <div className='w-full cursor-grab overflow-hidden active:cursor-grabbing' ref={emblaRef}>
        <div className='flex touch-pan-y'>
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={slide.id}
              className='relative h-120 min-w-0 flex-[0_0_100%] sm:h-[65vh] lg:h-[65vh]'
            >
              <img
                src={slide.image}
                alt={slide.alt}
                className='h-full w-full object-cover object-center'
                loading={index === 0 ? 'eager' : 'lazy'}
              />

              <div className='absolute inset-0 flex items-end justify-center bg-linear-to-r from-black/60 via-black/30 to-transparent p-6 sm:p-12 lg:p-20'>
                <div className='max-w-md border border-white/10 bg-black/65 p-6 shadow-2xl backdrop-blur-xs sm:max-w-lg sm:p-8'>
                  <p className='mb-6 font-serif text-base leading-relaxed font-light text-stone-100 sm:text-xl lg:text-2xl'>
                    {slide.title}
                  </p>
                  <a
                    href={slide.link}
                    className='inline-block border-b border-white/60 pb-1 text-xs tracking-[0.25em] text-white uppercase transition-colors hover:border-white hover:text-stone-200'
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
        type='button'
        onClick={scrollPrev}
        aria-label='Previous slide'
        className='absolute top-1/2 left-4 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur-sm transition-all group-hover/hero:opacity-100 hover:bg-white/40 focus:opacity-100 sm:h-12 sm:w-12'
      >
        <ChevronLeft className='h-5 w-5 sm:h-6 sm:w-6' />
      </button>

      <button
        type='button'
        onClick={scrollNext}
        aria-label='Next slide'
        className='absolute top-1/2 right-4 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur-sm transition-all group-hover/hero:opacity-100 hover:bg-white/40 focus:opacity-100 sm:h-12 sm:w-12'
      >
        <ChevronRight className='h-5 w-5 sm:h-6 sm:w-6' />
      </button>

      <div className='absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2.5'>
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            type='button'
            onClick={() => scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`cursor-pointer rounded-full transition-all duration-300 ${
              index === selectedIndex ? 'w-7 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
