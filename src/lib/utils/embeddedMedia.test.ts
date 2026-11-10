import { describe, expect, it } from 'vitest';
import { reserveEmbeddedMediaSpace } from '@/lib/utils/embeddedMedia';

describe('reserveEmbeddedMediaSpace', () => {
  it('adds a matching aspect-ratio attribute when width and height are present', () => {
    const output = reserveEmbeddedMediaSpace(
      '<p><img src="https://example.com/a.jpg" width="294" height="400" /></p>'
    );

    expect(output).toContain('data-aspect-ratio="294/400"');
  });

  it('keeps the declared width and height attributes untouched', () => {
    const output = reserveEmbeddedMediaSpace(
      '<img src="https://example.com/a.jpg" width="294" height="400" />'
    );

    expect(output).toContain('width="294"');
    expect(output).toContain('height="400"');
  });

  it('defaults images without dimensions to lazy loading and async decoding', () => {
    const output = reserveEmbeddedMediaSpace('<img src="https://example.com/a.jpg" />');

    expect(output).toContain('loading="lazy"');
    expect(output).toContain('decoding="async"');
    expect(output).not.toContain('data-aspect-ratio=');
  });

  it('preserves an eager loading hint authored in the CMS', () => {
    const output = reserveEmbeddedMediaSpace(
      '<img src="https://example.com/a.jpg" loading="eager" width="100" height="100" />'
    );

    expect(output).toContain('loading="eager"');
  });

  it('reserves a 16 by 9 box for embeds without dimensions', () => {
    const output = reserveEmbeddedMediaSpace(
      '<iframe src="https://www.youtube.com/embed/x"></iframe>'
    );

    expect(output).toContain('data-aspect-ratio="16/9"');
    expect(output).toContain('loading="lazy"');
  });

  it('uses the frame dimensions when the CMS supplies them', () => {
    const output = reserveEmbeddedMediaSpace(
      '<iframe src="https://example.com/map" width="640" height="480"></iframe>'
    );

    expect(output).toContain('data-aspect-ratio="640/480"');
  });

  it('returns content that embeds no media unchanged', () => {
    const rawHtml = '<h2>Warranty</h2><p>Six months of coverage.</p>';

    expect(reserveEmbeddedMediaSpace(rawHtml)).toBe(rawHtml);
  });

  it('returns an empty string for empty input', () => {
    expect(reserveEmbeddedMediaSpace('')).toBe('');
  });

  it('reaches media nested several levels deep', () => {
    const output = reserveEmbeddedMediaSpace(
      '<div><div><figure><img src="https://example.com/b.jpg" width="10" height="20"></figure></div></div>'
    );

    expect(output).toContain('data-aspect-ratio="10/20"');
  });

  it('leaves non media markup intact', () => {
    const output = reserveEmbeddedMediaSpace(
      '<h2>Shipping</h2><p>Insured worldwide delivery.</p><img src="https://example.com/c.jpg" width="4" height="3">'
    );

    expect(output).toContain('<h2>Shipping</h2>');
    expect(output).toContain('Insured worldwide delivery.');
  });
});
