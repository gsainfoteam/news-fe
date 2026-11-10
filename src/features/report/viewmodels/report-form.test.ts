import { describe, expect, test } from "bun:test";
import { type TFunction } from "i18next";

import { zReportInput } from "../models";
import {
  createReportFormSchema,
  getReportSubmitError,
  isPhoneNumberKR,
  REPORT_FORM_DEFAULTS,
  toReportInput,
} from "./report-form";

// Returns the key so tests can tell which message fired.
const t = ((key: string) => key) as unknown as TFunction;
const schema = createReportFormSchema(t);

const valid = {
  name: "홍길동",
  email: "reporter@gm.gist.ac.kr",
  phone: "010-1234-5678",
  title: "",
  description: "학생회관 2층 휴게 공간이 저녁마다 잠겨 있습니다.",
};

const issuesOf = (values: typeof valid) => {
  const result = schema.safeParse(values);
  return result.success ? [] : result.error.issues.map((i) => i.message);
};

describe("isPhoneNumberKR", () => {
  test.each([
    "010-1234-5678",
    "01012345678",
    "010 1234 5678",
    "+82 10-1234-5678",
    "+82 010 1234 5678",
    "011-234-5678",
    "02-123-4567",
    "02-1234-5678",
    "062-715-2114",
    "070-1234-5678",
    "080-123-4567",
    "0505-123-4567",
    "1588-1234",
    // 10-digit 010 numbers are still valid to libphonenumber, and so to news-be.
    "010-1234-567",
    // Like `@IsPhoneNumber('KR')`, KR is only the default country.
    "+1 415 555 0100",
  ])("accepts %s", (value) => {
    expect(isPhoneNumberKR(value)).toBe(true);
  });

  test.each(["010-1234-56789", "010-1234-5678-9", "12-34", "phone", ""])(
    "rejects %s",
    (value) => {
      expect(isPhoneNumberKR(value)).toBe(false);
    },
  );
});

describe("report form schema", () => {
  test("accepts a complete form without a title", () => {
    expect(issuesOf(valid)).toEqual([]);
  });

  test("starts invalid on the defaults", () => {
    expect(issuesOf(REPORT_FORM_DEFAULTS)).toEqual([
      "report.error.nameRequired",
      "report.error.emailRequired",
      "report.error.phoneRequired",
      "report.error.descriptionRequired",
    ]);
  });

  test("treats whitespace as empty", () => {
    expect(issuesOf({ ...valid, name: "   ", description: "\n\n" })).toEqual([
      "report.error.nameRequired",
      "report.error.descriptionRequired",
    ]);
  });

  test("enforces the backend limits", () => {
    expect(
      issuesOf({
        ...valid,
        name: "가".repeat(51),
        title: "가".repeat(201),
        description: "가".repeat(10_001),
      }),
    ).toEqual([
      "report.error.nameTooLong",
      "report.error.titleTooLong",
      "report.error.descriptionTooLong",
    ]);
    expect(
      issuesOf({
        ...valid,
        name: "가".repeat(50),
        title: "가".repeat(200),
        description: "가".repeat(10_000),
      }),
    ).toEqual([]);
  });

  test("checks email and phone formats", () => {
    expect(
      issuesOf({ ...valid, email: "reporter@", phone: "010-1234-56789" }),
    ).toEqual(["report.error.emailInvalid", "report.error.phoneInvalid"]);
  });
});

describe("toReportInput", () => {
  test("trims values and leaves out empty optional fields", () => {
    const input = toReportInput(
      { ...valid, name: " 홍길동 ", title: "  " },
      [],
    );
    expect(input).toEqual({
      name: "홍길동",
      email: valid.email,
      phone: valid.phone,
      description: valid.description,
    });
    expect(zReportInput.safeParse(input).success).toBe(true);
  });

  test("keeps the title and file keys when present", () => {
    expect(
      toReportInput({ ...valid, title: " 휴게 공간 " }, ["a", "b"]),
    ).toMatchObject({ title: "휴게 공간", fileKeys: ["a", "b"] });
  });
});

test("getReportSubmitError", () => {
  expect(
    getReportSubmitError({ statusCode: 429, message: "", error: "" }),
  ).toBe("rate-limit");
  expect(getReportSubmitError({ statusCode: 400 })).toBe("unknown");
  expect(getReportSubmitError(new TypeError("Failed to fetch"))).toBe(
    "unknown",
  );
});
