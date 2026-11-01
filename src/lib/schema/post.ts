import { Schema } from 'effect';

export const PostSchema = Schema.Struct({
  id: Schema.Finite,
  slug: Schema.String,
  date: Schema.String,
  title: Schema.Struct({
    rendered: Schema.String,
  }),
  content: Schema.Struct({
    rendered: Schema.String,
  }),
  excerpt: Schema.Struct({
    rendered: Schema.String,
  }),
  _embedded: Schema.optional(
    Schema.Struct({
      'wp:featuredmedia': Schema.optional(
        Schema.Array(
          Schema.Struct({
            source_url: Schema.String,
            alt_text: Schema.optional(Schema.String),
          })
        )
      ),
    })
  ),
});

export type Post = typeof PostSchema.Type;
