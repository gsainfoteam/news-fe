import { type TFunction } from "i18next";
import { z } from "zod";

import { getFileExtension, toSafeFileName } from "@/common/lib/file-name";
import {
  CATEGORIES,
  CATEGORY_GROUPS,
  type Category,
} from "@/features/category";
import { type Member } from "@/features/member";

import {
  type Article,
  type ArticleAuthor,
  type ArticleInput,
  type ArticleUpdate,
  zArticleImageRequest,
  zArticleInput,
} from "../models";

const PARENTS = new Map<Category, Category>(
  CATEGORY_GROUPS.flatMap((g) =>
    g.children.map((child) => [child, g.category] as const),
  ),
);

// `GET /article?category=` matches one value, so a section page lists a
// sub-category article only when the article carries the section too.
export function normalizeCategories(selected: readonly Category[]) {
  const set = new Set(selected);
  for (const category of selected) {
    const parent = PARENTS.get(category);
    if (parent) set.add(parent);
  }
  return CATEGORIES.filter((c) => set.has(c));
}

/** A section stays selected while any of its sub-categories is. */
export function isCategoryLocked(
  selected: readonly Category[],
  category: Category,
) {
  return selected.some((c) => PARENTS.get(c) === category);
}

export function toggleCategory(
  selected: readonly Category[],
  category: Category,
): Category[] {
  if (!selected.includes(category)) {
    return normalizeCategories([...selected, category]);
  }
  if (isCategoryLocked(selected, category)) return [...selected];
  return selected.filter((c) => c !== category);
}

// news-be picks the S3 Content-Type from these extensions and refuses the
// rest (heic included, which browsers can't show anyway).
export const ARTICLE_IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
] as const;

export const ARTICLE_IMAGE_ACCEPT = ARTICLE_IMAGE_EXTENSIONS.map(
  (ext) => `.${ext}`,
).join(",");

export type ArticleImageIssue = "type" | "empty";

export function checkArticleImage(file: {
  name: string;
  size: number;
}): ArticleImageIssue | undefined {
  const ext = getFileExtension(file.name);
  if (!(ARTICLE_IMAGE_EXTENSIONS as readonly string[]).includes(ext)) {
    return "type";
  }
  // news-be requires contentLength >= 1.
  if (file.size === 0) return "empty";
  return undefined;
}

export function toArticleImageRequest(file: { name: string; size: number }) {
  return zArticleImageRequest.parse({
    fileName: toSafeFileName(file.name),
    contentLength: file.size,
  });
}

export function getImageSources(html: string) {
  return [...html.matchAll(/<img\b[^>]*?\bsrc="([^"]*)"/g)].map((m) =>
    m[1].replaceAll("&amp;", "&"),
  );
}

// news-be serves an article image at `<S3 bucket URL>/<key>` and every key
// starts with `articles/`. The article carries only the URLs, so an edit
// recovers the keys of images it didn't upload itself from them.
const KEY_PREFIX = "articles/";

export function getImageKey(src: string) {
  let path: string;
  try {
    path = new URL(src).pathname;
  } catch {
    return undefined;
  }
  const start = path.indexOf(`/${KEY_PREFIX}`);
  return start < 0 ? undefined : decodeURIComponent(path.slice(start + 1));
}

/** The body still shows a local preview, so an upload hasn't finished. */
export function hasPendingImages(html: string) {
  return getImageSources(html).some((src) => src.startsWith("blob:"));
}

// Images deleted from the body drop out here, so the saved `imageKeys`
// never lists them.
export function collectImageKeys(
  html: string,
  uploaded: ReadonlyMap<string, string>,
) {
  const keys = getImageSources(html).flatMap((src) => {
    const key = uploaded.get(src) ?? getImageKey(src);
    return key ? [key] : [];
  });
  return [...new Set(keys)];
}

export type AuthorOption = {
  id: string;
  name: string;
  picture?: string | null;
  role?: Member["role"];
};

// Former members sort last but stay pickable for corrections to old
// articles. An author who is no longer a member still shows by name.
export function getAuthorOptions(
  members: readonly Member[],
  authors: readonly ArticleAuthor[] = [],
): AuthorOption[] {
  const ordered = [
    ...members.filter((m) => m.role !== "ALUMNI"),
    ...members.filter((m) => m.role === "ALUMNI"),
  ];
  const options: AuthorOption[] = ordered.map(
    ({ id, name, picture, role }) => ({
      id,
      name,
      picture,
      role,
    }),
  );
  const known = new Set(options.map((o) => o.id));
  return [
    ...options,
    ...authors
      .filter((a) => !known.has(a.id))
      .map(({ id, name }) => ({ id, name })),
  ];
}

export type ArticleDraft = {
  title: string;
  subtitle: string;
  content: string;
  categories: Category[];
  authorIds: string[];
  /** Null falls back to the first body image. */
  thumbnail: string | null;
};

export function toArticleDraft(article?: Article): ArticleDraft {
  return {
    title: article?.title ?? "",
    subtitle: article?.subtitle ?? "",
    content: article?.content ?? "",
    categories: normalizeCategories(article?.categories ?? []),
    authorIds: article?.authors.map((a) => a.id) ?? [],
    thumbnail: article?.thumbnailUrl || null,
  };
}

// WordPress imports keep the featured image only in `imageKeys`; unless the
// editor offers it, the next save drops it.
export function getDetachedThumbnail(
  article?: Pick<Article, "thumbnailUrl" | "content">,
) {
  const src = article?.thumbnailUrl;
  return src && !getImageSources(article.content).includes(src)
    ? src
    : undefined;
}

export type ThumbnailOption = { src: string; inBody: boolean };

// A `blob:` preview is still uploading and has no key to save yet.
export function getThumbnailOptions(
  html: string,
  detached?: string,
): ThumbnailOption[] {
  const body = [
    ...new Set(
      getImageSources(html).filter((src) => /^https?:\/\//i.test(src)),
    ),
  ];
  return [
    ...(detached && !body.includes(detached)
      ? [{ src: detached, inBody: false }]
      : []),
    ...body.map((src) => ({ src, inBody: true })),
  ];
}

// Keeps a pick whose image left the body, so undoing the delete restores it.
export function getSelectedThumbnail(
  draft: Pick<ArticleDraft, "content" | "thumbnail">,
  detached?: string,
) {
  const { thumbnail } = draft;
  return thumbnail &&
    getThumbnailOptions(draft.content, detached).some(
      (o) => o.src === thumbnail,
    )
    ? thumbnail
    : null;
}

// Unpicked, readers get the first body image, so the picker checks that one.
export function getShownThumbnail(
  draft: Pick<ArticleDraft, "content" | "thumbnail">,
  detached?: string,
) {
  return (
    getSelectedThumbnail(draft, detached) ??
    getThumbnailOptions(draft.content, detached).find((o) => o.inBody)?.src ??
    null
  );
}

export function isContentEmpty(html: string) {
  return (
    getImageSources(html).length === 0 &&
    html.replace(/<[^>]*>/g, "").replace(/&nbsp;|\s/g, "") === ""
  );
}

// Built from the generated DTO schema so a field the backend renames breaks
// here. Messages are set per field because the page language decides them.
export function createArticleDraftSchema(t: TFunction) {
  return zArticleInput.pick({ categories: true }).extend({
    title: z
      .string()
      .trim()
      .min(1, t("admin.editor.error.titleRequired", "제목을 입력해 주세요")),
    subtitle: z.string(),
    content: z
      .string()
      .refine(
        (html) => !isContentEmpty(html),
        t("admin.editor.error.contentRequired", "본문을 입력해 주세요"),
      ),
    authorIds: z
      .array(zArticleInput.shape.authorIds.element)
      .min(
        1,
        t("admin.editor.error.authorRequired", "작성자를 1명 이상 골라 주세요"),
      ),
  });
}

export type ArticleDraftErrors = Partial<Record<keyof ArticleDraft, string>>;

export function validateArticleDraft(
  draft: ArticleDraft,
  t: TFunction,
): ArticleDraftErrors {
  const result = createArticleDraftSchema(t).safeParse(draft);
  if (result.success) return {};
  const errors: ArticleDraftErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof ArticleDraft;
    errors[field] ??= issue.message;
  }
  return errors;
}

// Tiptap keeps an empty paragraph after a trailing image so the caret has
// somewhere to go; the published article doesn't need it.
export function trimTrailingEmptyParagraphs(html: string) {
  return html.replace(/(?:<p><\/p>)+$/, "");
}

function toPayload(
  draft: ArticleDraft,
  uploaded: ReadonlyMap<string, string>,
  detached?: string,
) {
  const subtitle = draft.subtitle.trim();
  const thumbnail = getSelectedThumbnail(draft, detached);
  const thumbnailKey = thumbnail
    ? (uploaded.get(thumbnail) ?? getImageKey(thumbnail))
    : undefined;
  const imageKeys = collectImageKeys(draft.content, uploaded);
  // news-be rejects a `thumbnailKey` that isn't one of `imageKeys`.
  if (thumbnailKey && !imageKeys.includes(thumbnailKey)) {
    imageKeys.push(thumbnailKey);
  }
  return {
    subtitle,
    thumbnailKey,
    input: {
      title: draft.title.trim(),
      content: trimTrailingEmptyParagraphs(draft.content),
      imageKeys,
      categories: normalizeCategories(draft.categories),
      authorIds: [...new Set(draft.authorIds)],
    },
  };
}

export function toArticleInput(
  draft: ArticleDraft,
  uploaded: ReadonlyMap<string, string>,
): ArticleInput {
  const { subtitle, thumbnailKey, input } = toPayload(draft, uploaded);
  return {
    ...input,
    ...(subtitle && { subtitle }),
    ...(thumbnailKey && { thumbnailKey }),
  };
}

export function toArticleUpdate(
  draft: ArticleDraft,
  uploaded: ReadonlyMap<string, string>,
  article: Pick<Article, "thumbnailUrl" | "content">,
): ArticleUpdate {
  const { subtitle, thumbnailKey, input } = toPayload(
    draft,
    uploaded,
    getDetachedThumbnail(article),
  );
  // An omitted field keeps its stored value, so a clear has to be sent.
  return { ...input, subtitle, thumbnailKey: thumbnailKey ?? null };
}

export function parseArticleId(search: string) {
  const raw = new URLSearchParams(search).get("id") ?? "";
  const id = Number(raw);
  return /^\d+$/.test(raw) && Number.isSafeInteger(id) && id > 0
    ? id
    : undefined;
}
