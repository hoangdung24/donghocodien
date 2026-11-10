import { Schema } from 'effect';

export const GalleryPictureSchema = Schema.Struct({
  id: Schema.Finite,
  src: Schema.String,
  alt: Schema.optional(Schema.String),
  slideSources: Schema.String,
  thumbnailSources: Schema.String,
  posterHref: Schema.String,
});
export type GalleryPicture = Schema.Schema.Type<typeof GalleryPictureSchema>;

export const GalleryPicturesSchema = Schema.Array(GalleryPictureSchema);
