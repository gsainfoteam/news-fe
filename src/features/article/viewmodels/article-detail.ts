import { type IOptions } from "sanitize-html";

import { getCategoryGroup, type Category } from "@/features/category";

import { extractSummary, extractThumbnail } from "./article-content";
import { filterByCategory } from "./article-list";
import { getArticlePath, getKickerCategory } from "./article-preview";
import { type Article } from "../models";

// Build only: the body reaches the browser as static HTML, so no island ever
// sanitizes.

// What the CMS editor (Tiptap StarterKit + Image) writes, plus tables for
// articles pasted from elsewhere. No `style` or `class`: the page styles the
// body, and inline CSS is where `url(javascript:…)` tricks live.
const SANITIZE_OPTIONS: IOptions = {
  allowedTags: [
    "p",
    "br",
    "h2",
    "h3",
    "h4",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "del",
    "sub",
    "sup",
    "mark",
    "code",
    "pre",
    "blockquote",
    "ul",
    "ol",
    "li",
    "a",
    "img",
    "figure",
    "figcaption",
    "hr",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading", "decoding"],
    ol: ["start"],
    th: ["colspan", "rowspan"],
    td: ["colspan", "rowspan"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  // A data: image would inline the whole file into the page.
  allowedSchemesByTag: { img: ["http", "https"] },
  allowProtocolRelative: false,
  transformTags: {
    // The page title is the only h1.
    h1: "h2",
    h5: "h4",
    h6: "h4",
    a: (tagName, { target, ...attribs }) => {
      delete attribs.rel;
      // A new tab gets no handle on this page (window.opener).
      if (target === "_blank") {
        Object.assign(attribs, { target, rel: "noopener noreferrer nofollow" });
      }
      return { tagName, attribs };
    },
    img: (tagName, attribs) => ({
      tagName,
      attribs: { ...attribs, loading: "lazy", decoding: "async" },
    }),
  },
  // An image whose src was dropped (data:, javascript:) is an empty box.
  exclusiveFilter: (frame) => frame.tag === "img" && !frame.attribs.src,
};

// Loaded lazily, and never in Vite's browser bundle (`SSR` is false there,
// undefined under bun test). A static import ships sanitize-html and postcss
// to every island that imports `@/features/article`, such as /admin.
export async function sanitizeArticleHtml(html: string) {
  if (import.meta.env.SSR === false) {
    throw new Error("sanitizeArticleHtml runs only while building");
  }
  const { default: sanitizeHtml } = await import("sanitize-html");
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}

export type ArticleDetail = {
  id: number;
  /** Unprefixed; views localize it with `localizePath`. */
  path: string;
  title: string;
  subtitle?: string;
  /** Sanitized body, safe to render as HTML. */
  html: string;
  /** Link preview photo: the backend thumbnail, else the first body image. */
  image?: string;
  /** Section, then sub-category: "학술·연구 › 연구". */
  breadcrumb: Category[];
  categories: Category[];
  authors: string[];
  publishedAt: Date;
  /** Only when the article was edited after it was published. */
  updatedAt?: Date;
  /** As of the build. */
  views: number;
};

// A typo fixed right after publishing is not worth a "수정" line.
const EDIT_THRESHOLD_MS = 60_000;

export function getBreadcrumb(categories: readonly Category[]): Category[] {
  const kicker = getKickerCategory(categories);
  if (!kicker) return [];
  const section = getCategoryGroup(kicker)?.category;
  return section && section !== kicker ? [section, kicker] : [kicker];
}

export async function toArticleDetail(
  article: Article,
): Promise<ArticleDetail> {
  const edited =
    article.updatedAt.getTime() - article.createdAt.getTime() >
    EDIT_THRESHOLD_MS;
  // Read the photo from the sanitized body: the raw one may hide an <img>
  // inside markup the page drops (a script string, a data: URL).
  const html = await sanitizeArticleHtml(article.content);
  const image = article.thumbnailUrl ?? extractThumbnail(html);
  return {
    id: article.id,
    path: getArticlePath(article.id),
    title: article.title,
    subtitle: article.subtitle?.trim() || undefined,
    html,
    image: image && /^https?:\/\//i.test(image) ? image : undefined,
    breadcrumb: getBreadcrumb(article.categories),
    categories: [...article.categories],
    authors: article.authors.map((author) => author.name),
    publishedAt: article.createdAt,
    updatedAt: edited ? article.updatedAt : undefined,
    views: article.views,
  };
}

export type ArticleMeta = {
  title: string;
  description: string;
  /** Absolute http(s) URL, or undefined for the site default. */
  image?: string;
  publishedTime: string;
  modifiedTime: string;
  section?: string;
  tags: string[];
};

// Link previews (KakaoTalk, Slack) read these from the static HTML.
export function getArticleMeta(
  detail: ArticleDetail,
  categoryLabels: Record<Category, string>,
): ArticleMeta {
  const kicker = detail.breadcrumb.at(-1);
  return {
    title: detail.title,
    description: detail.subtitle ?? extractSummary(detail.html, 120),
    image: detail.image,
    publishedTime: detail.publishedAt.toISOString(),
    modifiedTime: (detail.updatedAt ?? detail.publishedAt).toISOString(),
    section: kicker && categoryLabels[kicker],
    tags: detail.categories.map((c) => categoryLabels[c]),
  };
}

// Aside and the band below the article. Both skip the article itself, and
// the band skips what the aside already shows; it tops up with the latest
// articles elsewhere so a small section still has a band.
export function getRelatedArticles(
  articles: readonly Article[],
  article: Article,
  { latest = 3, more = 4 } = {},
) {
  const byDate = (a: Article, b: Article) =>
    b.createdAt.getTime() - a.createdAt.getTime();
  const others = articles.filter((a) => a.id !== article.id).toSorted(byDate);
  const section = getBreadcrumb(article.categories)[0];
  const family = section ? filterByCategory(others, section) : [];

  const continueReading = [
    ...family.slice(latest),
    ...others.filter((a) => !family.includes(a)),
  ].slice(0, more);
  return { section, latestInSection: family.slice(0, latest), continueReading };
}
