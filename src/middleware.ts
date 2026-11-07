import type { APIContext, MiddlewareNext } from 'astro';
import { handleStoreApiProxy } from '@/lib/storeApiProxy';
import { cacheControlFor, resolveCacheScope } from '@/lib/utils/cachePolicy';
import { COUNTRY_COOKIE, COUNTRY_CODE_PATTERN } from '@/lib/utils/geo';

const COUNTRY_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

interface CloudflareRuntime {
  cf?: { country?: string | null };
}

type RequestWithGeo = Request & { cf?: { country?: string | null } };

function normalizeCountry(value: string | null | undefined): string | null {
  return value && COUNTRY_CODE_PATTERN.test(value) ? value.toUpperCase() : null;
}

function getCloudflareCountry(context: APIContext): string | null {
  try {
    const runtime = (context.locals as { runtime?: CloudflareRuntime }).runtime;
    return normalizeCountry(runtime?.cf?.country);
  } catch {
    return normalizeCountry((context.request as RequestWithGeo).cf?.country);
  }
}

export const onRequest = async (context: APIContext, next: MiddlewareNext): Promise<Response> => {
  const proxied = await handleStoreApiProxy(context.request);
  if (proxied) {
    return proxied;
  }

  const cacheScope = resolveCacheScope(context.url.pathname);

  const cfCountry = import.meta.env.DEV ? null : getCloudflareCountry(context);
  const cookieCountry = normalizeCountry(context.cookies.get(COUNTRY_COOKIE)?.value);

  const country = cfCountry ?? cookieCountry;

  if (country && country !== cookieCountry && cacheScope !== 'shared') {
    context.cookies.set(COUNTRY_COOKIE, country, {
      path: '/',
      maxAge: COUNTRY_COOKIE_MAX_AGE,
      sameSite: 'lax',
    });
  }

  context.locals.country = country;

  const response = await next();

  if (!import.meta.env.DEV && !response.headers.has('Cache-Control')) {
    response.headers.set('Cache-Control', cacheControlFor(cacheScope, response.status));
  }
  return response;
};
