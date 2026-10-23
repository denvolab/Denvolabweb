export function allowedCheckoutUrl(
  value: string,
  origin: string,
): string | null {
  try {
    const url = new URL(value, origin);
    if (url.username || url.password) return null;
    if (url.origin === origin && ["http:", "https:"].includes(url.protocol))
      return url.href;
    if (
      url.protocol === "https:" &&
      url.origin === "https://checkout.stripe.com"
    )
      return url.href;
    return null;
  } catch {
    return null;
  }
}
