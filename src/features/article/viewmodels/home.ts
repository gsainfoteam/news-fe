import { dayjs } from "@/common/lib/dayjs";
import { CATEGORY_GROUPS, type Category } from "@/features/category";

import { toArticlePreview, type ArticlePreview } from "./article-preview";
import {
  ARTICLE_FETCH_LIMIT,
  fetchArticles,
  type Article,
  type ArticleSort,
} from "../models";

// The backend has no "headline" flag, so the build picks one. Views are build
// time values: the headline only changes when an article change triggers a
// rebuild.
export const HEADLINE_WINDOW_DAYS = 14;

// Readers are in Korea and the build runs in UTC; "the last 14 days" are
// Korean calendar days.
const TIME_ZONE = "Asia/Seoul";

export const HOME_SECTION_SIZE = {
  featured: 3,
  latest: 4,
  popular: 5,
  category: 3,
  spotlight: 4,
  opinion: 4,
} as const;

type HeadlineCandidate = Pick<
  ArticlePreview,
  "thumbnail" | "publishedAt" | "views"
>;

const byLatest = (a: HeadlineCandidate, b: HeadlineCandidate) =>
  b.publishedAt.getTime() - a.publishedAt.getTime();

export function selectHeadline<T extends HeadlineCandidate>(
  articles: readonly T[],
  now: Date = new Date(),
): T | undefined {
  const since = dayjs(now)
    .tz(TIME_ZONE)
    .startOf("day")
    .subtract(HEADLINE_WINDOW_DAYS - 1, "day");
  const latestFirst = articles.toSorted(byLatest);
  const withPhoto = latestFirst.filter((article) => article.thumbnail);
  // Stable sort: among equal views the newer article stays first.
  const [mostViewed] = withPhoto
    .filter((article) => !dayjs(article.publishedAt).isBefore(since))
    .toSorted((a, b) => b.views - a.views);
  return mostViewed ?? withPhoto[0] ?? latestFirst[0];
}

export type HomeCategorySection = {
  category: Category;
  children: readonly Category[];
  articles: ArticlePreview[];
};

export type HomeSections = {
  headline?: ArticlePreview;
  featured: ArticlePreview[];
  latest: ArticlePreview[];
  popular: ArticlePreview[];
  spotlight?: HomeCategorySection;
  categories: HomeCategorySection[];
  opinion?: HomeCategorySection;
};

export type HomeArticles = {
  latest: Article[];
  popular: Article[];
  categories: Partial<Record<Category, Article[]>>;
};

const SPOTLIGHT: Category = "PLANNING_SPECIAL";
const OPINION: Category = "OPINION";

function sectionSize(category: Category) {
  if (category === SPOTLIGHT) return HOME_SECTION_SIZE.spotlight;
  if (category === OPINION) return HOME_SECTION_SIZE.opinion;
  return HOME_SECTION_SIZE.category;
}

let homeArticles: Promise<HomeArticles> | undefined;

// Build only. Cached so / and /en/ render the same snapshot.
export function fetchHomeArticles(): Promise<HomeArticles> {
  homeArticles ??= loadHomeArticles().catch((error: unknown) => {
    homeArticles = undefined;
    throw error;
  });
  return homeArticles;
}

// The API matches one category value exactly, so a section asks for itself
// and each sub-category, then merges. Every request fails the build on error:
// the previous deployment stays up instead of a home page with holes.
async function loadHomeArticles(): Promise<HomeArticles> {
  const get = async (query: {
    sort: ArticleSort;
    limit: number;
    category?: Category;
  }) => {
    const { data } = await fetchArticles({ query, throwOnError: true });
    return data.articles;
  };
  const [latest, popular, ...sections] = await Promise.all([
    get({ sort: "LATEST", limit: ARTICLE_FETCH_LIMIT }),
    // One spare in case the headline is among them.
    get({ sort: "MOST_POPULAR", limit: HOME_SECTION_SIZE.popular + 1 }),
    ...CATEGORY_GROUPS.map(async ({ category, children }) => {
      const lists = await Promise.all(
        [category, ...children].map((c) =>
          get({ category: c, sort: "LATEST", limit: sectionSize(category) }),
        ),
      );
      return [category, lists.flat()] as const;
    }),
  ]);
  return { latest, popular, categories: Object.fromEntries(sections) };
}

function latestUnique(articles: readonly Article[]) {
  const byId = new Map(articles.map((article) => [article.id, article]));
  return [...byId.values()].toSorted(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime() || b.id - a.id,
  );
}

export function buildHomeSections(
  { latest, popular, categories }: HomeArticles,
  now: Date = new Date(),
): HomeSections {
  const latestPreviews = latestUnique(latest).map((a) => toArticlePreview(a));
  const headline = selectHeadline(latestPreviews, now);
  const notHeadline = (article: { id: number }) => article.id !== headline?.id;

  const rest = latestPreviews.filter(notHeadline);
  const {
    featured,
    latest: latestSize,
    popular: popularSize,
  } = HOME_SECTION_SIZE;

  const sections = CATEGORY_GROUPS.map(
    ({ category, children }): HomeCategorySection => ({
      category,
      children,
      articles: latestUnique(categories[category] ?? [])
        .slice(0, sectionSize(category))
        .map((article) => toArticlePreview(article, { category })),
    }),
  ).filter((section) => section.articles.length > 0);

  return {
    headline,
    featured: rest.slice(0, featured),
    latest: rest.slice(featured, featured + latestSize),
    popular: popular
      .filter(notHeadline)
      .slice(0, popularSize)
      .map((article) => toArticlePreview(article)),
    spotlight: sections.find((s) => s.category === SPOTLIGHT),
    categories: sections.filter(
      (s) => s.category !== SPOTLIGHT && s.category !== OPINION,
    ),
    opinion: sections.find((s) => s.category === OPINION),
  };
}

type Optimize = (
  src: string | undefined,
  width: number,
) => Promise<string | undefined>;

// Widths are CSS px doubled for high-density screens. The page passes
// `optimizeImage` in because it only runs inside Astro.
export async function optimizeHomeThumbnails(
  sections: HomeSections,
  optimize: Optimize,
): Promise<HomeSections> {
  const resize = (width: number) => async (article: ArticlePreview) => ({
    ...article,
    thumbnail: await optimize(article.thumbnail, width),
  });
  const resizeAll =
    (width: number) => async (section: HomeCategorySection) => ({
      ...section,
      articles: await Promise.all(section.articles.map(resize(width))),
    });
  // The spotlight and category boxes show a photo for their lead only; the
  // rest are title links, so converting their photos would only bloat dist/.
  const resizeLead =
    (width: number) =>
    async ({ articles: [lead, ...rest], ...section }: HomeCategorySection) => ({
      ...section,
      articles: [await resize(width)(lead), ...rest],
    });
  const [headline, featured, latest, spotlight, categories, opinion] =
    await Promise.all([
      sections.headline && resize(1920)(sections.headline),
      Promise.all(sections.featured.map(resize(208))),
      Promise.all(sections.latest.map(resize(600))),
      sections.spotlight && resizeLead(1400)(sections.spotlight),
      Promise.all(sections.categories.map(resizeLead(600))),
      sections.opinion && resizeAll(600)(sections.opinion),
    ]);
  return {
    ...sections,
    headline,
    featured,
    latest,
    spotlight,
    categories,
    opinion,
  };
}
