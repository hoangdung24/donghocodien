import { describe, it, expect } from 'vitest';
import { Schema } from 'effect';
import { PostSchema } from '@/lib/schema/post';

describe('PostSchema', () => {
  const samplePost = {
    id: 5987,
    slug: 'les-must-de-cartier-nguon-goc-suc-manh',
    date: '2021-12-27T21:11:00',
    title: {
      rendered: '&#8220;LES MUST DE CARTIER!&#8221; &#8211; NGUỒN GỐC &#038; SỨC MẠNH',
    },
    content: {
      rendered: '<p>Sample article content</p>',
    },
    excerpt: {
      rendered: '<p>Sample excerpt</p>',
    },
    _embedded: {
      'wp:featuredmedia': [
        {
          source_url: 'https://donghocodien.com/wp-content/uploads/2021/12/ref-6-44-6.jpg',
          alt_text: 'Cartier watch',
        },
      ],
    },
  };

  it('successfully decodes a valid WordPress post object with embedded media', () => {
    const decoded = Schema.decodeSync(PostSchema)(samplePost);
    expect(decoded.id).toBe(5987);
    expect(decoded.slug).toBe('les-must-de-cartier-nguon-goc-suc-manh');
    expect(decoded._embedded?.['wp:featuredmedia']?.[0].source_url).toBe(
      'https://donghocodien.com/wp-content/uploads/2021/12/ref-6-44-6.jpg'
    );
  });

  it('decodes posts without _embedded media gracefully', () => {
    const postWithoutMedia = {
      id: 101,
      slug: 'minimal-post',
      date: '2026-01-01T00:00:00',
      title: { rendered: 'Minimal' },
      content: { rendered: '<p>Content</p>' },
      excerpt: { rendered: '<p>Excerpt</p>' },
    };
    const decoded = Schema.decodeSync(PostSchema)(postWithoutMedia);
    expect(decoded.id).toBe(101);
    expect(decoded._embedded).toBeUndefined();
  });
});
