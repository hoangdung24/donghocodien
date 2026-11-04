import React, { useState } from 'react';
import { ShoppingBag, Loader2, Check } from 'lucide-react';
import type { Product } from '../lib/schema/product';
import { formatApproxPrice } from '../lib/utils/currency';
import { useApproxDisplay } from '../lib/hooks/useApproxDisplay';
import { cartStore } from '../lib/cartStore';
import { Button } from './Button';
import { cleanTitle } from '../lib/utils/text';

// Default placeholder: black background with logo (monospace for classic look)
const DEFAULT_PLACEHOLDER = `data:image/svg+xml;base64,${btoa(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750">
  <rect width="600" height="750" fill="#111"/>
  <text x="300" y="350" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="28" font-weight="500" fill="#fff" text-anchor="middle" letter-spacing="0.15em">SPACETIME</text>
  <text x="300" y="395" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="11" fill="#888" text-anchor="middle" letter-spacing="0.2em">VINTAGE WATCH</text>
</svg>
`)}`;

interface WatchCardProps {
  product: Product;
  country?: string | null;
}

export function WatchCard({ product, country }: WatchCardProps) {
  const primaryCategory =
    product.categories.find((c) =>
      [
        'Omega',
        'Rolex',
        'Cartier',
        'Edox',
        'Eterna',
        'Seiko',
        'Farve-Leuba',
        'Zenith',
        'Longines',
        'Universal Geneve',
        'Tudor',
      ].some((b) => c.name.toLowerCase().includes(b.toLowerCase()))
    ) || product.categories[0];

  const mainImage = product.images[0]?.src || DEFAULT_PLACEHOLDER;
  const hoverImage = product.images[1]?.src || mainImage;
  const cleanName = cleanTitle(product.name);
  const approx = useApproxDisplay(country);

  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
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
        href={`/product/${product.slug}`}
        className='relative block aspect-300/375 overflow-hidden bg-stone-50'
      >
        <img
          src={mainImage}
          alt={cleanName}
          loading='lazy'
          className={`h-full w-full object-cover transition-opacity duration-500 ease-in-out group-hover:opacity-0 ${!product.is_in_stock ? 'grayscale-50 opacity-60' : ''}`}
        />
        <img
          src={hoverImage}
          alt={`${cleanName} alternate angle`}
          loading='lazy'
          className={`absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100 ${!product.is_in_stock ? 'grayscale-50 opacity-60' : ''}`}
        />

        <div className='absolute top-2 left-2 z-10 flex flex-col gap-1'>
          {product.on_sale && (
            <span className='bg-red-700 px-2 py-0.5 font-sans text-[9px] tracking-widest text-white uppercase sm:text-[10px]'>
              Sale
            </span>
          )}
          {!product.is_in_stock && (
            <span className='bg-black/80 px-2 py-0.5 font-sans text-[9px] tracking-widest text-white uppercase sm:text-[10px]'>
              Sold
            </span>
          )}
        </div>
      </a>

      <div className='flex flex-1 flex-col px-1 pt-3 pb-4 text-center sm:text-left'>
        {primaryCategory && (
          <p className='mb-1 truncate text-[10px] tracking-[0.15em] text-stone-400 uppercase sm:text-[11px]'>
            {cleanTitle(primaryCategory.name)}
          </p>
        )}

        <h3 className='mb-1.5 line-clamp-2 text-xs leading-snug tracking-normal text-black sm:text-sm'>
          <a href={`/product/${product.slug}`} className='transition-colors hover:text-stone-500'>
            {cleanName}
          </a>
        </h3>

        <div className='mt-auto flex flex-col items-center pt-1 font-serif sm:items-start'>
          {Number(product.prices.price) > 0 && product.is_in_stock ? (
            <>
              <div className='flex items-baseline gap-2'>
                {product.on_sale && product.prices.regular_price && (
                  <span className='text-xs text-stone-400 line-through'>
                    ${product.prices.regular_price}
                  </span>
                )}
                <span className='text-sm font-semibold text-black sm:text-base'>
                  ${product.prices.price}
                </span>
              </div>
              {approx && (
                <span className='approximate-vnd' data-usd-price={product.prices.price}>
                  {formatApproxPrice(product.prices.price, approx.currency, approx.rates)}
                </span>
              )}

              <Button
                onClick={handleAddToCart}
                disabled={isAdding}
                size='sm'
                className='mt-3 w-full'
              >
                {isAdding && <Loader2 className='h-3.5 w-3.5 animate-spin' />}
                {added && <Check className='h-3.5 w-3.5' />}
                {!isAdding && !added && <ShoppingBag className='h-3.5 w-3.5' />}
                <span>{isAdding ? 'Adding...' : added ? 'Added' : 'Add to Cart'}</span>
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
