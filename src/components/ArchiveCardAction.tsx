import { ShoppingBag, Loader2, Check } from 'lucide-react';
import { useState } from 'react';
import { activeCartStore as cartStore } from '@/lib/cartStore';
import { Button } from '@/components/Button';
import { formatPrice } from '@/lib/utils/format';

interface ArchiveCardActionProps {
  productId: number;
  price: string;
  cleanName: string;
}

export function ArchiveCardAction({ productId, price, cleanName }: ArchiveCardActionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (isAdding) return;

    setIsAdding(true);
    try {
      await cartStore.addItem(productId, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className='mt-auto flex flex-col items-center pt-1 sm:items-start'>
      <span className='text-sm font-semibold sm:text-base'>{formatPrice(price)}</span>
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
        <span aria-hidden='true'>{isAdding ? 'Adding…' : added ? 'Added' : 'Add to Cart'}</span>
        <span role='status' className='sr-only'>
          {added ? `${cleanName} added to your collector's case` : ''}
        </span>
      </Button>
    </div>
  );
}
