import React, { useState } from 'react';
import { useCart } from '../lib/context/CartContext';
import { ShoppingBag, Loader2, Check } from 'lucide-react';
import type { Product } from '../lib/schema/product';

interface AddToCartButtonProps {
  product: Product;
  stockText?: string;
  stockClass?: string;
}

export function AddToCartButton({ product, stockText, stockClass }: AddToCartButtonProps) {
  const { addItem, openDrawer } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    if (!product.is_in_stock || isAdding) return;
    setIsAdding(true);
    try {
      await addItem(product.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-stone-900">Availability:</span>
        <span className={`font-medium ${stockClass || (product.is_in_stock ? 'text-emerald-700' : 'text-stone-500')}`}>
          {stockText || (product.is_in_stock ? 'In stock' : 'Out of stock')}
        </span>
      </div>
      <button
        onClick={handleAddToCart}
        disabled={!product.is_in_stock || isAdding}
        className="w-full py-4 bg-stone-900 text-white font-serif text-sm tracking-wider uppercase hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isAdding && <Loader2 className="w-5 h-5 animate-spin" />}
        {added && <Check className="w-5 h-5" />}
        {!isAdding && !added && <ShoppingBag className="w-5 h-5" />}
        <span>
          {isAdding ? 'Adding...' : added ? 'Added to Case' : 'Add to Collector\'s Case'}
        </span>
      </button>
    </div>
  );
}