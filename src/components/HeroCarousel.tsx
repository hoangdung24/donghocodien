import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  HERO_AUTOPLAY_DELAY_MS,
  HERO_MEDIA_QUERY,
  HERO_SIZES,
  HERO_SLIDES,
  type HeroSlide,
} from '@/lib/data/heroSlides';

const FIRST_SLIDE = HERO_SLIDES[0];
const MOBILE_SOURCE_SET = [640, 960].map((width) => `${FIRST_SLIDE.image}-${width}.webp ${width}w`);

function HeroSlideCaption({ slide }: { slide: HeroSlide }) {
  return (
    <>
      <div className='absolute inset-0 bg-black/40' />
      <div className='absolute right-4 bottom-8 left-4'>
        <div className='mx-auto max-w-md bg-black/65 p-6 backdrop-blur-xs'>
          <p className='mb-6 text-base leading-relaxed font-light text-stone-100 sm:text-lg lg:text-xl'>
            {slide.title}
          </p>
          <a
            href={slide.link}
            aria-label={`${slide.title} — browse this collection`}
            className='inline-block border-b border-white/60 pb-1 text-xs tracking-[0.25em] text-white uppercase transition-colors hover:border-white hover:text-stone-200'
          >
            Learn More &rarr;
          </a>
        </div>
      </div>
    </>
  );
}

export default function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30, axis: 'x' }, [
    Autoplay({ delay: HERO_AUTOPLAY_DELAY_MS, stopOnInteraction: false }),
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

  useEffect(() => {
    if (!emblaApi) return;
    const autoplay = emblaApi.plugins().autoplay;
    if (!autoplay) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches) {
      autoplay.stop();
    }
  }, [emblaApi]);

  const dotCount = scrollSnaps.length || HERO_SLIDES.length;

  const ARROW_CONTROLS = [
    {
      direction: 'previous',
      ariaLabel: 'Previous featured watch',
      position: 'left-4',
      icon: ChevronLeft,
      action: scrollPrev,
    },
    {
      direction: 'next',
      ariaLabel: 'Next featured watch',
      position: 'right-4',
      icon: ChevronRight,
      action: scrollNext,
    },
  ];

  return (
    <div
      className='group/hero relative w-full overflow-hidden bg-stone-950 text-white select-none'
      role='region'
      aria-roledescription='carousel'
      aria-label='Featured watches'
    >
      <div className='w-full cursor-grab overflow-hidden active:cursor-grabbing' ref={emblaRef}>
        <div className='flex touch-pan-y'>
          <div
            className='relative h-120 min-w-0 flex-[0_0_100%] shrink-0 sm:h-[75vh]'
            role='group'
            aria-roledescription='slide'
            aria-label={`1 of ${HERO_SLIDES.length}`}
            data-hero-first-slide=''
          >
            <picture>
              <source
                type='image/webp'
                media={HERO_MEDIA_QUERY}
                srcSet={MOBILE_SOURCE_SET.join(', ')}
                sizes={HERO_SIZES}
              />
              <img
                src={`${FIRST_SLIDE.image}-960.webp`}
                alt={FIRST_SLIDE.alt}
                width='1152'
                height='1440'
                fetchPriority='high'
                loading='eager'
                decoding='async'
                className='h-full w-full object-cover object-center'
              />
            </picture>

            <HeroSlideCaption slide={FIRST_SLIDE} />
          </div>

          {HERO_SLIDES.slice(1).map((slide, index) => (
            <div
              key={slide.id}
              className='relative h-120 min-w-0 flex-[0_0_100%] shrink-0 sm:h-[75vh]'
              role='group'
              aria-roledescription='slide'
              aria-label={`${index + 2} of ${HERO_SLIDES.length}`}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                width='1152'
                height='1440'
                className='h-full w-full object-cover object-center'
                loading='lazy'
                decoding='async'
              />

              <HeroSlideCaption slide={slide} />
            </div>
          ))}
        </div>
      </div>

      {ARROW_CONTROLS.map((control) => (
        <button
          key={control.direction}
          type='button'
          onClick={control.action}
          aria-label={control.ariaLabel}
          className={`absolute top-1/2 ${control.position} flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur-sm transition-all group-hover/hero:opacity-100 hover:bg-white/40 focus-visible:opacity-100 sm:h-12 sm:w-12`}
        >
          <control.icon className='h-5 w-5 sm:h-6 sm:w-6' aria-hidden='true' />
        </button>
      ))}

      <div className='absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2.5'>
        {Array.from({ length: dotCount }, (_, index) => (
          <button
            key={index}
            type='button'
            onClick={() => scrollTo(index)}
            aria-label={`Show featured watch ${index + 1} of ${HERO_SLIDES.length}`}
            aria-current={index === selectedIndex ? 'true' : undefined}
            className={`relative cursor-pointer rounded-full transition-all duration-300 ${
              index === selectedIndex ? 'h-2 w-7 bg-white' : 'h-2 w-2 bg-white/40 hover:bg-white/70'
            } after:absolute after:top-1/2 after:left-1/2 after:h-11 after:w-11 after:-translate-1/2 after:content-[""]`}
          />
        ))}
      </div>
    </div>
  );
}
