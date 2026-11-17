import { type TFunction } from "i18next";
import { z } from "zod";

import {
  type About,
  type AboutInput,
  type HistoryEntry,
  type HistoryInput,
  zAboutInput,
  zHistoryInput,
} from "../models";

// Mirrors news-be's DTO limits (`zUpdateAboutDto`, `zCreateHistoryDto`),
// which the generated schemas carry without messages.
export const ABOUT_LIMITS = {
  introduction: 5000,
  name: 100,
  address: 200,
  historyContent: 1000,
} as const;

export type AboutFormValues = Required<AboutInput>;
export type HistoryFormValues = HistoryInput;

export const ABOUT_FIELDS = [
  "introduction",
  "foundedAt",
  "publisher",
  "director",
  "editorInChief",
  "address",
  "email",
  "homepage",
  "instagram",
] as const satisfies readonly (keyof AboutFormValues)[];

export function toAboutFormValues(about: About): AboutFormValues {
  return Object.fromEntries(
    ABOUT_FIELDS.map((key) => [key, about[key]]),
  ) as AboutFormValues;
}

export function toAboutInput(values: AboutFormValues): AboutInput {
  return Object.fromEntries(
    ABOUT_FIELDS.map((key) => [key, values[key].trim()]),
  ) as AboutInput;
}

// PATCH takes any subset; sending only what changed keeps one editor's save
// from overwriting a field another editor changed in the meantime.
export function getChangedAbout(
  saved: AboutFormValues,
  values: AboutFormValues,
): AboutInput {
  const next = toAboutInput(values);
  return Object.fromEntries(
    ABOUT_FIELDS.filter((key) => next[key] !== saved[key]).map((key) => [
      key,
      next[key],
    ]),
  );
}

const required = (message: string) => z.string().trim().min(1, message);

// `<input type="date">` already gives YYYY-MM-DD; the round trip through
// Date catches impossible days typed by hand (2026-02-30).
const calendarDay = (message: string) =>
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, message)
    .refine((date) => {
      const day = new Date(`${date}T00:00:00Z`);
      return !Number.isNaN(day.getTime()) && day.toISOString().startsWith(date);
    }, message);

const webUrl = (message: string) =>
  z
    .string()
    .trim()
    .pipe(z.url({ protocol: /^https?$/, message }));

export function createAboutFormSchema(t: TFunction) {
  const tooLong = (max: number) =>
    t("about.error.tooLong", "{{max}}자 이하로 입력해 주세요", { max });
  const name = required(
    t("about.error.nameRequired", "이름을 입력해 주세요"),
  ).max(ABOUT_LIMITS.name, tooLong(ABOUT_LIMITS.name));

  return zAboutInput.required().extend({
    introduction: required(
      t("about.error.introductionRequired", "소개 문구를 입력해 주세요"),
    ).max(ABOUT_LIMITS.introduction, tooLong(ABOUT_LIMITS.introduction)),
    foundedAt: calendarDay(
      t("about.error.dateInvalid", "날짜를 YYYY-MM-DD 형식으로 입력해 주세요"),
    ),
    publisher: name,
    director: name,
    editorInChief: name,
    address: required(
      t("about.error.addressRequired", "주소를 입력해 주세요"),
    ).max(ABOUT_LIMITS.address, tooLong(ABOUT_LIMITS.address)),
    email: z
      .string()
      .trim()
      .pipe(
        z.email(t("about.error.emailInvalid", "이메일 형식을 확인해 주세요")),
      ),
    homepage: webUrl(
      t("about.error.urlInvalid", "https://로 시작하는 주소를 입력해 주세요"),
    ),
    instagram: webUrl(
      t("about.error.urlInvalid", "https://로 시작하는 주소를 입력해 주세요"),
    ),
  });
}

export const emptyHistory = (): HistoryFormValues => ({
  date: "",
  content: "",
});

export function toHistoryFormValues({
  date,
  content,
}: HistoryEntry): HistoryFormValues {
  return { date, content };
}

export function toHistoryInput(values: HistoryFormValues): HistoryInput {
  return { date: values.date, content: values.content.trim() };
}

export function createHistoryFormSchema(t: TFunction) {
  return zHistoryInput.extend({
    date: calendarDay(t("about.error.dateRequired", "날짜를 골라 주세요")),
    content: required(
      t("about.error.contentRequired", "내용을 입력해 주세요"),
    ).max(
      ABOUT_LIMITS.historyContent,
      t("about.error.tooLong", "{{max}}자 이하로 입력해 주세요", {
        max: ABOUT_LIMITS.historyContent,
      }),
    ),
  });
}
