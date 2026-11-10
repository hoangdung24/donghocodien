interface ProductTabsProps {
  descriptionHtml: string;
  sku?: string;
  shortDescription?: string;
  hideHeading?: boolean;
}

export function ProductTabs({ descriptionHtml, hideHeading = false }: ProductTabsProps) {
  return (
    <section
      aria-labelledby='product-description-heading'
      className='woocommerce-tabs wc-tabs-wrapper tabbed-content container min-h-96 border-t border-stone-200 pt-6'
    >
      {hideHeading ? (
        <h2 id='product-description-heading' className='sr-only'>
          Description
        </h2>
      ) : (
        <h2
          id='product-description-heading'
          className='mb-4 text-xl leading-tight font-normal tracking-wider text-stone-950 uppercase'
        >
          Description
        </h2>
      )}
      <div className='woocommerce-Tabs-panel woocommerce-Tabs-panel--description panel entry-content'>
        <div
          className='entry-content prose max-w-none prose-stone'
          dangerouslySetInnerHTML={{ __html: descriptionHtml }}
        />
      </div>
    </section>
  );
}
