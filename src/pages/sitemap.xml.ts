import type { APIRoute } from 'astro';
import { Effect } from 'effect';
import { getAllProducts, getProductsPage } from '@/lib/services/woocommerce';
import {
  ARCHIVE_PAGE_SIZE,
  buildSitemapXml,
  excludedSitemapPaths,
  toArchivePageCount,
} from '@/lib/utils/sitemap';

const SITE_ORIGIN = 'https://donghocodien.com';
const SITEMAP_EDGE_TTL_SECONDS = 86400;

const STATIC_PATHS = [
  '/',
  '/watches',
  '/archives',
  '/about-us',
  '/contact-us',
  '/warranty-policy',
  '/exchange-policy',
  '/payment-shipping-methods',
];

export const GET: APIRoute = async ({ site }) => {
  const [productsResult, archivePageResult] = await Effect.runPromise(
    Effect.all(
      [
        Effect.exit(getAllProducts),
        Effect.exit(
          getProductsPage({ page: 1, per_page: ARCHIVE_PAGE_SIZE, stock_status: 'outofstock' })
        ),
      ],
      { concurrency: 'unbounded' }
    )
  );

  const productPaths =
    productsResult._tag === 'Success'
      ? productsResult.value
          .filter((product) => product.slug.length > 0)
          .map((product) => `/watches/${product.slug}/`)
      : [];

  const archivePageCount =
    archivePageResult._tag === 'Success' ? toArchivePageCount(archivePageResult.value.total) : 0;
  const archivePaths = Array.from(
    { length: archivePageCount },
    (_, offset) => `/archives/${offset + 2}`
  );

  const paths = [...STATIC_PATHS, ...productPaths, ...archivePaths].filter(
    (path) => !(excludedSitemapPaths as readonly string[]).includes(path)
  );

  const origin = (site ?? new URL(SITE_ORIGIN)).origin;
  const xml = buildSitemapXml(origin, paths);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': `public, max-age=0, s-maxage=${SITEMAP_EDGE_TTL_SECONDS}`,
    },
  });
};
