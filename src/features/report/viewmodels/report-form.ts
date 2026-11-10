import { type TFunction } from "i18next";
import { parsePhoneNumberFromString } from "libphonenumber-js/min";
import { z } from "zod";

import { zReportInput, type ReportInput } from "../models";

// news-be validates with class-validator's `@IsPhoneNumber('KR')`, which the
// spec doesn't carry: libphonenumber parsing with KR as the default country,
// so numbers with another country code pass too. The min metadata is a bit
// looser than the backend's max (it accepts 02-012-3456); such a number gets
// the generic send error.
export function isPhoneNumberKR(value: string) {
  return parsePhoneNumberFromString(value, "KR")?.isValid() ?? false;
}

export type ReportFormValues = {
  name: string;
  email: string;
  phone: string;
  title: string;
  description: string;
};

export const REPORT_FORM_DEFAULTS: ReportFormValues = {
  name: "",
  email: "",
  phone: "",
  title: "",
  description: "",
};

export const REPORT_LIMITS = {
  name: 50,
  title: 200,
  description: 10_000,
} as const;

// Built from the generated DTO schema so a field the backend adds or drops
// breaks here. Messages are set per field because the page language decides
// them (zod's locale is global).
export function createReportFormSchema(t: TFunction) {
  const required = (message: string) => z.string().trim().min(1, message);
  return zReportInput.omit({ fileKeys: true }).extend({
    name: required(t("report.error.nameRequired", "이름을 입력해 주세요")).max(
      REPORT_LIMITS.name,
      t("report.error.nameTooLong", "이름은 50자 이하로 입력해 주세요"),
    ),
    email: required(
      t("report.error.emailRequired", "이메일을 입력해 주세요"),
    ).pipe(
      z.email(t("report.error.emailInvalid", "이메일 형식을 확인해 주세요")),
    ),
    phone: required(
      t("report.error.phoneRequired", "전화번호를 입력해 주세요"),
    ).refine(
      // Empty is already reported as required.
      (value) => value === "" || isPhoneNumberKR(value),
      t("report.error.phoneInvalid", "전화번호 형식을 확인해 주세요"),
    ),
    title: z
      .string()
      .trim()
      .max(
        REPORT_LIMITS.title,
        t("report.error.titleTooLong", "제목은 200자 이하로 입력해 주세요"),
      ),
    description: required(
      t("report.error.descriptionRequired", "내용을 입력해 주세요"),
    ).max(
      REPORT_LIMITS.description,
      t(
        "report.error.descriptionTooLong",
        "내용은 10,000자 이하로 입력해 주세요",
      ),
    ),
  });
}

export function toReportInput(
  values: ReportFormValues,
  fileKeys: string[],
): ReportInput {
  const title = values.title.trim();
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    description: values.description.trim(),
    ...(title && { title }),
    ...(fileKeys.length > 0 && { fileKeys }),
  };
}

export type ReportSubmitError = "rate-limit" | "unknown";

// hey-api throws the parsed ErrorDto body; a network failure throws a
// TypeError instead.
export function getReportSubmitError(error: unknown): ReportSubmitError {
  const status =
    typeof error === "object" && error !== null && "statusCode" in error
      ? error.statusCode
      : undefined;
  return status === 429 ? "rate-limit" : "unknown";
}
