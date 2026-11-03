// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://donghocodien.com",
  output: "server",
  adapter: cloudflare({
    compatibilityDate: "2026-10-30",
  }),
  session: false,
  integrations: [react(), sitemap()],
  image: {
    domains: ["donghocodien.com"],
    remotePatterns: [{ protocol: "https", hostname: "donghocodien.com" }],
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      proxy: {
        '/wc/store/v1': {
          target: 'https://donghocodien.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/wc/, '/wp-json/wc'),
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              if (req.headers.cookie) {
                proxyReq.setHeader('cookie', req.headers.cookie);
              }
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              const origin = req.headers.origin || '*';
              res.setHeader('Access-Control-Allow-Origin', origin);
              res.setHeader('Access-Control-Allow-Credentials', 'true');
              const nonce = proxyRes.headers['x-wc-store-api-nonce'];
              if (nonce) {
                res.setHeader('Access-Control-Expose-Headers', 'x-wc-store-api-nonce');
              }
            });
          },
        },
      },
    },
  },
});
