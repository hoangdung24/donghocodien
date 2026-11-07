import { Effect, Schema } from 'effect';
import { InstagramFeedSchema, InstagramPostsSchema, type InstagramPost } from '../schema/instagram';
import seedPosts from '../../data/instagram.json';

const SHORTCODE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const VANITY_MEDIA_ID = '59700049662';
const PROFILE_URL = 'https://www.instagram.com/spacetime.vintagewatch/';
const CRAWLER_AGENT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

export class InstagramParseError extends Schema.TaggedError<
  InstagramParseError,
  { readonly brand: unique symbol }
>()('InstagramParseError', {
  message: Schema.String,
}) {}

export const shortcodeFromMediaId = (mediaId: string): string => {
  if (!/^\d{1,19}$/.test(mediaId)) return '';
  let remaining = BigInt(mediaId);
  if (remaining <= 0n) return '';
  let encoded = '';
  while (remaining > 0n) {
    encoded = SHORTCODE_ALPHABET[Number(remaining % 64n)] + encoded;
    remaining = remaining / 64n;
  }
  return encoded;
};

const unescapeJsonString = (value: string): string =>
  value.replaceAll('\\u0026', '&').replaceAll('\\/', '/').replaceAll('\\"', '"');

const parseGraphPosts = (payload: unknown): InstagramPost[] => {
  const records = payload as { data?: Array<Record<string, unknown>> } | null;
  const entries = Array.isArray(records?.data) ? records.data : [];
  return entries.flatMap((entry) => {
    const image = typeof entry.thumbnail_url === 'string' ? entry.thumbnail_url : entry.media_url;
    const permalink = entry.permalink;
    if (typeof image !== 'string' || typeof permalink !== 'string') return [];
    return [
      {
        shortcode: typeof entry.id === 'string' ? entry.id : permalink,
        image,
        caption: typeof entry.caption === 'string' ? entry.caption : '',
        href: permalink,
      },
    ];
  });
};

const parseProfilePage = (html: string): InstagramPost[] => {
  const timelineStart = html.indexOf('"polaris_timeline_connection"');
  if (timelineStart < 0) return [];

  const timeline = html.slice(timelineStart);
  const edges = timeline.split('{"node":{').slice(1);
  const seen = new Set<string>();
  const posts: InstagramPost[] = [];

  for (const edge of edges) {
    const mediaId = edge.match(/"pk":"(\d{10,})"/)?.[1];
    const image = edge.match(/"display_uri":"(.*?)","seo_canonical_url"/)?.[1];
    if (!mediaId || mediaId === VANITY_MEDIA_ID || !image) continue;

    const shortcode = shortcodeFromMediaId(mediaId);
    if (!shortcode || seen.has(shortcode)) continue;
    seen.add(shortcode);

    const caption = edge.match(/"caption":\{"pk":"\d+","text":"((?:[^"\\]|\\.)*)"/)?.[1] ?? '';
    posts.push({
      shortcode,
      image: unescapeJsonString(image),
      caption: unescapeJsonString(caption),
      href: `https://www.instagram.com/p/${shortcode}/`,
    });
  }

  return posts;
};

export const parseInstagramResponse = (payload: unknown): InstagramPost[] => {
  if (typeof payload === 'string') return parseProfilePage(payload);
  return parseGraphPosts(payload);
};

export const fetchInstagramPosts = (limit: number) =>
  Effect.gen(function* () {
    const response = yield* Effect.tryPromise({
      try: () => fetch(PROFILE_URL, { headers: { 'User-Agent': CRAWLER_AGENT } }),
      catch: (cause) => new InstagramParseError({ message: String(cause) }),
    });

    if (!response.ok) {
      return yield* new InstagramParseError({
        message: `Instagram responded with ${response.status} ${response.statusText}`,
      });
    }

    const body = yield* Effect.tryPromise({
      try: () => response.text(),
      catch: (cause) => new InstagramParseError({ message: String(cause) }),
    });

    const posts = parseInstagramResponse(body).slice(0, limit);
    return yield* Schema.decodeEffect(InstagramPostsSchema)(posts);
  }).pipe(Effect.retry({ times: 1 }), Effect.timeout('20 seconds'));

export interface InstagramCache {
  read: () => Promise<unknown>;
  write: (value: string) => Promise<unknown>;
}

export const getInstagramPosts = (
  cache: InstagramCache | null
): Promise<readonly InstagramPost[]> =>
  Effect.runPromise(
    Effect.gen(function* () {
      if (cache) {
        const stored = yield* Effect.tryPromise({
          try: () => cache.read(),
          catch: () => new InstagramParseError({ message: 'cache read failed' }),
        }).pipe(Effect.orElseSucceed(() => null));

        if (stored) {
          const feed = yield* Schema.decodeUnknownEffect(InstagramFeedSchema)(stored).pipe(
            Effect.orElseSucceed(() => null)
          );
          if (feed && feed.posts.length > 0) return feed.posts;
        }
      }

      return yield* Schema.decodeEffect(InstagramPostsSchema)(seedPosts);
    }).pipe(Effect.orElseSucceed(() => seedPosts as InstagramPost[]))
  );

export const refreshInstagramFeed = (cache: InstagramCache, limit = 12) =>
  Effect.gen(function* () {
    const posts = yield* fetchInstagramPosts(limit);
    const feed = {
      handle: 'spacetime.vintagewatch',
      posts,
      updatedAt: new Date().toISOString(),
    };
    yield* Effect.tryPromise({
      try: () => cache.write(JSON.stringify(feed)),
      catch: (cause) => new InstagramParseError({ message: String(cause) }),
    });
    return feed;
  });
