// @ts-check
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

// https://astro.build/config
export default defineConfig({
  site: 'https://donghocodien.com',
  output: 'server',
  adapter: cloudflare(),
  session: false,
  integrations: [react()],
  image: {
    domains: ['donghocodien.com'],
    remotePatterns: [{ protocol: 'https', hostname: 'donghocodien.com' }],
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
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
