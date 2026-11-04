# Graph Report - src (2026-11-01)

## Corpus Check

- Corpus is ~11,897 words - fits in a single context window. You may not need a graph.

## Summary

- 143 nodes · 277 edges · 9 communities (8 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)

- WooCommerce API & Page Services
- Layout & Hero Components
- Product Carousel & Currency Utilities
- Cart Drawer & Watch Gallery UI
- Header & Mega Menu Navigation
- Schema Validation & Post Processing
- Watch Consignment Service & Form
- Watch Card & Catalog Schemas

## God Nodes (most connected - your core abstractions)

1. `Product` - 7 edges
2. `submitConsignment()` - 7 edges
3. `NetworkError` - 7 edges
4. `HttpError` - 7 edges
5. `formatApproxVND()` - 7 edges
6. `ProductCarousel()` - 6 edges
7. `getProducts()` - 5 edges
8. `getProductBySlug()` - 5 edges
9. `getPageBySlug()` - 5 edges
10. `getPosts()` - 5 edges

## Surprising Connections (you probably didn't know these)

- `CartDrawerProps` --references--> `Product` [EXTRACTED]
  components/CartDrawer.tsx → lib/schema/product.ts
- `ProductCarouselProps` --references--> `Product` [EXTRACTED]
  components/ProductCarousel.tsx → lib/schema/product.ts
- `ConsignmentForm()` --calls--> `submitConsignment()` [EXTRACTED]
  components/ConsignmentForm.tsx → lib/services/consignment.ts
- `ProductCarousel()` --calls--> `formatApproxVND()` [EXTRACTED]
  components/ProductCarousel.tsx → lib/utils/currency.ts
- `ProductCarousel()` --calls--> `getClientExchangeRate()` [EXTRACTED]
  components/ProductCarousel.tsx → lib/utils/currency.ts

## Import Cycles

- None detected.

## Communities (9 total, 1 thin omitted)

### Community 0 - "WooCommerce API & Page Services"

Cohesion: 0.15
Nodes (21): PageSchema, PagesListSchema, WpPage, cache, getCategories, getPageBySlug(), getPostBySlug(), getPosts() (+13 more)

### Community 1 - "Layout & Hero Components"

Cohesion: 0.10
Nodes (7): year, HERO_SLIDES, HeroSlide, canonicalURL, Props, page, fallbackArticles

### Community 2 - "Product Carousel & Currency Utilities"

Cohesion: 0.23
Nodes (13): cleanTitle(), ProductCarousel(), CachedExchangeRate, DEFAULT_USD_TO_VND_RATE, EXCHANGE_RATE_CACHE_KEY, EXCHANGE_RATE_CACHE_TTL_MS, formatApproxVND(), getClientExchangeRate() (+5 more)

### Community 3 - "Cart Drawer & Watch Gallery UI"

Cohesion: 0.18
Nodes (10): CartDrawer(), CartDrawerProps, ProductCarouselProps, WatchGallery(), WatchGalleryProps, WatchSpecs(), WatchSpecsProps, Product (+2 more)

### Community 4 - "Header & Mega Menu Navigation"

Cohesion: 0.12
Nodes (12): clockEl, closeBtn, drawer, drawerContent, megaMenuData, toggleBtn, watchesChevron, watchesContent (+4 more)

### Community 5 - "Schema Validation & Post Processing"

Cohesion: 0.17
Nodes (6): PageSchema, WpPage, Post, PostSchema, sanitizeWordPressHtml(), cleanItemTitle

### Community 6 - "Watch Consignment Service & Form"

Cohesion: 0.27
Nodes (7): ConsignmentForm(), ConsignmentError, ConsignmentPayload, ConsignmentResponse, HttpError, NetworkError, submitConsignment()

### Community 7 - "Watch Card & Catalog Schemas"

Cohesion: 0.15
Nodes (9): cleanName, Props, ProductCategory, ProductCategorySchema, ProductImageSchema, ProductPrices, ProductPricesSchema, ProductSchema (+1 more)

## Knowledge Gaps

- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `Product` connect `Cart Drawer & Watch Gallery UI` to `WooCommerce API & Page Services`, `Product Carousel & Currency Utilities`, `Watch Card & Catalog Schemas`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Should `Layout & Hero Components` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Why does `formatApproxVND()` connect `Product Carousel & Currency Utilities` to `Layout & Hero Components`, `Cart Drawer & Watch Gallery UI`, `Watch Card & Catalog Schemas`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Should `Header & Mega Menu Navigation` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
