import { describe, expect, it } from 'vitest';
import {
  demoteEmbeddedHeadings,
  leadHeadingRepeatsSection,
  sanitizeWordPressHtml,
} from '@/lib/utils/html';

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

describe('demoteEmbeddedHeadings', () => {
  it('turns a top-level heading inside embedded content into a subheading so the page keeps a single top-level heading', async () => {
    const html = '<h1>Warranty Policy</h1><h2>Conditions</h2><h3>Coverage</h3>';
    const demoted = await demoteEmbeddedHeadings(html);
    expect(demoted).not.toContain('<h1>');
    expect(demoted).toContain('<h2>Warranty Policy</h2>');
    expect(demoted).toContain('<h2>Conditions</h2>');
    expect(demoted).toContain('<h3>Coverage</h3>');
  });

  it('leaves content without a top-level heading untouched', async () => {
    const html = '<h2>Conditions</h2><p>Body copy.</p>';
    expect(await demoteEmbeddedHeadings(html)).toBe(html);
  });
});

describe('leadHeadingRepeatsSection', () => {
  it('detects a description that opens by repeating its section title', () => {
    expect(
      leadHeadingRepeatsSection('<h1>DESCRIPTION</h1><p>Case in steel.</p>', 'Description')
    ).toBe(true);
  });

  it('ignores markup inside the heading when comparing', () => {
    expect(
      leadHeadingRepeatsSection('<h2><strong>No. 200246</strong> description</h2>', 'Description')
    ).toBe(true);
  });

  it('keeps a lead heading that adds information the section title does not carry', () => {
    expect(
      leadHeadingRepeatsSection('<h2>Case and dial condition</h2><p>Unpolished.</p>', 'Description')
    ).toBe(false);
  });

  it('reports false when the content has no heading to compare', () => {
    expect(leadHeadingRepeatsSection('<p>Case in steel.</p>', 'Description')).toBe(false);
  });
});
