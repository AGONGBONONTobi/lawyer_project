/** Protocoles autorisés pour les liens saisis dans le back office. */
export function safeHref(value) {
  if (typeof value !== "string") return null;
  const href = value.trim();
  if (!href || href.includes("\\") || [...href].some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)) return null;
  if (href.startsWith("#")) return href;
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  if (/^(mailto:|tel:)/i.test(href)) return href;
  try {
    const url = new URL(href);
    return ["https:", "http:"].includes(url.protocol) ? href : null;
  } catch {
    return null;
  }
}
