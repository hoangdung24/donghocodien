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

  const availabilityText = stockText || (product.is_in_stock ? 'In stock' : 'Out of stock');

  return (
    <div className='flex w-full flex-col gap-4'>
      <div className='flex items-center justify-between text-sm'>
        <span className='font-medium text-stone-900'>Availability:</span>
        <span
          className={`font-medium ${stockClass || (product.is_in_stock ? 'text-green-700' : 'text-stone-500')}`}
        >
          {availabilityText}
        </span>
      </div>
      <Button
        onClick={handleAddToCart}
        disabled={!product.is_in_stock || isAdding}
        className='w-full'
        aria-label={`Add ${product.name} to your collector's case`}
      >
        {isAdding && <Loader2 className='h-5 w-5 animate-spin' aria-hidden='true' />}
        {added && <Check className='h-5 w-5' aria-hidden='true' />}
        {!isAdding && !added && <ShoppingBag className='h-5 w-5' aria-hidden='true' />}
        <span aria-hidden='true'>
          {isAdding ? 'Adding…' : added ? 'Added to Case' : "Add to Collector's Case"}
        </span>
        <span role='status' className='sr-only'>
          {added ? `${product.name} added to your collector's case` : ''}
        </span>
      </Button>
    </div>
  );
}
