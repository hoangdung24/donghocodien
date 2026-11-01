# AGENTS.md — Agent Steering & Operational Protocols

Guidelines for AI agents working on **donghocodien.com** (Spacetime Vintage Watches).

---

## 1. Project Context & Identity
- **Product**: Global luxury e-commerce for authentic vintage Swiss & Japanese timepieces.
- **Backend / CMS**: WordPress + WooCommerce Store API (`https://donghocodien.com/wp-json/wc/store/v1`).
- **Primary Language**: **English (`en`)** across all UI, navigation, forms, and metadata.
- **Brand Name**: *Spacetime - Vintage Watch* / *Dong Ho Co Dien*.
- **Currency**: USD (`$`).

---

## 2. Technology Stack & Architectural Invariants
- **Framework**: **Astro (v7+)** configured with `@astrojs/node` in `server` / hybrid mode.
- **Functional Programming**: **Effect (v4)** with **`@effect/tsgo`**:
  - Diagnostic engine: Run `pnpm check:effect` to catch Effect anti-patterns (floating effects, missing yields, schema finite numbers, lazy indirection).
  - Use `Schema.decodeUnknownEffect` (or `Schema.decodeUnknownSync`) to decode API data.
  - Model domain errors explicitly with tagged errors (`HttpError`, `NetworkError`, `ProductNotFoundError`).
  - No untyped `catch (e: any)` blocks.
  - Use `Effect.retry` and `Effect.timeout` for resilient remote requests.
- **UI Components**: **Ark UI (`@ark-ui/react v5+`)** based on Zag.js state machines (Carousel, Accordion, Dialog/Drawer).
- **Styling**: **Tailwind CSS v4** with CSS-first `@theme` in `src/styles/global.css`.
- **Typography**: Signature font `elle-futura-book` bundled in `public/fonts/`. Never replace with generic default sans-serif.

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
- **Centered Logo Layout**: Desktop header must maintain the centered brand logo (`/images/logo.png`) with balanced split navigation.
- **Responsive Product Grids**:
  - Mobile (<640px): 2 columns (`grid-cols-2`)
  - Tablet (640–1024px): 3 columns (`md:grid-cols-3`)
  - Desktop (>1024px): 4 columns (`lg:grid-cols-4`)
- **Card Aspect Ratio**: Strictly `300/375` (4:5 portrait) with `image-fade_in_back` hover transitions.
- **Three Signature Feature Blocks**: Must be preserved in the footer:
  - `6 MONTHS WARRANTY` &rarr; `/warranty-policy`
  - `SHIPPING WORLDWIDE` &rarr; `/payment-and-delivery`
  - `EXCHANGE POLICY` &rarr; `/exchange-policy`
- **Contact Channels**: WhatsApp (`+84 94 162 5653`) and Email (`spacetime.donghocodien@gmail.com`).

---

## 5. Development Workflow Commands

```bash
# Install dependencies
pnpm install

# Run unit tests (Vitest)
pnpm test

# Run Effect-TS diagnostics (powered by @effect/tsgo)
pnpm check:effect

# Typecheck and build SSR production bundle
pnpm build

# Start local development server
pnpm dev

# Start background development server (if needed)
astro dev --background
```

---

## 6. Installed Skills Reference (`.agents/skills/`)
Agents should consult these specialized skill guidelines before modifying relevant layers:
- `tdd`: Red-green-refactor loop, public seams, vertical slicing, no tautological assertions.
- `frontend-design`: Horology-specific typography, high editorial aesthetic, zero generic SaaS card kits.
- `tailwind-design-system`: Tailwind v4 patterns with `@theme` design tokens.
- `ponytail`: Smallest complete change, strict YAGNI, clean diffs.
- `agent-browser`: Programmatic browser verification and interaction testing.
- `graphify`: Knowledge graph queries on codebase architecture.
