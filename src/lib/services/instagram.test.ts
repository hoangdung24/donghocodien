import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Effect, Schema } from 'effect';
import { InstagramPostsSchema } from '../schema/instagram';
import {
  parseInstagramResponse,
  shortcodeFromMediaId,
  fetchInstagramPosts,
  refreshInstagramFeed,
  type InstagramCache,
} from './instagram';

const profileFixture = readFileSync(
  join(__dirname, '../../tests/fixtures/instagram-profile.html'),
  'utf8'
);

const decodePosts = (payload: unknown) =>
  Effect.runSync(Schema.decodeEffect(InstagramPostsSchema)(parseInstagramResponse(payload)));

describe('shortcodeFromMediaId', () => {
  it('encodes a media id into the Instagram base64 alphabet', () => {
    expect(shortcodeFromMediaId('4023775562497344175')).toBe('DfXUo4ijUKv');
    expect(shortcodeFromMediaId('4017252365673594198')).toBe('DfAJb4FEn1W');
  });

  it('returns an empty string for unusable ids', () => {
    expect(shortcodeFromMediaId('')).toBe('');
    expect(shortcodeFromMediaId('not-a-number')).toBe('');
    expect(shortcodeFromMediaId('0')).toBe('');
  });
});

describe('parseInstagramResponse for the profile page', () => {
  const posts = decodePosts(profileFixture);

  it('extracts twelve posts from a real profile capture', () => {
    expect(posts).toHaveLength(12);
  });

  it('builds permalinks from the encoded media id', () => {
    expect(posts[0]).toMatchObject({
      shortcode: 'DfZ5dHaGGND',
      href: 'https://www.instagram.com/p/DfZ5dHaGGND/',
    });
  });

  it('returns walkable cdn image urls', () => {
    for (const post of posts) {
      expect(post.image).toMatch(/^https:\/\/[a-z0-9-]+\.cdninstagram\.com\//);
      expect(post.image).not.toContain('\\/');
      expect(post.image).not.toContain('\\u0026');
    }
  });

  it('keeps captions readable and unique per post', () => {
    const shortcodes = new Set(posts.map((post) => post.shortcode));
    expect(shortcodes.size).toBe(12);
    expect(posts[0].caption.startsWith('The silver dial on this Oyster Perpetual')).toBe(true);
  });

  it('returns an empty list when the timeline payload is missing', () => {
    expect(decodePosts('<html><body>Log in</body></html>')).toEqual([]);
  });
});

describe('parseInstagramResponse for the graph api', () => {
  it('maps graph media entries onto feed posts', () => {
    const posts = decodePosts({
      data: [
        {
          id: '17912345678901234',
          media_type: 'CAROUSEL_ALBUM',
          media_url: 'https://scontent.cdninstagram.com/media.jpg',
          thumbnail_url: 'https://scontent.cdninstagram.com/thumb.jpg',
          permalink: 'https://www.instagram.com/p/Abc123/',
          caption: 'Rolex Explorer ref. 114270',
        },
        {
          id: '17912345678901235',
          media_type: 'VIDEO',
          media_url: 'https://scontent.cdninstagram.com/clip.mp4',
          thumbnail_url: 'https://scontent.cdninstagram.com/clip.jpg',
          permalink: 'https://www.instagram.com/reel/Def456/',
        },
      ],
    });

    expect(posts).toEqual([
      {
        shortcode: '17912345678901234',
        image: 'https://scontent.cdninstagram.com/thumb.jpg',
        caption: 'Rolex Explorer ref. 114270',
        href: 'https://www.instagram.com/p/Abc123/',
      },
      {
        shortcode: '17912345678901235',
        image: 'https://scontent.cdninstagram.com/clip.jpg',
        caption: '',
        href: 'https://www.instagram.com/reel/Def456/',
      },
    ]);
  });

  it('drops entries without an image or permalink', () => {
    const posts = decodePosts({
      data: [{ id: '1', media_url: 'https://scontent.cdninstagram.com/a.jpg' }],
    });
    expect(posts).toEqual([]);
  });
});

describe('fetchInstagramPosts', () => {
  it('surfaces a tagged error when instagram is rate limited', () => {
    expect.assertions(1);
    globalThis.fetch = async () =>
      new Response('', { status: 429, statusText: 'Too Many Requests' });

    return Effect.runPromiseExit(fetchInstagramPosts(12)).then((exit) => {
      expect(JSON.stringify(exit)).toContain('InstagramParseError');
    });
  });
});

describe('refreshInstagramFeed', () => {
  it('persists the parsed feed to the cache', async () => {
    globalThis.fetch = async () => new Response(profileFixture, { status: 200 });
    const writes: string[] = [];
    const cache: InstagramCache = {
      read: async () => null,
      write: async (value) => {
        writes.push(value);
      },
    };

    const feed = await Effect.runPromise(refreshInstagramFeed(cache, 12));

    expect(feed.posts).toHaveLength(12);
    expect(feed.handle).toBe('spacetime.vintagewatch');
    expect(writes).toHaveLength(1);

    const stored = Schema.decodeUnknownSync(InstagramPostsSchema)(JSON.parse(writes[0]).posts);
    expect(stored[0].shortcode).toBe('DfZ5dHaGGND');
  });
});
