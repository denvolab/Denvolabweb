import { test, expect } from "@playwright/test";
test("responsive route geometry and visual review captures", async ({
  page,
}) => {
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    for (const route of [
      "/",
      "/collections/new-in",
      "/products/women-wildflower-front",
      "/pages/about-us",
      "/pages/contact-us",
    ]) {
      await page.goto(route);
      await expect(page.locator("main")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${width} ${route}`,
      ).toBe(true);
      if (route === "/" || (width === 390 && route.startsWith("/products/"))) {
        await page.evaluate(async () => {
          await Promise.all(
            [...document.images]
              .filter((i) => i.getBoundingClientRect().top < innerHeight)
              .map((i) => i.decode().catch(() => {})),
          );
        });
        await page.screenshot({
          path: `output/qa-${width}-${route === "/" ? "home" : "product"}.png`,
        });
      }
    }
  }
});
