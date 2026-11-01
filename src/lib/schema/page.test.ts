import { describe, it, expect } from 'vitest';
import { Schema } from 'effect';

export const PageSchema = Schema.Struct({
  id: Schema.Finite,
  slug: Schema.String,
  title: Schema.Struct({
    rendered: Schema.String,
  }),
  content: Schema.Struct({
    rendered: Schema.String,
  }),
});
export type WpPage = Schema.Schema.Type<typeof PageSchema>;

describe('WordPress Page Schema Seam', () => {
  it('decodes a valid WordPress REST API page payload', () => {
    const rawPage = {
      id: 616,
      slug: 'contact-us',
      title: { rendered: 'Contact us' },
      content: { rendered: '<p>Get in touch with our specialists.</p>' },
    };

    const decoded = Schema.decodeUnknownSync(PageSchema)(rawPage);
    expect(decoded.id).toBe(616);
    expect(decoded.slug).toBe('contact-us');
    expect(decoded.title.rendered).toBe('Contact us');
  });

  it('fails when id or required fields are missing', () => {
    expect(() => Schema.decodeUnknownSync(PageSchema)({ slug: 'test' })).toThrow();
  });
});
