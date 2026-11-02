# NOREVRA

A production storefront for a contemporary European furniture house: twenty
pieces across five collections, made to order.

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Motion ·
GSAP-free by choice (see [Motion](#motion)) · Stripe-ready checkout.

---

## Quick start

```bash
npm install
```

```bash
npm run dev
```

The site runs with **no environment variables**. Every integration reports its
own absence rather than failing quietly — see
[Integrations](#integrations-and-what-happens-without-them).

```bash
npm run verify
```

Runs `tsc --noEmit`, ESLint and a production build. Use it before pushing.

For the full end-to-end suite, start the production server and drive it:

```bash
npm run build && npm start
```

```bash
node scripts/test/smoke.mjs
```

---

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (flat config) |
| `npm run verify` | typecheck + lint + build |
| `npm run assets` | Regenerate every image under `public/media` |
| `node scripts/inspect.mjs [filter]` | Measure tone, detail and subject placement of generated images |
| `node scripts/test/smoke.mjs` | Drive the production build in a browser: 27 routes at two viewports, plus 36 assertions covering the bag, filters, search, gallery, forms, mobile nav and reduced motion |
| `node --experimental-strip-types --import ./scripts/ts-loader.mjs scripts/test/audit.mjs` | Functional audit: link crawl, product data cross-checked against the catalogue, quantity bounds, checkout contract, form validation, eight viewport widths, contrast, labels, landmarks, heading order, tab order and touch targets |
| `node scripts/sheet.mjs <paths…>` | Contact sheet of generated frames, for reviewing art direction |

---

## Architecture

```
src/
  app/                     Routes. Server components unless marked otherwise.
    api/                   checkout · contact · newsletter
    account/               Sign-in, profile, order history
    furniture/             Catalogue index (URL-driven) + 20 product pages
    collections/           Index + 5 collection pages
    journal/               Index + 4 articles
    legal/[slug]/          Terms, privacy, cookies, accessibility
    checkout/success/      Order confirmation, verified server-side
  components/
    layout/                Header, mobile nav, footer, chrome context
    motion/                Reveal, SplitText, Parallax, SmoothScroll, PageFade
    ui/                    Button, Media, Field, Overlay, Accordion, Quantity…
    product/               Gallery, purchase panel, card, quick view, wishlist
    shop/                  Filters
    bag/                   Drawer, bag page
    forms/                 Newsletter, contact
  data/                    The whole catalogue. See below.
  hooks/                   Configurator, hydration, media queries
  lib/                     Store, bag maths, catalogue query, SEO, integrations
                           facets.ts holds the filter vocabulary with no data
                           imports, so the filter UI never bundles the
                           catalogue or its search index
scripts/
  lib/                     Asset pipeline: forms, textures, scene, elevation
  generate-assets.mjs      The pipeline
  inspect.mjs              Image QA
  test/smoke.mjs           End-to-end smoke test
```

### One source of truth

Business information lives in `src/data` and nowhere else. No component
contains an address, a price, a lead time or a tax rate.

| File | Owns |
| --- | --- |
| `brand.ts` | Identity, addresses, email, telephone, tax rate, delivery tiers, warranty, returns, designers |
| `products.ts` | 20 products: variants, option groups, construction, care, lead times, images |
| `collections.ts` | 5 collections and their art direction |
| `materials.ts` | 18 materials — **and the recipe used to render each one** |
| `journal.ts` | 4 articles as structured blocks |
| `legal.ts` | Four legal documents as sections |
| `assets.ts` | Site-level imagery, each with the photograph that should replace it |
| `navigation.ts` | Header and footer navigation |
| `types.ts` | Shared types, categories, silhouette names |
| `focus.json` | Generated. Where the subject sits in each frame, so a crop keeps the furniture |

To change a price, edit `products.ts`. To add a product, add an object to the
same array: it appears in the catalogue, the filters, the facet counts, the
sitemap, the structured data, and — once you run `npm run assets` — gets its
own photography and drawings.

### Commerce state

`src/lib/store.ts` — zustand with `persist` to `localStorage`.

Cart lines store **identity only**: product slug, variant id, chosen finishes,
quantity. Prices, names, dimensions and lead times are resolved against the
live catalogue on every render (`src/lib/bag.ts`), and again on the server at
checkout (`src/app/api/checkout/route.ts`).

A stale price can therefore never be charged, a discontinued piece is dropped
from the bag rather than ordered, and a client cannot influence what anything
costs.

### Catalogue queries

`src/lib/catalogue.ts` is a pure function of URL search params:

```
/furniture?category=seating,tables&collection=sestri&family=textile&band=3000-8000&sort=price-desc&q=bouclé
```

Unknown values are discarded, so a hand-edited URL cannot break the page.
Facet counts are computed against the rest of the query, so a filter that
would return nothing is shown as unavailable rather than leading to an empty
grid. Filtered views are server-rendered and shareable.

### Replacing the commerce backend

The catalogue is read through accessors (`productBySlug`, `queryProducts`,
`priceRange`, `variantPrice`), never by reaching into the array. To move to
Shopify, Commerce Layer or a CMS:

1. Keep the types in `src/data/types.ts` as the contract.
2. Replace the bodies of the accessors in `products.ts` / `collections.ts`
   with fetches, and make them async.
3. Await them in the (already server-side) pages.

Nothing in `components/` reads the data files directly except through those
accessors, so no view needs to change.

---

## Integrations, and what happens without them

Nothing here pretends. Each adapter in `src/lib/integrations.ts` reports
whether it is configured, and that state reaches the interface.

| Integration | Configured | Not configured |
| --- | --- | --- |
| **Sign-in** (Auth.js + Google) | Google only, session in a signed cookie, no user table | `/account` redirects to a sign-in page that says it is not connected and names the variables; `/api/auth/*` returns 503 |
| **Order history** (Stripe) | Read back from the customer's Checkout Sessions | States that history is not connected, and offers to look an order up by hand |
| **Checkout** (Stripe) | Server re-prices the bag, creates a Checkout Session, redirects | `/api/checkout` returns **501** with the exact variables required; the bag renders them, states that no payment was taken, and offers to invoice by email |
| **Enquiries** (Resend) | Emailed to `ENQUIRY_TO_EMAIL`, reply-to the sender | Validated and logged server-side; the visitor is told it has not reached a mailbox and given the studio address |
| **Newsletter** | POSTed to your provider | Logged server-side; the confirmation says the address was received but no provider is connected |
| **Order confirmation** | Session retrieved from Stripe; shows reference, amount paid, and empties the bag | States that no completed payment could be confirmed and **leaves the bag untouched** |

All three API routes validate with `zod`, rate-limit per IP
(`src/lib/rate-limit.ts`), and carry a honeypot field.

### Accounts

Google only. Sessions are a signed JWT cookie, so there is **no user
database** — and order history is read back from Stripe Checkout rather than
from a table of our own, so an account stores nothing. The bag and saved
pieces stay in the browser, signed in or not.

`src/middleware.ts` does the account-area redirect rather than `redirect()`
inside the page: a redirect thrown during a Server Component render resolves
inline, so the sign-in page appears at `/account` and the URL never changes,
which breaks bookmarking and the `next` parameter. The pages still verify the
session properly — the middleware only checks that a cookie is present.

### Fulfilment

`/api/checkout` creates the session; it does not fulfil the order. For
production, add a webhook route for `checkout.session.completed`, verify it
with `STRIPE_WEBHOOK_SECRET`, and write the order wherever it belongs.
Confirming payment from the browser is never sufficient.

---

## Photography

**Every image in `public/media` is generated art direction, not photography.**

Stock libraries were ruled out — a luxury furniture house does not use them,
and mismatched frames are the fastest way to make a site look assembled rather
than designed. So the imagery is produced locally and deterministically from
the catalogue itself:

- **Materials** are drawn as vectors from recipes in `materials.ts`: travertine
  as elongated pores over horizontal bedding, oak as 230 wandering grain lines
  with cathedral figure, bouclé as a jittered field of loops, patinated brass as
  drawn lines under oxidation cloud. The swatch a customer selects and the
  surface rendered on the piece come from the same recipe.
- **Pieces** are built from parametric forms in `scripts/lib/forms.mjs`, defined
  in centimetres and driven by the published dimensions, then photographed by
  the camera in `scripts/lib/camera.mjs` — a pinhole that yaws but never
  pitches and composes with a lens shift, so horizontals converge and
  verticals stay vertical.
- **Every offered combination of finishes is rendered** (226 frames), so
  choosing a graphite cloth *and* a natural oak plinth shows exactly that
  piece rather than the cloth change alone.
- **The hero is art-directed twice**, landscape and portrait, and a `<picture>`
  built with `getImageProps` serves one or the other. A phone gets a frame
  composed for its crop, not a crop of the wide one.
- **Drawings** — the elevation and plan on every product page — are generated
  from the same part list, so a drawing can never disagree with a photograph.
  These are **not** placeholders: they are correct to the published dimensions.

Quality control is mechanical, not visual: the pipeline asserts each piece's
projected bounding box sits inside the safe margin before writing a frame, and
`scripts/inspect.mjs` measures tone, detail energy and subject placement so a
flat or broken frame cannot ship unnoticed.

### Replacing it with real photography

`PHOTOGRAPHY.md` is generated by the pipeline and contains a brief for every
frame — focal length, camera height, light direction, what must be in the
frame and what must not. For each one:

1. Shoot it. Keep the aspect ratio; layouts are built to it.
2. Save it at the exact path given, as JPEG, at or above the stated width.
3. Run `npm run build`.

No component changes, because every path is referenced through `src/data`.

Regenerating requires Playwright, which is deliberately **not** a dependency of
this project — the media is committed, so `npm ci && npm run build` never needs
a browser download:

```bash
npm i -D playwright && npx playwright install chromium && npm run assets
```

---

## Motion

The brief asked for GSAP where it adds genuine value. It did not: every
behaviour here is lighter without it.

- **Reveals** run through **one shared `IntersectionObserver`**
  (`src/lib/observe.ts`) with CSS transitions, so they work before hydration
  and a reload part-way down the page never shows an empty section.
- **Smooth scrolling** (Lenis) is dynamically imported, and only for fine
  pointers without a reduced-motion preference — it is never in the critical
  bundle for anyone who will not use it.
- **Parallax, page transitions, overlays and the hero** use Motion.
- **`prefers-reduced-motion`** is honoured thoroughly: reveals resolve
  instantly, the hero stops advancing (its indicators still work), parallax is
  disabled, and Lenis is not loaded at all.

---

## Performance

- Server components by default. The only client islands are the header, the
  bag, the product configurator, the gallery, the filter UI and the forms.
- Facet labels and counts are resolved on the server and passed as props, so
  the filter UI imports no catalogue data at all.
- Images go through `next/image` to AVIF/WebP with explicit `sizes`; a product
  page pulls about 170 KB of imagery at 1440px and 70 KB on a phone.
- Script weight, uncompressed, measured against the production build: 226 KB
  on the homepage, 106 KB on the catalogue, 81 KB on a product page.
- Filtered catalogue links are not prefetched: `/furniture` is dynamic, and
  hovering a footer link should not cost a server render.
- Lenis is dynamically imported and skipped entirely for coarse pointers and
  reduced-motion users.

## Accessibility

- Semantic landmarks, one `<h1>` per page, a skip link as the first tab stop.
- Overlays are real dialogs: `aria-modal`, focus moved in and restored on
  close, a tab trap, Escape, scroll locked, Lenis stopped.
- Filters are labelled checkboxes with live result counts; the result total is
  an `aria-live` region.
- Every image has alt text written for the picture. Where an image carries
  information, the information is also stated in words.
- Forms: labels tied to inputs, `aria-invalid`, errors in `role="alert"` and
  referenced by `aria-describedby`.
- No pure black on pure white; contrast was chosen against the warm palette
  rather than assumed.

`/legal/accessibility` documents the known limitations honestly.

---

## SEO

- One metadata builder (`src/lib/seo.tsx`) — no page can forget a canonical
  URL or an Open Graph image.
- JSON-LD: `Organization` and `WebSite` site-wide, `Product` with
  `AggregateOffer` on every piece, `BreadcrumbList`, `Article` on journal posts.
- `sitemap.xml` and `robots.txt` generated from the data; `/bag`, `/wishlist`,
  `/checkout/` and `/api/` are excluded.
- 44 of 49 routes prerender as static HTML. Only the three API handlers,
  `/furniture` (rendered from search params) and `/checkout/success` (verifies
  a payment server-side) are dynamic.

---

## Deployment (Vercel)

1. Push the repository to GitHub.
2. Import it at **vercel.com/new**. Framework is detected; no build settings
   need changing.
3. Add `NEXT_PUBLIC_SITE_URL`. Everything else is optional — see
   `.env.example`.
4. Deploy.

Pushing to the branch does not deploy anything by itself. Vercel builds on
push only once the repository is connected to a Vercel project.

`public/media` (~20 MB) is committed on purpose: the build is then a plain
`next build` with no image generation step, and deploys are reproducible.

### Before going live

- [ ] Set `NEXT_PUBLIC_SITE_URL` to the real origin, or canonical URLs and OG
      images will point at the fallback domain.
- [ ] Connect Stripe with a **test** key first and complete a test order.
- [ ] Connect `RESEND_API_KEY` + `ENQUIRY_TO_EMAIL`, or the contact form will
      keep telling visitors it has nowhere to send.
- [ ] Add a `checkout.session.completed` webhook before taking real money.
- [ ] Replace the generated imagery using `PHOTOGRAPHY.md`.
- [ ] Rate limiting is in-process and resets on each cold start. For real
      traffic put a WAF or Upstash in front of `/api/*`.
- [ ] Replace the placeholder social URLs in `brand.ts` with the real profiles.

---

## What is deliberately absent

No customer accounts, no reviews, no live chat, no cookie banner (there are no
tracking cookies to consent to), no analytics, no discount codes, no "trusted
by" strip, and no stock photography. A furniture house of this kind sells
twenty pieces to people who want to sit on them first; the site's job is to
make that conversation easy to start.

## Licence

Private and unpublished. All brand names, copy, product data and generated
imagery here are fictional and were written for this project.
