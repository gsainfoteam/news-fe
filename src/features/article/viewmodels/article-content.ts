// Regex, not a DOM parser: these run in the build (no DOM) and in Storybook,
// and the result is rendered as React text, so it never needs to be safe HTML.

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  middot: "·",
  hellip: "…",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
};

export function decodeEntities(text: string) {
  return text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === "#") {
      const point =
        code[1] === "x" || code[1] === "X"
          ? Number.parseInt(code.slice(2), 16)
          : Number.parseInt(code.slice(1), 10);
      return Number.isFinite(point) && point <= 0x10ffff
        ? String.fromCodePoint(point)
        : match;
    }
    return ENTITIES[code.toLowerCase()] ?? match;
  });
}

const IMG_TAG = /<img\b[^>]*>/gi;
const SRC_ATTR = /\ssrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i;

// First <img> that points at a real file. The editor never writes data: URIs,
// but a pasted one would be a whole image inlined into every listing page.
export function extractThumbnail(html: string): string | undefined {
  for (const [tag] of html.matchAll(IMG_TAG)) {
    const match = SRC_ATTR.exec(tag);
    const src = decodeEntities(match?.[1] ?? match?.[2] ?? match?.[3] ?? "");
    if (/^https?:\/\//i.test(src.trim())) return src.trim();
  }
  return undefined;
}

// Block-level tags end a sentence visually; without a space their texts
// would run together ("제목본문").
const BLOCK_TAG =
  /<\/?(?:p|div|br|h[1-6]|li|ul|ol|blockquote|figure|figcaption|table|tr|td|th|pre|hr|section|article)\b[^>]*>/gi;

export function toPlainText(html: string) {
  const text = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|template)\b[\s\S]*?<\/\1\s*>/gi, "")
    .replace(BLOCK_TAG, " ")
    .replace(/<[^>]+>/g, "");
  return decodeEntities(text).replace(/\s+/g, " ").trim();
}

export const SUMMARY_LENGTH = 160;

export function extractSummary(html: string, maxLength = SUMMARY_LENGTH) {
  const text = toPlainText(html);
  // Count code points so a cut never splits a surrogate pair (emoji).
  const chars = Array.from(text);
  if (chars.length <= maxLength) return text;
  const cut = chars.slice(0, maxLength).join("");
  // Korean wraps by eojeol, so end on a space when one is near the end.
  const space = cut.lastIndexOf(" ");
  const head = space > cut.length * 0.6 ? cut.slice(0, space) : cut;
  return `${head.replace(/[\s.,·…]+$/, "")}…`;
}
