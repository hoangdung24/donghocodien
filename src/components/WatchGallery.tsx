import { Carousel } from '@ark-ui/react/carousel';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProductImage } from '../lib/schema/product';

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
    <Carousel.Root slideCount={images.length} spacing='16px' className='group relative w-full'>
      <Carousel.ItemGroup className='overflow-hidden rounded-none border border-stone-200/80 bg-white'>
        {images.map((image, index) => (
          <Carousel.Item key={image.id ?? index} index={index} className='w-full'>
            <div className='relative flex aspect-4/5 items-center justify-center overflow-hidden bg-stone-50'>
              <img
                src={image.src}
                alt={image.alt || `${title} - ảnh ${index + 1}`}
                className='h-full w-full object-contain p-4'
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            </div>
          </Carousel.Item>
        ))}
      </Carousel.ItemGroup>

      {images.length > 1 && (
        <Carousel.Control className='pointer-events-none absolute inset-0 flex items-center justify-between px-3'>
          <Carousel.PrevTrigger className='pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-800 opacity-0 shadow-md transition-all group-hover:opacity-100 hover:bg-stone-900 hover:text-white'>
            <ChevronLeft className='h-5 w-5' />
          </Carousel.PrevTrigger>
          <Carousel.NextTrigger className='pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-800 opacity-0 shadow-md transition-all group-hover:opacity-100 hover:bg-stone-900 hover:text-white'>
            <ChevronRight className='h-5 w-5' />
          </Carousel.NextTrigger>
        </Carousel.Control>
      )}

      {images.length > 1 && (
        <Carousel.IndicatorGroup className='mt-4 flex gap-2 overflow-x-auto pb-2'>
          {images.map((image, index) => (
            <Carousel.Indicator
              key={image.id ?? index}
              index={index}
              className='h-20 w-16 shrink-0 cursor-pointer overflow-hidden border border-stone-200 opacity-70 transition-all data-current:border-stone-900 data-current:opacity-100'
            >
              <img
                src={image.thumbnail || image.src}
                alt={`Thumbnail ${index + 1}`}
                className='h-full w-full object-cover'
              />
            </Carousel.Indicator>
          ))}
        </Carousel.IndicatorGroup>
      )}
    </Carousel.Root>
  );
}
