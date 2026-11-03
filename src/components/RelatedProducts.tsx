import React from 'react';
import type { Product } from '../lib/schema/product';
import { formatApproxVND } from '../lib/utils/currency';

interface RelatedProductsProps {
  products: Product[];
  title?: string;
}

export function RelatedProducts({ products, title = 'Similar Watches' }: RelatedProductsProps) {
  if (!products.length) return null;

  function cleanTitle(title: string) {
    return title
      .replace(/&#8216;/g, '‘')
      .replace(/&#8217;/g, '’')
      .replace(/&#8211;/g, '–')
      .replace(/&#038;/g, '&')
      .replace(/&/g, '&');
  }

  return (
    <section className="border-t border-stone-200 pt-8 mt-8">
      <h2 className="font-serif text-xl text-stone-950 font-normal leading-tight mb-6 uppercase tracking-wider">
        {title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <article key={product.id} className="group flex flex-col bg-white border border-stone-200 overflow-hidden transition-all duration-300">
            <a href={`/product/${product.slug}`} className="relative block aspect-[300/375] overflow-hidden bg-brand-surface">
              {product.images[0] && (
                <>
                  <img
                    src={product.images[0].src}
                    alt={cleanTitle(product.name)}
                    loading="lazy"
                    className="h-full w-full object-cover transition-opacity duration-500 ease-in-out group-hover:opacity-0"
                  />
                  {product.images[1] && (
                    <img
                      src={product.images[1].src}
                      alt={`${cleanTitle(product.name)} alternate angle`}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100"
                    />
                  )}
                </>
              )}
              {!product.is_in_stock && (
                <div className="absolute top-2 left-2 z-10">
                  <span className="bg-stone-900/80 text-white text-[9px] sm:text-[10px] uppercase font-sans tracking-widest px-2 py-0.5">
                    Sold
                  </span>
                </div>
              )}
            </a>

            <div className="flex flex-1 flex-col pt-3 pb-4 text-center sm:text-left px-1">
              <h3 className="text-xs sm:text-sm text-stone-900 leading-snug tracking-normal mb-1.5 line-clamp-2">
                <a href={`/product/${product.slug}`} className="hover:text-stone-500 transition-colors">
                  {cleanTitle(product.name)}
                </a>
              </h3>

              <div className="mt-auto flex flex-col items-center sm:items-start pt-1 font-serif">
                {Number(product.prices.price) > 0 ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      {product.on_sale && product.prices.regular_price && (
                        <span className="text-xs text-stone-400 line-through">
                          ${product.prices.regular_price}
                        </span>
                      )}
                      <span className="text-sm sm:text-base font-semibold text-stone-950">
                        ${product.prices.price}
                      </span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-stone-400 font-sans tracking-tight mt-0.5 approximate-vnd" data-usd-price={product.prices.price}>
                      {formatApproxVND(product.prices.price)}
                    </span>
                  </>
                ) : (
                  <span className="text-sm sm:text-base font-semibold text-stone-950 uppercase">
                    PRICE ON REQUEST
                  </span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}