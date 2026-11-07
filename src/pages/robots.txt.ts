import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL('sitemap.xml', site);
  const robotsTxt = `User-agent: *
Allow: /

# Disallow admin and private areas
Disallow: /cart
Disallow: /checkout
Disallow: /my-account
Disallow: /wp-admin
Disallow: /wp-json
Disallow: /?

Sitemap: ${sitemapURL.href}
`;
  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
