const STORE_API_PREFIX = '/wc/store/v1/';
const WP_BACKEND_ORIGIN = 'https://donghocodien.com/wp-json';

const HOP_BY_HOP_HEADERS = [
  'host',
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'accept-encoding',
  'content-length',
];

export async function handleStoreApiProxy(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith(STORE_API_PREFIX)) {
    return null;
  }

  const target = `${WP_BACKEND_ORIGIN}${url.pathname}${url.search}`;
  const headers = new Headers(request.headers);
  for (const name of HOP_BY_HOP_HEADERS) {
    headers.delete(name);
  }

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const body = hasBody ? await request.arrayBuffer() : undefined;

  return fetch(target, {
    method: request.method,
    headers,
    body,
  });
}
