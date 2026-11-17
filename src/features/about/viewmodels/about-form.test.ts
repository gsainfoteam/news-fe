import { describe, expect, test } from "bun:test";
import { type TFunction } from "i18next";

import {
  createAboutFormSchema,
  createHistoryFormSchema,
  getChangedAbout,
  toAboutFormValues,
} from "./about-form";
import { MOCK_ABOUT } from "../models/mocks";

const t = ((_key: string, fallback: string) => fallback) as TFunction;
const values = toAboutFormValues(MOCK_ABOUT);

describe("createAboutFormSchema", () => {
  const schema = createAboutFormSchema(t);

  test("accepts the current about", () => {
    expect(schema.safeParse(values).success).toBe(true);
  });

  test("rejects what news-be would reject", () => {
    const fails = (patch: Partial<typeof values>) =>
      schema.safeParse({ ...values, ...patch }).success === false;
    expect(fails({ publisher: "  " })).toBe(true);
    expect(fails({ publisher: "가".repeat(101) })).toBe(true);
    expect(fails({ foundedAt: "2016-02-30" })).toBe(true);
    expect(fails({ foundedAt: "2016.04.11" })).toBe(true);
    expect(fails({ email: "editor" })).toBe(true);
    expect(fails({ homepage: "javascript:alert(1)" })).toBe(true);
    expect(fails({ instagram: "instagram.com/gistnews" })).toBe(true);
  });
});

describe("getChangedAbout", () => {
  test("sends only trimmed fields that changed", () => {
    expect(
      getChangedAbout(values, {
        ...values,
        publisher: ` ${values.publisher} `,
        director: " 김교수 ",
      }),
    ).toEqual({ director: "김교수" });
  });
});

describe("createHistoryFormSchema", () => {
  const schema = createHistoryFormSchema(t);

  test("needs a real day and some content", () => {
    expect(
      schema.safeParse({ date: "2026-11-17", content: "창간 10주년" }).success,
    ).toBe(true);
    expect(schema.safeParse({ date: "", content: "x" }).success).toBe(false);
    expect(schema.safeParse({ date: "2026-11-17", content: " " }).success).toBe(
      false,
    );
    expect(
      schema.safeParse({ date: "2026-11-17", content: "가".repeat(1001) })
        .success,
    ).toBe(false);
  });
});
