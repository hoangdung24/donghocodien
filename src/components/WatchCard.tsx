import React, { useState } from 'react';
import { ShoppingBag, Loader2, Check } from 'lucide-react';
import type { Product } from '../lib/schema/product';
import { formatApproxVND } from '../lib/utils/currency';
import { cartStore } from '../lib/cartStore';

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
}

function cleanTitle(title: string) {
  return title
    .replace(/&#8216;/g, '‘')
    .replace(/&#8217;/g, '’')
    .replace(/&#8211;/g, '–')
    .replace(/&#038;/g, '&')
    .replace(/&/g, '&');
}

export function WatchCard({ product }: WatchCardProps) {
  const primaryCategory = product.categories.find((c) =>
    ['Omega', 'Rolex', 'Cartier', 'Edox', 'Eterna', 'Seiko', 'Farve-Leuba', 'Zenith', 'Longines', 'Universal Geneve', 'Tudor'].some(
      (b) => c.name.toLowerCase().includes(b.toLowerCase())
    )
  ) || product.categories[0];

  const mainImage = product.images[0]?.src || DEFAULT_PLACEHOLDER;
  const hoverImage = product.images[1]?.src || mainImage;
  const cleanName = cleanTitle(product.name);

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
    <article className="group relative flex flex-col bg-white overflow-hidden transition-all duration-300">
      <a href={`/product/${product.slug}`} className="relative block aspect-[300/375] overflow-hidden bg-stone-50">
        <img
          src={mainImage}
          alt={cleanName}
          loading="lazy"
          className={`h-full w-full object-cover transition-opacity duration-500 ease-in-out group-hover:opacity-0 ${!product.is_in_stock ? 'grayscale-50 opacity-60' : ''}`}
        />
        <img
          src={hoverImage}
          alt={`${cleanName} alternate angle`}
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100 ${!product.is_in_stock ? 'grayscale-50 opacity-60' : ''}`}
        />

        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.on_sale && (
            <span className="bg-red-700 text-white text-[9px] sm:text-[10px] uppercase font-sans tracking-widest px-2 py-0.5">
              Sale
            </span>
          )}
          {!product.is_in_stock && (
            <span className="bg-black/80 text-white text-[9px] sm:text-[10px] uppercase font-sans tracking-widest px-2 py-0.5">
              Sold
            </span>
          )}
        </div>
      </a>

      <div className="flex flex-1 flex-col pt-3 pb-4 text-center sm:text-left px-1">
        {primaryCategory && (
          <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-stone-400 mb-1 truncate">
            {cleanTitle(primaryCategory.name)}
          </p>
        )}

        <h3 className="text-xs sm:text-sm text-black leading-snug tracking-normal mb-1.5 line-clamp-2">
          <a href={`/product/${product.slug}`} className="hover:text-stone-500 transition-colors">
            {cleanName}
          </a>
        </h3>

        <div className="mt-auto flex flex-col items-center sm:items-start pt-1 font-serif">
          {Number(product.prices.price) > 0 && product.is_in_stock ? (
            <>
              <div className="flex items-baseline gap-2">
                {product.on_sale && product.prices.regular_price && (
                  <span className="text-xs text-stone-400 line-through">
                    ${product.prices.regular_price}
                  </span>
                )}
                <span className="text-sm sm:text-base font-semibold text-black">
                  ${product.prices.price}
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-stone-400 font-sans tracking-tight mt-0.5 approximate-vnd" data-usd-price={product.prices.price}>
                {formatApproxVND(product.prices.price)}
              </span>

              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="mt-3 w-full sm:w-auto text-xs sm:text-sm uppercase tracking-wider border-2 border-black bg-black text-white px-5 py-2 font-medium hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {isAdding && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {added && <Check className="w-3.5 h-3.5" />}
                {!isAdding && !added && <ShoppingBag className="w-3.5 h-3.5" />}
                <span className="flex-1 text-center">
                  {isAdding ? 'Adding...' : added ? 'Added' : 'Add to Cart'}
                </span>
              </button>
            </>
          ) : (
            <span className="mt-3 w-full sm:w-auto block text-xs sm:text-sm uppercase tracking-wider border-2 border-stone-300 bg-white text-stone-500 px-5 py-2 font-medium text-center">
              Sold
            </span>
          )}
        </div>
      </div>
    </article>
  );
}