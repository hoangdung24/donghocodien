import { Schema } from 'effect';

export const InstagramPostSchema = Schema.Struct({
  shortcode: Schema.String,
  image: Schema.String,
  caption: Schema.String,
  href: Schema.String,
});

export type InstagramPost = typeof InstagramPostSchema.Type;

export const InstagramPostsSchema = Schema.Array(InstagramPostSchema);

export const InstagramFeedSchema = Schema.Struct({
  handle: Schema.String,
  posts: InstagramPostsSchema,
  updatedAt: Schema.String,
});

export type InstagramFeed = typeof InstagramFeedSchema.Type;
