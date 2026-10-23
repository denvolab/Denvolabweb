import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { z } from "zod";
import { persist, readStored, sanitizeCart, totals } from "../domain/cart";
import type { CartLine, Product } from "../domain/types";
import { message, storeApi } from "../services/store-api";
function useStoreState() {
  const [products, setProducts] = useState<Product[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0);
  const [cart, setCart] = useState<CartLine[]>([]),
    [wishlist, setWishlist] = useState<string[]>([]),
    [ready, setReady] = useState(false),
    [notice, setNotice] = useState(""),
    [promo, setPromo] = useState("");
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    storeApi
      .products()
      .then((data) => {
        if (!active) return;
        setProducts(data);
        setCart(sanitizeCart(readStored("sn:cart:v1", []), data));
        const saved = z
          .array(z.string())
          .max(100)
          .safeParse(readStored("sn:wishlist:v1", []));
        setWishlist(
          saved.success
            ? [...new Set(saved.data)].filter((id) =>
                data.some((p) => p.id === id),
              )
            : [],
        );
        setReady(true);
      })
      .catch((e) => {
        if (active) setError(message(e));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [retry]);
  useEffect(() => {
    if (ready) persist("sn:cart:v1", cart);
  }, [cart, ready]);
  useEffect(() => {
    if (ready) persist("sn:wishlist:v1", wishlist);
  }, [wishlist, ready]);
  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(timeout);
  }, [notice]);
  const pricing = useMemo(
    () => totals(cart, products, promo),
    [cart, products, promo],
  );
  function add(product: Product, size: string, quantity = 1) {
    if (
      !product.sizes.includes(size) ||
      !product.stock ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 8
    )
      return false;
    const existing = cart.find(
      (line) => line.productId === product.id && line.size === size,
    );
    if (!existing && cart.length >= 50) {
      setNotice(
        "Your bag is full. Please remove a piece before adding another.",
      );
      return false;
    }
    const remaining = Math.min(8, product.stock) - (existing?.quantity ?? 0);
    if (quantity > remaining) {
      setNotice(
        remaining > 0
          ? `You can add up to ${remaining} more of this size.`
          : "You have reached the available quantity for this size.",
      );
      return false;
    }
    setCart((previous) =>
      sanitizeCart(
        existing
          ? previous.map((line) =>
              line.productId === product.id && line.size === size
                ? { ...line, quantity: line.quantity + quantity }
                : line,
            )
          : [...previous, { productId: product.id, size, quantity }],
        products,
      ),
    );
    setNotice(`${product.name} added to your bag`);
    return true;
  }
  function quantity(productId: string, size: string, value: number) {
    setCart((previous) =>
      sanitizeCart(
        previous
          .map((l) =>
            l.productId === productId && l.size === size
              ? { ...l, quantity: value }
              : l,
          )
          .filter((l) => l.quantity > 0),
        products,
      ),
    );
  }
  function toggleWishlist(id: string) {
    if (!products.some((p) => p.id === id)) return;
    setWishlist((old) =>
      old.includes(id)
        ? old.filter((x) => x !== id)
        : [...old, id].slice(0, 100),
    );
  }
  return {
    products,
    loading,
    error,
    retry: () => setRetry((x) => x + 1),
    cart,
    wishlist,
    add,
    quantity,
    toggleWishlist,
    notice,
    setNotice,
    pricing,
    promo,
    setPromo,
    cartCount: cart.reduce((n, l) => n + l.quantity, 0),
  };
}
type Store = ReturnType<typeof useStoreState>;
const StoreContext = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  return (
    <StoreContext.Provider value={useStoreState()}>
      {children}
    </StoreContext.Provider>
  );
}
export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("StoreProvider is required");
  return store;
}
