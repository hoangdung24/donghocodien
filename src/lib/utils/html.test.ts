import { describe, it, expect } from 'vitest';
import { sanitizeWordPressHtml } from './html';

describe('sanitizeWordPressHtml', () => {
  it('strips legacy inline style attributes from spans, paragraphs, and images', async () => {
    const raw =
      '<p style="font-size: 14.4px;"><span style="font-size: 120%; color: #000;"><strong>Heading</strong></span></p>';
    const cleaned = await sanitizeWordPressHtml(raw);
    expect(cleaned).not.toContain('style=');
    expect(cleaned).toContain('<strong>Heading</strong>');
    expect(cleaned).toContain('<p>');
    expect(cleaned).toContain('<span>');
  });

  it('preserves responsive image attributes such as srcset, sizes, and loading', async () => {
    const rawImage =
      '<img src="https://example.com/watch.jpg" srcset="watch-300.jpg 300w, watch-600.jpg 600w" sizes="(max-width: 600px) 100vw, 600px" alt="Vintage Rolex" loading="lazy" style="font-size: 14px;" />';
    const cleaned = await sanitizeWordPressHtml(rawImage);
    expect(cleaned).toContain('srcset="watch-300.jpg 300w, watch-600.jpg 600w"');
    expect(cleaned).toContain('alt="Vintage Rolex"');
    expect(cleaned).toContain('loading="lazy"');
    expect(cleaned).not.toContain('style=');
  });

  it('handles empty or blank content gracefully', async () => {
    expect(await sanitizeWordPressHtml('')).toBe('');
  });
});
