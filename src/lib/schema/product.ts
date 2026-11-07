import { Schema } from 'effect';

export const ProductImageSchema = Schema.Struct({
  id: Schema.Finite,
  src: Schema.String,
  thumbnail: Schema.optional(Schema.String),
  name: Schema.optional(Schema.String),
  alt: Schema.optional(Schema.String),
});
export type ProductImage = Schema.Schema.Type<typeof ProductImageSchema>;

export const ProductPricesSchema = Schema.Struct({
  price: Schema.String,
  regular_price: Schema.String,
  sale_price: Schema.optional(Schema.String),
  currency_code: Schema.String,
  currency_symbol: Schema.String,
  currency_prefix: Schema.optional(Schema.String),
  currency_suffix: Schema.optional(Schema.String),
});
export type ProductPrices = Schema.Schema.Type<typeof ProductPricesSchema>;

export const ProductCategorySchema = Schema.Struct({
  id: Schema.Finite,
  name: Schema.String,
  slug: Schema.String,
  parent: Schema.optional(Schema.Finite),
  link: Schema.optional(Schema.String),
  count: Schema.optional(Schema.Finite),
});
export type ProductCategory = Schema.Schema.Type<typeof ProductCategorySchema>;

export const ProductSchema = Schema.Struct({
  id: Schema.Finite,
  name: Schema.String,
  slug: Schema.String,
  permalink: Schema.String,
  sku: Schema.optional(Schema.String),
  description: Schema.String,
  short_description: Schema.String,
  on_sale: Schema.Boolean,
  is_in_stock: Schema.Boolean,
  low_stock_remaining: Schema.optional(Schema.NullOr(Schema.Finite)),
  prices: ProductPricesSchema,
  price_html: Schema.optional(Schema.String),
  images: Schema.Array(ProductImageSchema),
  categories: Schema.Array(ProductCategorySchema),
});
export type Product = Schema.Schema.Type<typeof ProductSchema>;

export const ProductsListSchema = Schema.Array(ProductSchema);
