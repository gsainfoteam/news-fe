import { describe, expect, test } from "bun:test";

import {
  getArticleMeta,
  getBreadcrumb,
  getRelatedArticles,
  sanitizeArticleHtml,
  toArticleDetail,
} from "./article-detail";
import { createMockArticle, createMockArticles } from "../models/mocks";

const LABELS = new Proxy({} as Parameters<typeof getArticleMeta>[1], {
  get: (_, key) => `label:${String(key)}`,
});

const metaOf = async (article: Parameters<typeof toArticleDetail>[0]) =>
  getArticleMeta(await toArticleDetail(article), LABELS);

describe("sanitizeArticleHtml", () => {
  test("removes scripts with their content", async () => {
    expect(
      await sanitizeArticleHtml(
        '<p>본문</p><script>alert("x")</script><p>끝</p>',
      ),
    ).toBe("<p>본문</p><p>끝</p>");
  });

  test("removes event handlers", async () => {
    const html = await sanitizeArticleHtml(
      '<img src="https://cdn.test/a.jpg" onerror="alert(1)"><p onclick="x()">글</p>',
    );
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("onclick");
    expect(html).toContain('src="https://cdn.test/a.jpg"');
  });

  test("drops javascript: and data: URLs", async () => {
    expect(
      await sanitizeArticleHtml('<a href="javascript:alert(1)">링크</a>'),
    ).toBe("<a>링크</a>");
    expect(
      await sanitizeArticleHtml('<a href=" JaVaScRiPt:alert(1)">링크</a>'),
    ).toBe("<a>링크</a>");
    expect(
      await sanitizeArticleHtml(
        '<p>a</p><img src="data:image/png;base64,AAAA">',
      ),
    ).toBe("<p>a</p>");
  });

  test("removes iframes, styles, forms, and inline CSS", async () => {
    const html = await sanitizeArticleHtml(
      '<iframe src="https://evil.test"></iframe><style>p{}</style><form><input></form><p style="background:url(javascript:x)" class="x">글</p>',
    );
    expect(html).toBe("<p>글</p>");
  });

  test("keeps what the editor writes", async () => {
    const body =
      "<h2>소제목</h2><p><strong>굵게</strong> <em>기울임</em> <s>취소</s></p><blockquote><p>인용</p></blockquote><ul><li>항목</li></ul><figure><figcaption>설명</figcaption></figure><hr>";
    expect(await sanitizeArticleHtml(body)).toBe(
      body.replace("<hr>", "<hr />"),
    );
  });

  test("demotes h1 so the title stays the only one", async () => {
    expect(await sanitizeArticleHtml("<h1>제목</h1>")).toBe("<h2>제목</h2>");
  });

  test("lazy-loads images", async () => {
    expect(
      await sanitizeArticleHtml(
        '<img src="https://cdn.test/a.jpg" alt="사진">',
      ),
    ).toBe(
      '<img src="https://cdn.test/a.jpg" alt="사진" loading="lazy" decoding="async" />',
    );
  });

  test("links that open a new tab cannot reach this page", async () => {
    expect(
      await sanitizeArticleHtml(
        '<a href="https://ex.test" target="_blank" rel="opener">링크</a>',
      ),
    ).toBe(
      '<a href="https://ex.test" target="_blank" rel="noopener noreferrer nofollow">링크</a>',
    );
    expect(
      await sanitizeArticleHtml(
        '<a href="https://ex.test" target="_top">링크</a>',
      ),
    ).toBe('<a href="https://ex.test">링크</a>');
  });
});

describe("getBreadcrumb", () => {
  test("puts the section before a sub-category", async () => {
    expect(getBreadcrumb(["RESEARCH"])).toEqual([
      "ACADEMIC_RESEARCH",
      "RESEARCH",
    ]);
    expect(getBreadcrumb(["ACADEMIC_RESEARCH", "RESEARCH"])).toEqual([
      "ACADEMIC_RESEARCH",
      "RESEARCH",
    ]);
  });

  test("a section on its own is one item", async () => {
    expect(getBreadcrumb(["CAMPUS"])).toEqual(["CAMPUS"]);
    expect(getBreadcrumb([])).toEqual([]);
  });
});

describe("toArticleDetail", () => {
  test("sanitizes the body", async () => {
    const detail = await toArticleDetail(
      createMockArticle(0, { content: "<p>본문</p><script>x()</script>" }),
    );
    expect(detail.html).toBe("<p>본문</p>");
    expect(detail.path).toBe("/article/1");
  });

  test("shows the edit time only for an edited article", async () => {
    const createdAt = new Date("2026-10-28T05:20:00Z");
    const unedited = await toArticleDetail(
      createMockArticle(0, { createdAt, updatedAt: createdAt }),
    );
    expect(unedited.updatedAt).toBeUndefined();
    const updatedAt = new Date("2026-10-28T09:05:00Z");
    const edited = await toArticleDetail(
      createMockArticle(0, { createdAt, updatedAt }),
    );
    expect(edited.updatedAt).toEqual(updatedAt);
  });

  test("an empty subtitle is no subtitle", async () => {
    const detail = await toArticleDetail(
      createMockArticle(0, { subtitle: " " }),
    );
    expect(detail.subtitle).toBeUndefined();
  });
});

describe("getArticleMeta", () => {
  const createdAt = new Date("2026-10-28T05:20:00Z");

  test("describes the article with its subtitle", async () => {
    const meta = await metaOf(
      createMockArticle(0, { subtitle: "부제", createdAt }),
    );
    expect(meta.title).toBe(
      "연구실 안전 점검 항목 개편, 현장에서는 무엇이 달라졌나",
    );
    expect(meta.description).toBe("부제");
    expect(meta.publishedTime).toBe("2026-10-28T05:20:00.000Z");
    expect(meta.section).toBe("label:RESEARCH");
  });

  test("falls back to the start of the body", async () => {
    const meta = await metaOf(
      createMockArticle(0, {
        subtitle: null,
        content: "<p>첫 문단입니다.</p><p>둘째 문단.</p>",
      }),
    );
    expect(meta.description).toBe("첫 문단입니다. 둘째 문단.");
  });

  test("a photo-only article leaves the description to the site", async () => {
    const meta = await metaOf(
      createMockArticle(0, {
        subtitle: null,
        content: '<figure><img src="https://cdn.test/1.jpg" alt=""></figure>',
      }),
    );
    expect(meta.description).toBeUndefined();
  });

  test("uses the first body image for og:image", async () => {
    const meta = await metaOf(
      createMockArticle(0, {
        content:
          '<p>a</p><img src="data:image/png;base64,AA"><img src="https://cdn.test/1.jpg"><img src="https://cdn.test/2.jpg">',
      }),
    );
    expect(meta.image).toBe("https://cdn.test/1.jpg");
  });

  test("the backend thumbnail wins over the body", async () => {
    const meta = await metaOf(
      createMockArticle(0, {
        thumbnailUrl: "https://cdn.test/thumb.jpg",
        content: '<img src="https://cdn.test/1.jpg">',
      }),
    );
    expect(meta.image).toBe("https://cdn.test/thumb.jpg");
  });

  test("ignores an image hidden in markup the page drops", async () => {
    const meta = await metaOf(
      createMockArticle(0, {
        content:
          '<script>"<img src=https://evil.test/x.jpg>"</script><p>글</p>',
      }),
    );
    expect(meta.image).toBeUndefined();
  });
});

describe("getRelatedArticles", () => {
  const articles = createMockArticles(10);

  test("skips the article itself and repeats nothing", async () => {
    const current = articles[0];
    const { section, latestInSection, continueReading } = getRelatedArticles(
      articles,
      current,
    );
    expect(section).toBe("ACADEMIC_RESEARCH");
    const ids = [...latestInSection, ...continueReading].map((a) => a.id);
    expect(ids).not.toContain(current.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(continueReading).toHaveLength(4);
  });

  test("lists the section newest first", async () => {
    const { latestInSection } = getRelatedArticles(articles, articles[0]);
    expect(latestInSection.length).toBeGreaterThan(0);
    for (const article of latestInSection) {
      expect(
        article.categories.some((c) =>
          ["ACADEMIC_RESEARCH", "ACADEMIC", "RESEARCH"].includes(c),
        ),
      ).toBe(true);
    }
    const times = latestInSection.map((a) => a.createdAt.getTime());
    expect(times).toEqual(times.toSorted((a, b) => b - a));
  });
});
