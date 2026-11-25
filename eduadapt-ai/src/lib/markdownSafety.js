// Markdown links are limited to web URLs; javascript:, data: and other schemes are rendered as text.
export function isSafeMarkdownUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}
