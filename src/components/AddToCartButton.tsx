import { useState } from 'react';
import { useCart } from '@/lib/context/CartContext';
import { ShoppingBag, Loader2, Check } from 'lucide-react';
import type { Product } from '@/lib/schema/product';
import { Button } from '@/components/Button';

interface AddToCartButtonProps {
  product: Product;
  stockText?: string;
  stockClass?: string;
}

export function AddToCartButton({ product, stockText, stockClass }: AddToCartButtonProps) {
  const { addItem } = useCart();
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
    <div className='flex w-full flex-col gap-3'>
      <div className='flex items-center justify-between text-sm'>
        <span className='font-medium text-stone-900'>Availability:</span>
        <span
          className={`font-medium ${stockClass || (product.is_in_stock ? 'text-green-700' : 'text-stone-500')}`}
        >
          {stockText || (product.is_in_stock ? 'In stock' : 'Out of stock')}
        </span>
      </div>
      <Button
        onClick={handleAddToCart}
        disabled={!product.is_in_stock || isAdding}
        className='w-full'
      >
        {isAdding && <Loader2 className='h-5 w-5 animate-spin' />}
        {added && <Check className='h-5 w-5' />}
        {!isAdding && !added && <ShoppingBag className='h-5 w-5' />}
        <span>{isAdding ? 'Adding...' : added ? 'Added to Case' : "Add to Collector's Case"}</span>
      </Button>
    </div>
  );
}
