import { expect, it } from "vitest";
import { allowedCheckoutUrl } from "../src/domain/checkout";
it("accepts only same-origin or the explicit hosted payment provider", () => {
  expect(
    allowedCheckoutUrl("/checkout/confirmed", "https://shop.example.com"),
  ).toBe("https://shop.example.com/checkout/confirmed");
  expect(
    allowedCheckoutUrl(
      "https://checkout.stripe.com/c/pay/example",
      "https://shop.example.com",
    ),
  ).not.toBeNull();
});
it("blocks script URLs, untrusted redirects and embedded credentials", () => {
  for (const value of [
    "javascript:alert(1)",
    "https://evil.example/pay",
    "https://checkout.stripe.com.evil.example/pay",
    "https://user:secret@checkout.stripe.com/pay",
    "//evil.example/pay",
    "http://checkout.stripe.com/pay",
  ])
    expect(allowedCheckoutUrl(value, "https://shop.example.com")).toBeNull();
});
