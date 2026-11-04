export const COUNTRY_COOKIE = 'st_country';

export const COUNTRY_CODE_PATTERN = /^[A-Za-z]{2}$/;

const COUNTRY_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function parseCountryCookie(cookieHeader: string): string | null {
  for (const part of cookieHeader.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === COUNTRY_COOKIE) {
      const value = decodeURIComponent(rest.join('='));
      return COUNTRY_CODE_PATTERN.test(value) ? value.toUpperCase() : null;
    }
  }
  return null;
}

export function readVisitorCountry(): string | null {
  if (typeof document === 'undefined') return null;
  return parseCountryCookie(document.cookie);
}

export function persistVisitorCountry(countryCode: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${COUNTRY_COOKIE}=${countryCode}; path=/; max-age=${COUNTRY_COOKIE_MAX_AGE}; samesite=lax`;
}

export function parseCfTraceLoc(traceText: string): string | null {
  const match = /^loc=([A-Za-z]{2})$/m.exec(traceText);
  return match ? match[1].toUpperCase() : null;
}

async function fetchCloudflareTraceCountry(): Promise<string | null> {
  try {
    const response = await fetch('/cdn-cgi/trace');
    if (!response.ok) return null;
    return parseCfTraceLoc(await response.text());
  } catch {
    return null;
  }
}

async function fetchIpWhoCountry(): Promise<string | null> {
  try {
    const response = await fetch('https://ipwho.is/');
    if (!response.ok) return null;
    const data = await response.json();
    const code = data?.country_code;
    return typeof code === 'string' && COUNTRY_CODE_PATTERN.test(code) ? code.toUpperCase() : null;
  } catch {
    return null;
  }
}

export async function detectVisitorCountry(): Promise<string | null> {
  const known = readVisitorCountry();
  if (known) return known;

  const fromTrace = await fetchCloudflareTraceCountry();
  if (fromTrace) {
    persistVisitorCountry(fromTrace);
    return fromTrace;
  }

  const fromLookup = await fetchIpWhoCountry();
  if (fromLookup) {
    persistVisitorCountry(fromLookup);
    return fromLookup;
  }

  return null;
}
