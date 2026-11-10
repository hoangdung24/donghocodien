import { Schema } from 'effect';
import { PageSchema } from '@/lib/schema/page';

export const PostSchema = PageSchema;
export type WpPost = Schema.Schema.Type<typeof PostSchema>;

export const PostsListSchema = Schema.Array(PostSchema);
