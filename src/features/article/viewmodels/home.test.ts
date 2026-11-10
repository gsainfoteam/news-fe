import { describe, expect, test } from "bun:test";

import { type Category } from "@/features/category";

import {
  buildHomeSections,
  HEADLINE_WINDOW_DAYS,
  optimizeHomeThumbnails,
  selectHeadline,
} from "./home";
import { createMockArticle } from "../models/mocks";

// 2026-11-10 12:00 KST
const NOW = new Date("2026-11-10T03:00:00Z");

type Candidate = {
  id: number;
  thumbnail?: string;
  publishedAt: Date;
  views: number;
};

const candidate = (
  id: number,
  publishedAt: string,
  views: number,
  photo = true,
): Candidate => ({
  id,
  publishedAt: new Date(publishedAt),
  views,
  thumbnail: photo ? `https://img.test/${id}.jpg` : undefined,
});

const pick = (articles: Candidate[]) => selectHeadline(articles, NOW)?.id;

describe("selectHeadline", () => {
  test("picks the most viewed recent article with a photo", () => {
    expect(
      pick([
        candidate(1, "2026-11-09T00:00:00Z", 100),
        candidate(2, "2026-11-05T00:00:00Z", 300),
        candidate(3, "2026-11-08T00:00:00Z", 900, false),
        candidate(4, "2026-10-01T00:00:00Z", 5000),
      ]),
    ).toBe(2);
  });

  test("counts 14 Korean calendar days, today included", () => {
    expect(HEADLINE_WINDOW_DAYS).toBe(14);
    // 2026-10-28 00:00 KST is the first moment of the window.
    const inside = candidate(1, "2026-10-27T15:00:00Z", 500);
    const outside = candidate(2, "2026-10-27T14:59:59Z", 900);
    const newer = candidate(3, "2026-11-10T02:00:00Z", 10);
    expect(pick([newer, inside, outside])).toBe(1);
  });

  test("among equal views the newer article wins", () => {
    expect(
      pick([
        candidate(1, "2026-11-01T00:00:00Z", 100),
        candidate(2, "2026-11-03T00:00:00Z", 100),
      ]),
    ).toBe(2);
  });

  test("falls back to the latest article with a photo", () => {
    expect(
      pick([
        candidate(1, "2026-11-09T00:00:00Z", 900, false),
        candidate(2, "2026-09-01T00:00:00Z", 10),
        candidate(3, "2026-09-20T00:00:00Z", 5),
      ]),
    ).toBe(3);
  });

  test("falls back to the latest article without photos", () => {
    expect(
      pick([
        candidate(1, "2026-11-01T00:00:00Z", 900, false),
        candidate(2, "2026-11-09T00:00:00Z", 10, false),
      ]),
    ).toBe(2);
  });

  test("returns nothing for an empty list", () => {
    expect(pick([])).toBeUndefined();
  });
});

describe("buildHomeSections", () => {
  // Two days apart from 2026-10-28, views going down, every third without a
  // photo.
  const withPhoto = (index: number, overrides = {}) =>
    createMockArticle(index, {
      thumbnailUrl: index % 3 === 2 ? null : `https://img.test/${index}.jpg`,
      ...overrides,
    });
  const latest = Array.from({ length: 10 }, (_, i) => withPhoto(i));

  test("leaves the headline out of the featured and popular sections", () => {
    const top = withPhoto(1, { views: 9999 });
    const articles = latest.map((a) => (a.id === top.id ? top : a));
    const sections = buildHomeSections(
      {
        latest: articles,
        popular: [top, ...articles.filter((a) => a.id !== top.id)],
        categories: {},
      },
      new Date("2026-10-30T00:00:00Z"),
    );
    const ids = (list: { id: number }[]) => list.map((a) => a.id);

    expect(sections.headline?.id).toBe(top.id);
    expect(ids(sections.featured)).toEqual([1, 3, 4]);
    expect(ids(sections.latest)).toEqual([5, 6, 7, 8]);
    expect(ids(sections.popular)).toEqual([1, 3, 4, 5, 6]);
  });

  test("merges a section with its sub-categories, newest first", () => {
    const research = createMockArticle(2, { categories: ["RESEARCH"] });
    const academic = createMockArticle(0, { categories: ["ACADEMIC"] });
    const both = createMockArticle(1, {
      categories: ["ACADEMIC", "RESEARCH"],
    });
    const sections = buildHomeSections(
      {
        latest,
        popular: [],
        categories: {
          ACADEMIC_RESEARCH: [research, both, academic, both],
          OPINION: [createMockArticle(4, { categories: ["CARTOON"] })],
        },
      },
      NOW,
    );

    const academicResearch = sections.categories.find(
      (s) => s.category === "ACADEMIC_RESEARCH",
    );
    expect(academicResearch?.articles.map((a) => a.id)).toEqual([1, 2, 3]);
    expect(academicResearch?.articles[2].category).toBe("RESEARCH");
    // Sections without articles are left out.
    expect(sections.categories).toHaveLength(1);
    expect(sections.spotlight).toBeUndefined();
    expect(sections.opinion?.articles[0].category).toBe("CARTOON");
  });

  test("an empty site has no headline and empty sections", () => {
    const sections = buildHomeSections(
      { latest: [], popular: [], categories: {} },
      NOW,
    );
    expect(sections.headline).toBeUndefined();
    expect(sections.featured).toEqual([]);
    expect(sections.categories).toEqual([]);
  });
});

describe("optimizeHomeThumbnails", () => {
  test("converts only the photos a section shows", async () => {
    const article = (index: number, category: Category) =>
      createMockArticle(index, {
        categories: [category],
        thumbnailUrl: `https://img.test/${index}.jpg`,
      });
    const sections = buildHomeSections(
      {
        latest: [],
        popular: [],
        categories: {
          CAMPUS: [article(0, "CAMPUS"), article(1, "CAMPUS")],
          OPINION: [article(2, "CARTOON"), article(3, "CARTOON")],
        },
      },
      NOW,
    );
    const optimized = await optimizeHomeThumbnails(
      sections,
      async (src, width) => src && `${src}?w=${width}`,
    );
    const thumbs = (list?: { thumbnail?: string }[]) =>
      list?.map((a) => a.thumbnail);

    expect(thumbs(optimized.categories[0].articles)).toEqual([
      "https://img.test/0.jpg?w=600",
      "https://img.test/1.jpg",
    ]);
    expect(thumbs(optimized.opinion?.articles)).toEqual([
      "https://img.test/2.jpg?w=600",
      "https://img.test/3.jpg?w=600",
    ]);
  });
});
