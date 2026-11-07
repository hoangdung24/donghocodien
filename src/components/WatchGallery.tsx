import { Carousel } from '@ark-ui/react/carousel';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProductImage } from '@/lib/schema/product';

const DEFAULT_PLACEHOLDER = '/images/placeholder.jpeg';

interface WatchGalleryProps {
  images: readonly ProductImage[];
  title: string;
}

export function WatchGallery({ images, title }: WatchGalleryProps) {
  if (!images || images.length === 0) {
    return (
      <div className='relative flex aspect-4/5 items-center justify-center overflow-hidden border border-stone-200/80 bg-stone-50'>
        <img
          src={DEFAULT_PLACEHOLDER}
          alt={`${title} placeholder image`}
          className='h-full w-full object-cover'
          loading='eager'
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
      <Carousel.ItemGroup className='overflow-hidden rounded-none border border-stone-200/80 bg-white'>
        {images.map((image, index) => (
          <Carousel.Item key={image.id ?? index} index={index} className='w-full'>
            <div className='relative flex aspect-4/5 items-center justify-center overflow-hidden bg-stone-50'>
              <img
                src={image.src}
                alt={image.alt || `${title}, photograph ${index + 1}`}
                className='h-full w-full object-contain p-4'
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            </div>
          </Carousel.Item>
        ))}
      </Carousel.ItemGroup>

      {images.length > 1 && (
        <Carousel.Control className='pointer-events-none absolute inset-0 flex items-center justify-between px-3'>
          <Carousel.PrevTrigger
            aria-label='Previous photograph'
            className='pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-stone-800 opacity-0 shadow-md transition-all group-hover:opacity-100 hover:bg-stone-900 hover:text-white focus-visible:opacity-100 data-[disabled]:hidden'
          >
            <ChevronLeft className='h-5 w-5' aria-hidden='true' />
          </Carousel.PrevTrigger>
          <Carousel.NextTrigger
            aria-label='Next photograph'
            className='pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-stone-800 opacity-0 shadow-md transition-all group-hover:opacity-100 hover:bg-stone-900 hover:text-white focus-visible:opacity-100 data-[disabled]:hidden'
          >
            <ChevronRight className='h-5 w-5' aria-hidden='true' />
          </Carousel.NextTrigger>
        </Carousel.Control>
      )}

      {images.length > 1 && (
        <Carousel.IndicatorGroup className='mt-4 flex gap-2 overflow-x-auto pb-2'>
          {images.map((image, index) => (
            <Carousel.Indicator
              key={image.id ?? index}
              index={index}
              aria-label={`Show photograph ${index + 1} of ${images.length}`}
              className='h-20 w-16 shrink-0 cursor-pointer overflow-hidden border border-stone-200 opacity-70 transition-all data-current:border-stone-900 data-current:opacity-100'
            >
              <img
                src={image.thumbnail || image.src}
                alt=''
                className='h-full w-full object-cover'
              />
            </Carousel.Indicator>
          ))}
        </Carousel.IndicatorGroup>
      )}
    </Carousel.Root>
  );
}
