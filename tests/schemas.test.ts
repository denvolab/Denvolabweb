import { expect, it } from "vitest";
import {
  addressSchema,
  contactSchema,
  emailSchema,
  productSchema,
} from "../src/domain/types";
import { catalog } from "../src/data/catalog";
it("validates all catalogue records", () => {
  for (const p of catalog)
    expect(productSchema.safeParse(p).success).toBe(true);
});
it("rejects external image URLs in catalogue responses", () =>
  expect(
    productSchema.safeParse({
      ...catalog[0],
      image: "https://untrusted.test/image.jpg",
    }).success,
  ).toBe(false));
it("rejects checkout without consent and an email", () =>
  expect(
    addressSchema.safeParse({
      firstName: "A",
      lastName: "B",
      email: "invalid",
      address: "123 test street",
      city: "London",
      postcode: "E1 1AA",
      country: "GB",
      consent: false,
    }).success,
  ).toBe(false));
it("rejects excessive form input", () => {
  expect(emailSchema.safeParse("a".repeat(255) + "@example.com").success).toBe(
    false,
  );
  expect(
    contactSchema.safeParse({
      name: "Test",
      email: "test@example.com",
      subject: "Hello",
      message: "x".repeat(3001),
    }).success,
  ).toBe(false);
});
