import { describe, expect, it } from "vitest";
import { sanitizeCart, totals } from "../src/domain/cart";
import { catalog } from "../src/data/catalog";
const p = catalog[0]!;
describe("untrusted stored cart", () => {
  it("rejects malformed and excessive quantities", () => {
    expect(
      sanitizeCart([{ productId: p.id, size: "S", quantity: -1 }], catalog),
    ).toEqual([]);
    expect(sanitizeCart("injected", catalog)).toEqual([]);
    expect(
      sanitizeCart([{ productId: p.id, size: "S", quantity: 10000 }], catalog),
    ).toEqual([]);
  });
  it("drops unknown products and unsupported sizes", () =>
    expect(
      sanitizeCart(
        [
          { productId: "missing", size: "S", quantity: 1 },
          { productId: p.id, size: "invalid", quantity: 1 },
        ],
        catalog,
      ),
    ).toEqual([]));
  it("combines duplicate lines and caps quantity against stock", () =>
    expect(
      sanitizeCart(
        [
          { productId: p.id, size: "S", quantity: 6 },
          { productId: p.id, size: "S", quantity: 6 },
        ],
        catalog,
      ),
    ).toEqual([{ productId: p.id, size: "S", quantity: 8 }]));
  it("drops sold-out products", () => {
    const sold = catalog.find((p) => !p.stock)!;
    expect(
      sanitizeCart(
        [{ productId: sold.id, size: sold.sizes[0], quantity: 1 }],
        catalog,
      ),
    ).toEqual([]);
  });
});
describe("preview estimates in integer pence", () => {
  it("does not charge shipping for an empty cart", () =>
    expect(totals([], catalog)).toEqual({
      subtotal: 0,
      discount: 0,
      shipping: 0,
      total: 0,
    }));
  it("calculates quantity totals and free delivery", () =>
    expect(
      totals([{ productId: p.id, size: "M", quantity: 2 }], catalog),
    ).toEqual({ subtotal: 8400, discount: 0, shipping: 0, total: 8400 }));
  it("uses the discounted subtotal for the shipping threshold", () => {
    const product = { ...p, price: 6000 };
    expect(
      totals(
        [{ productId: p.id, size: "S", quantity: 1 }],
        [product],
        "WELCOME10",
      ),
    ).toEqual({ subtotal: 6000, discount: 600, shipping: 395, total: 5795 });
  });
  it("does not apply unrecognised codes", () =>
    expect(
      totals(
        [{ productId: p.id, size: "S", quantity: 1 }],
        catalog,
        "<script>",
      ),
    ).toEqual({ subtotal: 4200, discount: 0, shipping: 395, total: 4595 }));
});
