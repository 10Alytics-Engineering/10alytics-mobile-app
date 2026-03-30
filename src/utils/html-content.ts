function decodeEntity(entity: string): string {
  switch (entity) {
    case "&nbsp;":
      return " ";
    case "&amp;":
      return "&";
    case "&quot;":
      return '"';
    case "&#39;":
    case "&apos;":
      return "'";
    case "&lt;":
      return "<";
    case "&gt;":
      return ">";
    default:
      break;
  }

  const decimal = entity.match(/^&#(\d+);$/);
  if (decimal) {
    const codePoint = Number.parseInt(decimal[1], 10);
    return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : entity;
  }

  const hexadecimal = entity.match(/^&#x([0-9a-f]+);$/i);
  if (hexadecimal) {
    const codePoint = Number.parseInt(hexadecimal[1], 16);
    return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : entity;
  }

  return entity;
}

export function decodeHtmlEntities(value: string): string {
  return value.replace(/&(?:nbsp|amp|quot|apos|lt|gt);|&#\d+;|&#x[0-9a-f]+;/gi, (match) =>
    decodeEntity(match),
  );
}

export function normalizeHtmlToPlainText(value: string | null | undefined): string {
  if (!value?.trim()) return "";

  const withBreaks = value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|section|article|h1|h2|h3|h4|h5|h6)>/gi, "\n\n")
    .replace(/<\/(ul|ol)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/li>/gi, "\n");

  const withoutTags = withBreaks.replace(/<[^>]+>/g, " ");
  const decoded = decodeHtmlEntities(withoutTags);

  return decoded
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function extractHtmlParagraphs(value: string | null | undefined): string[] {
  const normalized = normalizeHtmlToPlainText(value);
  if (!normalized) return [];

  return normalized
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function extractHtmlListItems(value: string | null | undefined): string[] {
  if (!value?.trim()) return [];

  const matches = [...value.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)];
  if (!matches.length) return [];

  return matches
    .map((match) => normalizeHtmlToPlainText(match[1]))
    .map((item) => item.replace(/^•\s*/, "").trim())
    .filter(Boolean);
}
