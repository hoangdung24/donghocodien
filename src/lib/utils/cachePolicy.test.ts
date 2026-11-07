import { describe, it, expect } from 'vitest';
import {
  cacheControlFor,
  resolveCacheScope,
  SHARED_CACHE_CONTROL_TTL_SECONDS,
  SHARED_NOT_FOUND_TTL_SECONDS,
} from '@/lib/utils/cachePolicy';

describe('resolveCacheScope', () => {
  it('treats the catalog route as shared-cacheable', () => {
    expect(resolveCacheScope('/watches')).toBe('shared');
  });

  it('treats a trailing-slash catalog route as shared-cacheable', () => {
    expect(resolveCacheScope('/watches/')).toBe('shared');
  });

  it('treats product detail routes as shared-cacheable', () => {
    expect(resolveCacheScope('/watches/seiko-6309-7290')).toBe('shared');
  });

  it('treats deep product paths as shared-cacheable', () => {
    expect(resolveCacheScope('/watches/some/odd/slug')).toBe('shared');
  });

  it('treats archive routes as shared-cacheable', () => {
    expect(resolveCacheScope('/archives')).toBe('shared');
    expect(resolveCacheScope('/archives/3')).toBe('shared');
  });

  it('treats the cart as private', () => {
    expect(resolveCacheScope('/cart')).toBe('private');
  });

  it('treats checkout and order confirmation as private', () => {
    expect(resolveCacheScope('/checkout')).toBe('private');
    expect(resolveCacheScope('/checkout/order-received/1042')).toBe('private');
  });

  it('treats the homepage as shared-cacheable', () => {
    expect(resolveCacheScope('/')).toBe('shared');
  });

  it('treats unknown routes as private', () => {
    expect(resolveCacheScope('/warranty-policy')).toBe('private');
    expect(resolveCacheScope('/robots.txt')).toBe('private');
  });
});

describe('cacheControlFor', () => {
  it('caches successful shared responses at the edge', () => {
    const directive = cacheControlFor('shared', 200);
    expect(directive).toBe(
      `public, max-age=0, s-maxage=${SHARED_CACHE_CONTROL_TTL_SECONDS}, stale-while-revalidate=86400`
    );
  });

  it('uses a short edge TTL for non-200 shared responses', () => {
    const directive = cacheControlFor('shared', 404);
    expect(directive).toBe(
      `public, max-age=0, s-maxage=${SHARED_NOT_FOUND_TTL_SECONDS}, stale-while-revalidate=86400`
    );
  });

  it('never stores private responses anywhere', () => {
    expect(cacheControlFor('private', 200)).toBe('private, no-store');
    expect(cacheControlFor('private', 500)).toBe('private, no-store');
  });
});
