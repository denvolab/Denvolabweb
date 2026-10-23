import { test, expect } from "@playwright/test";

test("announcement and hero advance, wrap, and pause on interaction", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.clock.install();
  await page.goto("/");
  await expect(page.locator(".announcement-copy")).toBeVisible();
  await page.mouse.move(1400, 70);
  const original = await page.locator(".announcement-copy").textContent();
  await page.clock.runFor(5000);
  await expect(page.locator(".announcement-copy")).not.toHaveText(original!);
  await page.clock.runFor(5000);
  await expect(page.locator(".announcement-copy")).toContainText(
    "Slow mornings.",
  );
  await page.clock.runFor(5000);
  await expect(page.locator(".announcement-copy")).toHaveText(original!);
  await page.locator(".announcement").hover();
  await page.clock.runFor(15000);
  await expect(page.locator(".announcement-copy")).toHaveText(original!);
  await page
    .getByRole("button", { name: "Next announcement", exact: true })
    .focus();
  await page.mouse.move(1400, 70);
  await page.clock.runFor(15000);
  await expect(page.locator(".announcement-copy")).toHaveText(original!);
  await page
    .getByRole("button", { name: "Next announcement", exact: true })
    .click();
  await expect(page.locator(".announcement-copy")).not.toHaveText(original!);
  await page.goto("/");
  await expect(page.locator(".hero h1")).toHaveText("Women’s Pyjama Sets");
  await page.mouse.move(1400, 70);
  await page.clock.runFor(7000);
  await expect(page.locator(".hero h1")).toHaveText("Little everyday joys");
  await page.clock.runFor(7000);
  await expect(page.locator(".hero h1")).toHaveText("A morning to remember");
  await page.clock.runFor(7000);
  await expect(page.locator(".hero h1")).toHaveText("Women’s Pyjama Sets");
});

test("reduced motion disables autoplay while manual arrows still work", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install();
  await page.goto("/");
  await expect(page.locator(".announcement-copy")).toBeVisible();
  const original = await page.locator(".announcement-copy").textContent();
  await page.clock.runFor(21000);
  await expect(page.locator(".announcement-copy")).toHaveText(original!);
  await expect(page.locator(".hero h1")).toHaveText("Women’s Pyjama Sets");
  await page
    .getByRole("button", { name: "Next announcement", exact: true })
    .click();
  await expect(page.locator(".announcement-copy")).not.toHaveText(original!);
});

test("sections fill wide screens and product rows scroll without a scrollbar", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [390, 768, 1440, 1920, 2560]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    await expect(page.locator(".feature-products")).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width);
    const sections = await page
      .locator(".home > section")
      .evaluateAll((nodes) =>
        nodes.map((e) => ({
          width: e.getBoundingClientRect().width,
          maxWidth: getComputedStyle(e).maxWidth,
        })),
      );
    for (const section of sections) {
      expect(section.width).toBeCloseTo(width, 0);
      expect(section.maxWidth).toBe("none");
    }
    expect(
      await page
        .locator(".product-track")
        .evaluate((e) => getComputedStyle(e).scrollbarWidth),
    ).toBe("none");
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.locator(".feature-products").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Next products" }).click();
  await expect
    .poll(() => page.locator(".product-track").evaluate((e) => e.scrollLeft))
    .toBeGreaterThan(100);
});

test("Figma icon geometry stays correct and wishlist works on each viewport", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    const heart = page.locator(".product-heart").first();
    await expect(heart).toHaveAttribute(
      "src",
      "/images/figma-product-heart.svg",
    );
    await expect
      .poll(() =>
        heart.evaluate((e) => ({
          w: e.getBoundingClientRect().width,
          h: e.getBoundingClientRect().height,
        })),
      )
      .toEqual({ w: 25, h: 25 });
    const save = page.locator(".save-button").first();
    await save.click();
    await expect(save).toHaveAttribute("aria-pressed", "true");
    await save.click();
    await expect(save).toHaveAttribute("aria-pressed", "false");
    expect(await page.locator("main").innerText()).not.toMatch(/[←→↑↓↗‹›⌄]/);
  }
  const nav = page.locator(".nav-expand .figma-arrow").first();
  expect(await nav.evaluate((e) => getComputedStyle(e).maskImage)).toContain(
    "figma-nav-chevron.svg",
  );
  expect((await nav.boundingBox())?.width).toBe(10);
});
