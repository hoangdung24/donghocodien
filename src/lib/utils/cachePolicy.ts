export const SHARED_CACHE_CONTROL_TTL_SECONDS = 300;
export const SHARED_NOT_FOUND_TTL_SECONDS = 60;
const SHARED_STALE_WHILE_REVALIDATE_SECONDS = 86400;

export type CacheScope = 'shared' | 'private';

const SHARED_PATH_PATTERNS: RegExp[] = [/^\/watches(?:\/|$)/, /^\/archives(?:\/|$)/];

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

export function cacheControlFor(scope: CacheScope, status: number): string {
  if (scope === 'private') {
    return 'private, no-store';
  }
  const edgeTtl = status === 200 ? SHARED_CACHE_CONTROL_TTL_SECONDS : SHARED_NOT_FOUND_TTL_SECONDS;
  return `public, max-age=0, s-maxage=${edgeTtl}, stale-while-revalidate=${SHARED_STALE_WHILE_REVALIDATE_SECONDS}`;
}

export function pageCacheControl(scope: CacheScope, dataLoaded: boolean): string {
  if (scope === 'private' || !dataLoaded) {
    return 'private, no-store';
  }
  return cacheControlFor(scope, 200);
}
