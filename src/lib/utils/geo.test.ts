import { describe, it, expect, vi, afterEach } from 'vitest';
import { parseCountryCookie, parseCfTraceLoc, detectVisitorCountry } from './geo';

describe('parseCountryCookie', () => {
  it('reads the st_country cookie from a cookie header', () => {
    expect(parseCountryCookie('foo=bar; st_country=JP; other=x')).toBe('JP');
  });

  it('uppercases the country code', () => {
    expect(parseCountryCookie('st_country=de')).toBe('DE');
  });

  it('returns null when the cookie is missing or malformed', () => {
    expect(parseCountryCookie('foo=bar')).toBeNull();
    expect(parseCountryCookie('st_country=ABC')).toBeNull();
    expect(parseCountryCookie('')).toBeNull();
  });
});

describe('parseCfTraceLoc', () => {
  it('extracts the visitor country from a Cloudflare trace response', () => {
    const trace = 'fl=123\nh=donghocodien.com\nip=1.2.3.4\nts=1\nloc=DE\ntls=TLSv1.3\n';
    expect(parseCfTraceLoc(trace)).toBe('DE');
  });

  it('returns null when loc is missing or malformed', () => {
    expect(parseCfTraceLoc('fl=1\nloc=EURO\n')).toBeNull();
    expect(parseCfTraceLoc('fl=1\ncolo=FRA\n')).toBeNull();
    expect(parseCfTraceLoc('')).toBeNull();
  });
});

describe('detectVisitorCountry', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the cookie country without any network request', async () => {
    vi.stubGlobal('document', { cookie: 'st_country=JP' });
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(detectVisitorCountry()).resolves.toBe('JP');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('detects the country in the background via the Cloudflare trace endpoint', async () => {
    vi.stubGlobal('document', { cookie: '' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: async () => 'fl=1\nip=1.2.3.4\nloc=FR\ntls=TLSv1.3\n',
    }));

    await expect(detectVisitorCountry()).resolves.toBe('FR');
  });

  it('falls back to the public IP lookup when the trace endpoint is unavailable', async () => {
    vi.stubGlobal('document', { cookie: '' });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ country_code: 'sg' }) });
    vi.stubGlobal('fetch', fetchMock);

    await expect(detectVisitorCountry()).resolves.toBe('SG');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('returns null when both detection sources fail', async () => {
    vi.stubGlobal('document', { cookie: '' });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    await expect(detectVisitorCountry()).resolves.toBeNull();
  });
});
