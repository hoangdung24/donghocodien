
interface ProductTabsProps {
  descriptionHtml: string;
  sku?: string;
  shortDescription?: string;
}

export function ProductTabs({ descriptionHtml }: ProductTabsProps) {
  return (
    <div className="woocommerce-tabs wc-tabs-wrapper container tabbed-content border-t border-stone-200 pt-6">
      <div className="woocommerce-Tabs-panel woocommerce-Tabs-panel--description panel entry-content">
        <div className="entry-content prose prose-stone max-w-none" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
      </div>
    </div>
  );
}