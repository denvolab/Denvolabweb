# Backend integration contract

The backend is intentionally not implemented. The frontend is ready to switch from a local catalogue to same-origin JSON endpoints. See `src/services/store-api.ts` and `src/domain/types.ts` for executable request/response validation.

## Configuration

```dotenv
VITE_DATA_SOURCE=api
VITE_API_BASE_PATH=/api
```

Only same-origin API paths are supported. Configure a reverse proxy or serve the frontend and backend together. Never put database credentials, payment secrets, admin tokens or email-provider keys in `VITE_` variables. The included static preview server returns 503 for unconfigured API requests; replace/proxy those routes in the real deployment.

## Endpoints

All responses must be `application/json`. The client times out requests after 12 seconds, rejects unexpected schema shapes and caps JSON responses at 2 MB.

| Method | Path | Request | Validated response |
|---|---|---|---|
| GET | `/api/products` | None | `{ "products": Product[] }`, max 1000 items |
| GET | `/api/session` | Same-origin session cookie | `{ "csrfToken": "unpredictable-token-at-least-16-characters" }` |
| POST | `/api/checkout/sessions` | `{ lines, address, promo }` | `{ "checkoutUrl": "https://checkout.stripe.com/..." }` or a same-origin URL |
| POST | `/api/newsletter` | `{ email, consent: true }` | `{ "message": "Short confirmation" }` |
| POST | `/api/contact` | `{ name, email, subject, message }` | `{ "message": "Short confirmation" }` |
| POST | `/api/auth/magic-link` | `{ email }` | `{ "message": "If this address is eligible, a sign-in link will arrive shortly." }` |

Use suitable HTTP status codes. The client handles 401, 409, 429 and network failures with safe messages. Do not return stack traces, raw database errors, credentials or full customer details in errors. Personalized responses must use `Cache-Control: no-store`.

## Product

```json
{
  "id": "women-wildflower-front",
  "name": "Ivory Wildflower Cotton Pyjama Set",
  "price": 4600,
  "category": "womens",
  "material": "Cotton",
  "colour": "Ivory",
  "image": "women-wildflower-front",
  "gallery": ["women-wildflower-front", "women-wildflower-side"],
  "sizes": ["XS", "S", "M", "L", "XL", "XXL"],
  "stock": 8,
  "isNew": true,
  "description": "Your verified product description."
}
```

`price` is integer GBP pence. Category is one of `womens`, `mens`, `kids`, `accessories`, `gifting`; material is `Cotton`, `Satin`, `Jersey`, `Linen blend`. The current stock field is a maximum purchasable quantity per size for a product. If your inventory varies by variant, extend the schema to return variant IDs and per-variant inventory, and update the size picker/cart validation together. Do not rely on the browser's stock checks.

Image fields are validated local asset keys, not arbitrary remote URLs. Every image key must have corresponding `public/images/<key>-640.webp`, `-1280.webp`, `-1920.webp` and `-4k.jpeg` files. The supplied manifest lists available keys. For an image CDN, extend the product schema and allowlist trusted HTTPS media origins in both the image renderer and CSP; do not accept arbitrary user-controlled image URLs.

The current client filters and sorts the complete catalogue locally. Introduce server-side pagination/search before using a catalogue larger than the response limits; change the adapter and list screens together.

## Checkout request

```json
{
  "lines": [{ "productId": "women-wildflower-front", "size": "M", "quantity": 2 }],
  "address": {
    "email": "customer@example.com",
    "firstName": "Example",
    "lastName": "Customer",
    "address": "10 Example Road",
    "city": "London",
    "postcode": "SW1A 1AA",
    "country": "GB",
    "consent": true
  },
  "promo": ""
}
```

The frontend does not send a trusted total or payment success flag. Recalculate prices, tax, discounts, shipping and stock on the server. Validate every line, size and quantity again. Use integer currency values. The preview uses UK delivery at 395p, free at a discounted subtotal of 6000p, but the server owns the final policy.

The client sends an `Idempotency-Key` UUID for checkout creation. Scope it to the session/user and payload; reserve/check inventory atomically and prevent duplicate orders/payment sessions. Disable expired/out-of-stock variants server-side. A payment redirect is not proof of payment. Verify signed payment-provider webhooks server-side and make processing idempotent before confirming or fulfilling an order. The current frontend has no paid-order success screen or order-history implementation.

## Session and mutation security

Every POST first obtains `/api/session` and sends the returned token in `X-CSRF-Token`. The backend must bind the token to the session, verify it, verify the request Origin, require JSON and enforce authorization separately. Configure session cookies as `HttpOnly`, `Secure` and appropriate `SameSite` values; never store authentication tokens in localStorage. Regenerate sessions as needed after authentication.

Authentication links must be short-lived, single-use and checked on the server, with safe same-origin redirects. Rate-limit sign-in, contact, newsletter and checkout endpoints; use generic responses to prevent account enumeration. Protect authenticated order/account APIs with ownership checks. Validate input, use parameterized database queries, encode rendered content, keep provider secrets on the server and avoid logging customer input/payment details.

## Return URL policy

Checkout currently accepts only the current origin or HTTPS `checkout.stripe.com`. Extend the explicit allowlist for your payment provider if necessary. Never let a query parameter or customer input decide an unrestricted redirect URL.

## Before accepting real customers

Replace sample product/pricing/stock data and verify sizing. Supply your trading identity, final delivery and return terms, privacy notice and support details. Configure HTTPS, security headers, server-side validation, CSRF/session security, payment webhooks and email consent/unsubscribe handling. Test failed/retried payments, concurrent stock updates, authorization, network errors and data retention in your deployed environment.
