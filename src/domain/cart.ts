import { cartSchema } from "./types";
import type { CartLine, Product } from "./types";
export const MAX_QUANTITY = 8;
export function sanitizeCart(value: unknown, products: Product[]): CartLine[] {
  const parsed = cartSchema.safeParse(value);
  if (!parsed.success) return [];
  const merged = new Map<string, CartLine>();
  for (const line of parsed.data) {
    const p = products.find((p) => p.id === line.productId);
    if (!p || !p.sizes.includes(line.size) || !p.stock) continue;
    const key = `${p.id}:${line.size}`;
    const existing = merged.get(key);
    merged.set(key, {
      ...line,
      quantity: Math.min(
        (existing?.quantity ?? 0) + line.quantity,
        p.stock,
        MAX_QUANTITY,
      ),
    });
  }
  return [...merged.values()];
}
export function totals(
  lines: CartLine[],
  products: Product[],
  promo: string = "",
) {
  const subtotal = lines.reduce(
    (sum, l) =>
      sum +
      (products.find((p) => p.id === l.productId)?.price ?? 0) * l.quantity,
    0,
  );
  const discount = promo === "WELCOME10" ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal === 0 || subtotal - discount >= 6000 ? 0 : 395;
  return {
    subtotal,
    discount,
    shipping,
    total: subtotal - discount + shipping,
  };
}
export const money = (pence: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
    pence / 100,
  );
export function readStored<T>(key: string, fallback: T): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw && raw.length < 50000 ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
export function persist(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Storage can be denied or full; browsing must still work. */
  }
}
