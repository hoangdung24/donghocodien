import { describe, it, expect } from 'vitest';
import {
  ARCHIVE_PAGE_SIZE,
  buildSitemapXml,
  excludedSitemapPaths,
  toArchivePageCount,
} from '@/lib/utils/sitemap';

describe('Sitemap URL building seam', () => {
  it('excludes private and transactional routes', () => {
    expect(excludedSitemapPaths).toContain('/cart');
    expect(excludedSitemapPaths).toContain('/checkout');
    expect(excludedSitemapPaths).toContain('/404');
  });

  it('derives archive page count from the product total', () => {
    expect(toArchivePageCount(2312)).toBe(Math.ceil(2312 / ARCHIVE_PAGE_SIZE));
    expect(toArchivePageCount(0)).toBe(0);
    expect(toArchivePageCount(20)).toBe(1);
    expect(toArchivePageCount(21)).toBe(2);
  });

  it('emits one loc per unique path, encoded and absolute', () => {
    const xml = buildSitemapXml('https://donghocodien.com', [
      '/',
      '/watches',
      '/watches',
      '/watches/rolex-datejust-1601/',
      '/watches/omega-speedmaster-' + 'x'.repeat(10),
      '/archives/2',
    ]);

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<loc>https://donghocodien.com/</loc>');
    expect(xml).toContain('<loc>https://donghocodien.com/watches</loc>');
    expect(xml.split('/watches</loc>').length - 1).toBe(1);
    expect(xml).toContain('<loc>https://donghocodien.com/watches/rolex-datejust-1601/</loc>');
    expect(xml).toContain('<loc>https://donghocodien.com/archives/2</loc>');
    expect(xml).toContain('<urlset');
  });

  it('escapes ampersands in query style paths', () => {
    const xml = buildSitemapXml('https://donghocodien.com', ['/watches?category=a&page=2']);
    expect(xml).toContain('&amp;');
    expect(xml).not.toContain('a&page');
  });

  it('returns an empty urlset when no paths are given', () => {
    const xml = buildSitemapXml('https://donghocodien.com', []);
    expect(xml).toContain('<urlset');
    expect(xml).not.toContain('<url>');
  });
});
