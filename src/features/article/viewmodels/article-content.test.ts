import { describe, expect, test } from "bun:test";

import {
  decodeEntities,
  extractSummary,
  extractThumbnail,
  toPlainText,
} from "./article-content";

describe("extractThumbnail", () => {
  test("takes the first image in the body", () => {
    const html =
      '<p>본문</p><img src="https://cdn.test/a.jpg"><img src="https://cdn.test/b.jpg">';
    expect(extractThumbnail(html)).toBe("https://cdn.test/a.jpg");
  });

  test("reads src wherever it sits and however it is quoted", () => {
    expect(
      extractThumbnail(`<img alt="x" class='y' src='https://cdn.test/a.png'>`),
    ).toBe("https://cdn.test/a.png");
    expect(extractThumbnail("<IMG SRC=https://cdn.test/a.webp />")).toBe(
      "https://cdn.test/a.webp",
    );
    expect(
      extractThumbnail('<img\n  width="10"\n  src = "https://cdn.test/a.jpg">'),
    ).toBe("https://cdn.test/a.jpg");
  });

  test("does not mistake data-src or srcset for src", () => {
    expect(
      extractThumbnail(
        '<img data-src="https://cdn.test/lazy.jpg" srcset="https://cdn.test/s.jpg 2x" src="https://cdn.test/real.jpg">',
      ),
    ).toBe("https://cdn.test/real.jpg");
  });

  test("decodes entities in the URL", () => {
    expect(
      extractThumbnail('<img src="https://cdn.test/a.jpg?w=1&amp;h=2">'),
    ).toBe("https://cdn.test/a.jpg?w=1&h=2");
  });

  test("skips images that are not http(s) files", () => {
    expect(
      extractThumbnail(
        '<img src="data:image/png;base64,AAAA"><img src=""><img src="https://cdn.test/ok.jpg">',
      ),
    ).toBe("https://cdn.test/ok.jpg");
    expect(extractThumbnail('<img src="javascript:alert(1)">')).toBeUndefined();
  });

  test("returns undefined without images", () => {
    expect(extractThumbnail("<p>글만 있는 기사</p>")).toBeUndefined();
    expect(extractThumbnail("")).toBeUndefined();
  });
});

describe("toPlainText", () => {
  test("strips tags and keeps a space between blocks", () => {
    expect(toPlainText("<h2>제목</h2><p>첫 <b>문단</b></p><p>둘째</p>")).toBe(
      "제목 첫 문단 둘째",
    );
    expect(toPlainText("한 줄<br>다음 줄")).toBe("한 줄 다음 줄");
  });

  test("drops scripts, styles, and comments with their contents", () => {
    expect(
      toPlainText(
        "<style>p{color:red}</style><!-- 메모 --><p>본문</p><script>alert(1)</script>",
      ),
    ).toBe("본문");
  });

  test("does not join inline tags into extra spaces", () => {
    expect(
      toPlainText("<p>GIST<sup>2</sup>와 <a href='#'>학생</a>회</p>"),
    ).toBe("GIST2와 학생회");
  });
});

test("decodeEntities handles named and numeric entities", () => {
  expect(decodeEntities("A&amp;B &lt;tag&gt; &#39;q&#x27; &nbsp;x")).toBe(
    "A&B <tag> 'q'  x",
  );
  expect(decodeEntities("&unknown; &#xFFFFFFF;")).toBe("&unknown; &#xFFFFFFF;");
});

describe("extractSummary", () => {
  test("keeps short text whole", () => {
    expect(extractSummary("<p>짧은 본문</p>")).toBe("짧은 본문");
  });

  test("cuts long text at a word boundary", () => {
    const summary = extractSummary(
      "<p>학생들은 바뀐 기준을 아직 잘 모른다고 답했다</p>",
      20,
    );
    expect(summary).toBe("학생들은 바뀐 기준을 아직 잘…");
  });

  test("cuts mid-word when no space is near the end", () => {
    expect(extractSummary("가나다라마바사아자차카타파하", 5)).toBe(
      "가나다라마…",
    );
  });

  test("never splits an emoji", () => {
    const summary = extractSummary("😀".repeat(10), 3);
    expect(summary).toBe("😀😀😀…");
  });

  test("is empty for an image-only body", () => {
    expect(
      extractSummary('<figure><img src="https://cdn.test/a.jpg"></figure>'),
    ).toBe("");
  });
});
