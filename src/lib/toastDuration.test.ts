import { describe, expect, it } from 'vitest';
import { resolveToastDuration } from '@/lib/toastDuration';

describe('resolveToastDuration', () => {
  it('keeps error notifications readable far longer than the pause window a screen reader user needs', () => {
    expect(resolveToastDuration('error')).toBeGreaterThanOrEqual(5000);
  });

  it('keeps success notifications readable long enough to finish a short sentence', () => {
    expect(resolveToastDuration('success')).toBeGreaterThanOrEqual(5000);
  });

  it('holds errors on screen longer than confirmations', () => {
    expect(resolveToastDuration('error')).toBeGreaterThan(resolveToastDuration('success'));
  });
});
