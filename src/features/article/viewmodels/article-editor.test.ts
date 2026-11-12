import { describe, expect, test } from "bun:test";
import i18next from "i18next";

import {
  checkArticleImage,
  collectImageKeys,
  getAuthorOptions,
  getImageKey,
  getImageSources,
  hasPendingImages,
  isCategoryLocked,
  isContentEmpty,
  normalizeCategories,
  parseArticleId,
  toArticleImageRequest,
  toArticleInput,
  toArticleUpdate,
  toggleCategory,
  trimTrailingEmptyParagraphs,
  validateArticleDraft,
  type ArticleDraft,
} from "./article-editor";

const S3 = "https://s3.ap-northeast-2.amazonaws.com/news-bucket";
const KEY_A = "articles/2026-11-10/AbC_d-lab.webp";
const KEY_B = "articles/2026-11-09/XyZ-file.png";
const AUTHOR = "123e4567-e89b-42d3-a456-426614174000";

describe("categories", () => {
  test("picking a sub-category picks its section too", () => {
    expect(toggleCategory([], "RESEARCH")).toEqual([
      "ACADEMIC_RESEARCH",
      "RESEARCH",
    ]);
  });

  test("a section can't be unpicked while a sub-category is picked", () => {
    const selected = toggleCategory([], "REPORTAGE");
    expect(isCategoryLocked(selected, "PLANNING_SPECIAL")).toBe(true);
    expect(toggleCategory(selected, "PLANNING_SPECIAL")).toEqual(selected);
  });

  test("unpicking the last sub-category keeps the section and unlocks it", () => {
    const selected = toggleCategory(
      ["PLANNING_SPECIAL", "REPORTAGE"],
      "REPORTAGE",
    );
    expect(selected).toEqual(["PLANNING_SPECIAL"]);
    expect(isCategoryLocked(selected, "PLANNING_SPECIAL")).toBe(false);
    expect(toggleCategory(selected, "PLANNING_SPECIAL")).toEqual([]);
  });

  test("sections without sub-categories toggle freely", () => {
    expect(toggleCategory(["CAMPUS"], "SOCIETY")).toEqual([
      "CAMPUS",
      "SOCIETY",
    ]);
    expect(toggleCategory(["CAMPUS", "SOCIETY"], "CAMPUS")).toEqual([
      "SOCIETY",
    ]);
  });

  test("normalizing adds missing sections, dedupes and keeps enum order", () => {
    expect(
      normalizeCategories(["CARTOON", "CAMPUS", "CARTOON", "ACADEMIC"]),
    ).toEqual([
      "CAMPUS",
      "ACADEMIC_RESEARCH",
      "ACADEMIC",
      "OPINION",
      "CARTOON",
    ]);
  });
});

describe("images", () => {
  test("accepts only jpg, png, webp and gif", () => {
    expect(checkArticleImage({ name: "a.JPG", size: 1 })).toBeUndefined();
    expect(checkArticleImage({ name: "a.jpeg", size: 1 })).toBeUndefined();
    expect(checkArticleImage({ name: "a.webp", size: 1 })).toBeUndefined();
    expect(checkArticleImage({ name: "a.gif", size: 1 })).toBeUndefined();
    expect(checkArticleImage({ name: "IMG_0001.HEIC", size: 1 })).toBe("type");
    expect(checkArticleImage({ name: "a.svg", size: 1 })).toBe("type");
    expect(checkArticleImage({ name: "png", size: 1 })).toBe("type");
    expect(checkArticleImage({ name: "a.png", size: 0 })).toBe("empty");
  });

  test("turns Korean names into ones the backend accepts", () => {
    expect(
      toArticleImageRequest({ name: "시약장 사진.JPG", size: 10 }),
    ).toEqual({
      fileName: "file.jpg",
      contentLength: 10,
    });
    expect(
      toArticleImageRequest({ name: "연구실 lab (1).png", size: 5 }).fileName,
    ).toBe("lab_1.png");
  });

  test("reads img sources from Tiptap's HTML", () => {
    expect(
      getImageSources(
        `<p>a</p><img src="${S3}/${KEY_A}?a=1&amp;b=2" alt=""><p><img class="x" src="b.png"></p>`,
      ),
    ).toEqual([`${S3}/${KEY_A}?a=1&b=2`, "b.png"]);
  });

  test("recovers the key from a public URL", () => {
    expect(getImageKey(`${S3}/${KEY_A}`)).toBe(KEY_A);
    expect(getImageKey("https://example.com/photo.png")).toBeUndefined();
    expect(getImageKey("blob:")).toBeUndefined();
  });

  test("keeps only keys of images still in the body", () => {
    const uploaded = new Map([[`${S3}/${KEY_B}`, KEY_B]]);
    const html = `<img src="${S3}/${KEY_A}"><p>x</p><img src="${S3}/${KEY_A}"><img src="https://example.com/x.png">`;
    expect(collectImageKeys(html, uploaded)).toEqual([KEY_A]);
    expect(
      collectImageKeys(`${html}<img src="${S3}/${KEY_B}">`, uploaded),
    ).toEqual([KEY_A, KEY_B]);
  });
});

test("an upload still showing its local preview is pending", () => {
  expect(hasPendingImages(`<img src="blob:http://localhost/1">`)).toBe(true);
  expect(hasPendingImages(`<img src="${S3}/${KEY_A}">`)).toBe(false);
});

test("author options: alumni last, unknown authors kept by name", () => {
  const member = (id: string, role: "ALUMNI" | "CUB_REPORTER") => ({
    id,
    email: `${id}@gm.gist.ac.kr`,
    name: id,
    role,
    permission: "NONE" as const,
    createdAt: new Date(0),
    updatedAt: new Date(0),
  });
  const options = getAuthorOptions(
    [member("a", "ALUMNI"), member("b", "CUB_REPORTER")],
    [
      { id: "b", name: "b" },
      { id: "gone", name: "떠난 기자" },
    ],
  );
  expect(options.map((o) => o.id)).toEqual(["b", "a", "gone"]);
  expect(options[2]).toEqual({ id: "gone", name: "떠난 기자" });
});

const draft = (overrides: Partial<ArticleDraft> = {}): ArticleDraft => ({
  title: "  제목  ",
  subtitle: "",
  content: `<p>본문</p><img src="${S3}/${KEY_A}">`,
  categories: ["RESEARCH"],
  authorIds: [AUTHOR, AUTHOR],
  ...overrides,
});

describe("payload", () => {
  test("create: trims, adds sections, dedupes authors, lists body images", () => {
    expect(toArticleInput(draft(), new Map())).toEqual({
      title: "제목",
      content: `<p>본문</p><img src="${S3}/${KEY_A}">`,
      imageKeys: [KEY_A],
      categories: ["ACADEMIC_RESEARCH", "RESEARCH"],
      authorIds: [AUTHOR],
    });
  });

  test("drops the empty paragraphs Tiptap keeps after a last image", () => {
    expect(trimTrailingEmptyParagraphs('<p>a</p><img src="x"><p></p>')).toBe(
      '<p>a</p><img src="x">',
    );
    expect(trimTrailingEmptyParagraphs("<p></p><p>a</p>")).toBe(
      "<p></p><p>a</p>",
    );
  });

  test("update: sends an empty subtitle to clear it", () => {
    const body = toArticleUpdate(draft(), new Map(), { thumbnailUrl: null });
    expect(body.subtitle).toBe("");
    expect(body).not.toHaveProperty("thumbnailKey");
  });

  test("update: clears the thumbnail when its image left the body", () => {
    const article = { thumbnailUrl: `${S3}/${KEY_B}` };
    expect(
      toArticleUpdate(draft(), new Map(), article).thumbnailKey,
    ).toBeNull();
    const kept = draft({ content: `<img src="${S3}/${KEY_B}">` });
    expect(toArticleUpdate(kept, new Map(), article)).not.toHaveProperty(
      "thumbnailKey",
    );
  });
});

describe("validation", () => {
  const t = i18next.t.bind(i18next);

  test("passes a complete draft", () => {
    expect(validateArticleDraft(draft(), t)).toEqual({});
  });

  test("needs a title, a body and at least one author", () => {
    const errors = validateArticleDraft(
      draft({ title: " ", content: "<p></p>", authorIds: [] }),
      t,
    );
    expect(Object.keys(errors).sort()).toEqual([
      "authorIds",
      "content",
      "title",
    ]);
  });

  test("a body with only an image counts as content", () => {
    expect(isContentEmpty(`<p></p><img src="${S3}/${KEY_A}">`)).toBe(false);
    expect(isContentEmpty("<p>&nbsp;</p>")).toBe(true);
  });
});

test("parses the edit page id", () => {
  expect(parseArticleId("?id=42")).toBe(42);
  expect(parseArticleId("?id=0")).toBeUndefined();
  expect(parseArticleId("?id=4.2")).toBeUndefined();
  expect(parseArticleId("?id=abc")).toBeUndefined();
  expect(parseArticleId("")).toBeUndefined();
});
