const REQUEST_TIMEOUT_MS = 60_000;

export async function fetchJsonWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'DongHoCoDien-Headless/1.0',
      },
      signal: controller.signal,
      keepalive: false,
    });
  } finally {
    clearTimeout(timer);
  }
}
