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
    <section
      aria-labelledby='related-products-heading'
      className={`${className} border-t border-stone-200 pt-8`}
    >
      <h2
        id='related-products-heading'
        className='mb-6 text-xl leading-tight font-normal tracking-wider text-stone-950 uppercase'
      >
        {title}
      </h2>
      <ul className='grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-4'>
        {available.map((product) => (
          <li key={product.id}>
            <WatchCard product={product} categories={categories} country={country} />
          </li>
        ))}
      </ul>
    </section>
  );
}
