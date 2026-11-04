import { describe, expect, it } from 'vitest';
import { buttonClass } from './Button';

describe('buttonClass', () => {
  it('defaults to primary variant and md size', () => {
    const cls = buttonClass();
    expect(cls).toContain('bg-stone-900');
    expect(cls).toContain('text-white');
    expect(cls).toContain('text-sm');
    expect(cls).toContain('uppercase');
  });

  it('applies outline variant without solid background', () => {
    const cls = buttonClass('outline', 'md');
    expect(cls).toContain('border');
    expect(cls).not.toContain('bg-stone-900');
  });

  it('applies ghost variant as text-only', () => {
    const cls = buttonClass('ghost', 'md');
    expect(cls).toContain('text-stone-600');
    expect(cls).not.toContain('bg-stone-900');
    expect(cls).not.toContain('border');
  });

  it('sm size renders smaller text and padding', () => {
    expect(buttonClass('primary', 'sm')).toContain('text-xs');
    expect(buttonClass('primary', 'sm')).toContain('py-2.5');
  });

  it('appends custom className last', () => {
    const cls = buttonClass('primary', 'md', 'w-full mt-6');
    expect(cls.endsWith('w-full mt-6')).toBe(true);
  });

  it('always includes disabled affordances', () => {
    expect(buttonClass('primary', 'md')).toContain('disabled:opacity-50');
    expect(buttonClass('ghost', 'sm')).toContain('disabled:cursor-not-allowed');
  });
});
