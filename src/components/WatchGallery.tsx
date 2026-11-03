import React from 'react';
import { Carousel } from '@ark-ui/react/carousel';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProductImage } from '../lib/schema/product';

interface WatchGalleryProps {
  images: ProductImage[];
  title: string;
}

export function WatchGallery({ images, title }: WatchGalleryProps) {
  if (!images || images.length === 0) {
    return (
      <div className="aspect-[4/5] bg-stone-100 flex items-center justify-center text-stone-400 font-serif">
        No images available
      </div>
    );
  }

  return (
    <Carousel.Root
      slideCount={images.length}
      spacing="16px"
      className="relative w-full group"
    >
      <Carousel.ItemGroup className="overflow-hidden rounded-none border border-stone-200/80 bg-white">
        {images.map((image, index) => (
          <Carousel.Item key={image.id ?? index} index={index} className="w-full">
            <div className="relative aspect-[4/5] overflow-hidden bg-stone-50 flex items-center justify-center">
              <img
                src={image.src}
                alt={image.alt || `${title} - ảnh ${index + 1}`}
                className="w-full h-full object-contain p-4"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            </div>
          </Carousel.Item>
        ))}
      </Carousel.ItemGroup>

      {images.length > 1 && (
        <Carousel.Control className="absolute inset-0 pointer-events-none flex items-center justify-between px-3">
          <Carousel.PrevTrigger className="pointer-events-auto w-10 h-10 rounded-full bg-white/90 shadow-md border border-stone-200/60 flex items-center justify-center text-stone-800 hover:bg-stone-900 hover:text-white transition-all opacity-0 group-hover:opacity-100">
            <ChevronLeft className="w-5 h-5" />
          </Carousel.PrevTrigger>
          <Carousel.NextTrigger className="pointer-events-auto w-10 h-10 rounded-full bg-white/90 shadow-md border border-stone-200/60 flex items-center justify-center text-stone-800 hover:bg-stone-900 hover:text-white transition-all opacity-0 group-hover:opacity-100">
            <ChevronRight className="w-5 h-5" />
          </Carousel.NextTrigger>
        </Carousel.Control>
      )}

      {images.length > 1 && (
        <Carousel.IndicatorGroup className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <Carousel.Indicator
              key={image.id ?? index}
              index={index}
              className="flex-shrink-0 w-16 h-20 border border-stone-200 overflow-hidden cursor-pointer opacity-70 data-[current]:opacity-100 data-[current]:border-stone-900 transition-all"
            >
              <img
                src={image.thumbnail || image.src}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </Carousel.Indicator>
          ))}
        </Carousel.IndicatorGroup>
      )}
    </Carousel.Root>
  );
}
