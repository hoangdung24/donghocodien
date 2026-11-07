import { describe, it, expect } from 'vitest';
import { Schema } from 'effect';
import { PageSchema } from './page';

describe('PageSchema', () => {
  const samplePage = {
    id: 620,
    slug: 'about-us',
    date: '2020-07-02T14:38:20',
    modified: '2021-03-15T09:12:45',
    title: { rendered: 'About us' },
    content: { rendered: '<p>About our atelier.</p>' },
  };

  it('decodes a valid WordPress REST API page payload with publish dates', () => {
    const decoded = Schema.decodeSync(PageSchema)(samplePage);
    expect(decoded.id).toBe(620);
    expect(decoded.slug).toBe('about-us');
    expect(decoded.title.rendered).toBe('About us');
    expect(decoded.date).toBe('2020-07-02T14:38:20');
    expect(decoded.modified).toBe('2021-03-15T09:12:45');
  });

  it('decodes pages without dates gracefully', () => {
    const pageWithoutDates = {
      id: 101,
      slug: 'contact-us',
      title: { rendered: 'Contact us' },
      content: { rendered: '<p>Get in touch with our specialists.</p>' },
    };

    const decoded = Schema.decodeSync(PageSchema)(pageWithoutDates);
    expect(decoded.id).toBe(101);
    expect(decoded.date).toBeUndefined();
    expect(decoded.modified).toBeUndefined();
  });

  it('fails when required fields are missing', () => {
    expect(() => Schema.decodeUnknownSync(PageSchema)({ slug: 'test' })).toThrow();
  });
});
