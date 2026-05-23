/**
 * Minimal markdown renderer for CV content.
 *
 * Supported syntax:
 *   **bold**        → <strong>
 *   *italic*        → <em>
 *   [text](url)     → <a> (only http/https URLs are allowed)
 *
 * All raw text is HTML-escaped FIRST to prevent XSS, then the markdown
 * patterns are applied on the already-safe string.
 */

/** Escapes characters that have special meaning in HTML. */
function escapeHtml(raw) {
  return String(raw)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Returns true when the URL is safe to use inside an href attribute.
 * Only http and https protocols are accepted; everything else (javascript:,
 * data:, etc.) is blocked.
 */
function isSafeUrl(url) {
  try {
    const { protocol } = new URL(url)
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    // Relative URLs (no scheme) are also allowed
    return !url.includes(':')
  }
}

export function renderMarkdown(text) {
  if (!text) return ''

  // Step 1 – escape all HTML so no raw tags can sneak through
  let safe = escapeHtml(text)

  // Step 2 – convert markdown patterns to HTML tags
  // Links: [display text](url)
  safe = safe.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, label, url) => {
      const decodedUrl = url.replace(/&amp;/g, '&').replace(/&quot;/g, '"')
      if (!isSafeUrl(decodedUrl)) return label
      return `<a href="${url}" target="_blank" rel="noreferrer">${label}</a>`
    }
  )

  // Bold: **text**
  safe = safe.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

  // Italic: *text* (not preceded by another * to avoid matching bold)
  safe = safe.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')

  return safe
}
