export const SHARED_CACHE_CONTROL_TTL_SECONDS = 300;
export const NEGATIVE_EDGE_TTL_SECONDS = 60;
export const SHARED_STALE_WHILE_REVALIDATE_SECONDS = 86400;

export type CacheScope = 'shared' | 'private';

const SHARED_PATH_PATTERNS: RegExp[] = [/^\/watches(?:\/|$)/, /^\/archives(?:\/|$)/];

export interface SharedRouteRule {
  maxAge: number;
  swr: number;
  tags: string[];
}

export function sharedRouteRule(tags: string[]): SharedRouteRule {
  return {
    maxAge: SHARED_CACHE_CONTROL_TTL_SECONDS,
    swr: SHARED_STALE_WHILE_REVALIDATE_SECONDS,
    tags,
  };
}

export function resolveCacheScope(pathname: string): CacheScope {
  const normalizedPathname =
    pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  if (
    normalizedPathname === '/' ||
    SHARED_PATH_PATTERNS.some((pattern) => pattern.test(normalizedPathname))
  ) {
    return 'shared';
  }
  return 'private';
}

export function cacheControlFor(scope: CacheScope, status: number): string | null {
  if (scope === 'private') {
    return 'private, no-store';
  }
  if (status !== 200) {
    return `public, max-age=0, s-maxage=${NEGATIVE_EDGE_TTL_SECONDS}`;
  }
  return `public, max-age=0, s-maxage=${SHARED_CACHE_CONTROL_TTL_SECONDS}, stale-while-revalidate=${SHARED_STALE_WHILE_REVALIDATE_SECONDS}`;
}
