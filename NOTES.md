# donghocodien.com — Headless Architecture & Migration Notes

This document preserves the agreed technical architecture and decisions for converting **donghocodien.com** to Headless WordPress.

---

## 1. Selected Stack
- **Target Audience & Language**: Global international collectors — **English** is the primary storefront language.
- **Backend / CMS**: WordPress + WooCommerce on current hosting/cPanel (`https://donghocodien.com`).
- **Frontend**: [Astro](https://astro.build/) (SSR / Hybrid mode for optimal SEO & sub-second page loads).
- **Language**: TypeScript (Strict mode).
- **Functional Programming & API Client**: [Effect (v4)](https://effect.website/) for schema validation (`Schema`), typed error handling, and resilient API requests (retries, timeouts).
- **Headless UI Primitives**: [Ark UI](https://ark-ui.com/) (`@ark-ui/react`) for accessible, unstyled interactive components (Carousels, Drawers, Modals, Accordions).
- **Styling**: Tailwind CSS (customized for luxury / vintage watch aesthetics).
- **Package Manager**: `pnpm` (Node.js v26+).

---

## 2. Verified Live WordPress Endpoints
- **CORS Headers**: Configured and verified live on `https://donghocodien.com/wp-json/wp/v2/`.
- **Products Catalog**: `https://donghocodien.com/wp-json/wc/store/v1/products`
- **Product Categories**: `https://donghocodien.com/wp-json/wc/store/v1/products/categories`
- **Cart API**: `https://donghocodien.com/wp-json/wc/store/v1/cart`
- **Product Route Matching**: `/product/[slug]/` to preserve all existing Google SEO rankings and incoming backlinks without 404s.

---

## 3. WordPress Backend Setup Checklist
- [x] CORS configuration added in cPanel (`functions.php` or `mu-plugins`).
- [ ] Install **WP-REST-API-V2-Menus** (for header/footer menu sync).
- [ ] Install **WP Webhooks** (for instant on-demand cache revalidation when watches are added/updated/sold).

---

## 4. Installed Guiding Skills (.agents/skills)
1. **`frontend-design`**: Authentic horology aesthetic; avoid generic SaaS templates or AI tells; high editorial typography and intentional layouts.
2. **`tailwind-design-system`**: Tailwind CSS v4 `@theme` design tokens, OKLCH color palettes, and scalable component patterns.
3. **`ponytail`**: Smallest complete changes, avoid over-engineering/YAGNI, maximum simplicity and maintainability.
4. **`tdd`**: Test public seams (Effect Schema decoding, price formatting, cart state) with verified fixtures.
5. **`agent-browser`**: Browser automation for end-to-end visual verification and interaction testing.
6. **`graphify`**: Codebase & architectural knowledge graph generator for deep component relationship mapping.

---

## 5. Live Crawl Inventory & Page Scope (2,384 Total URLs)
- **Products Catalog**: **2,312 Watches** (`/product/[slug]/`)
  - *Strategy*: Astro Hybrid SSR with edge cache (`s-maxage=86400`) to avoid lengthy build times.
- **Articles & Blog**: **46 Posts** (`/[slug]/`)
  - *Strategy*: 100% Pre-rendered SSG for top Google SEO.
- **Core Pages**:
  - Trang chủ (`/`)
  - Cửa hàng (`/shop/`, `/watches/`)
  - Về chúng tôi (`/about-us/`)
  - Ký gửi đồng hồ (`/consign-your-watch/`)
  - Bảo dưỡng (`/maintain/`)
  - Liên hệ (`/contact-us/`)
  - Blog index (`/blog/`, `/articles/`)
- **Policies & Terms**:
  - Bảo hành (`/warranty-policy/`)
  - Đổi trả (`/refund_returns/`, `/returns-and-exhanges-policy/`)
  - Thanh toán & Vận chuyển (`/payment-and-delivery/`)
  - Điều khoản (`/terms-and-conditions/`)
  - Chính sách bảo mật (`/privacy-policy/`)
- **E-Commerce Flows**:
  - Giỏ hàng (`/cart/`) & Thanh toán (`/checkout/`)

---

## 6. Key Frontend Features to Build
1. **Catalog & Filters**: Filter by Brand (Omega, Rolex, Cartier, etc.), Size (20-30mm, 30-40mm), Movement (Automatic, Hand Wound), and Status (Now Available).
2. **Product Page (`/product/[slug]`)**:
   - High-res watch photo gallery carousel (Ark UI Carousel + Astro `<Image />` for auto WebP/AVIF conversion).
   - Technical Specifications accordion (Ark UI Accordion).
   - Price & availability badge.
3. **Cart / Inquiry Drawer**: (Ark UI Dialog/Drawer) for checkout or direct contact.
