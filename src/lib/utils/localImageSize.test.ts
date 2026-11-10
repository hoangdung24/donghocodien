import { describe, expect, it } from 'vitest';
import { localImageSize } from '@/lib/utils/localImageSize';
import localImageDimensions from '@/lib/data/localImageDimensions.json';

describe('localImageSize', () => {
  it('reports the intrinsic size of a bundled image so layout space is reserved', () => {
    expect(localImageSize('/images/placeholder.jpeg')).toEqual({ width: 1152, height: 1440 });
  });

  it('reports the intrinsic size of the brand logo', () => {
    expect(localImageSize('/images/logo.png')).toEqual({ width: 608, height: 93 });
  });

  it('returns undefined for images hosted outside the project', () => {
    expect(localImageSize('https://cms.donghocodien.com/wp-content/uploads/a.jpg')).toBeUndefined();
  });

  it('every recorded local image declares positive integer dimensions', () => {
    for (const size of Object.values(localImageDimensions)) {
      expect(Number.isInteger(size.width) && size.width > 0).toBe(true);
      expect(Number.isInteger(size.height) && size.height > 0).toBe(true);
    }
  });
});
