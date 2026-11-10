import type { GalleryPicture } from '@/lib/schema/galleryPicture';
import type { ProductImage } from '@/lib/schema/product';

const LIGHTBOX_WIDTHS = [768, 600, 300];
const THUMBNAIL_STEP = 300;
const REMOTE_SOURCE_PATTERN = /^https?:\/\//;
const SIZE_SUFFIX_PATTERN = /^(.*)-(\d+)x(\d+)(\.[a-z]+)$/i;

function withWidth(source: string, width: number): string {
  const match = SIZE_SUFFIX_PATTERN.exec(source);
  const height = Math.round(width * 1.25);
  if (match) return `${match[1]}-${width}x${height}${match[4]}`;
  return source.replace(/(\.[a-z]+)$/i, `-${width}x${height}$1`);
}

function tailWidth(source: string): number | null {
  const match = SIZE_SUFFIX_PATTERN.exec(source);
  return match ? Number(match[2]) : null;
}

function toWidthDescriptors(sources: string[]): string {
  return sources
    .map((source) => {
      const width = tailWidth(source) ?? 1152;
      return `${source} ${width}w`;
    })
    .join(', ');
}

function smallestDeclaredSource(srcset: string): string | null {
  const entries = srcset
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [source, descriptor] = entry.split(/\s+/);
      const width = descriptor?.endsWith('w') ? Number(descriptor.slice(0, -1)) : NaN;
      return {
        source: source ?? '',
        width: Number.isFinite(width) ? width : Number.MAX_SAFE_INTEGER,
      };
    })
    .filter((entry) => entry.source.length > 0);
  if (entries.length === 0) return null;
  return entries.reduce((smallest, entry) => (entry.width < smallest.width ? entry : smallest))
    .source;
}

function toGalleryPicture(image: ProductImage): GalleryPicture {
  if (!REMOTE_SOURCE_PATTERN.test(image.src)) {
    return {
      id: image.id,
      src: image.src,
      alt: image.alt,
      slideSources: image.src,
      thumbnailSources: image.src,
      posterHref: image.src,
    };
  }

  const thumbnailSource = image.thumbnail ?? smallestDeclaredSource(image.srcset ?? '');

  if (image.srcset) {
    const thumbnailWidth = thumbnailSource ? tailWidth(thumbnailSource) : null;
    return {
      id: image.id,
      src: image.src,
      alt: image.alt,
      slideSources: image.srcset,
      thumbnailSources: thumbnailWidth
        ? `${thumbnailSource} ${thumbnailWidth}w`
        : (thumbnailSource ?? image.src),
      posterHref: thumbnailSource ?? image.src,
    };
  }

  const lightboxSources = [
    image.src,
    ...LIGHTBOX_WIDTHS.map((width) => withWidth(image.src, width)),
  ];
  const synthesizedThumbnail = thumbnailSource ?? withWidth(image.src, THUMBNAIL_STEP);
  const thumbnailWidth = tailWidth(synthesizedThumbnail);

  return {
    id: image.id,
    src: image.src,
    alt: image.alt,
    slideSources: toWidthDescriptors(lightboxSources),
    thumbnailSources: thumbnailWidth
      ? `${synthesizedThumbnail} ${thumbnailWidth}w`
      : synthesizedThumbnail,
    posterHref: synthesizedThumbnail,
  };
}

export function buildGalleryPictures(product: {
  images: readonly ProductImage[];
}): GalleryPicture[] {
  return product.images.map(toGalleryPicture);
}
