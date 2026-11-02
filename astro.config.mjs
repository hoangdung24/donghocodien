// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare({
    compatibilityDate: "2026-10-30",
  }),
  session: false,
  integrations: [react()],
  image: {
    domains: ["donghocodien.com"],
    remotePatterns: [{ protocol: "https", hostname: "donghocodien.com" }],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
