import { Schema } from 'effect';

export const PageSchema = Schema.Struct({
  id: Schema.Finite,
  slug: Schema.String,
  date: Schema.optional(Schema.String),
  modified: Schema.optional(Schema.String),
  title: Schema.Struct({
    rendered: Schema.String,
  }),
  content: Schema.Struct({
    rendered: Schema.String,
  }),
});
export type WpPage = Schema.Schema.Type<typeof PageSchema>;

export const PagesListSchema = Schema.Array(PageSchema);
