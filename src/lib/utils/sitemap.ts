export const ARCHIVE_PAGE_SIZE = 20;

export const excludedSitemapPaths = ['/cart', '/checkout', '/404'] as const;

export const toArchivePageCount = (productTotal: number) =>
  productTotal > 0 ? Math.ceil(productTotal / ARCHIVE_PAGE_SIZE) : 0;

const escapeXml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

export const buildSitemapXml = (site: string, paths: readonly string[]) => {
  const uniquePaths = [...new Set(paths)];
  const urls = uniquePaths
    .map((path) => `<url><loc>${escapeXml(new URL(path, site).href)}</loc></url>`)
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
};
