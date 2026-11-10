import { Carousel } from '@ark-ui/react/carousel';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLayoutEffect, useRef } from 'react';
import type { GalleryPicture } from '@/lib/schema/galleryPicture';
import { localImageSize } from '@/lib/utils/localImageSize';

const DEFAULT_PLACEHOLDER = '/images/placeholder.jpeg';
const IMAGE_WIDTH = 1152;
const IMAGE_HEIGHT = 1440;
const THUMBNAIL_WIDTH = 64;
const THUMBNAIL_HEIGHT = 80;
const GALLERY_SIZES = '(min-width: 1024px) 583px, (min-width: 768px) 92vw, 100vw';

interface WatchGalleryProps {
  images: readonly GalleryPicture[];
  title: string;
}

export function WatchGallery({ images, title }: WatchGalleryProps) {
  const itemGroupRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const itemGroup = itemGroupRef.current;
    if (!itemGroup || !itemGroup.getAttribute('style')?.includes('grid-auto-flow')) return;
    const slides = Array.from(itemGroup.querySelectorAll<HTMLElement>('[data-part="item"]'));
    if (slides.length === 0) return;
    itemGroup.style.gridAutoFlow = 'unset';
    itemGroup.style.display = 'flex';
    itemGroup.style.gap = '0px';
    itemGroup.style.overflowX = 'scroll';
    itemGroup.style.scrollSnapType = 'x mandatory';
    itemGroup.style.minWidth = '0';
    for (const slide of slides) {
      slide.style.flex = '0 0 100%';
      slide.style.width = '100%';
      slide.style.minWidth = '0';
    }
    itemGroup.scrollLeft = 0;
    const firstImage = slides[0].querySelector('img');
    if (firstImage) firstImage.loading = 'eager';
  }, []);

  if (!images || images.length === 0) {
    const placeholderSize = localImageSize(DEFAULT_PLACEHOLDER);
    return (
      <div className='relative flex aspect-4/5 w-full items-center justify-center overflow-hidden border border-stone-200/80 bg-stone-50'>
        <img
          src={DEFAULT_PLACEHOLDER}
          alt={`${title} placeholder image`}
          width={placeholderSize?.width ?? IMAGE_WIDTH}
          height={placeholderSize?.height ?? IMAGE_HEIGHT}
          className='h-full w-full object-cover'
          loading='eager'
          fetchPriority='high'
          decoding='async'
        />
      </div>
    );
  }

  return (
    <Carousel.Root
      slideCount={images.length}
      spacing='16px'
      className='group relative w-full'
      aria-label={`${title} image gallery`}
    >
      <Carousel.ItemGroup
        ref={itemGroupRef}
        className='grid aspect-4/5 w-full snap-x snap-mandatory auto-cols-[100%] grid-flow-col overflow-x-auto border border-stone-200/80 bg-white'
      >
        {images.map((picture, index) => (
          <Carousel.Item key={picture.id ?? index} index={index} className='min-w-0 snap-start'>
            <div className='relative flex aspect-4/5 w-full items-center justify-center overflow-hidden bg-stone-50'>
              <img
                src={picture.src}
                srcSet={picture.slideSources}
                sizes={GALLERY_SIZES}
                alt={picture.alt || `${title}, photograph ${index + 1}`}
                width={IMAGE_WIDTH}
                height={IMAGE_HEIGHT}
                className='absolute inset-0 h-full w-full object-contain p-4'
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                decoding='async'
              />
            </div>
          </Carousel.Item>
        ))}
      </Carousel.ItemGroup>

      {images.length > 1 && (
        <Carousel.Control className='pointer-events-none absolute inset-0 flex items-center justify-between px-3'>
          <Carousel.PrevTrigger
            aria-label='Previous photograph'
            className='pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-stone-800 opacity-0 shadow-md transition-all group-hover:opacity-100 hover:bg-stone-900 hover:text-white focus-visible:opacity-100 data-disabled:hidden'
          >
            <ChevronLeft className='h-5 w-5' aria-hidden='true' />
          </Carousel.PrevTrigger>
          <Carousel.NextTrigger
            aria-label='Next photograph'
            className='pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-stone-800 opacity-0 shadow-md transition-all group-hover:opacity-100 hover:bg-stone-900 hover:text-white focus-visible:opacity-100 data-disabled:hidden'
          >
            <ChevronRight className='h-5 w-5' aria-hidden='true' />
          </Carousel.NextTrigger>
        </Carousel.Control>
      )}

      {images.length > 1 && (
        <Carousel.IndicatorGroup className='mt-4 flex gap-2 overflow-x-auto pb-2'>
          {images.map((picture, index) => (
            <Carousel.Indicator
              key={picture.id ?? index}
              index={index}
              aria-label={`Show photograph ${index + 1} of ${images.length}`}
              className='h-20 w-16 shrink-0 cursor-pointer overflow-hidden opacity-70 transition-all data-current:opacity-100'
            >
              <img
                src={picture.posterHref}
                alt=''
                width={THUMBNAIL_WIDTH}
                height={THUMBNAIL_HEIGHT}
                className='h-full w-full object-cover'
                loading='lazy'
                decoding='async'
              />
            </Carousel.Indicator>
          ))}
        </Carousel.IndicatorGroup>
      )}
    </Carousel.Root>
  );
}
