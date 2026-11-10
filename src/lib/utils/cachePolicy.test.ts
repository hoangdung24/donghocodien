import { describe, it, expect } from 'vitest';
import {
  resolveCacheScope,
  cacheControlFor,
  sharedRouteRule,
  NEGATIVE_EDGE_TTL_SECONDS,
  SHARED_CACHE_CONTROL_TTL_SECONDS,
  SHARED_STALE_WHILE_REVALIDATE_SECONDS,
} from './cachePolicy';

describe('resolveCacheScope', () => {
  it('is shared for the storefront catalog', () => {
    expect(resolveCacheScope('/watches')).toBe('shared');
  });

  it('treats trailing slashes as shared', () => {
    expect(resolveCacheScope('/watches/')).toBe('shared');
  });

  it('is shared for product detail pages', () => {
    expect(resolveCacheScope('/watches/seiko-6309-7290')).toBe('shared');
  });

  it('is shared for deeply nested product slugs', () => {
    expect(resolveCacheScope('/watches/some/odd/slug')).toBe('shared');
  });

  it('is shared for archive listings', () => {
    expect(resolveCacheScope('/archives')).toBe('shared');
    expect(resolveCacheScope('/archives/3')).toBe('shared');
  });

  it('is private for cart flow pages', () => {
    expect(resolveCacheScope('/cart')).toBe('private');
    expect(resolveCacheScope('/checkout')).toBe('private');
    expect(resolveCacheScope('/checkout/order-received/1042')).toBe('private');
  });

  it('is shared for the home page', () => {
    expect(resolveCacheScope('/')).toBe('shared');
  });

  it('is private for static policy pages', () => {
    expect(resolveCacheScope('/warranty-policy')).toBe('private');
    expect(resolveCacheScope('/robots.txt')).toBe('private');
  });
});

describe('cacheControlFor', () => {
  it('keeps a browser-level directive for shared 200 responses; the CDN rule owns the edge', () => {
    expect(cacheControlFor('shared', 200)).toBe(
      `public, max-age=0, s-maxage=300, stale-while-revalidate=86400`
    );
  });

  it('returns a short negative-cache directive for shared error responses', () => {
    expect(cacheControlFor('shared', 404)).toBe(
      `public, max-age=0, s-maxage=${NEGATIVE_EDGE_TTL_SECONDS}`
    );
    expect(cacheControlFor('shared', 500)).toBe(
      `public, max-age=0, s-maxage=${NEGATIVE_EDGE_TTL_SECONDS}`
    );
  });

  it('returns no-store for private scopes at any status', () => {
    expect(cacheControlFor('private', 200)).toBe('private, no-store');
    expect(cacheControlFor('private', 500)).toBe('private, no-store');
  });
});

describe('sharedRouteRule', () => {
  it('derives the CDN rule from the same TTL constants as the browser directive', () => {
    expect(sharedRouteRule(['watches'])).toEqual({
      maxAge: SHARED_CACHE_CONTROL_TTL_SECONDS,
      swr: SHARED_STALE_WHILE_REVALIDATE_SECONDS,
      tags: ['watches'],
    });
    expect(SHARED_CACHE_CONTROL_TTL_SECONDS).toBe(300);
    expect(SHARED_STALE_WHILE_REVALIDATE_SECONDS).toBe(86400);
  });
});
