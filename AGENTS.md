# AGENTS.md — Agent Steering & Operational Protocols

Guidelines for AI agents working on **donghocodien.com** (Spacetime Vintage Watches).

---

## 1. Project Context & Identity

- **Product**: Global luxury e-commerce for authentic vintage Swiss & Japanese timepieces.
- **Backend / CMS**: WordPress + WooCommerce Store API (`https://donghocodien.com/wp-json/wc/store/v1`).
- **Primary Language**: **English (`en`)** across all UI, navigation, forms, and metadata.
- **Brand Name**: _Spacetime - Vintage Watch_ / _Dong Ho Co Dien_.
- **Currency**: USD (`$`).

---

## 2. Technology Stack & Architectural Invariants

- **Framework**: **Astro (v7+)** configured with `@astrojs/cloudflare` adapter in `server` / hybrid mode for SSR.
- **Functional Programming**: **Effect (v4)** with **`@effect/tsgo`**:
  - Diagnostic engine: Run `pnpm check:effect` to catch Effect anti-patterns (floating effects, missing yields, schema finite numbers, lazy indirection).
  - Use `Schema.decodeUnknownEffect` (or `Schema.decodeUnknownSync`) to decode API data.
  - Model domain errors explicitly with tagged errors (`HttpError`, `NetworkError`, `ProductNotFoundError`, `CartNetworkError`, `CartHttpError`, `CartNotFoundError`, `PageNotFoundError`, `PostNotFoundError`).
  - No untyped `catch (e: any)` blocks.
  - Use `Effect.retry` and `Effect.timeout` for resilient remote requests.
  - In-memory caching with TTL (5 min default) for products, categories, pages, posts.
- **UI Components**: **Ark UI (`@ark-ui/react v5+`)** based on Zag.js state machines (Carousel, Accordion, Dialog/Drawer).
  - Before implementing any new component, check `@src/components/` whether an Ark UI component already exists for that pattern (Carousel, Accordion, Dialog/Drawer, etc.). If it exists, reuse it; do not duplicate.
- **Icon Packages**:
  - In Astro templates (`*.astro`): Strictly use `@lucide/astro` (zero client JS overhead).
  - In React components (`*.tsx`): Use `lucide-react`.
  - **Search Before You Create an Icon**: Icons may already exist as shared components in `src/components/` (e.g. `SocialIcon.astro` for brand icons) or as lucide icons. Before writing any inline SVG, importing an icon, or creating a new icon component, SEARCH the codebase (`src/components/`, `src/lib/`, and `grep` for the icon/data) first. If a shared icon already exists, reuse it — never duplicate or scatter the same icon inline across files. Only create a new shared icon when none exists.
- **Styling**: **Tailwind CSS v4** with CSS-first `@theme` in `src/styles/global.css`.
- **Typography**: Signature font `elle-futura-book` bundled in `public/fonts/`. Never replace with generic default sans-serif.
- **Deployment**: Cloudflare Workers via `@astrojs/cloudflare` adapter.

---

## 3. Test-Driven Development (TDD) Mandatory Protocol

Every new non-trivial logic (schema, calculator, service method, filter, cart mutation) MUST follow TDD:

```
Red (Failing Test) ➔ Green (Minimal Implementation) ➔ Refactor
```

### Seams (Where Tests Live)

1. **Never test internal details or private variables**: Test at agreed public boundaries (seams).
2. **Schema & API Seams**: Verify decoding of real WooCommerce JSON fixtures (`src/tests/fixtures/`).
3. **Price & Cart Logic**: Verify pricing, currency formatting, discounts, and line-item totals with independent truths, never tautological tests.
4. **Execution Command**:
   ```bash
   pnpm test       # Run Vitest test suite
   ```
5. **No Blind Code Generation**: Always run `pnpm test` and `pnpm build` before completing any coding turn.

---

## 4. Visual & Responsive Design Standards (`frontend-design`)

- **Solid Colors Only — No Gradients**: Use solid flat colors exclusively. Never use gradient color patterns (`bg-linear-to-*`, `bg-gradient-to-*`, `from-*`/`to-*`/`via-*` color stops, `linear-gradient()`, or `bg-clip-text`). For legibility overlays (e.g. hero captions), use a solid semi-transparent background such as `bg-black/40` instead of a gradient scrim. Apply color via Tailwind color utilities or the `brand-*` tokens in `src/styles/global.css`; never inline raw hex in styles.
- **Dark Text Color — Use `brand-dark`, Never Raw Black**: The canonical dark text color is the `--color-brand-dark` token (`#111111`), which equals the `body` default color. Do NOT write `text-black` / `hover:text-black` (raw `#000`) — use `text-brand-dark` / `hover:text-brand-dark` instead. Because it equals the inherited body color, most element-level `text-brand-dark` classes are redundant: declare it once on a container root (e.g. `<footer>`, `<main>`) and let children inherit; only keep it on elements that must escape a differently-colored ancestor (e.g. inside a `text-stone-*` nav) or as a `hover:`/`group-hover:` target. Before adding a new `text-brand-dark`, check whether inheritance already provides it.
- **Centered Logo Layout**: Desktop header must maintain the centered brand logo (`/images/logo.png`) with balanced split navigation.
- **Responsive Product Grids**:
  - Mobile (<640px): 2 columns (`grid-cols-2`)
  - Tablet (640–1024px): 3 columns (`md:grid-cols-3`)
  - Desktop (>1024px): 4 columns (`lg:grid-cols-4`)
- **Card Aspect Ratio**: Strictly `300/375` (4:5 portrait) with `image-fade_in_back` hover transitions.
- **Three Signature Feature Blocks**: Must be preserved in the footer:
  - `6 MONTHS WARRANTY` → `/warranty-policy`
  - `SHIPPING WORLDWIDE` → `/payment-shipping-methods`
  - `EXCHANGE POLICY` → `/exchange-policy`
- **Contact Channels**: WhatsApp (`+84 94 162 5653`) and Email (`spacetime.donghocodien@gmail.com`).

---

## 5. Development Workflow Commands

```bash
# Install dependencies
pnpm install

# Run unit tests (Vitest)
pnpm test

# Typecheck TypeScript files
pnpm exec tsc --noEmit

# Run Effect-TS diagnostics (powered by @effect/tsgo)
pnpm check:effect

# Lint and format (oxlint + oxfmt) — MUST pass with zero warnings/errors
pnpm lint
pnpm fmt:check

# Typecheck and build SSR production bundle
pnpm build

# Start local development server
pnpm dev

# Start background development server (if needed)
astro dev --background

# Deploy to Cloudflare Workers
pnpm deploy
```

---

## 5a. Quality Gate Protocol (Mandatory)

**Zero-tolerance policy for lint/format/typecheck issues:**

1. **Before completing any coding task**, run the full quality gate:

   ```bash
   pnpm lint && pnpm fmt:check && pnpm exec tsc --noEmit && pnpm check:effect && pnpm test && pnpm build
   ```

2. **If ANY warnings or errors appear**, the agent MUST:
   - Fix the root cause (refactor code, adjust patterns, add types)
   - NEVER suppress with `// eslint-disable`, `// @ts-ignore`, `// oxlint-disable`, or config overrides
   - NEVER lower rule severity to hide issues
   - Re-run the quality gate until clean

3. **Pre-existing warnings in third-party code** (e.g., `.agents/skills/`):
   - Do not modify third-party skill code
   - These are documented exceptions; do not use as precedent for project code

4. **New code must introduce zero new warnings** — this is enforced in CI and reviewed in every turn.

---

## 6. Installed Skills Reference (`.agents/skills/`)

Agents should consult these specialized skill guidelines before modifying relevant layers:

- `tdd`: Red-green-refactor loop, public seams, vertical slicing, no tautological assertions.
- `frontend-design`: Horology-specific typography, high editorial aesthetic, zero generic SaaS card kits.
- `tailwind-design-system`: Tailwind v4 patterns with `@theme` design tokens.
- `ponytail`: Smallest complete change, strict YAGNI, clean diffs.
- `agent-browser`: Programmatic browser verification and interaction testing.
- `graphify`: Knowledge graph queries on codebase architecture.
- `design-taste-frontend`: Anti-slop frontend art direction from curated gallery study.

---

## 7. Code Cleanliness & Commenting Policy

- **No Code Comments**: Do not write comments in code (`//`, `/* */`, `{/* ... */}`, `<!-- ... -->`). Code must be clean, self-documenting, and concise without explanatory narrative or section labels.
- **Readable Variable Names — No Single-Letter Identifiers**: Every variable, parameter, and arrow-function argument MUST use a descriptive, self-documenting name (e.g. `product`, `category`, `page`, `order`, `event`, `country`, `current`). Never name a variable with a single letter such as `p`, `c`, `o`, `e`, `f`, `b`, `n`, `t`, or `g`. This applies everywhere, including arrow callbacks (`(product) => …`), event handlers (`(event) => …`), reducer/sort callbacks (`(categoryA, categoryB) => …`), and test callbacks (`(toast) => …`).
  - **Anti-examples (forbidden)**: `(p) => p.prices.price`, `setForm((f) => ({ ...f }))`, `.map((c) => c.name)`, `(e) => e.target.value`.
  - **Good examples**: `(product) => product.prices.price`, `setForm((current) => ({ ...current }))`, `.map((category) => category.name)`, `(event) => event.target.value`.
  - When writing new code or editing existing code, audit nearby callbacks and renames for any lingering single-letter identifiers.

---

## 8. Project Discovery & Architectural Navigation (`graphify-out/`)

- **First Stop for Codebase Discovery**: When exploring codebase structure, relationships, call chains, data flows, or cross-cutting abstractions, ALWAYS check `graphify-out/` before manual crawling:
  - `graphify-out/GRAPH_REPORT.md`: Architectural summary, community clusters, god nodes, and cohesion scores.
  - `graphify-out/graph.json`: Pre-computed knowledge graph of all symbols, types, dependencies, and imports.
  - `graphify-out/graph.html`: Visual interactive map of the architecture.
- **Fast Graph Queries**: Use `/graphify query "<question>"` to trace paths, explore communities, or understand cross-module interactions without reading every file sequentially.

---

## 9. Current Implementation Status

### Pages (Astro)

- `index.astro` — Homepage with HeroCarousel, product sections
- `shop.astro` — Product catalog with filtering
- `product/[slug].astro` — Product detail page
- `cart.astro` — Cart page
- `checkout.astro` — Checkout page
- `checkout/order-received/[orderId].astro` — Order confirmation
- `about-us.astro` — About page
- `contact-us.astro` — Contact page
- `[slug].astro` — Dynamic article/page routes
- `warranty-policy.astro`, `exchange-policy.astro`, `payment-shipping-methods.astro` — Policy pages

### Components

**Astro Components:**

- `Header.astro` — Navigation with mega menu
- `Footer.astro` — Footer with feature blocks
- `Head.astro` — SEO meta tags

**React Components (`src/components/`):**

- `HeroCarousel.tsx` — Hero image carousel (Ark UI Carousel + Embla)
- `ProductCarousel.tsx` — Product grid carousel
- `WatchCard.tsx` — Product card component
- `WatchGallery.tsx` — Product image gallery (Ark UI Carousel)
- `WatchSpecs.tsx` — Technical specs accordion (Ark UI Accordion)
- `ProductTabs.tsx` — Product description/specs/reviews tabs
- `AddToCartButton.tsx` — Add to cart with quantity
- `CartDrawer.tsx` — Slide-out cart drawer (Ark UI Dialog/Drawer)
- `CartPage.tsx` — Cart page component
- `CheckoutPage.tsx` — Checkout form component
- `OrderComplete.tsx` — Order confirmation display
- `CategoryAccordion.tsx` — Category filter accordion (Ark UI Accordion)
- `PriceRangeSlider.tsx` — Price filter slider
- `SelectField.tsx` — Custom select dropdown
- `Button.tsx` — Reusable button component
- `RelatedProducts.tsx` — Related products carousel
- `ConsignmentForm.tsx` — Watch consignment form
- `Snackbar.tsx` — Toast notifications
- `Providers.tsx` — React context providers

### Services (Effect v4)

- `src/lib/services/woocommerce.ts` — WooCommerce Store API client
  - `getProducts()`, `getProductBySlug()`, `getCategories()`
  - `getPageBySlug()`, `getPostBySlug()`
  - Tagged errors: `NetworkError`, `HttpError`, `ProductNotFoundError`, `PageNotFoundError`, `PostNotFoundError`
  - In-memory caching with 5-minute TTL
- `src/lib/services/cart.ts` — Cart API client
  - `getCart()`, `addToCart()`, `updateCartItem()`, `removeCartItem()`, `clearCart()`
  - Tagged errors: `CartNetworkError`, `CartHttpError`, `CartNotFoundError`
- `src/lib/services/consignment.ts` — Consignment submission service

### Schemas (Effect Schema)

- `src/lib/schema/product.ts` — Product, ProductImage, ProductPrices, ProductCategory
- `src/lib/schema/cart.ts` — Cart, CartItem, CartTotals, CartAddress
- `src/lib/schema/page.ts` — WordPress Page schema
- `src/lib/schema/post.ts` — WordPress Post schema

### Tests

- All schemas have corresponding `.test.ts` files with real WooCommerce JSON fixtures
- Cart service tests in `src/lib/services/cart.test.ts`
- Utility tests for currency, categories, products, format, geo, html, text

### Utilities

- `src/lib/utils/currency.ts` — Currency formatting, VND approximation, exchange rates
- `src/lib/utils/products.ts` — Product filtering, sorting helpers
- `src/lib/utils/categories.ts` — Category tree utilities
- `src/lib/utils/format.ts` — General formatting utilities
- `src/lib/utils/geo.ts` — Geolocation helpers
- `src/lib/utils/html.ts` — HTML sanitization
- `src/lib/utils/text.ts` — Text utilities

### State Management

- `src/lib/cartStore.ts` / `src/lib/cartStore.test.ts` — Client-side cart state
- `src/lib/toastStore.ts` / `src/lib/toastStore.test.ts` — Toast notification state
- `src/lib/context/CartContext.tsx` — React context for cart

---

## 10. API Endpoints (Verified Live)

| Endpoint                                                           | Description                      |
| ------------------------------------------------------------------ | -------------------------------- |
| `https://donghocodien.com/wp-json/wc/store/v1/products`            | Products catalog (2,312 watches) |
| `https://donghocodien.com/wp-json/wc/store/v1/products/categories` | Product categories               |
| `https://donghocodien.com/wp-json/wc/store/v1/cart`                | Cart API                         |
| `https://donghocodien.com/wp-json/wp/v2/pages`                     | WordPress pages                  |
| `https://donghocodien.com/wp-json/wp/v2/posts`                     | WordPress posts/articles         |

### Proxy Configuration (astro.config.mjs)

- Local dev proxies `/wc/store/v1` → `https://donghocodien.com/wp-json/wc/store/v1`
- Forwards cookies for cart session persistence
- Handles CORS headers for cart nonce exposure

---

## 11. Key Architectural Decisions

1. **Hybrid SSR Mode**: Product pages (2,312) use SSR with edge caching (`s-maxage=86400`), articles (46) use SSG pre-rendering.
2. **Route Matching**: `/product/[slug]/` preserves SEO rankings and backlinks.
3. **Effect v4 for All I/O**: Schema validation, typed errors, retries, timeouts, caching.
4. **Ark UI for Interactivity**: Accessible, unstyled primitives — no custom state machines.
5. **Tailwind v4 with @theme**: Design tokens in `src/styles/global.css`, no config file.
6. **Cloudflare Workers Deployment**: Edge runtime for global performance.

---

## 12. WordPress Backend Setup Status

- ✅ CORS configuration added in cPanel (`functions.php` or `mu-plugins`)
- ⬜ Install **WP-REST-API-V2-Menus** (for header/footer menu sync)

---

## 13. Upcoming / Planned Features

1. **Advanced Filters**: Brand, Size (20-30mm, 30-40mm), Movement (Automatic, Hand Wound), Status (Now Available)
2. **Search**: Full-text product search
3. **User Accounts**: Wishlist, order history
4. **Multi-currency**: USD primary, VND approximate display
5. **Analytics**: GA4 + custom events for vintage watch interactions
