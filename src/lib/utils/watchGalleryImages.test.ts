import { describe, expect, it } from 'vitest';
import { buildGalleryPictures } from '@/lib/utils/watchGalleryImages';

const UPLOADED_IMAGE = 'https://cms.donghocodien.com/wp-content/uploads/2026/10/ref-8645-32-1.jpg';

function sized(width: number, height: number): string {
  return UPLOADED_IMAGE.replace('-1.', `-1-${width}x${height}.`);
}

describe('buildGalleryPictures', () => {
  it('only offers candidate widths the media library actually generated', () => {
    const [picture] = buildGalleryPictures({
      images: [{ id: 1, src: UPLOADED_IMAGE, thumbnail: sized(300, 375) }],
    });

    expect(picture.slideSources).toBe(
      `${UPLOADED_IMAGE} 1152w, ${sized(768, 960)} 768w, ${sized(600, 750)} 600w, ${sized(300, 375)} 300w`
    );
  });

  it('derives poster and thumbnail candidates from the declared thumbnail size', () => {
    const [picture] = buildGalleryPictures({
      images: [{ id: 1, src: UPLOADED_IMAGE, thumbnail: sized(300, 375) }],
    });

    expect(picture.posterHref).toBe(sized(300, 375));
    expect(picture.thumbnailSources).toBe(`${sized(300, 375)} 300w`);
  });

  it('falls back to the smallest declared size when no derived size is declared', () => {
    const [picture] = buildGalleryPictures({
      images: [{ id: 1, src: UPLOADED_IMAGE }],
    });

    expect(picture.posterHref).toBe(sized(300, 375));
    expect(picture.slideSources.startsWith(`${UPLOADED_IMAGE} 1152w`)).toBe(true);
  });

  it('keeps bundled local images untouched because they have no size variants', () => {
    const [picture] = buildGalleryPictures({
      images: [{ id: 3, src: '/images/placeholder.jpeg' }],
    });

    expect(picture.slideSources).toBe('/images/placeholder.jpeg');
    expect(picture.thumbnailSources).toBe('/images/placeholder.jpeg');
    expect(picture.posterHref).toBe('/images/placeholder.jpeg');
  });
});
