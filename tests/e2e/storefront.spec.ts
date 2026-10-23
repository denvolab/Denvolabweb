import { test, expect } from "@playwright/test";
test("all page types render with working local images and no console or CSP errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  for (const route of [
    "/",
    "/collections/new-in",
    "/collections/mens",
    "/products/women-wildflower-front",
    "/journal",
    "/journal/behind-the-prints",
    "/pages/about-us",
    "/pages/faq",
    "/pages/privacy",
    "/pages/size-guides",
    "/pages/contact-us",
    "/account",
    "/wishlist",
    "/cart",
  ]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("main")).toBeVisible();
    await page.evaluate(async () => {
      for (const image of document.images) {
        image.loading = "eager";
      }
      await Promise.all(
        [...document.images].map((i) => i.decode().catch(() => {})),
      );
    });
    expect(
      await page
        .locator("img")
        .evaluateAll((images) =>
          images
            .filter(
              (i) =>
                i instanceof HTMLImageElement &&
                (!i.complete || i.naturalWidth === 0),
            )
            .map((i) => i.getAttribute("src")),
        ),
      route,
    ).toEqual([]);
  }
  expect(errors).toEqual([]);
});
test("size validation, quantity, discount, checkout and bag persistence work", async ({
  page,
}) => {
  await page.goto("/products/women-wildflower-front");
  await page.getByRole("button", { name: "Add to bag", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("choose a size");
  await page.getByRole("button", { name: "M", exact: true }).click();
  await page.getByRole("button", { name: "Add to bag", exact: true }).click();
  await page.getByRole("link", { name: "Shopping bag, 1 items" }).click();
  await expect(
    page.getByRole("heading", { name: "Your shopping bag" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Increase quantity/ }).click();
  await page.reload();
  await expect(page.getByLabel("Item quantity")).toHaveText("2");
  await page.getByLabel("Gift or discount code").fill("WELCOME10");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(page.locator(".promo-form [role=status]")).toContainText(
    "10% sample discount applied.",
  );
  await page.getByRole("link", { name: /Continue to checkout/ }).click();
  await page.getByRole("button", { name: "Review checkout details" }).click();
  await expect(page.locator(".checkout-form [role=status]")).toContainText(
    "check the highlighted fields",
  );
  await page
    .getByRole("textbox", { name: "Email address", exact: true })
    .fill("shopper@example.com");
  await page.getByRole("textbox", { name: "First name" }).fill("Test");
  await page.getByRole("textbox", { name: "Last name" }).fill("Guest");
  await page
    .getByRole("textbox", { name: "Street address" })
    .fill("10 Example Road");
  await page.getByRole("textbox", { name: "Town / city" }).fill("London");
  await page.getByRole("textbox", { name: "Postcode" }).fill("SW1A 1AA");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Review checkout details" }).click();
  await expect(page.locator(".checkout-form [role=status]")).toContainText(
    "No order has been placed",
  );
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(
    "shopper@example.com",
  );
});
test("wishlist is reversible and survives refresh", async ({ page }) => {
  await page.goto("/collections/new-in");
  await page.getByRole("button", { name: /^Save Sage Botanical/ }).click();
  await page.goto("/wishlist");
  await expect(
    page.getByRole("link", { name: "Sage Botanical Cotton Robe", exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: /^Remove Sage Botanical/ }).click();
  await expect(
    page.getByRole("heading", { name: "A little space for your favourites" }),
  ).toBeVisible();
});
test("search, filters, sort and empty states work", async ({ page }) => {
  await page.goto("/search?q=cotton");
  await page.getByRole("button", { name: /^Filters/ }).click();
  await page.getByLabel("Size", { exact: true }).selectOption("M");
  await page.getByLabel("In stock only").check();
  await page
    .getByRole("combobox", { name: "Sort by" })
    .selectOption("price-asc");
  const prices = await page.locator(".product-meta>span").allTextContents();
  expect(prices.length).toBeGreaterThan(0);
  const numbers = prices.map((t) => Number(t.replace(/[^\d.]/g, "")));
  expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
  await page.goto("/search?q=no-such-pyjama");
  await expect(
    page.getByRole("heading", { name: "No pieces found" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset search & filters" }).click();
  await expect(page.locator(".product-card").first()).toBeVisible();
});
test("untrusted search text and corrupted storage do not execute or crash", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem("sn:cart:v1", "{broken");
    localStorage.setItem("sn:wishlist:v1", '{"bad":true}');
  });
  await page.goto(
    "/search?q=" + encodeURIComponent("<img src=x onerror=alert(1)>"),
  );
  await expect(
    page.getByRole("heading", { name: "No pieces found" }),
  ).toBeVisible();
  await expect(page.locator('main img[src="x"]')).toHaveCount(0);
  await page.goto("/cart");
  await expect(
    page.getByRole("heading", {
      name: "Your bag is waiting for something lovely",
    }),
  ).toBeVisible();
});
test("mobile menu, keyboard dialog and responsive layout work", async ({
  page,
}) => {
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Women’s Pyjama Sets" }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      String(width),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  await page.getByRole("button", { name: "Search products" }).click();
  await page.getByRole("searchbox").fill("sage");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL(/search\?q=sage/);
});
test("production responses have security headers and reject sensitive paths", async ({
  request,
}) => {
  const response = await request.get("/");
  expect(response.headers()["content-security-policy"]).toContain(
    "script-src 'self'",
  );
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["x-frame-options"]).toBe("DENY");
  expect((await request.get("/.env")).status()).toBe(404);
  expect((await request.get("/src/main.tsx")).status()).toBe(404);
  expect((await request.post("/")).status()).toBe(405);
  expect((await request.get("/missing-image.webp")).status()).toBe(404);
});

test("desktop collection menus open, navigate and close with Escape", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Browse Womens", exact: true })
    .click();
  await expect(page.locator("#menu-womens")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#menu-womens")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Browse Womens", exact: true })
    .click();
  await page
    .locator("#menu-womens")
    .getByRole("link", { name: "Cotton pyjamas", exact: true })
    .click();
  await expect(page).toHaveURL(/collections\/womens\?material=Cotton/);
});
