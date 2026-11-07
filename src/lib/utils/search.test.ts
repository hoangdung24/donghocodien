import { describe, it, expect } from 'vitest';
import { parseSearchQuery } from '@/lib/utils/search';

describe('parseSearchQuery', () => {
  it('returns undefined when no search param is present', () => {
    expect(parseSearchQuery(new URLSearchParams())).toBeUndefined();
  });

  it('returns undefined for the focus-only value', () => {
    expect(parseSearchQuery(new URLSearchParams('search=true'))).toBeUndefined();
  });

  it('returns the trimmed query', () => {
    expect(parseSearchQuery(new URLSearchParams('search=%20rolex%20'))).toBe('rolex');
  });

  it('returns undefined for whitespace-only queries', () => {
    expect(parseSearchQuery(new URLSearchParams('search=%20%20'))).toBeUndefined();
  });
});
