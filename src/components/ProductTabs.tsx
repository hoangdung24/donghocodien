interface ProductTabsProps {
  descriptionHtml: string;
  sku?: string;
  shortDescription?: string;
}

export function ProductTabs({ descriptionHtml }: ProductTabsProps) {
  return (
    <div className='woocommerce-tabs wc-tabs-wrapper tabbed-content container border-t border-stone-200 pt-6'>
      <div className='woocommerce-Tabs-panel woocommerce-Tabs-panel--description panel entry-content'>
        <div
          className='entry-content prose max-w-none prose-stone'
          dangerouslySetInnerHTML={{ __html: descriptionHtml }}
        />
      </div>
    </div>
  );
}
