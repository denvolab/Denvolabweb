# Sunday Nest — React storefront

A local React + TypeScript storefront based on the Sunday Nest Figma design. This repository contains the maintained React application.

## Run locally

Requires Node.js 22.12+ (Node 24 is supported).

```sh
npm ci
npm run dev
```

Open the URL printed by Vite, normally `http://127.0.0.1:5173`.

For the production build, including the security headers and real deep-link handling:

```sh
npm run build
npm start
```

Open `http://127.0.0.1:4173`. `npm start` binds only to your computer's loopback address. Set `PORT` to select another local port. The production server is a static frontend server; it is not the commerce backend.

## Included

- Responsive homepage, announcement carousel, mobile navigation and search dialog.
- Collections, search, material/size/availability filters, sorting and load-more.
- 26 sample products, product galleries, original 4K image zoom, size guide, size selection and stock/quantity controls.
- Persistent browser-local wishlist and bag, quantity changes, removal and integer-pence totals.
- Preview discount, UK shipping estimates and checkout details validation.
- Journal, articles, about, FAQ, contact, size guides, privacy, accessibility, delivery and terms pages.
- Validated newsletter, contact and email-link sign-in forms, with honest preview states.
- Lazy route loading, local fonts, local responsive WebP images and retained original 4K JPEGs.
- Error boundaries, API errors, empty states, unknown routes, safe storage recovery, keyboard dialogs and reduced-motion support.

## What needs your backend

No real orders, payments, authentication, marketing subscriptions or contact messages are created in demo mode. The frontend deliberately does not fake successful payments or save customer addresses/passwords in browser storage. Products, stock, prices, size measurements and legal copy are samples and must be confirmed before launch.

Copy `.env.example` to `.env.local`, set `VITE_DATA_SOURCE=api`, and provide the same-origin endpoints in [BACKEND.md](./BACKEND.md). Use a reverse proxy for a backend on another port. Rebuild after changing environment variables. `VITE_` configuration is public; never put a secret or API key there.

## Project map

| Path | Purpose |
|---|---|
| `src/components/` | Shared navigation, cards, dialogs, image handling and footer |
| `src/pages/` | Route-level screens, split into separate build chunks |
| `src/state/Store.tsx` | Bag, wishlist, catalogue loading and persistence |
| `src/domain/` | Schemas, cart rules and integer-pence calculations |
| `src/services/store-api.ts` | Demo/API switch, network validation, CSRF and mutation handling |
| `src/data/` | Sample catalogue, articles and image manifest |
| `src/styles.css` | Brand tokens and responsive styles |
| `public/images/` | All runtime photos, original 4K files and exact Figma icon assets |
| `public/fonts/` | Locally served Poppins and Instrument Serif fonts |
| `scripts/serve.mjs` | Local production preview with security headers |
| `tests/` | Domain and real-browser regression checks |

## Checks

```sh
npm run check
npm test
npm run build
npm run test:e2e
npm audit
```

Browser tests use Playwright Chromium. If it is not already installed, run `npx playwright install chromium`. An existing compatible Chrome executable can be selected with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

`npm run format` formats the source. Commit `package-lock.json`; use `npm ci` for repeatable installs.

## Images and design

All 36 photographs are the original approved Sunday Nest AI-generated assets. The 4K JPEGs have a 3840px long edge and were locally upscaled with the user's approval; they do not contain native 4K detail. The storefront loads 640/1280/1920px WebP variants and fetches a 4K original only when the visitor opens product zoom. No source-website photography is used.

Figma icons and the logo mask are stored locally, not loaded from expiring Figma URLs. `scripts/figma-assets.json` records checked-in asset filenames. Transient Figma download URLs are not stored in this repository. Fonts are Poppins and Instrument Serif, distributed under the SIL Open Font License; see `public/fonts/` for notices.

The implementation adapts fixed Figma geometry to flowing responsive layouts. It does not claim an individual pixel comparison of every previously captured Figma state; working routes and interaction states replace static captures.

## Deployment

Use HTTPS in production. Apply the headers in `public/_headers` using your hosting platform's equivalent. Static hosts need SPA rewrites for valid client routes; route `/api/*` to your backend before applying the SPA fallback. Do not expose this development server to the public Internet.

The current CSP intentionally allows only same-origin scripts, styles, fonts, images and API traffic. If your backend adds a media CDN, analytics, embedded payment widgets or any external service, explicitly review and update the policy and URL validation. The hosted Stripe redirect supported by the adapter does not embed a payment frame.

Dependency scans and tests reduce risk; they are not a guarantee of zero bugs or a substitute for reviewing the backend, deployment configuration and business rules.
