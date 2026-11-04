import type { APIContext, MiddlewareNext } from 'astro';
import { handleStoreApiProxy } from './lib/storeApiProxy';

export const onRequest = async (context: APIContext, next: MiddlewareNext): Promise<Response> => {
  const proxied = await handleStoreApiProxy(context.request);
  if (proxied) {
    return proxied;
  }
  return next();
};
