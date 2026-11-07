import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

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
    link: '/watches?category=patek-philippe',
    alt: 'Patek Philippe Perpetual Calendar 3940J',
  },
  {
    id: 'rolex',
    image: '/images/hero/hero-rolex-1601.jpg',
    title: 'Vintage Rolex timepieces always carry a unique allure',
    link: '/watches?category=rolex',
    alt: 'Vintage Rolex Datejust 1601',
  },
  {
    id: 'omega',
    image: '/images/hero/hero-omega-speedmaster.jpg',
    title: 'A trusted place where you can find authentic vintage Omega watches',
    link: '/watches?category=omega',
    alt: 'Omega Speedmaster Professional',
  },
  {
    id: 'cartier',
    image: '/images/hero/hero-cartier-3170.jpg',
    title: 'Cartier has always left a lasting impression in the hearts of collectors',
    link: '/watches?category=cartier',
    alt: 'Cartier Tank Vintage Collection',
  },
];

const AUTOPLAY_DELAY_MS = 5500;

export default function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 }, [
    Autoplay({ delay: AUTOPLAY_DELAY_MS, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);

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
      setIsPlaying(false);
    }
  }, [emblaApi]);

  const toggleAutoplay = () => {
    const autoplay = emblaApi?.plugins().autoplay;
    if (!autoplay) return;
    if (autoplay.isPlaying()) {
      autoplay.stop();
      setIsPlaying(false);
    } else {
      autoplay.play();
      setIsPlaying(true);
    }
  };

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
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={slide.id}
              className='relative h-120 min-w-0 flex-[0_0_100%] sm:h-[75vh]'
              role='group'
              aria-roledescription='slide'
              aria-label={`${index + 1} of ${HERO_SLIDES.length}`}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                className='h-full w-full object-cover object-center'
                loading={index === 0 ? 'eager' : 'lazy'}
              />

              <div className='absolute inset-0 flex items-end justify-center bg-black/40'>
                <div className='max-w-md bg-black/65 p-6 backdrop-blur-xs sm:mb-10 sm:max-w-lg sm:p-8'>
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

      <button
        type='button'
        onClick={toggleAutoplay}
        aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
        className='absolute top-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/40 focus-visible:opacity-100'
      >
        {isPlaying ? (
          <Pause className='h-4 w-4' aria-hidden='true' />
        ) : (
          <Play className='h-4 w-4' aria-hidden='true' />
        )}
      </button>

      <div className='absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2.5'>
        {scrollSnaps.map((_, index) => (
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
