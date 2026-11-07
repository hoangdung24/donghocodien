import type { Product, ProductCategory } from '@/lib/schema/product';
import { WatchCard } from '@/components/WatchCard';

interface RelatedProductsProps {
  products: Product[];
  title?: string;
  categories?: ProductCategory[];
  country?: string | null;
  className?: string;
}

export function RelatedProducts({
  products,
  title = 'Similar Watches',
  categories,
  country,
  className = 'mt-8',
}: RelatedProductsProps) {
  const available = products.filter((product) => product.is_in_stock);
  if (!available.length) return null;

  return (
    <section className={`${className} border-t border-stone-200 pt-8`}>
      <h2 className='mb-6 text-xl leading-tight font-normal tracking-wider text-stone-950 uppercase'>
        {title}
      </h2>
      <div className='grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-4'>
        {available.map((product) => (
          <WatchCard key={product.id} product={product} categories={categories} country={country} />
        ))}
      </div>
    </section>
  );
}
