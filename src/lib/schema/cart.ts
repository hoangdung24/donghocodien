import { Schema } from 'effect';

export const CartAddressSchema = Schema.Struct({
  first_name: Schema.String,
  last_name: Schema.String,
  company: Schema.String,
  address_1: Schema.String,
  address_2: Schema.String,
  city: Schema.String,
  state: Schema.String,
  postcode: Schema.String,
  country: Schema.String,
  phone: Schema.String,
  email: Schema.optional(Schema.String),
});
export type CartAddress = Schema.Schema.Type<typeof CartAddressSchema>;

export const CartItemSchema = Schema.Struct({
  key: Schema.String,
  id: Schema.Finite,
  name: Schema.String,
  short_description: Schema.String,
  sku: Schema.optional(Schema.String),
  permalink: Schema.String,
  quantity: Schema.Finite,
  price: Schema.String,
  regular_price: Schema.String,
  sale_price: Schema.optional(Schema.String),
  on_sale: Schema.Boolean,
  totals: Schema.Struct({
    line_total: Schema.String,
    line_subtotal: Schema.String,
    line_tax: Schema.String,
    line_subtotal_tax: Schema.String,
    line_total_tax: Schema.String,
  }),
  images: Schema.Array(
    Schema.Struct({
      id: Schema.Finite,
      src: Schema.String,
      thumbnail: Schema.optional(Schema.String),
      alt: Schema.optional(Schema.String),
    })
  ),
});
export type CartItem = Schema.Schema.Type<typeof CartItemSchema>;

export const CartTotalsSchema = Schema.Struct({
  total_items: Schema.String,
  total_items_tax: Schema.String,
  total_fees: Schema.String,
  total_fees_tax: Schema.String,
  total_discount: Schema.String,
  total_discount_tax: Schema.String,
  total_shipping: Schema.optional(Schema.NullOr(Schema.String)),
  total_shipping_tax: Schema.optional(Schema.NullOr(Schema.String)),
  total_price: Schema.String,
  total_tax: Schema.String,
  tax_lines: Schema.Array(
    Schema.Struct({
      id: Schema.Finite,
      label: Schema.String,
      compound: Schema.Boolean,
      rate: Schema.String,
      total: Schema.String,
    })
  ),
  currency_code: Schema.String,
  currency_symbol: Schema.String,
  currency_minor_unit: Schema.Finite,
  currency_decimal_separator: Schema.String,
  currency_thousand_separator: Schema.String,
  currency_prefix: Schema.String,
  currency_suffix: Schema.String,
});
export type CartTotals = Schema.Schema.Type<typeof CartTotalsSchema>;

export const CartSchema = Schema.Struct({
  coupons: Schema.Array(
    Schema.Struct({
      code: Schema.String,
      discount_type: Schema.String,
      discount: Schema.String,
      discount_tax: Schema.String,
      totals: Schema.Record(Schema.String, Schema.String),
    })
  ),
  shipping_rates: Schema.Array(
    Schema.Struct({
      id: Schema.String,
      instance_id: Schema.String,
      label: Schema.String,
      cost: Schema.String,
      method_id: Schema.String,
      taxes: Schema.Array(Schema.String),
    })
  ),
  shipping_address: CartAddressSchema,
  billing_address: CartAddressSchema,
  items: Schema.Array(CartItemSchema),
  items_count: Schema.Finite,
  items_weight: Schema.String,
  cross_sells: Schema.Array(
    Schema.Struct({
      id: Schema.Finite,
      name: Schema.String,
      permalink: Schema.String,
      prices: Schema.Struct({
        price: Schema.String,
        regular_price: Schema.String,
        sale_price: Schema.optional(Schema.String),
        currency_code: Schema.String,
        currency_symbol: Schema.String,
      }),
      images: Schema.Array(
        Schema.Struct({
          id: Schema.Finite,
          src: Schema.String,
          thumbnail: Schema.optional(Schema.String),
        })
      ),
    })
  ),
  needs_payment: Schema.Boolean,
  needs_shipping: Schema.Boolean,
  has_calculated_shipping: Schema.Boolean,
  fees: Schema.Array(Schema.Struct({})),
  totals: CartTotalsSchema,
  errors: Schema.Array(Schema.Struct({})),
  payment_methods: Schema.Array(Schema.String),
  payment_requirements: Schema.Array(Schema.String),
  extensions: Schema.Record(Schema.String, Schema.Unknown),
});
export type Cart = Schema.Schema.Type<typeof CartSchema>;

export const AddToCartRequestSchema = Schema.Struct({
  id: Schema.Finite,
  quantity: Schema.Finite,
  variation: Schema.optional(
    Schema.Array(
      Schema.Struct({
        attribute: Schema.String,
        value: Schema.String,
      })
    )
  ),
});
export type AddToCartRequest = Schema.Schema.Type<typeof AddToCartRequestSchema>;

export const UpdateCartItemRequestSchema = Schema.Struct({
  key: Schema.String,
  quantity: Schema.Finite,
});
export type UpdateCartItemRequest = Schema.Schema.Type<typeof UpdateCartItemRequestSchema>;

export const RemoveCartItemRequestSchema = Schema.Struct({
  key: Schema.String,
});
export type RemoveCartItemRequest = Schema.Schema.Type<typeof RemoveCartItemRequestSchema>;