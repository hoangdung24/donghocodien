import { describe, expect, it } from 'vitest';
import { Effect, Schema } from 'effect';
import { PostSchema, PostsListSchema } from '@/lib/schema/post';

const wordpressPost = {
  id: 5987,
  date: '2021-12-27T21:11:00',
  modified: '2021-12-28T09:51:57',
  slug: 'les-must-de-cartier-nguon-goc-suc-manh',
  title: { rendered: '&#8220;LES MUST DE CARTIER!&#8221; &#8211; NGUỒN GỐC &amp; SỨC MẠNH' },
  content: {
    rendered: '<h1>DESCRIPTION</h1><p>Cartier history.</p>',
  },
};

describe('WordPress Post Schema', () => {
  it('decodes a post document returned by the posts endpoint', () => {
    const post = Effect.runSync(Schema.decodeEffect(PostSchema)(wordpressPost));

    expect(post.id).toBe(5987);
    expect(post.slug).toBe('les-must-de-cartier-nguon-goc-suc-manh');
    expect(post.content.rendered).toContain('Cartier history.');
  });

  it('decodes a list response that is empty for an unknown slug', () => {
    const posts = Effect.runSync(Schema.decodeEffect(PostsListSchema)([]));

    expect(posts).toEqual([]);
  });

  it('decodes a single entry list response', () => {
    const posts = Effect.runSync(Schema.decodeEffect(PostsListSchema)([wordpressPost]));

    expect(posts).toHaveLength(1);
    expect(posts[0]?.title.rendered).toContain('LES MUST DE CARTIER');
  });

  it('rejects a post that is missing rendered content', () => {
    const result = Effect.runSync(
      Effect.exit(
        Schema.decodeUnknownEffect(PostSchema)({ id: 1, slug: 'x', title: { rendered: 'x' } })
      )
    );

    expect(result._tag).toBe('Failure');
  });
});
