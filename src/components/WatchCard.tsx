import React, { useState } from 'react';
import { ShoppingBag, Loader2, Check } from 'lucide-react';
import type { Product, ProductCategory } from '@/lib/schema/product';
import { categoryHref, decodeCategoryName, productBrandCategory } from '@/lib/utils/categories';
import { formatApproxPrice } from '@/lib/utils/currency';
import { approxPriceReserveText } from '@/lib/utils/approxPriceReserve';
import { formatPrice } from '@/lib/utils/format';
import { useApproxDisplay } from '@/lib/hooks/useApproxDisplay';
import { activeCartStore as cartStore } from '@/lib/cartStore';
import { Button } from '@/components/Button';
import { cleanTitle } from '@/lib/utils/text';

const DEFAULT_PLACEHOLDER = '/images/placeholder.jpeg';
const CARD_SIZES = '(min-width: 1024px) 288px, (min-width: 640px) 30vw, 80vw';

interface WatchCardProps {
  product: Product;
  categories?: ProductCategory[];
  country?: string | null;
  showStatus?: boolean;
}

export function WatchCard({
  product,
  categories = [],
  country,
  showStatus = true,
}: WatchCardProps) {
  const mainImage = product.images[0]?.src || DEFAULT_PLACEHOLDER;
  const mainImageSrcSet = product.images[0]?.srcset || undefined;
  const hoverImage = product.images[1]?.src || mainImage;
  const hoverImageSrcSet = product.images[1]?.srcset || undefined;
  const cleanName = cleanTitle(product.name);
  const brandCategory = productBrandCategory(product, categories);
  const approx = useApproxDisplay(country);

  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (!product.is_in_stock || isAdding) return;

    setIsAdding(true);
    try {
      await cartStore.addItem(product.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <article className='group relative flex flex-col overflow-hidden bg-white transition-all duration-300'>
      <a
        href={`/watches/${product.slug}`}
        className='relative block aspect-300/375 overflow-hidden bg-stone-50'
        aria-label={`View ${cleanName}`}
      >
        <img
          src={mainImage}
          srcSet={mainImageSrcSet}
          sizes={CARD_SIZES}
          alt={cleanName}
          loading='lazy'
          decoding='async'
          width={1152}
          height={1440}
          className={`h-full w-full object-cover transition-opacity duration-500 ease-in-out group-hover:opacity-0 ${!product.is_in_stock && showStatus ? 'opacity-60 grayscale-50' : ''}`}
        />
        <img
          src={hoverImage}
          srcSet={hoverImageSrcSet}
          sizes={CARD_SIZES}
          alt=''
          aria-hidden='true'
          loading='lazy'
          decoding='async'
          width={1152}
          height={1440}
          className={`absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100 ${!product.is_in_stock && showStatus ? 'opacity-60 grayscale-50' : ''}`}
        />

        <div className='absolute top-2 left-2 z-10 flex flex-col gap-1'>
          {product.on_sale && (
            <span className='bg-red-700 px-2 py-0.5 font-sans text-[9px] tracking-widest text-white uppercase sm:text-[10px]'>
              Sale
            </span>
          )}
          {!product.is_in_stock && showStatus && (
            <span className='bg-black/80 px-2 py-0.5 font-sans text-[9px] tracking-widest text-white uppercase sm:text-[10px]'>
              Sold
            </span>
          )}
        </div>
      </a>

      <div className='flex flex-1 flex-col px-1 pt-3 pb-4 text-center sm:text-left'>
        {brandCategory && (
          <p className='mb-1.5 truncate text-[10px] font-medium tracking-[0.2em] text-stone-500 uppercase sm:text-[11px]'>
            <a
              href={categoryHref(brandCategory.slug)}
              className='transition-colors hover:text-brand-dark hover:underline'
            >
              {decodeCategoryName(brandCategory.name)}
            </a>
          </p>
        )}
        <h3 className='mb-1.5 line-clamp-2 min-h-[2.75em] text-xs leading-snug tracking-normal sm:text-sm'>
          <a href={`/watches/${product.slug}`} className='transition-colors hover:text-stone-500'>
            {cleanName}
          </a>
        </h3>

        <div
          className={`mt-auto flex flex-col items-center pt-1 sm:items-start ${showStatus ? '' : 'hidden'}`}
        >
          {Number(product.prices.price) > 0 && product.is_in_stock ? (
            <>
              <div className='flex items-baseline gap-2'>
                {product.on_sale && product.prices.regular_price && (
                  <span className='text-xs text-stone-600 line-through'>
                    <span className='sr-only'>Was </span>${product.prices.regular_price}
                  </span>
                )}
                <span className='text-sm font-semibold sm:text-base'>
                  {formatPrice(product.prices.price)}
                </span>
              </div>
              {approx?.rates ? (
                <span
                  className='approximate-vnd'
                  data-usd-price={product.prices.price}
                  aria-hidden='true'
                >
                  {formatApproxPrice(product.prices.price, approx.currency, approx.rates)}
                </span>
              ) : (
                <span className='approximate-vnd' aria-hidden='true'>
                  <span className='invisible'>
                    {approxPriceReserveText(product.prices.price, country ?? 'VN')}
                  </span>
                </span>
              )}

              <Button
                onClick={handleAddToCart}
                disabled={isAdding}
                size='sm'
                className='mt-3 w-full'
                aria-label={`Add ${cleanName} to your collector's case`}
              >
                {isAdding && <Loader2 className='h-3.5 w-3.5 animate-spin' aria-hidden='true' />}
                {added && <Check className='h-3.5 w-3.5' aria-hidden='true' />}
                {!isAdding && !added && <ShoppingBag className='h-3.5 w-3.5' aria-hidden='true' />}
                <span aria-hidden='true'>
                  {isAdding ? 'Adding…' : added ? 'Added' : 'Add to Cart'}
                </span>
                <span role='status' className='sr-only'>
                  {added ? `${cleanName} added to your collector's case` : ''}
                </span>
              </Button>
            </>
          ) : (
            <span className='mt-3 block w-full border-2 border-stone-300 bg-white px-5 py-2 text-center text-xs font-medium tracking-wider text-stone-500 uppercase sm:w-auto sm:text-sm'>
              Sold
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
