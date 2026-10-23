import { allowedCheckoutUrl } from "../domain/checkout";
import { z } from "zod";
import { catalog } from "../data/catalog";
import {
  addressSchema,
  cartSchema,
  contactSchema,
  emailSchema,
  productSchema,
} from "../domain/types";
import type { Address, CartLine } from "../domain/types";
export const isDemo = import.meta.env.VITE_DATA_SOURCE !== "api";
const configuredPath = import.meta.env.VITE_API_BASE_PATH ?? "/api";
const base = /^\/(?!\/)[a-zA-Z0-9/_-]*$/.test(configuredPath)
  ? configuredPath.replace(/\/$/, "")
  : "/api";
export class StoreError extends Error {
  constructor(
    message: string,
    public readonly code = "REQUEST_FAILED",
  ) {
    super(message);
    this.name = "StoreError";
  }
}
async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  options: RequestInit = {},
) {
  const response = await fetch(base + path, {
    ...options,
    credentials: "same-origin",
    redirect: "error",
    signal: AbortSignal.timeout(12000),
    headers: { Accept: "application/json", ...options.headers },
  }).catch(() => {
    throw new StoreError("We could not reach the store. Please try again.");
  });
  if (!response.ok)
    throw new StoreError(
      response.status === 401
        ? "Please sign in to continue."
        : response.status === 429
          ? "Too many requests. Please wait a moment."
          : response.status === 409
            ? "Availability has changed. Please review your bag."
            : "We could not complete that request. Please try again.",
      "HTTP_" + response.status,
    );
  if (!response.headers.get("content-type")?.includes("application/json"))
    throw new StoreError("The store returned an unexpected response.");
  const reader = response.body?.getReader();
  if (!reader) throw new StoreError("The store returned an empty response.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.length;
      if (size > 2_000_000) {
        await reader.cancel();
        throw new StoreError("The store response was too large.");
      }
      chunks.push(chunk.value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  let data: unknown;
  try {
    data = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new StoreError("The store returned an unexpected response.");
  }
  const parsed = schema.safeParse(data);
  if (!parsed.success)
    throw new StoreError(
      "The store returned incomplete information. Please try again.",
    );
  return parsed.data;
}
async function mutate<T>(
  path: string,
  payload: unknown,
  schema: z.ZodType<T>,
  idempotent = false,
) {
  if (isDemo)
    throw new StoreError(
      "This is a local preview. Your details have not been sent. Connect the backend to enable this service.",
      "BACKEND_REQUIRED",
    );
  const session = await request(
    "/session",
    z.object({ csrfToken: z.string().min(16).max(256) }),
  );
  return request(path, schema, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": session.csrfToken,
      ...(idempotent ? { "Idempotency-Key": crypto.randomUUID() } : {}),
    },
    body: JSON.stringify(payload),
  });
}
export const storeApi = {
  async products() {
    return isDemo
      ? catalog
      : request(
          "/products",
          z.object({ products: z.array(productSchema).max(1000) }),
        ).then((r) => r.products);
  },
  async checkout(lines: CartLine[], address: Address, promo: string) {
    const payload = {
      lines: cartSchema.min(1).parse(lines),
      address: addressSchema.parse(address),
      promo: promo === "WELCOME10" ? promo : "",
    };
    const result = await mutate(
      "/checkout/sessions",
      payload,
      z.object({ checkoutUrl: z.string().url() }),
      true,
    );
    const url = allowedCheckoutUrl(result.checkoutUrl, location.origin);
    if (!url) throw new StoreError("The checkout address is not allowed.");
    return url;
  },
  newsletter(email: string) {
    return mutate(
      "/newsletter",
      { email: emailSchema.parse(email), consent: true },
      z.object({ message: z.string().max(200) }),
    );
  },
  contact(data: unknown) {
    return mutate(
      "/contact",
      contactSchema.parse(data),
      z.object({ message: z.string().max(200) }),
    );
  },
  login(email: string) {
    return mutate(
      "/auth/magic-link",
      { email: emailSchema.parse(email) },
      z.object({ message: z.string().max(200) }),
    );
  },
};
export function message(error: unknown) {
  return error instanceof StoreError
    ? error.message
    : "Something went wrong. Please try again.";
}
