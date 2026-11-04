import type { Product } from '../lib/schema/product';
import { formatApproxPrice } from '../lib/utils/currency';
import { useApproxDisplay } from '../lib/hooks/useApproxDisplay';
import { cleanTitle } from '../lib/utils/text';

interface RelatedProductsProps {
  products: Product[];
  title?: string;
  country?: string | null;
}

export function RelatedProducts({
  products,
  title = 'Similar Watches',
  country,
}: RelatedProductsProps) {
  const approx = useApproxDisplay(country);

  const available = products.filter((product) => product.is_in_stock);
  if (!available.length) return null;

  return (
    <section className='mt-8 border-t border-stone-200 pt-8'>
      <h2 className='mb-6 font-serif text-xl leading-tight font-normal tracking-wider text-stone-950 uppercase'>
        {title}
      </h2>
      <div className='grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-4'>
        {available.map((product) => (
          <article
            key={product.id}
            className='group flex flex-col overflow-hidden border border-stone-200 bg-white transition-all duration-300'
          >
            <a
              href={`/product/${product.slug}`}
              className='relative block aspect-300/375 overflow-hidden bg-brand-surface'
            >
              {product.images[0] && (
                <>
                  <img
                    src={product.images[0].src}
                    alt={cleanTitle(product.name)}
                    loading='lazy'
                    className='h-full w-full object-cover transition-opacity duration-500 ease-in-out group-hover:opacity-0'
                  />
                  {product.images[1] && (
                    <img
                      src={product.images[1].src}
                      alt={`${cleanTitle(product.name)} alternate angle`}
                      loading='lazy'
                      className='absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100'
                    />
                  )}
                </>
              )}
            </a>

            <div className='flex flex-1 flex-col px-1 pt-3 pb-4 text-center sm:text-left'>
              <h3 className='mb-1.5 line-clamp-2 text-xs leading-snug tracking-normal text-stone-900 sm:text-sm'>
                <a
                  href={`/product/${product.slug}`}
                  className='transition-colors hover:text-stone-500'
                >
                  {cleanTitle(product.name)}
                </a>
              </h3>

              <div className='mt-auto flex flex-col items-center pt-1 font-serif sm:items-start'>
                {Number(product.prices.price) > 0 ? (
                  <>
                    <div className='flex items-baseline gap-2'>
                      {product.on_sale && product.prices.regular_price && (
                        <span className='text-xs text-stone-400 line-through'>
                          ${product.prices.regular_price}
                        </span>
                      )}
                      <span className='text-sm font-semibold text-stone-950 sm:text-base'>
                        ${product.prices.price}
                      </span>
                    </div>
                    {approx && (
                      <span className='approximate-vnd' data-usd-price={product.prices.price}>
                        {formatApproxPrice(product.prices.price, approx.currency, approx.rates)}
                      </span>
                    )}
                  </>
                ) : (
                  <span className='text-sm font-semibold text-stone-950 uppercase sm:text-base'>
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
