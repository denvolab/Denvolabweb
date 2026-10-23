import { afterEach, expect, it, vi } from "vitest";
import { catalog } from "../src/data/catalog";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetModules();
});
async function api() {
  vi.stubEnv("VITE_DATA_SOURCE", "api");
  vi.resetModules();
  return (await import("../src/services/store-api")).storeApi;
}
it("validates the live catalogue response instead of trusting JSON", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          products: [{ ...catalog[0], price: "not-a-price" }],
        }),
        { headers: { "content-type": "application/json" } },
      ),
    ),
  );
  await expect((await api()).products()).rejects.toThrow(
    "incomplete information",
  );
});
it("uses safe network error messages", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockRejectedValue(new Error("private server details")),
  );
  await expect((await api()).products()).rejects.toThrow(
    "could not reach the store",
  );
});
it("rejects oversized JSON bodies", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response("x".repeat(2_000_001), {
        headers: { "content-type": "application/json" },
      }),
    ),
  );
  await expect((await api()).products()).rejects.toThrow("too large");
});
it("requires a session-bound CSRF token for a mutation", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ csrfToken: "test-csrf-token-123456789" }), {
        headers: { "content-type": "application/json" },
      }),
    )
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Subscribed" }), {
        headers: { "content-type": "application/json" },
      }),
    );
  vi.stubGlobal("fetch", fetcher);
  expect((await (await api()).newsletter("person@example.com")).message).toBe(
    "Subscribed",
  );
  const init = fetcher.mock.calls[1]?.[1] as RequestInit;
  expect(init.credentials).toBe("same-origin");
  expect(init.headers).toMatchObject({
    "X-CSRF-Token": "test-csrf-token-123456789",
  });
});
